import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { OnboardingPortal } from "@/pages/OnboardingPortal";
import { SacWorkspace } from "@/pages/SacWorkspace";
import { CreateSessionPage } from "@/pages/CreateSessionPage";
import { PublicLeadForm } from "@/pages/PublicLeadForm";
import { SacLoginPage } from "@/pages/SacLoginPage";
import type { MagicLinkSession } from "@/types/onboarding";
import { supabase } from "@/lib/supabase";
import {
  appendSessionAudit,
  listSessions,
  syncLeadToCrm,
  updateSession,
} from "@/repositories/sessionRepository";

// ------------------------------------------------------------------
// 1. COMPONENTE DEL DASHBOARD DE SAC
// ------------------------------------------------------------------
function SacDashboard() {
  const [sessions, setSessions] = useState<MagicLinkSession[]>([]);

  useEffect(() => {
    // 1. Carga inicial
    fetchSessions();

    // 2. MAGIA DE TIEMPO REAL (Supabase Realtime)
    // Escucha cualquier cambio (Insert, Update, Delete) en la tabla 'sessions'
    const subscription = supabase
      .channel("public:sessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        (payload) => {
          console.log("Cambio detectado desde Supabase:", payload);
          fetchSessions(); // Recarga los datos automáticamente en segundo plano
        },
      )
      .subscribe();

    // 3. Limpieza de la suscripción al desmontar
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchSessions() {
    try {
      setSessions(await listSessions());
    } catch (error) {
      console.error(
        "Error al cargar las sesiones y auditoría desde Supabase:",
        error,
      );
    }
  }

  const handleSyncSessionToCRM = async (sessionId: string) => {
    try {
      const crmProspectId = await syncLeadToCrm(sessionId);
      await fetchSessions();
      return crmProspectId;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleApproveSession = async (sessionId: string) => {
    try {
      await updateSession(sessionId, { status: "approved" });
      await appendSessionAudit(
        sessionId,
        "SAC (Revisor)",
        "Aprobación de expediente",
        "Aprobado; integración CRM pendiente",
      );
      fetchSessions();
    } catch (error) {
      console.error(error);
    }
  };

  // Agregada la función para Reactivar Enlaces Vencidos
  const handleReactivateSession = async (sessionId: string) => {
    const newExp = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
    try {
      await updateSession(sessionId, {
        status: "active",
        expires_at: newExp.toISOString(),
      });
      await appendSessionAudit(
        sessionId,
        "SAC",
        "Reactivación / Extensión de Link",
        "+3 Días",
      );
      fetchSessions();
    } catch (error) {
      console.error(error);
    }
  };

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
        onSyncSessionToCRM={handleSyncSessionToCRM}
        onApproveSession={handleApproveSession}
        onReactivateSession={handleReactivateSession}
        onRefresh={fetchSessions} // Vinculamos el botón de actualización manual
        onSignOut={() => supabase.auth.signOut()}
      />
    </div>
  );
}

// ------------------------------------------------------------------
// 2. ENRUTADOR PRINCIPAL (Solo 2 Rutas)
// ------------------------------------------------------------------
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!authReady) return <div className="min-h-screen bg-slate-950" />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/solicitud" element={<PublicLeadForm />} />
        <Route path="/sac/login" element={<SacLoginPage session={session} />} />
        <Route path="/" element={session ? <SacDashboard /> : <Navigate to="/sac/login" replace />} />
        <Route path="/sac/nueva-sesion" element={session ? <CreateSessionPage /> : <Navigate to="/sac/login" replace />} />
        <Route path="/registro/magic-link" element={<OnboardingPortal />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
