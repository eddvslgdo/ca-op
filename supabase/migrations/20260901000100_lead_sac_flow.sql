-- Corte 2: flujo transaccional Lead -> SAC -> CRM simulado -> Onboarding.

create or replace function public.is_internal_user(allowed_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and (allowed_roles is null or role = any(allowed_roles))
  );
$$;

revoke all on function public.is_internal_user(text[]) from public;
grant execute on function public.is_internal_user(text[]) to authenticated;

create policy "SAC inserts sessions"
on public.sessions for insert to authenticated
with check (public.is_internal_user(array['sac_operator', 'sac_reviewer', 'admin']));

create policy "SAC updates sessions"
on public.sessions for update to authenticated
using (public.is_internal_user(array['sac_operator', 'sac_reviewer', 'admin']))
with check (public.is_internal_user(array['sac_operator', 'sac_reviewer', 'admin']));

create policy "SAC inserts leads"
on public.leads for insert to authenticated
with check (public.is_internal_user(array['sac_operator', 'admin']));

create policy "SAC updates leads"
on public.leads for update to authenticated
using (public.is_internal_user(array['sac_operator', 'sac_reviewer', 'admin']))
with check (public.is_internal_user(array['sac_operator', 'sac_reviewer', 'admin']));

create policy "SAC inserts audit"
on public.audit_logs for insert to authenticated
with check (public.is_internal_user(array['sac_operator', 'sac_reviewer', 'admin']));

create policy "SAC manages profiles"
on public.commercial_profiles for insert to authenticated
with check (public.is_internal_user(array['sac_operator', 'admin']));

create policy "SAC updates profiles"
on public.commercial_profiles for update to authenticated
using (public.is_internal_user(array['sac_operator', 'admin']))
with check (public.is_internal_user(array['sac_operator', 'admin']));

create or replace function public.create_public_lead(
  p_legal_name text,
  p_tax_id text,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_commercial_interest text
)
returns table(lead_id uuid, session_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lead_id uuid;
  v_session_id uuid;
  v_tax_id text := upper(btrim(p_tax_id));
  v_email text := lower(btrim(p_contact_email));
begin
  if length(btrim(p_legal_name)) < 2 then
    raise exception 'La razón social es obligatoria';
  end if;
  if v_tax_id !~ '^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$' then
    raise exception 'El RFC no tiene un formato válido';
  end if;
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'El correo no tiene un formato válido';
  end if;
  if length(regexp_replace(coalesce(p_contact_phone, ''), '[^0-9]', '', 'g')) < 10 then
    raise exception 'El teléfono debe contener al menos 10 dígitos';
  end if;
  if length(btrim(p_contact_name)) < 2 or length(btrim(p_commercial_interest)) < 2 then
    raise exception 'Faltan datos mínimos del Lead';
  end if;

  insert into public.leads (
    legal_name, tax_id, contact_name, contact_email, contact_phone,
    commercial_interest
  ) values (
    btrim(p_legal_name), v_tax_id, btrim(p_contact_name), v_email,
    btrim(p_contact_phone), btrim(p_commercial_interest)
  ) returning id into v_lead_id;

  insert into public.sessions (
    lead_id, workflow, status, access_token_hash, ultimo_avance
  ) values (
    v_lead_id,
    'lead',
    'completed_by_client',
    encode(extensions.digest(gen_random_uuid()::text, 'sha256'), 'hex'),
    jsonb_build_object(
      'empresa', jsonb_build_object(
        'razonSocial', btrim(p_legal_name), 'rfc', v_tax_id,
        'regimenFiscal', '', 'usoCFDI', '', 'giroComercial', ''
      ),
      'direccionFiscal', jsonb_build_object(
        'codigoPostal', '', 'tipoVialidad', '', 'calle', '',
        'numeroExterior', '', 'colonia', '', 'municipio', '', 'estado', ''
      ),
      'direccionesEntrega', '[]'::jsonb,
      'contacto', jsonb_build_object(
        'nombreRepresentante', btrim(p_contact_name),
        'correoContacto', v_email, 'telefonoContacto', btrim(p_contact_phone)
      ),
      'facturacion', jsonb_build_object(
        'metodoPago', '', 'formaPago', '', 'banco', '',
        'cuenta4Digitos', '', 'correoFacturas', v_email
      ),
      'interesComercial', btrim(p_commercial_interest)
    )
  ) returning sessions.session_id into v_session_id;

  insert into public.audit_logs (
    session_id, lead_id, event_type, usuario, actor_role, accion, resultado
  ) values (
    v_session_id, v_lead_id, 'lead.created', 'Prospecto', 'public',
    'Registro público de Lead', 'Lead recibido; pendiente de revisión SAC'
  );

  return query select v_lead_id, v_session_id;
exception
  when unique_violation then
    raise exception 'Ya existe un Lead activo con este RFC';
end;
$$;

revoke all on function public.create_public_lead(text, text, text, text, text, text) from public;
grant execute on function public.create_public_lead(text, text, text, text, text, text) to anon, authenticated;

create or replace function public.simulate_crm_prospect(p_session_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.sessions%rowtype;
  v_lead public.leads%rowtype;
  v_crm_id text;
  v_idempotency_key text;
begin
  if not public.is_internal_user(array['sac_operator', 'sac_reviewer', 'admin']) then
    raise exception 'Acción no autorizada';
  end if;

  select * into v_session from public.sessions where session_id = p_session_id for update;
  if not found or v_session.workflow <> 'lead' or v_session.status <> 'completed_by_client' then
    raise exception 'El Lead no está listo para sincronizar';
  end if;
  if v_session.crm_prospect_id is not null then
    return v_session.crm_prospect_id;
  end if;

  select * into v_lead from public.leads where id = v_session.lead_id for update;
  if not found then raise exception 'La sesión no está vinculada a un Lead'; end if;

  v_crm_id := 'SIM-CRM-' || upper(substr(replace(v_lead.id::text, '-', ''), 1, 10));
  v_idempotency_key := 'lead.ready:' || v_lead.id::text || ':v1';

  insert into public.integration_jobs (
    session_id, lead_id, event_type, idempotency_key, payload, payload_hash,
    status, attempt_count, crm_prospect_id, confirmed_at
  ) values (
    v_session.session_id, v_lead.id, 'lead.ready', v_idempotency_key,
    jsonb_build_object(
      'externalLeadId', v_lead.id,
      'legalName', v_lead.legal_name,
      'taxId', v_lead.tax_id,
      'contactName', v_lead.contact_name,
      'contactEmail', v_lead.contact_email,
      'contactPhone', v_lead.contact_phone,
      'commercialInterest', v_lead.commercial_interest,
      'simulation', true
    ),
    encode(extensions.digest(v_lead.id::text || v_lead.updated_at::text, 'sha256'), 'hex'),
    'confirmed', 1, v_crm_id, now()
  ) on conflict (idempotency_key) do nothing;

  update public.leads
  set crm_prospect_id = v_crm_id, crm_sync_status = 'confirmed'
  where id = v_lead.id;
  update public.sessions set crm_prospect_id = v_crm_id where session_id = p_session_id;

  insert into public.audit_logs (
    session_id, lead_id, event_type, usuario, actor_id, actor_role,
    accion, resultado
  ) values (
    p_session_id, v_lead.id, 'lead.crm_simulated', 'SAC', auth.uid(),
    public.current_internal_role(), 'Simulación de alta de Prospecto en CRM',
    'Confirmado en modo simulado: ' || v_crm_id
  );
  return v_crm_id;
end;
$$;

revoke all on function public.simulate_crm_prospect(uuid) from public;
grant execute on function public.simulate_crm_prospect(uuid) to authenticated;

create or replace function public.promote_lead_to_onboarding(
  p_session_id uuid,
  p_raw_token text,
  p_owner text,
  p_commercial_config jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.sessions%rowtype;
begin
  if not public.is_internal_user(array['sac_operator', 'admin']) then
    raise exception 'Acción no autorizada';
  end if;
  if length(p_raw_token) < 32 then raise exception 'Token de acceso inválido'; end if;

  select * into v_session from public.sessions where session_id = p_session_id for update;
  if not found or v_session.workflow <> 'lead' or v_session.status <> 'completed_by_client' then
    raise exception 'La sesión no puede promoverse desde su estado actual';
  end if;
  if v_session.crm_prospect_id is null then
    raise exception 'El Lead debe existir primero como Prospecto en CRM';
  end if;

  update public.sessions
  set workflow = 'onboarding', status = 'active', propietario = nullif(btrim(p_owner), ''),
      config_comercial = coalesce(p_commercial_config, '[]'::jsonb),
      token = p_raw_token,
      access_token_hash = encode(extensions.digest(p_raw_token, 'sha256'), 'hex'),
      expires_at = now() + interval '3 days', reactivaciones_count = reactivaciones_count + 1,
      current_step = 1
  where session_id = p_session_id;

  insert into public.audit_logs (
    session_id, lead_id, event_type, usuario, actor_id, actor_role, accion, resultado
  ) values (
    p_session_id, v_session.lead_id, 'lead.promoted', 'SAC', auth.uid(),
    public.current_internal_role(), 'Promoción de Lead a Onboarding',
    'Onboarding iniciado conservando ' || v_session.crm_prospect_id
  );
end;
$$;

revoke all on function public.promote_lead_to_onboarding(uuid, text, text, jsonb) from public;
grant execute on function public.promote_lead_to_onboarding(uuid, text, text, jsonb) to authenticated;
