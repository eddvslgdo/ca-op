import { supabase } from '@/lib/supabase'
import type { MagicLinkSession, SessionStatus } from '@/types/onboarding'
import { env } from '@/config/env'

interface AuditRow {
  id: string
  session_id: string
  created_at: string
  usuario: string
  accion: string
  resultado: string
}

interface SessionRow {
  session_id: string
  workflow: MagicLinkSession['workflow']
  token: string
  crm_prospect_id?: string
  config_comercial: MagicLinkSession['configComercial']
  propietario?: string
  created_at: string
  expires_at: string
  reactivaciones_count: number
  status: SessionStatus
  ultimo_avance: MagicLinkSession['ultimoAvance']
}

function mapSession(row: SessionRow, auditRows: AuditRow[]): MagicLinkSession {
  return {
    sessionId: row.session_id,
    workflow: row.workflow,
    token: row.token,
    crmProspectId: row.crm_prospect_id,
    clienteExisteEnCRM: Boolean(row.crm_prospect_id),
    configComercial: row.config_comercial || [],
    propietario: row.propietario,
    fechaCreacion: new Date(row.created_at).toLocaleDateString('es-MX'),
    fechaExpiracion: new Date(row.expires_at).toLocaleDateString('es-MX'),
    reactivacionesCount: row.reactivaciones_count || 0,
    status: row.status,
    ultimoAvance: row.ultimo_avance,
    documentosTemporales: {},
    auditLogs: auditRows
      .filter((log) => log.session_id === row.session_id)
      .map((log) => ({
        id: log.id,
        fechaHora: new Date(log.created_at).toLocaleString('es-MX', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        usuario: log.usuario,
        accion: log.accion,
        resultado: log.resultado,
      })),
  }
}

export async function listSessions(): Promise<MagicLinkSession[]> {
  const [sessionsResult, auditResult] = await Promise.all([
    supabase.from('sessions').select('*').order('created_at', { ascending: false }),
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }),
  ])

  if (sessionsResult.error) throw sessionsResult.error
  if (auditResult.error) throw auditResult.error

  return ((sessionsResult.data || []) as SessionRow[]).map((row) =>
    mapSession(row, (auditResult.data || []) as AuditRow[]),
  )
}

export async function updateSession(
  sessionId: string,
  fields: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update(fields)
    .eq('session_id', sessionId)

  if (error) throw error
}

export async function appendSessionAudit(
  sessionId: string,
  usuario: string,
  accion: string,
  resultado: string,
): Promise<void> {
  const { error } = await supabase.from('audit_logs').insert([
    { session_id: sessionId, usuario, accion, resultado },
  ])

  if (error) throw error
}

export async function syncLeadToCrm(sessionId: string): Promise<string> {
  if (env.crmMode !== 'simulated') {
    await appendSessionAudit(sessionId, 'SAC', 'Solicitud de sincronización con CRM', 'Pendiente de configuración por TI')
    throw new Error('La integración CRM no está configurada. Usa modo simulado sólo en local.')
  }

  const { data, error } = await supabase.rpc('simulate_crm_prospect', {
    p_session_id: sessionId,
  })
  if (error) throw error
  return data as string
}

export async function promoteLeadToOnboarding(
  sessionId: string,
  rawToken: string,
  owner: string,
  commercialConfig: MagicLinkSession['configComercial'],
): Promise<void> {
  const { error } = await supabase.rpc('promote_lead_to_onboarding', {
    p_session_id: sessionId,
    p_raw_token: rawToken,
    p_owner: owner,
    p_commercial_config: commercialConfig,
  })
  if (error) throw error
}
