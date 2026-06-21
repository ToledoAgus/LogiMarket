begin;

-- Sprint 3: alta de cliente autoservicio y checkout transaccional.
-- No se modifica la migración inicial; solo se agregan funciones controladas.

-- Alta de cliente para el usuario autenticado en la organización del MVP.
-- SECURITY DEFINER: crea ficha y membresía evitando exponer escritura directa
-- por RLS. Idempotente y siempre acotada a auth.uid() en la única organización.
create or replace function public.register_customer(
  p_business_name text,
  p_owner_name text,
  p_phone text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_org uuid;
  v_customer uuid;
begin
  if v_user is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select id into v_org
  from public.organizations
  where is_active
  order by created_at
  limit 1;

  if v_org is null then
    raise exception 'no active organization configured';
  end if;

  insert into public.profiles (id) values (v_user) on conflict (id) do nothing;

  select id into v_customer
  from public.customers
  where organization_id = v_org and profile_id = v_user;

  if v_customer is null then
    insert into public.customers (
      organization_id, profile_id, business_name, owner_name, phone, status
    ) values (
      v_org,
      v_user,
      coalesce(nullif(trim(p_business_name), ''), 'Comercio sin nombre'),
      coalesce(nullif(trim(p_owner_name), ''), 'Titular'),
      coalesce(nullif(trim(p_phone), ''), '0000000000'),
      'active'
    )
    returning id into v_customer;
  else
    update public.customers
    set business_name = coalesce(nullif(trim(p_business_name), ''), business_name),
        owner_name = coalesce(nullif(trim(p_owner_name), ''), owner_name),
        phone = coalesce(nullif(trim(p_phone), ''), phone)
    where id = v_customer;
  end if;

  insert into public.organization_members (organization_id, user_id, role, status)
  values (v_org, v_user, 'customer', 'active')
  on conflict (organization_id, user_id) do update set status = 'active';

  return v_customer;
end;
$$;

-- Número de pedido legible y razonablemente único por organización.
create or replace function public.generate_order_number(p_org uuid)
returns text
language sql
volatile
set search_path = ''
as $$
  select 'LM-'
    || to_char(now() at time zone 'utc', 'YYYYMMDD')
    || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
$$;

-- Checkout transaccional: resuelve precios en servidor, valida mínimos y stock,
-- reserva inventario, genera snapshots y devuelve el pedido creado. Nunca confía
-- en importes provistos por el cliente (ADR-005).
create or replace function public.place_order(
  p_items jsonb,
  p_first_name text,
  p_last_name text,
  p_business_name text,
  p_phone text,
  p_email text,
  p_delivery_address text,
  p_notes text
)
returns table (order_id uuid, order_number text, total_cents bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_customer public.customers%rowtype;
  v_org uuid;
  v_list uuid;
  v_order_id uuid;
  v_order_number text;
  v_subtotal bigint := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_kind public.price_kind;
  v_price bigint;
  v_available integer;
  v_line_subtotal bigint;
begin
  if v_user is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'cart is empty';
  end if;

  select * into v_customer
  from public.customers
  where profile_id = v_user and status = 'active'
  order by created_at
  limit 1;

  if v_customer.id is null then
    raise exception 'active customer profile required' using errcode = '42501';
  end if;

  v_org := v_customer.organization_id;

  select id into v_list
  from public.price_lists
  where organization_id = v_org
    and is_active
    and (valid_from is null or valid_from <= now())
    and (valid_until is null or valid_until > now())
  order by priority desc, created_at
  limit 1;

  if v_list is null then
    raise exception 'no active price list';
  end if;

  v_order_number := public.generate_order_number(v_org);

  insert into public.orders (
    organization_id, customer_id, order_number, status, currency_code,
    subtotal_cents, discount_cents, total_cents,
    customer_first_name, customer_last_name, business_name, phone, email,
    delivery_address, notes
  ) values (
    v_org, v_customer.id, v_order_number, 'pending', 'ARS',
    0, 0, 0,
    coalesce(nullif(trim(p_first_name), ''), v_customer.owner_name),
    coalesce(nullif(trim(p_last_name), ''), '-'),
    coalesce(nullif(trim(p_business_name), ''), v_customer.business_name),
    coalesce(nullif(trim(p_phone), ''), v_customer.phone),
    nullif(trim(p_email), ''),
    coalesce(nullif(trim(p_delivery_address), ''), coalesce(v_customer.address, 'A coordinar')),
    nullif(trim(p_notes), '')
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := coalesce((v_item ->> 'quantity')::integer, 0);
    v_kind := (v_item ->> 'price_kind')::public.price_kind;

    if v_qty <= 0 then
      raise exception 'invalid quantity';
    end if;

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
      and organization_id = v_org
      and is_active;

    if v_product.id is null then
      raise exception 'product not available';
    end if;

    if v_product.requires_minimum_purchase and v_qty < v_product.minimum_quantity then
      raise exception 'minimum quantity not met for %', v_product.name
        using errcode = '23514';
    end if;

    select amount_cents into v_price
    from public.product_prices
    where product_id = v_product.id
      and price_list_id = v_list
      and kind = v_kind
      and is_active
      and valid_from <= now()
      and (valid_until is null or valid_until > now())
    order by valid_from desc
    limit 1;

    if v_price is null then
      raise exception 'no price for product %', v_product.name;
    end if;

    select available_quantity into v_available
    from public.inventory
    where organization_id = v_org and product_id = v_product.id
    for update;

    if v_available is null or v_available < v_qty then
      raise exception 'insufficient stock for %', v_product.name
        using errcode = '23514';
    end if;

    update public.inventory
    set reserved_quantity = reserved_quantity + v_qty
    where organization_id = v_org and product_id = v_product.id;

    insert into public.inventory_movements (
      organization_id, product_id, kind, quantity_delta,
      reference_type, reference_id, reason, created_by
    ) values (
      v_org, v_product.id, 'reservation', -v_qty,
      'order', v_order_id, 'Reserva por pedido ' || v_order_number, v_user
    );

    v_line_subtotal := v_qty::bigint * v_price;
    v_subtotal := v_subtotal + v_line_subtotal;

    insert into public.order_items (
      organization_id, order_id, product_id, product_code, product_name,
      price_kind, quantity, unit_price_cents, subtotal_cents
    ) values (
      v_org, v_order_id, v_product.id, v_product.internal_code, v_product.name,
      v_kind, v_qty, v_price, v_line_subtotal
    );
  end loop;

  update public.orders
  set subtotal_cents = v_subtotal,
      discount_cents = 0,
      total_cents = v_subtotal
  where id = v_order_id;

  return query select v_order_id, v_order_number, v_subtotal;
end;
$$;

revoke all on function public.register_customer(text, text, text) from public;
revoke all on function public.generate_order_number(uuid) from public;
revoke all on function public.place_order(
  jsonb, text, text, text, text, text, text, text
) from public;

grant execute on function public.register_customer(text, text, text) to authenticated;
grant execute on function public.place_order(
  jsonb, text, text, text, text, text, text, text
) to authenticated;

commit;
