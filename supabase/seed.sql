-- Datos exclusivamente locales. No usar información real de clientes.
-- Los usuarios internos se crearán mediante Supabase Auth local y después
-- se asociarán manualmente con public.user_roles durante las pruebas.

insert into public.commercial_profiles (profile_key, profile_name, config)
values (
  'local_industrial_mxn',
  'Local - Industrial MXN',
  jsonb_build_object(
    'unidadNegocio', 'Industrial PQ',
    'canalDistribucion', 'Industrial',
    'division', 'Nacional',
    'moneda', 'MXN - Peso mexicano',
    'prioridadEntrega', 'Normal'
  )
)
on conflict (profile_key) do nothing;

-- Usuario exclusivamente local para validar el workspace SAC.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-111111111111',
  'authenticated', 'authenticated', 'sac.local@ca-op.test',
  crypt('CaOp-Local-2026!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"SAC Local"}'::jsonb, now(), now(), '', '', '', ''
) on conflict (id) do nothing;

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at,
  created_at, updated_at
) values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  '{"sub":"11111111-1111-4111-8111-111111111111","email":"sac.local@ca-op.test","email_verified":true}'::jsonb,
  'email', now(), now(), now()
) on conflict (provider_id, provider) do nothing;

insert into public.user_roles (user_id, role)
values ('11111111-1111-4111-8111-111111111111', 'admin')
on conflict (user_id) do update set role = excluded.role;
