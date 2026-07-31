import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { OnboardingPortal } from "@/pages/OnboardingPortal"
import { SacWorkspace } from "@/pages/SacWorkspace"
import { CreateSessionPage } from "@/pages/CreateSessionPage"
import type { MagicLinkSession } from "@/types/onboarding"
import { supabase } from "@/lib/supabase"

// ------------------------------------------------------------------
// 1. COMPONENTE DEL DASHBOARD DE SAC
// ------------------------------------------------------------------
function SacDashboard() {
  const [sessions, setSessions] = useState<MagicLinkSession[]>([])

  useEffect(() => {
    // 1. Carga inicial
    fetchSessions()

    // 2. MAGIA DE TIEMPO REAL (Supabase Realtime)
    // Escucha cualquier cambio (Insert, Update, Delete) en la tabla 'sessions'
    const subscription = supabase
      .channel('public:sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload) => {
        console.log('Cambio detectado desde Supabase:', payload)
        fetchSessions() // Recarga los datos automáticamente en segundo plano
      })
      .subscribe()

    // 3. Limpieza de la suscripción al desmontar
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        const sesionesRecuperadas = data.map((row: any) => ({
          sessionId: row.session_id,
          workflow: row.workflow,
          token: row.token,
          crmProspectId: row.crm_prospect_id,
          clienteExisteEnCRM: !!row.crm_prospect_id,
          configComercial: row.config_comercial,
          fechaCreacion: new Date(row.created_at).toLocaleDateString("es-MX"),
          fechaExpiracion: new Date(row.expires_at).toLocaleDateString("es-MX"),
          reactivacionesCount: row.reactivaciones_count,
          status: row.status,
          ultimoAvance: row.ultimo_avance,
          documentosTemporales: {},
          auditLogs: [] 
        }))
        setSessions(sesionesRecuperadas)
      }
    } catch (error) {
      console.error("Error al cargar las sesiones desde Supabase:", error)
    }
  }

  const handleSyncSessionToCRM = async (sessionId: string) => {
    const fakeCrmId = `CRM-${Math.floor(Math.random() * 10000) + 10000}`
    try {
      await supabase.from('sessions').update({ crm_prospect_id: fakeCrmId }).eq('session_id', sessionId)
      await supabase.from('audit_logs').insert([{ session_id: sessionId, usuario: "Sistema", accion: "Sincronización inicial con CRM", resultado: "ID Asignado" }])
      fetchSessions()
    } catch (error) { console.error(error) }
  }

  const handlePromoteToOnboarding = async (sessionId: string) => {
    const sessionActual = sessions.find(s => s.sessionId === sessionId)
    if (!sessionActual) return
    const newExp = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)
    try {
      await supabase.from('sessions').update({ workflow: 'onboarding', status: 'active', expires_at: newExp.toISOString(), reactivaciones_count: sessionActual.reactivacionesCount + 1 }).eq('session_id', sessionId)
      await supabase.from('audit_logs').insert([{ session_id: sessionId, usuario: "SAC", accion: "Promoción a ONBOARDING", resultado: "Exitoso" }])
      fetchSessions()
    } catch (error) { console.error(error) }
  }

  const handleApproveSession = async (sessionId: string) => {
    try {
      await supabase.from('sessions').update({ status: 'approved' }).eq('session_id', sessionId)
      await supabase.from('audit_logs').insert([{ session_id: sessionId, usuario: "SAC (Revisor)", accion: "Aprobación y Enriquecimiento CRM", resultado: "Enviado" }])
      fetchSessions()
    } catch (error) { console.error(error) }
  }

  // Agregada la función para Reactivar Enlaces Vencidos
  const handleReactivateSession = async (sessionId: string) => {
    const newExp = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)
    try {
      await supabase.from('sessions').update({ status: 'active', expires_at: newExp.toISOString() }).eq('session_id', sessionId)
      await supabase.from('audit_logs').insert([{ session_id: sessionId, usuario: "SAC", accion: "Reactivación / Extensión de Link", resultado: "+3 Días" }])
      fetchSessions()
    } catch (error) { console.error(error) }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-950 text-slate-300 text-xs px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <span className="font-semibold text-slate-400 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          Workspace SAC - Control de Accesos
        </span>
      </nav>
      <SacWorkspace 
        sessions={sessions}
        onSessionCreated={() => fetchSessions()}
        onPromoteToOnboarding={handlePromoteToOnboarding}
        onSyncSessionToCRM={handleSyncSessionToCRM}
        onApproveSession={handleApproveSession}
        onReactivateSession={handleReactivateSession} 
        onRefresh={fetchSessions} // Vinculamos el botón de actualización manual
      />
    </div>
  )
}

// ------------------------------------------------------------------
// 2. ENRUTADOR PRINCIPAL (Solo 2 Rutas)
// ------------------------------------------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SacDashboard />} />
        <Route path="/sac/nueva-sesion" element={<CreateSessionPage />} />
        <Route path="/registro/magic-link" element={<OnboardingPortal />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}