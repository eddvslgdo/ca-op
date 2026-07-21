import { useState } from "react"
import { OnboardingPortal } from "@/pages/OnboardingPortal"
import { SacWorkspace } from "@/pages/SacWorkspace"
import { Button } from "@/components/ui/button"
import { UserCheck, ShieldAlert } from "lucide-react"
import type { MagicLinkSession } from "@/types/onboarding"

function App() {
  const [currentView, setCurrentView] = useState<"client_portal" | "sac_workspace">("sac_workspace")
  const [activePortalWorkflow, setActivePortalWorkflow] = useState<"lead" | "onboarding">("lead")

  const [sessions, setSessions] = useState<MagicLinkSession[]>([
    {
      sessionId: "SES-POLAK-01",
      workflow: "lead",
      token: "xyz789token",
      clienteExisteEnCRM: false,
      configComercial: {
        unidadNegocio: "Industrial PQ",
        organizacionVentas: "Polak Grupo Industrial",
        canalDistribucion: "Industrial",
        division: "Nacional",
        oficinaVentas: "Gte. Div. Ind. PQ",
        grupoVendedores: "Gte. Vta. Industrial",
        condicionesPago: "CONT Contado",
        incoterms: "En fábrica",
        lugarEntrega: "CIA",
        moneda: "MXN",
        usoCFDI: "G03 Gastos en general",
        clasificacionIVA: "1 - Sujeto a impuestos",
        clasificacionIEPS: "0 - Exento de impto."
      },
      fechaCreacion: "24/07/2026",
      fechaExpiracion: "27/07/2026",
      reactivacionesCount: 0,
      status: "active",
      ultimoAvance: {
        empresa: { razonSocial: "QUIMICA MEXICANA DEL BAJIO S.A.", rfc: "QMB980412KK0", regimenFiscal: "", giroComercial: "" },
        direccionFiscal: { calle: "", numeroExterior: "", colonia: "", codigoPostal: "", estado: "", municipio: "" },
        direccionesEntrega: [],
        contacto: { nombreRepresentante: "Fernando Castro", correoContacto: "fcastro@quimicabajio.com", telefonoContacto: "477 123 4567" },
        facturacion: { banco: "", cuenta4Digitos: "", metodoPago: "", formaPago: "", correoFacturas: "" }
      },
      documentosTemporales: {},
      auditLogs: [
        { id: "LOG-01", fechaHora: new Date().toLocaleString("es-MX"), usuario: "SAC", accion: "Creación de Sesión (LEAD)", resultado: "Exitoso" }
      ]
    }
  ])

  const handleSessionCreated = (newSession: MagicLinkSession) => {
    setSessions((prev) => [newSession, ...prev])
  }

  // NUEVO: Sincronizar Sesión Lead con CRM (Genera ID)
  const handleSyncSessionToCRM = (sessionId: string) => {
    setSessions((prev) => prev.map((s) => {
      if (s.sessionId === sessionId) {
        return {
          ...s,
          crmProspectId: `CRM-${Math.floor(Math.random() * 10000) + 10000}`,
          auditLogs: [...s.auditLogs, { id: `LOG-${Date.now()}`, fechaHora: new Date().toLocaleString("es-MX"), usuario: "Sistema", accion: "Sincronización inicial con CRM (Cotización)", resultado: "ID Asignado" }]
        }
      }
      return s
    }))
  }

  const handlePromoteToOnboarding = (sessionId: string) => {
    setSessions((prev) => prev.map((s) => {
      if (s.sessionId === sessionId) {
        const now = new Date()
        const newExp = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        return {
          ...s,
          workflow: "onboarding",
          status: "active",
          fechaExpiracion: newExp.toLocaleDateString("es-MX"),
          reactivacionesCount: s.reactivacionesCount + 1,
          auditLogs: [...s.auditLogs, { id: `LOG-${Date.now()}`, fechaHora: new Date().toLocaleString("es-MX"), usuario: "SAC", accion: "Promoción a ONBOARDING y Reactivación", resultado: "Exitoso" }]
        }
      }
      return s
    }))
  }

  const handleApproveSession = (sessionId: string) => {
    setSessions((prev) => prev.map((s) => {
      if (s.sessionId === sessionId) {
        return {
          ...s,
          status: "approved",
          auditLogs: [...s.auditLogs, { id: `LOG-${Date.now()}`, fechaHora: new Date().toLocaleString("es-MX"), usuario: "SAC", accion: "Aprobación y Enriquecimiento Final CRM", resultado: "Payload Enviado" }]
        }
      }
      return s
    }))
  }

  return (
    <div>
      <nav className="bg-slate-950 text-slate-300 text-xs px-4 py-2 flex items-center justify-between border-b border-slate-800">
        <span className="font-semibold text-slate-400 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          Arquitectura Basada en Sesiones (RN-077 a RN-089)
        </span>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant={currentView === "client_portal" && activePortalWorkflow === "lead" ? "default" : "ghost"} className="h-7 text-xs"
            onClick={() => { setCurrentView("client_portal"); setActivePortalWorkflow("lead"); }}>
            Vista Cliente: LEAD
          </Button>
          <Button size="sm" variant={currentView === "client_portal" && activePortalWorkflow === "onboarding" ? "default" : "ghost"} className="h-7 text-xs"
            onClick={() => { setCurrentView("client_portal"); setActivePortalWorkflow("onboarding"); }}>
            Vista Cliente: ONBOARDING
          </Button>
          <Button size="sm" variant={currentView === "sac_workspace" ? "default" : "ghost"} className="h-7 text-xs"
            onClick={() => setCurrentView("sac_workspace")}>
            <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Workspace SAC
          </Button>
        </div>
      </nav>

      {currentView === "client_portal" && (
        <OnboardingPortal workflow={activePortalWorkflow} /> 
      )}
      
      {currentView === "sac_workspace" && (
        <SacWorkspace 
          sessions={sessions}
          onSessionCreated={handleSessionCreated}
          onPromoteToOnboarding={handlePromoteToOnboarding}
          onSyncSessionToCRM={handleSyncSessionToCRM}
          onApproveSession={handleApproveSession}
        />
      )}
    </div>
  )
}

export default App