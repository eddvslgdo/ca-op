create extension if not exists pgcrypto;

create type public.workflow_type as enum ('lead', 'onboarding');
create type public.onboarding_status as enum (
  'active',
  'expired',
  'completed_by_client',
  'under_review',
  'corrections_requested',
  'approved',
  'integration_pending',
  'integration_failed',
  'integrated',
  'closed',
  'cancelled'
);
create type public.integration_status as enum (
  'not_requested',
  'pending',
  'processing',
  'failed',
  'confirmed'
);
create type public.document_status as enum (
  'temporary',
  'transfer_pending',
  'transferred',
  'transfer_failed',
  'purged'
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  tax_id text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  commercial_interest text not null,
  owner_id uuid references auth.users(id),
  crm_prospect_id text,
  crm_sync_status public.integration_status not null default 'not_requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint leads_tax_id_not_blank check (btrim(tax_id) <> ''),
  constraint leads_email_not_blank check (btrim(contact_email) <> '')
);

create unique index leads_active_tax_id_unique
  on public.leads (upper(btrim(tax_id)))
  where closed_at is null;
create unique index leads_crm_prospect_id_unique
  on public.leads (crm_prospect_id)
  where crm_prospect_id is not null;

create table public.sessions (
  session_id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id),
  workflow public.workflow_type not null default 'lead',
  status public.onboarding_status not null default 'active',
  access_token_hash text,
  token text,
  crm_prospect_id text,
  propietario text,
  config_comercial jsonb not null default '[]'::jsonb,
  ultimo_avance jsonb not null default '{}'::jsonb,
  notas_correccion jsonb,
  current_step integer not null default 1,
  reactivaciones_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '3 days'),
  submitted_at timestamptz,
  approved_at timestamptz,
  integrated_at timestamptz,
  closed_at timestamptz,
  retention_until timestamptz,
  constraint sessions_current_step_positive check (current_step > 0),
  constraint sessions_reactivations_positive check (reactivaciones_count >= 0),
  constraint sessions_access_token_present check (
    access_token_hash is not null or token is not null
  )
);

comment on column public.sessions.token is
  'Compatibilidad temporal con el MVP existente. Debe retirarse después de migrar el acceso a funciones backend y hash.';

create unique index sessions_token_unique
  on public.sessions (token)
  where token is not null;
create unique index sessions_access_token_hash_unique
  on public.sessions (access_token_hash)
  where access_token_hash is not null;
create unique index sessions_one_active_onboarding_per_lead
  on public.sessions (lead_id)
  where workflow = 'onboarding'
    and status in (
      'active', 'expired', 'completed_by_client', 'under_review',
      'corrections_requested', 'approved', 'integration_pending',
      'integration_failed'
    );

create table public.commercial_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_key text not null unique,
  profile_name text not null,
  config jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(session_id) on delete cascade,
  document_type text not null,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null,
  status public.document_status not null default 'temporary',
  corporate_document_id text,
  transferred_at timestamptz,
  retention_until timestamptz,
  purged_at timestamptz,
  created_at timestamptz not null default now(),
  constraint documents_size_positive check (size_bytes > 0),
  constraint documents_allowed_mime check (
    mime_type in ('application/pdf', 'image/jpeg', 'image/png')
  )
);

create table public.correction_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(session_id) on delete cascade,
  section_key text not null,
  notes text not null,
  status text not null default 'open' check (status in ('open', 'addressed', 'accepted')),
  requested_by uuid references auth.users(id),
  requested_at timestamptz not null default now(),
  addressed_at timestamptz,
  accepted_at timestamptz
);

create table public.integration_jobs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(session_id),
  lead_id uuid references public.leads(id),
  event_type text not null check (
    event_type in ('lead.ready', 'customer.onboarding.approved')
  ),
  schema_version text not null default '1.0',
  correlation_id uuid not null default gen_random_uuid(),
  idempotency_key text not null unique,
  payload jsonb not null,
  payload_hash text not null,
  status public.integration_status not null default 'pending',
  attempt_count integer not null default 0,
  next_attempt_at timestamptz,
  last_error_code text,
  last_error_message text,
  crm_prospect_id text,
  crm_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  constraint integration_job_entity check (session_id is not null or lead_id is not null),
  constraint integration_attempt_count_positive check (attempt_count >= 0)
);

create table public.integration_attempts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.integration_jobs(id) on delete cascade,
  attempt_number integer not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  result_status text not null check (result_status in ('processing', 'confirmed', 'failed')),
  response_code text,
  error_code text,
  error_message text,
  unique (job_id, attempt_number)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(session_id),
  lead_id uuid references public.leads(id),
  event_type text,
  usuario text not null,
  actor_id uuid references auth.users(id),
  actor_role text,
  accion text not null,
  resultado text not null,
  correlation_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('sac_operator', 'sac_reviewer', 'sales', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();
create trigger sessions_set_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();
create trigger commercial_profiles_set_updated_at
before update on public.commercial_profiles
for each row execute function public.set_updated_at();
create trigger integration_jobs_set_updated_at
before update on public.integration_jobs
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;
alter table public.sessions enable row level security;
alter table public.commercial_profiles enable row level security;
alter table public.documents enable row level security;
alter table public.correction_requests enable row level security;
alter table public.integration_jobs enable row level security;
alter table public.integration_attempts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.user_roles enable row level security;

create or replace function public.current_internal_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.user_roles where user_id = auth.uid();
$$;

revoke all on function public.current_internal_role() from public;
grant execute on function public.current_internal_role() to authenticated;

create policy "internal users read leads"
on public.leads for select to authenticated
using (public.current_internal_role() is not null);
create policy "internal users read sessions"
on public.sessions for select to authenticated
using (public.current_internal_role() is not null);
create policy "internal users read documents"
on public.documents for select to authenticated
using (public.current_internal_role() is not null);
create policy "internal users read corrections"
on public.correction_requests for select to authenticated
using (public.current_internal_role() is not null);
create policy "internal users read profiles"
on public.commercial_profiles for select to authenticated
using (public.current_internal_role() is not null);
create policy "internal users read audit"
on public.audit_logs for select to authenticated
using (public.current_internal_role() is not null);
create policy "internal users read integration jobs"
on public.integration_jobs for select to authenticated
using (public.current_internal_role() is not null);
create policy "internal users read integration attempts"
on public.integration_attempts for select to authenticated
using (public.current_internal_role() is not null);
create policy "users read own role"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'onboarding-documents',
  'onboarding-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "internal users read onboarding files"
on storage.objects for select to authenticated
using (
  bucket_id = 'onboarding-documents'
  and public.current_internal_role() is not null
);

revoke all on table public.leads from anon;
revoke all on table public.sessions from anon;
revoke all on table public.documents from anon;
revoke all on table public.correction_requests from anon;
revoke all on table public.integration_jobs from anon;
revoke all on table public.integration_attempts from anon;
revoke all on table public.audit_logs from anon;
revoke all on table public.commercial_profiles from anon;

comment on table public.sessions is
  'Sesiones operativas de CA&OP. El acceso público deberá realizarse mediante funciones backend validadas por token.';
comment on table public.integration_jobs is
  'Outbox persistente para integraciones idempotentes con CRM.';
