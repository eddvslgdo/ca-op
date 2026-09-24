-- Convierte la restricción de sesión activa única en un error de negocio legible.

alter function public.promote_lead_to_onboarding(uuid, text, text, jsonb)
rename to promote_lead_to_onboarding_unchecked;

revoke all on function public.promote_lead_to_onboarding_unchecked(uuid, text, text, jsonb)
from public, authenticated;

create function public.promote_lead_to_onboarding(
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
  v_lead_id uuid;
  v_existing_session_id uuid;
begin
  if not public.is_internal_user(array['sac_operator', 'admin']) then
    raise exception 'Acción no autorizada';
  end if;

  select lead_id into v_lead_id
  from public.sessions
  where session_id = p_session_id;

  select session_id into v_existing_session_id
  from public.sessions
  where lead_id = v_lead_id
    and session_id <> p_session_id
    and workflow = 'onboarding'
    and status in (
      'active', 'expired', 'completed_by_client', 'under_review',
      'corrections_requested', 'approved', 'integration_pending',
      'integration_failed'
    )
  limit 1;

  if v_existing_session_id is not null then
    raise exception 'Ya existe un onboarding activo para este RFC (sesión %). Debe reutilizarse o cancelarse antes de crear otro.', v_existing_session_id;
  end if;

  perform public.promote_lead_to_onboarding_unchecked(
    p_session_id, p_raw_token, p_owner, p_commercial_config
  );
end;
$$;

revoke all on function public.promote_lead_to_onboarding(uuid, text, text, jsonb) from public;
grant execute on function public.promote_lead_to_onboarding(uuid, text, text, jsonb) to authenticated;
