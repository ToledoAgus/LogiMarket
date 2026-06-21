begin;

insert into public.organizations (
  id,
  name,
  slug,
  legal_name,
  whatsapp,
  currency_code,
  timezone,
  is_active
) values (
  '00000000-0000-4000-8000-000000000001',
  'LogiMarket',
  'logimarket',
  'LogiMarket',
  '+5491151461419',
  'ARS',
  'America/Argentina/Buenos_Aires',
  true
)
on conflict (id) do update set
  name = excluded.name,
  legal_name = excluded.legal_name,
  whatsapp = excluded.whatsapp,
  currency_code = excluded.currency_code,
  timezone = excluded.timezone,
  is_active = excluded.is_active;

insert into public.brands (id, organization_id, name, slug, is_active)
values
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000001',
    'Bagley',
    'bagley',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000001',
    'Arcor',
    'arcor',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000001',
    'Genérica',
    'generica',
    true
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  is_active = excluded.is_active;

insert into public.categories (
  id,
  organization_id,
  parent_id,
  name,
  slug,
  sort_order,
  is_active
)
values
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000001',
    null,
    'Galletitas',
    'galletitas',
    10,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000001',
    null,
    'Alfajores',
    'alfajores',
    20,
    true
  )
on conflict (id) do update set
  parent_id = excluded.parent_id,
  name = excluded.name,
  slug = excluded.slug,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.categories (
  id,
  organization_id,
  parent_id,
  name,
  slug,
  sort_order,
  is_active
)
values
  (
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    'Dulces',
    'galletitas-dulces',
    10,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000204',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    'Saladas',
    'galletitas-saladas',
    20,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000205',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000202',
    'Dulce de leche',
    'alfajores-dulce-de-leche',
    10,
    true
  )
on conflict (id) do update set
  parent_id = excluded.parent_id,
  name = excluded.name,
  slug = excluded.slug,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.products (
  id,
  organization_id,
  brand_id,
  category_id,
  internal_code,
  name,
  slug,
  description,
  sales_unit,
  requires_minimum_purchase,
  minimum_quantity,
  is_featured,
  is_active
)
values
  (
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000203',
    'GAL-SUR-BAG',
    'Surtido Bagley',
    'surtido-bagley',
    'Surtido de galletitas Bagley.',
    'paquete',
    true,
    3,
    true,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000302',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000203',
    'GAL-SUR-DIV',
    'Surtido Diversión',
    'surtido-diversion',
    'Surtido de galletitas dulces.',
    'paquete',
    true,
    3,
    false,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000303',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000204',
    'GAL-TRA-X3',
    'Traviata x3',
    'traviata-x3',
    'Pack de tres paquetes de galletitas saladas.',
    'pack',
    false,
    1,
    false,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000304',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000203',
    'GAL-CHO-250',
    'Chocolina 250 g',
    'chocolina-250-g',
    'Galletitas de chocolate en presentación de 250 g.',
    'paquete',
    false,
    1,
    true,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000305',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000205',
    'ALF-GEN-001',
    'Alfajor Genérico',
    'alfajor-generico',
    'Alfajor relleno con dulce de leche.',
    'unidad',
    true,
    6,
    false,
    true
  )
on conflict (id) do update set
  brand_id = excluded.brand_id,
  category_id = excluded.category_id,
  internal_code = excluded.internal_code,
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  sales_unit = excluded.sales_unit,
  requires_minimum_purchase = excluded.requires_minimum_purchase,
  minimum_quantity = excluded.minimum_quantity,
  is_featured = excluded.is_featured,
  is_active = excluded.is_active;

insert into public.inventory (
  id,
  organization_id,
  product_id,
  quantity,
  reserved_quantity,
  low_stock_threshold
)
values
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000301', 80, 0, 10),
  ('00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000302', 45, 0, 10),
  ('00000000-0000-4000-8000-000000000603', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000303', 25, 0, 8),
  ('00000000-0000-4000-8000-000000000604', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000304', 9, 0, 10),
  ('00000000-0000-4000-8000-000000000605', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000305', 0, 0, 10)
on conflict (id) do update set
  quantity = excluded.quantity,
  reserved_quantity = excluded.reserved_quantity,
  low_stock_threshold = excluded.low_stock_threshold;

insert into public.price_lists (
  id,
  organization_id,
  name,
  currency_code,
  priority,
  valid_from,
  is_active
)
values (
  '00000000-0000-4000-8000-000000000401',
  '00000000-0000-4000-8000-000000000001',
  'Lista general',
  'ARS',
  100,
  '2026-01-01T00:00:00Z',
  true
)
on conflict (id) do update set
  name = excluded.name,
  currency_code = excluded.currency_code,
  priority = excluded.priority,
  valid_from = excluded.valid_from,
  is_active = excluded.is_active;

insert into public.product_prices (
  id,
  organization_id,
  product_id,
  price_list_id,
  kind,
  amount_cents,
  units_included,
  valid_from,
  is_active
)
values
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000401', 'unit', 285000, 1, '2026-01-01T00:00:00Z', true),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000401', 'box', 3240000, 12, '2026-01-01T00:00:00Z', true),
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000401', 'display', 1620000, 6, '2026-01-01T00:00:00Z', true),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000401', 'bulk', 6120000, 24, '2026-01-01T00:00:00Z', true),
  ('00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000401', 'unit', 275000, 1, '2026-01-01T00:00:00Z', true),
  ('00000000-0000-4000-8000-000000000506', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000401', 'unit', 310000, 1, '2026-01-01T00:00:00Z', true),
  ('00000000-0000-4000-8000-000000000507', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000401', 'unit', 230000, 1, '2026-01-01T00:00:00Z', true),
  ('00000000-0000-4000-8000-000000000508', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000401', 'unit', 95000, 1, '2026-01-01T00:00:00Z', true)
on conflict (id) do update set
  amount_cents = excluded.amount_cents,
  units_included = excluded.units_included,
  is_active = excluded.is_active;

-- Cliente de prueba pre-confirmado para validar el flujo autenticado local
-- (precios, carrito y checkout). Solo para desarrollo: credenciales no secretas.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-8000-000000000701',
  'authenticated',
  'authenticated',
  'cliente@logimarket.test',
  extensions.crypt('logimarket123', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"first_name":"Cliente","last_name":"Demo"}'::jsonb,
  false, false
)
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  '00000000-0000-4000-8000-000000000701',
  '00000000-0000-4000-8000-000000000701',
  'email',
  '{"sub":"00000000-0000-4000-8000-000000000701","email":"cliente@logimarket.test","email_verified":true}'::jsonb,
  now(), now(), now()
)
on conflict do nothing;

insert into public.organization_members (
  id, organization_id, user_id, role, status
) values (
  '00000000-0000-4000-8000-000000000801',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000701',
  'customer',
  'active'
)
on conflict (organization_id, user_id) do update set status = excluded.status;

insert into public.customers (
  id, organization_id, profile_id, business_name, owner_name,
  phone, email, address, zone, status
) values (
  '00000000-0000-4000-8000-000000000901',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000701',
  'Kiosco Demo',
  'Cliente Demo',
  '+5491100000000',
  'cliente@logimarket.test',
  'Av. Siempre Viva 123',
  'Centro',
  'active'
)
on conflict (id) do update set status = excluded.status;

commit;
