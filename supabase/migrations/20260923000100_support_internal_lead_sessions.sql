-- Permite sincronizar Leads originados por SAC que nacieron como sesión y todavía
-- no tienen una fila correlacionada en public.leads (RN-020).

alter function public.simulate_crm_prospect(uuid)
rename to simulate_crm_prospect_linked;

revoke all on function public.simulate_crm_prospect_linked(uuid) from public, authenticated;

create function public.simulate_crm_prospect(p_session_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.sessions%rowtype;
  v_lead_id uuid;
  v_legal_name text;
  v_tax_id text;
  v_contact_name text;
  v_contact_email text;
  v_contact_phone text;
  v_commercial_interest text;
begin
  if not public.is_internal_user(array['sac_operator', 'sac_reviewer', 'admin']) then
    raise exception 'Acción no autorizada';
  end if;

  select * into v_session
  from public.sessions
  where session_id = p_session_id
  for update;

  if not found or v_session.workflow <> 'lead' or v_session.status <> 'completed_by_client' then
    raise exception 'El Lead debe estar completado por el cliente antes de sincronizar';
  end if;

  if v_session.lead_id is null then
    v_legal_name := btrim(coalesce(v_session.ultimo_avance #>> '{empresa,razonSocial}', ''));
    v_tax_id := upper(btrim(coalesce(v_session.ultimo_avance #>> '{empresa,rfc}', '')));
    v_contact_name := btrim(coalesce(v_session.ultimo_avance #>> '{contacto,nombreRepresentante}', ''));
    v_contact_email := lower(btrim(coalesce(v_session.ultimo_avance #>> '{contacto,correoContacto}', '')));
    v_contact_phone := btrim(coalesce(v_session.ultimo_avance #>> '{contacto,telefonoContacto}', ''));
    v_commercial_interest := btrim(coalesce(v_session.ultimo_avance ->> 'interesComercial', 'Lead originado por SAC'));

    if v_legal_name = '' or v_tax_id = '' or v_contact_name = ''
       or v_contact_email = '' or v_contact_phone = '' then
      raise exception 'La sesión no contiene los datos mínimos para crear el Prospecto';
    end if;

    select id into v_lead_id
    from public.leads
    where upper(btrim(tax_id)) = v_tax_id and closed_at is null
    limit 1
    for update;

    if v_lead_id is null then
      insert into public.leads (
        legal_name, tax_id, contact_name, contact_email, contact_phone,
        commercial_interest, owner_id
      ) values (
        v_legal_name, v_tax_id, v_contact_name, v_contact_email,
        v_contact_phone, v_commercial_interest, auth.uid()
      ) returning id into v_lead_id;
    end if;

    update public.sessions
    set lead_id = v_lead_id
    where session_id = p_session_id;

    insert into public.audit_logs (
      session_id, lead_id, event_type, usuario, actor_id, actor_role,
      accion, resultado
    ) values (
      p_session_id, v_lead_id, 'lead.linked', 'SAC', auth.uid(),
      public.current_internal_role(), 'Vinculación de sesión con Lead',
      'Lead creado o reutilizado antes de la simulación CRM'
    );
  end if;

  return public.simulate_crm_prospect_linked(p_session_id);
end;
$$;

revoke all on function public.simulate_crm_prospect(uuid) from public;
grant execute on function public.simulate_crm_prospect(uuid) to authenticated;
