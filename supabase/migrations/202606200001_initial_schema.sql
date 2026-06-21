begin;

create extension if not exists pgcrypto with schema extensions;

create type public.member_role as enum ('customer', 'subadmin', 'admin');
create type public.membership_status as enum ('pending', 'active', 'suspended');
create type public.customer_status as enum ('pending', 'active', 'inactive', 'blocked');
create type public.order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'dispatched',
  'delivered',
  'cancelled'
);
create type public.price_kind as enum ('unit', 'box', 'display', 'bulk');
create type public.stock_status as enum ('available', 'low_stock', 'out_of_stock');
create type public.promotion_kind as enum ('discount', 'combo', 'featured');
create type public.inventory_movement_kind as enum (
  'initial',
  'purchase',
  'sale',
  'reservation',
  'release',
  'adjustment'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  legal_name text,
  whatsapp text,
  currency_code text not null default 'ARS' check (currency_code ~ '^[A-Z]{3}$'),
  timezone text not null default 'America/Argentina/Buenos_Aires',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'customer',
  status public.membership_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  business_name text not null check (char_length(business_name) between 2 and 160),
  owner_name text not null check (char_length(owner_name) between 2 and 160),
  phone text not null,
  email text,
  address text,
  zone text,
  status public.customer_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, profile_id)
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, slug)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  parent_id uuid,
  name text not null check (char_length(name) between 1 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, slug),
  foreign key (organization_id, parent_id)
    references public.categories(organization_id, id)
    on delete restrict
    deferrable initially deferred,
  check (parent_id is null or parent_id <> id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  brand_id uuid,
  category_id uuid,
  internal_code text not null,
  name text not null check (char_length(name) between 2 and 180),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  sales_unit text not null default 'unidad',
  requires_minimum_purchase boolean not null default false,
  minimum_quantity integer not null default 1 check (minimum_quantity > 0),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, internal_code),
  unique (organization_id, slug),
  foreign key (organization_id, brand_id)
    references public.brands(organization_id, id) on delete restrict,
  foreign key (organization_id, category_id)
    references public.categories(organization_id, id) on delete restrict
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null,
  storage_path text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, product_id)
    references public.products(organization_id, id) on delete cascade,
  unique (organization_id, storage_path)
);

create unique index product_images_one_primary_per_product
  on public.product_images(product_id)
  where is_primary and is_active;

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null,
  quantity integer not null default 0 check (quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  low_stock_threshold integer not null default 10 check (low_stock_threshold >= 0),
  available_quantity integer generated always as (
    greatest(quantity - reserved_quantity, 0)
  ) stored,
  status public.stock_status generated always as (
    case
      when quantity - reserved_quantity <= 0 then 'out_of_stock'::public.stock_status
      when quantity - reserved_quantity <= low_stock_threshold then 'low_stock'::public.stock_status
      else 'available'::public.stock_status
    end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, product_id)
    references public.products(organization_id, id) on delete cascade,
  unique (organization_id, id),
  unique (organization_id, product_id),
  check (reserved_quantity <= quantity)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null,
  kind public.inventory_movement_kind not null,
  quantity_delta integer not null check (quantity_delta <> 0),
  reference_type text,
  reference_id uuid,
  reason text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (organization_id, product_id)
    references public.products(organization_id, id) on delete restrict
);

create table public.price_lists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  currency_code text not null default 'ARS' check (currency_code ~ '^[A-Z]{3}$'),
  priority integer not null default 0,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, name),
  check (valid_until is null or valid_from is null or valid_until > valid_from)
);

create table public.product_prices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null,
  price_list_id uuid not null,
  kind public.price_kind not null,
  amount_cents bigint not null check (amount_cents >= 0),
  units_included integer not null default 1 check (units_included > 0),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, product_id)
    references public.products(organization_id, id) on delete cascade,
  foreign key (organization_id, price_list_id)
    references public.price_lists(organization_id, id) on delete cascade,
  unique (organization_id, id),
  unique (product_id, price_list_id, kind, valid_from),
  check (valid_until is null or valid_until > valid_from)
);

create table public.price_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_price_id uuid not null,
  previous_amount_cents bigint,
  new_amount_cents bigint not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now(),
  reason text,
  foreign key (organization_id, product_price_id)
    references public.product_prices(organization_id, id) on delete cascade
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  label text not null default 'Promoción',
  kind public.promotion_kind not null,
  discount_percentage numeric(5,2) check (
    discount_percentage is null or discount_percentage between 0 and 100
  ),
  rules jsonb not null default '{}'::jsonb check (jsonb_typeof(rules) = 'object'),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  priority integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  check (ends_at is null or ends_at > starts_at)
);

create table public.promotion_products (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  promotion_id uuid not null,
  product_id uuid not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  primary key (promotion_id, product_id),
  foreign key (organization_id, promotion_id)
    references public.promotions(organization_id, id) on delete cascade,
  foreign key (organization_id, product_id)
    references public.products(organization_id, id) on delete cascade
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  customer_id uuid not null,
  order_number text not null,
  status public.order_status not null default 'pending',
  currency_code text not null default 'ARS' check (currency_code ~ '^[A-Z]{3}$'),
  subtotal_cents bigint not null default 0 check (subtotal_cents >= 0),
  discount_cents bigint not null default 0 check (discount_cents >= 0),
  total_cents bigint not null default 0 check (total_cents >= 0),
  customer_first_name text not null,
  customer_last_name text not null,
  business_name text not null,
  phone text not null,
  email text,
  delivery_address text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, order_number),
  foreign key (organization_id, customer_id)
    references public.customers(organization_id, id) on delete restrict,
  check (discount_cents <= subtotal_cents),
  check (total_cents = subtotal_cents - discount_cents)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  order_id uuid not null,
  product_id uuid not null,
  product_code text not null,
  product_name text not null,
  price_kind public.price_kind not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  subtotal_cents bigint not null check (subtotal_cents >= 0),
  created_at timestamptz not null default now(),
  foreign key (organization_id, order_id)
    references public.orders(organization_id, id) on delete cascade,
  foreign key (organization_id, product_id)
    references public.products(organization_id, id) on delete restrict,
  check (subtotal_cents = quantity::bigint * unit_price_cents)
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  order_id uuid not null,
  previous_status public.order_status,
  new_status public.order_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  comment text,
  created_at timestamptz not null default now(),
  foreign key (organization_id, order_id)
    references public.orders(organization_id, id) on delete cascade
);

create index organization_members_user_idx
  on public.organization_members(user_id, status);
create index customers_profile_idx on public.customers(profile_id);
create index categories_parent_idx on public.categories(organization_id, parent_id);
create index products_catalog_idx
  on public.products(organization_id, is_active, category_id, brand_id);
create index product_images_product_idx
  on public.product_images(product_id, is_active, sort_order);
create index product_prices_lookup_idx
  on public.product_prices(product_id, price_list_id, kind, is_active, valid_from, valid_until);
create index promotions_active_idx
  on public.promotions(organization_id, is_active, starts_at, ends_at);
create index orders_customer_idx on public.orders(customer_id, created_at desc);
create index orders_status_idx on public.orders(organization_id, status, created_at desc);
create index inventory_movements_product_idx
  on public.inventory_movements(product_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.get_current_user_role(target_organization_id uuid)
returns public.member_role
language sql
stable
security definer
set search_path = ''
as $$
  select om.role
  from public.organization_members om
  where om.user_id = (select auth.uid())
    and om.organization_id = target_organization_id
    and om.status = 'active'
  limit 1;
$$;

create or replace function public.get_current_user_role()
returns public.member_role
language sql
stable
security definer
set search_path = ''
as $$
  select om.role
  from public.organization_members om
  where om.user_id = (select auth.uid())
    and om.status = 'active'
  order by case om.role
    when 'admin' then 1
    when 'subadmin' then 2
    else 3
  end
  limit 1;
$$;

create or replace function public.has_role(
  target_organization_id uuid,
  allowed_roles public.member_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.user_id = (select auth.uid())
      and om.organization_id = target_organization_id
      and om.status = 'active'
      and om.role = any(allowed_roles)
  );
$$;

create or replace function public.is_active_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.user_id = (select auth.uid())
      and om.organization_id = target_organization_id
      and om.status = 'active'
  );
$$;

create or replace function public.validate_category_parent()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  parent_organization_id uuid;
  creates_cycle boolean;
begin
  if new.parent_id is null then
    return new;
  end if;

  select organization_id into parent_organization_id
  from public.categories
  where id = new.parent_id;

  if parent_organization_id is null or parent_organization_id <> new.organization_id then
    raise exception 'Category parent must belong to the same organization';
  end if;

  with recursive ancestors as (
    select id, parent_id from public.categories where id = new.parent_id
    union all
    select c.id, c.parent_id
    from public.categories c
    join ancestors a on c.id = a.parent_id
  )
  select exists(select 1 from ancestors where id = new.id) into creates_cycle;

  if creates_cycle then
    raise exception 'Category hierarchy cannot contain cycles';
  end if;

  return new;
end;
$$;

create or replace function public.log_price_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.amount_cents is distinct from new.amount_cents then
    insert into public.price_history (
      organization_id,
      product_price_id,
      previous_amount_cents,
      new_amount_cents,
      changed_by
    ) values (
      new.organization_id,
      new.id,
      case when tg_op = 'UPDATE' then old.amount_cents else null end,
      new.amount_cents,
      (select auth.uid())
    );
  end if;
  return new;
end;
$$;

create or replace function public.log_inventory_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  delta integer;
begin
  delta := case when tg_op = 'INSERT' then new.quantity else new.quantity - old.quantity end;
  if delta <> 0 then
    insert into public.inventory_movements (
      organization_id,
      product_id,
      kind,
      quantity_delta,
      reason,
      created_by
    ) values (
      new.organization_id,
      new.product_id,
      case when tg_op = 'INSERT' then 'initial'::public.inventory_movement_kind
        else 'adjustment'::public.inventory_movement_kind end,
      delta,
      'Automatic inventory balance audit',
      (select auth.uid())
    );
  end if;
  return new;
end;
$$;

create or replace function public.log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.order_status_history (
      organization_id,
      order_id,
      previous_status,
      new_status,
      changed_by
    ) values (
      new.organization_id,
      new.id,
      case when tg_op = 'UPDATE' then old.status else null end,
      new.status,
      (select auth.uid())
    );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger categories_validate_parent
  before insert or update of parent_id, organization_id on public.categories
  for each row execute function public.validate_category_parent();

create trigger product_prices_history
  after insert or update of amount_cents on public.product_prices
  for each row execute function public.log_price_change();

create trigger inventory_audit
  after insert or update of quantity on public.inventory
  for each row execute function public.log_inventory_change();

create trigger orders_status_history
  after insert or update of status on public.orders
  for each row execute function public.log_order_status_change();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'organizations', 'profiles', 'organization_members', 'customers', 'brands',
    'categories', 'products', 'product_images', 'inventory', 'price_lists',
    'product_prices', 'promotions', 'orders'
  ] loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I '
      'for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

create view public.public_catalog_products
with (security_barrier = true)
as
select
  p.id,
  p.organization_id,
  p.internal_code,
  p.name,
  p.slug,
  p.description,
  p.sales_unit,
  p.requires_minimum_purchase,
  p.minimum_quantity,
  p.is_featured,
  p.brand_id,
  b.name as brand_name,
  p.category_id,
  c.name as category_name,
  coalesce(i.available_quantity, 0) as available_quantity,
  coalesce(i.status, 'out_of_stock'::public.stock_status) as stock_status,
  p.created_at,
  p.updated_at
from public.products p
left join public.brands b
  on b.organization_id = p.organization_id and b.id = p.brand_id
left join public.categories c
  on c.organization_id = p.organization_id and c.id = p.category_id
left join public.inventory i
  on i.organization_id = p.organization_id and i.product_id = p.id
where p.is_active
  and (b.id is null or b.is_active)
  and (c.id is null or c.is_active);

comment on view public.public_catalog_products is
  'Public catalog projection. Deliberately excludes all price and reserved stock fields.';

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.customers enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.price_lists enable row level security;
alter table public.product_prices enable row level security;
alter table public.price_history enable row level security;
alter table public.promotions enable row level security;
alter table public.promotion_products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

create policy organizations_member_select on public.organizations
  for select to authenticated
  using (public.is_active_member(id));
create policy organizations_admin_all on public.organizations
  for all to authenticated
  using (public.has_role(id, array['admin']::public.member_role[]))
  with check (public.has_role(id, array['admin']::public.member_role[]));

create policy profiles_own_select on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_own_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy memberships_own_select on public.organization_members
  for select to authenticated using (user_id = (select auth.uid()));
create policy memberships_admin_all on public.organization_members
  for all to authenticated
  using (public.has_role(organization_id, array['admin']::public.member_role[]))
  with check (public.has_role(organization_id, array['admin']::public.member_role[]));

create policy customers_own_select on public.customers
  for select to authenticated using (profile_id = (select auth.uid()));
create policy customers_staff_all on public.customers
  for all to authenticated
  using (public.has_role(
    organization_id,
    array['subadmin', 'admin']::public.member_role[]
  ))
  with check (public.has_role(
    organization_id,
    array['subadmin', 'admin']::public.member_role[]
  ));

create policy brands_public_select on public.brands
  for select to anon, authenticated using (is_active);
create policy brands_admin_all on public.brands
  for all to authenticated
  using (public.has_role(organization_id, array['admin']::public.member_role[]))
  with check (public.has_role(organization_id, array['admin']::public.member_role[]));

create policy categories_public_select on public.categories
  for select to anon, authenticated using (is_active);
create policy categories_admin_all on public.categories
  for all to authenticated
  using (public.has_role(organization_id, array['admin']::public.member_role[]))
  with check (public.has_role(organization_id, array['admin']::public.member_role[]));

create policy products_public_select on public.products
  for select to anon, authenticated using (is_active);
create policy products_admin_all on public.products
  for all to authenticated
  using (public.has_role(organization_id, array['admin']::public.member_role[]))
  with check (public.has_role(organization_id, array['admin']::public.member_role[]));

create policy product_images_public_select on public.product_images
  for select to anon, authenticated using (is_active);
create policy product_images_admin_all on public.product_images
  for all to authenticated
  using (public.has_role(organization_id, array['admin']::public.member_role[]))
  with check (public.has_role(organization_id, array['admin']::public.member_role[]));

create policy inventory_staff_all on public.inventory
  for all to authenticated
  using (public.has_role(
    organization_id,
    array['subadmin', 'admin']::public.member_role[]
  ))
  with check (public.has_role(
    organization_id,
    array['subadmin', 'admin']::public.member_role[]
  ));

create policy inventory_movements_staff_select on public.inventory_movements
  for select to authenticated
  using (public.has_role(
    organization_id,
    array['subadmin', 'admin']::public.member_role[]
  ));
create policy inventory_movements_staff_insert on public.inventory_movements
  for insert to authenticated
  with check (public.has_role(
    organization_id,
    array['subadmin', 'admin']::public.member_role[]
  ));

create policy price_lists_member_select on public.price_lists
  for select to authenticated
  using (is_active and public.is_active_member(organization_id));
create policy price_lists_admin_all on public.price_lists
  for all to authenticated
  using (public.has_role(organization_id, array['admin']::public.member_role[]))
  with check (public.has_role(organization_id, array['admin']::public.member_role[]));

create policy product_prices_member_select on public.product_prices
  for select to authenticated
  using (
    is_active
    and valid_from <= now()
    and (valid_until is null or valid_until > now())
    and public.is_active_member(organization_id)
  );
create policy product_prices_admin_all on public.product_prices
  for all to authenticated
  using (public.has_role(organization_id, array['admin']::public.member_role[]))
  with check (public.has_role(organization_id, array['admin']::public.member_role[]));

create policy price_history_admin_select on public.price_history
  for select to authenticated
  using (public.has_role(organization_id, array['admin']::public.member_role[]));

create policy promotions_public_select on public.promotions
  for select to anon, authenticated
  using (is_active and starts_at <= now() and (ends_at is null or ends_at > now()));
create policy promotions_admin_all on public.promotions
  for all to authenticated
  using (public.has_role(organization_id, array['admin']::public.member_role[]))
  with check (public.has_role(organization_id, array['admin']::public.member_role[]));

create policy promotion_products_public_select on public.promotion_products
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.promotions promotion
      where promotion.id = promotion_products.promotion_id
        and promotion.organization_id = promotion_products.organization_id
        and promotion.is_active
        and promotion.starts_at <= now()
        and (promotion.ends_at is null or promotion.ends_at > now())
    )
  );
create policy promotion_products_admin_all on public.promotion_products
  for all to authenticated
  using (public.has_role(organization_id, array['admin']::public.member_role[]))
  with check (public.has_role(organization_id, array['admin']::public.member_role[]));

create policy orders_customer_select on public.orders
  for select to authenticated
  using (
    exists (
      select 1 from public.customers customer
      where customer.id = orders.customer_id
        and customer.organization_id = orders.organization_id
        and customer.profile_id = (select auth.uid())
    )
  );
create policy orders_staff_all on public.orders
  for all to authenticated
  using (public.has_role(
    organization_id,
    array['subadmin', 'admin']::public.member_role[]
  ))
  with check (public.has_role(
    organization_id,
    array['subadmin', 'admin']::public.member_role[]
  ));

create policy order_items_customer_select on public.order_items
  for select to authenticated
  using (
    exists (
      select 1
      from public.orders customer_order
      join public.customers customer
        on customer.id = customer_order.customer_id
        and customer.organization_id = customer_order.organization_id
      where customer_order.id = order_items.order_id
        and customer_order.organization_id = order_items.organization_id
        and customer.profile_id = (select auth.uid())
    )
  );
create policy order_items_staff_all on public.order_items
  for all to authenticated
  using (public.has_role(
    organization_id,
    array['subadmin', 'admin']::public.member_role[]
  ))
  with check (public.has_role(
    organization_id,
    array['subadmin', 'admin']::public.member_role[]
  ));

create policy order_history_customer_select on public.order_status_history
  for select to authenticated
  using (
    exists (
      select 1
      from public.orders customer_order
      join public.customers customer
        on customer.id = customer_order.customer_id
        and customer.organization_id = customer_order.organization_id
      where customer_order.id = order_status_history.order_id
        and customer_order.organization_id = order_status_history.organization_id
        and customer.profile_id = (select auth.uid())
    )
  );
create policy order_history_staff_select on public.order_status_history
  for select to authenticated
  using (public.has_role(
    organization_id,
    array['subadmin', 'admin']::public.member_role[]
  ));

revoke all on all tables in schema public from anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant select on public.public_catalog_products to anon, authenticated;

revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_user() from public;
revoke all on function public.validate_category_parent() from public;
revoke all on function public.log_price_change() from public;
revoke all on function public.log_inventory_change() from public;
revoke all on function public.log_order_status_change() from public;
revoke all on function public.get_current_user_role(uuid) from public;
revoke all on function public.get_current_user_role() from public;
revoke all on function public.has_role(uuid, public.member_role[]) from public;
revoke all on function public.is_active_member(uuid) from public;
grant execute on function public.get_current_user_role(uuid) to authenticated;
grant execute on function public.get_current_user_role() to authenticated;
grant execute on function public.has_role(uuid, public.member_role[]) to authenticated;
grant execute on function public.is_active_member(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
), (
  'organization-assets',
  'organization-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do nothing;

create policy product_images_storage_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy organization_storage_admin_all on storage.objects
  for all to authenticated
  using (
    bucket_id in ('product-images', 'organization-assets')
    and exists (
      select 1 from public.organization_members member
      where member.user_id = (select auth.uid())
        and member.role = 'admin'
        and member.status = 'active'
        and member.organization_id::text = (storage.foldername(name))[1]
    )
  )
  with check (
    bucket_id in ('product-images', 'organization-assets')
    and exists (
      select 1 from public.organization_members member
      where member.user_id = (select auth.uid())
        and member.role = 'admin'
        and member.status = 'active'
        and member.organization_id::text = (storage.foldername(name))[1]
    )
  );

commit;
