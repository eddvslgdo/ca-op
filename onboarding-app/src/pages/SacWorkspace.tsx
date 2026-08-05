import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  User,
  Link2,
  Copy,
  Check,
  History,
  Send,
  ArrowUpRight,
  Database,
  X,
  AlertTriangle,
  Building2,
  MapPin,
  CreditCard,
  FileText,
  ExternalLink,
  Truck,
  XCircle,
  Eye,
  RefreshCw,
  Clock,
} from "lucide-react";
import type { MagicLinkSession } from "@/types/onboarding";
import { supabase } from "@/lib/supabase";

interface SacWorkspaceProps {
  sessions: MagicLinkSession[];
  onSessionCreated?: (session: MagicLinkSession) => void;
  onPromoteToOnboarding: (sessionId: string) => void;
  onSyncSessionToCRM: (sessionId: string) => void;
  onApproveSession: (sessionId: string) => void;
  onReactivateSession: (sessionId: string) => void;
  onRequestCorrections?: (
    sessionId: string,
    sections: string[],
    message: string,
  ) => void;
  onRefresh?: () => void;
}

type AlertActionType =
  | "sync"
  | "promote"
  | "approve"
  | "correct"
  | "validate_planta"
  | null;

export function SacWorkspace({
  sessions,
  onPromoteToOnboarding,
  onSyncSessionToCRM,
  onApproveSession,
  onReactivateSession,
  onRequestCorrections = () => console.log("Correcciones solicitadas"),
  onRefresh,
}: SacWorkspaceProps) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"sessions" | "audit">("sessions");
  const [selectedSession, setSelectedSession] =
    useState<MagicLinkSession | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeAlert, setActiveAlert] = useState<{
    type: AlertActionType;
    sessionId: string;
    plantaIndex?: number;
  } | null>(null);

  const [isFullDetailsOpen, setIsFullDetailsOpen] = useState(false);

  // NUEVO ESTADO: Mapa de correcciones { "empresa": "Falta RFC", "documentos": "Borroso" }
  const [correctionNotesMap, setCorrectionNotesMap] = useState<
    Record<string, string>
  >({});

  const currentSession = selectedSession
    ? sessions.find((s) => s.sessionId === selectedSession.sessionId) || null
    : null;

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/registro/magic-link?token=${token}`,
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleManualRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const executeToggleValidatePlanta = async (
    sessionId: string,
    plantaIndex: number,
  ) => {
    if (!currentSession || !currentSession.ultimoAvance?.direccionesEntrega)
      return;

    const nuevasPlantas = [...currentSession.ultimoAvance.direccionesEntrega];
    nuevasPlantas[plantaIndex] = {
      ...nuevasPlantas[plantaIndex],
      validada: !nuevasPlantas[plantaIndex].validada,
    };

    const nuevoAvance = {
      ...currentSession.ultimoAvance,
      direccionesEntrega: nuevasPlantas,
    };

    try {
      const { error } = await supabase
        .from("sessions")
        .update({ ultimo_avance: nuevoAvance })
        .eq("session_id", sessionId);

      if (error) throw error;
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error al validar ubicación:", err);
      alert("No se pudo actualizar el estado de validación.");
    }
  };

  const handleSafeSyncToCRM = (sessionId: string) =>
    setActiveAlert({ type: "sync", sessionId });
  const handleSafePromoteToOnboarding = (
    sessionId: string,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    setActiveAlert({ type: "promote", sessionId });
  };
  const handleSafeApproveSession = (sessionId: string) =>
    setActiveAlert({ type: "approve", sessionId });

  // Al abrir el modal de correcciones, limpiamos el mapa
  const handleSafeRequestCorrections = (sessionId: string) => {
    setCorrectionNotesMap({});
    setActiveAlert({ type: "correct", sessionId });
  };

  const CORRECTION_OPTIONS = [
    { id: "empresa", label: "Datos de Empresa", icon: Building2 },
    { id: "domicilio", label: "Domicilio Fiscal", icon: MapPin },
    { id: "entregas", label: "Destinatarios", icon: Truck },
    { id: "facturacion", label: "Datos Bancarios", icon: CreditCard },
    { id: "documentos", label: "Documentos Adjuntos", icon: FileText },
  ];

  // NUEVA LÓGICA: Toggle del mapa de correcciones
  const toggleCorrectionSection = (sectionId: string) => {
    setCorrectionNotesMap((prev) => {
      const newMap = { ...prev };
      if (newMap[sectionId] !== undefined) {
        delete newMap[sectionId]; // Si ya existe, lo quitamos (lo deselecciona)
      } else {
        newMap[sectionId] = ""; // Si no existe, lo agregamos vacío
      }
      return newMap;
    });
  };

  // NUEVA LÓGICA: Actualizar el texto individual
  const updateCorrectionNote = (sectionId: string, note: string) => {
    setCorrectionNotesMap((prev) => ({
      ...prev,
      [sectionId]: note,
    }));
  };

  const confirmAlertAction = async () => {
    if (!activeAlert) return;
    switch (activeAlert.type) {
      case "sync":
        onSyncSessionToCRM(activeAlert.sessionId);
        break;
      case "promote":
        onPromoteToOnboarding(activeAlert.sessionId);
        break;
      case "approve":
        onApproveSession(activeAlert.sessionId);
        break;
      case "correct":
        try {
          const { error } = await supabase
            .from("sessions")
            .update({
              status: "corrections_requested",
              // Convertimos el diccionario a un texto JSON para guardarlo
              notas_correccion: JSON.stringify(correctionNotesMap),
            })
            .eq("session_id", activeAlert.sessionId);

          if (error) throw error;
          if (onRefresh) onRefresh();
        } catch (err) {
          console.error("Error al actualizar estado a corrección:", err);
        }

        // Ejecutamos prop pasandole todo junto (para futuros correos)
        onRequestCorrections(
          activeAlert.sessionId,
          Object.keys(correctionNotesMap),
          JSON.stringify(correctionNotesMap),
        );
        break;
      case "validate_planta":
        if (activeAlert.plantaIndex !== undefined) {
          executeToggleValidatePlanta(
            activeAlert.sessionId,
            activeAlert.plantaIndex,
          );
        }
        break;
    }
    setActiveAlert(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">
            P
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">
              SAC Control Portal
            </h1>
            <p className="text-xs text-slate-400">
              Orquestador de Sesiones B2B
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {onRefresh && (
            <Button
              variant="outline"
              onClick={handleManualRefresh}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white text-slate-300 gap-2 h-9 text-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`}
              />
              {isRefreshing ? "Actualizando..." : "Sincronizar"}
            </Button>
          )}
          <Button
            onClick={() => navigate("/sac/nueva-sesion")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs h-9"
          >
            <Link2 className="h-4 w-4" /> Crear Nueva Sesión
          </Button>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 h-9 rounded-md border border-slate-700">
            <User className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-medium text-slate-200">
              SAC: Eduardo Velázquez
            </span>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="max-w-[1600px] w-full mx-auto px-6 md:px-10 pt-3 flex gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${activeTab === "sessions" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <ShieldCheck className="h-4 w-4" /> Gestión de Sesiones (
            {sessions.length})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${activeTab === "audit" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <History className="h-4 w-4" /> Bitácora de Auditoría
          </button>
        </div>
      </div>

      <main className="flex-1 p-6 md:px-10 py-8 max-w-[1600px] w-full mx-auto relative z-0">
        {activeTab === "sessions" && (
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs font-semibold">
                    ID Sesión / Empresa
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Unidad de Negocio
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Workflow & Estado CRM
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-right">
                    Acciones Directas
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((sess) => (
                  <TableRow
                    key={sess.sessionId}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setSelectedSession(sess)}
                  >
                    <TableCell>
                      <p className="text-xs font-mono text-indigo-600 font-medium">
                        {sess.sessionId}
                      </p>
                      <p className="text-xs font-semibold text-slate-900">
                        {sess.ultimoAvance?.empresa?.razonSocial ||
                          "Sin Nombre"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-600"
                      >
                        {Array.isArray(sess.configComercial) &&
                        sess.configComercial.length > 0
                          ? sess.configComercial[0].unidadNegocio
                          : "No Definida"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1.5 items-start">
                        {sess.workflow === "lead" && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200 mb-1"
                          >
                            Prospecto (Lead)
                          </Badge>
                        )}

                        {sess.status === "active" && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1.5 bg-slate-50 text-slate-500 border-slate-200"
                          >
                            <Clock className="h-2.5 w-2.5 mr-1" /> Esperando al
                            Cliente
                          </Badge>
                        )}
                        {sess.status === "completed_by_client" && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1.5 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <ShieldCheck className="h-2.5 w-2.5 mr-1 animate-pulse" />{" "}
                            Por Validar (SAC)
                          </Badge>
                        )}
                        {sess.status === "corrections_requested" && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1.5 bg-orange-50 text-orange-700 border-orange-200"
                          >
                            <AlertTriangle className="h-2.5 w-2.5 mr-1" /> En
                            Corrección
                          </Badge>
                        )}
                        {sess.status === "approved" && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            <Check className="h-2.5 w-2.5 mr-1" /> Expediente
                            Cerrado
                          </Badge>
                        )}
                        {sess.status === "expired" && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1.5 bg-red-50 text-red-700 border-red-200"
                          >
                            <XCircle className="h-2.5 w-2.5 mr-1" /> Enlace
                            Vencido
                          </Badge>
                        )}

                        {sess.crmProspectId ? (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1"
                          >
                            <Database className="h-2.5 w-2.5" />{" "}
                            {sess.crmProspectId}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1.5 bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
                          >
                            <Database className="h-2.5 w-2.5" /> Pendiente CRM
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right space-x-2 flex justify-end items-center h-full">
                      {sess.status !== "completed_by_client" &&
                        sess.status !== "approved" && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReactivateSession(sess.sessionId);
                            }}
                            size="sm"
                            variant="outline"
                            className={`text-[10px] gap-1 h-7 border-indigo-200 text-indigo-600 hover:bg-indigo-50 ${sess.status === "expired" ? "border-red-300 text-red-600 hover:bg-red-50" : ""}`}
                          >
                            <RefreshCw className="h-3 w-3" />{" "}
                            {sess.status === "expired"
                              ? "Reactivar Vencido"
                              : "+3 Días"}
                          </Button>
                        )}

                      {sess.workflow === "lead" &&
                        sess.status === "completed_by_client" &&
                        sess.crmProspectId && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSafePromoteToOnboarding(sess.sessionId);
                            }}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] gap-1 h-7"
                          >
                            <ArrowUpRight className="h-3 w-3" /> Promover a
                            Onboarding
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeTab === "audit" && (
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs font-semibold">
                    Fecha y Hora
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Usuario
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Acción Registrada
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-right">
                    Resultado
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions
                  .flatMap((s) => s.auditLogs)
                  .map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs font-mono text-slate-600">
                        {log.fechaHora}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800">
                        {log.usuario}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {log.accion}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                        >
                          {log.resultado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>

      {/* PANEL SLIDE-OVER (INSPECTOR DE SESIÓN) */}
      {currentSession && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedSession(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <span className="text-[10px] font-mono text-indigo-600 font-bold tracking-wider">
                  {currentSession.sessionId}
                </span>
                <h3 className="text-sm font-bold text-slate-900 truncate pr-4">
                  {currentSession.ultimoAvance?.empresa?.razonSocial ||
                    "Empresa en Captura"}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSession(null)}
                className="h-7 w-7 text-slate-400 hover:bg-slate-200 rounded-full shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                  <Link2 className="h-4 w-4 text-indigo-500" /> Enlace del
                  Cliente (Magic Link)
                </h4>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/registro/magic-link?token=${currentSession.token}`}
                    readOnly
                    className="bg-slate-50 font-mono text-[10px] text-slate-600 h-8"
                  />
                  <Button
                    onClick={() => handleCopy(currentSession.token)}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-2.5 shrink-0"
                  >
                    {copiedLink ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2 rounded">
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    Expira:{" "}
                    <strong
                      className={`font-semibold ${currentSession.status === "expired" ? "text-red-600" : "text-slate-800"}`}
                    >
                      {currentSession.fechaExpiracion}
                    </strong>
                  </p>
                  {currentSession.status !== "completed_by_client" &&
                    currentSession.status !== "approved" && (
                      <Button
                        onClick={() =>
                          onReactivateSession(currentSession.sessionId)
                        }
                        size="sm"
                        variant={
                          currentSession.status === "expired"
                            ? "default"
                            : "outline"
                        }
                        className={`h-6 text-[10px] gap-1 ${currentSession.status === "expired" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "text-indigo-600 border-indigo-200 hover:bg-indigo-50"}`}
                      >
                        <RefreshCw className="h-3 w-3" />{" "}
                        {currentSession.status === "expired"
                          ? "Reactivar Enlace"
                          : "Extender (+3 Días)"}
                      </Button>
                    )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                  <Database className="h-4 w-4 text-indigo-500" /> Estado
                  Comercial CRM
                </h4>
                {currentSession.crmProspectId ? (
                  <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 space-y-1">
                    <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <Check className="h-4 w-4" /> Sincronizado
                    </p>
                    <p className="font-mono text-emerald-900">
                      {currentSession.crmProspectId}
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 space-y-3">
                    <p className="text-amber-700 font-medium leading-relaxed">
                      Este prospecto aún no cuenta con un identificador
                      comercial en SAP/CRM.
                    </p>
                    {currentSession.status === "completed_by_client" && (
                      <Button
                        onClick={() =>
                          handleSafeSyncToCRM(currentSession.sessionId)
                        }
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs gap-1.5 bg-white hover:bg-amber-50 hover:text-amber-800 border-amber-200 font-semibold"
                      >
                        <Database className="h-3.5 w-3.5" /> Generar Prospecto
                        en CRM
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* RESUMEN DE DATOS SIEMPRE VISIBLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-indigo-500" /> Información
                    Capturada
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullDetailsOpen(true)}
                    className="h-6 px-2 text-[10px] text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800"
                  >
                    <Eye className="h-3 w-3 mr-1" /> Ver Detalle
                  </Button>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-4">
                  <div>
                    <p className="font-semibold text-slate-800 flex items-center gap-1 mb-0.5">
                      <Building2 className="h-3 w-3 text-slate-500" /> Empresa
                    </p>
                    <p className="text-slate-600 pl-4">
                      RFC:{" "}
                      <span className="font-mono text-slate-900">
                        {currentSession.ultimoAvance?.empresa?.rfc ||
                          "No capturado"}
                      </span>
                    </p>
                    <p className="text-slate-600 pl-4">
                      Contacto:{" "}
                      <span className="text-slate-900">
                        {currentSession.ultimoAvance?.contacto
                          ?.nombreRepresentante || "No capturado"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* RESOLUCIONES SAC: Depende del Carril (Lead vs Onboarding) */}
              {(currentSession.status === "completed_by_client" ||
                currentSession.status === "corrections_requested") && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 pb-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />{" "}
                    Resolución Final SAC
                  </h4>

                  {currentSession.status === "corrections_requested" ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center space-y-2">
                      <AlertTriangle className="h-6 w-6 text-orange-500 mx-auto" />
                      <div>
                        <p className="text-sm font-bold text-orange-800">
                          Enviado a Corrección
                        </p>
                        <p className="text-[11px] text-orange-600 mt-1 leading-relaxed">
                          El expediente fue devuelto. El enlace del cliente ha
                          sido habilitado nuevamente para que solucione los
                          errores detectados.
                        </p>
                      </div>
                    </div>
                  ) : currentSession.workflow === "lead" ? (
                    <div className="space-y-3">
                      <p className="text-[11px] text-slate-500">
                        Valida los datos y promueve a este cliente al flujo
                        completo de Onboarding.
                      </p>
                      <Button
                        disabled={!currentSession.crmProspectId}
                        onClick={() =>
                          handleSafePromoteToOnboarding(
                            currentSession.sessionId,
                          )
                        }
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-xs gap-1.5 shadow-sm"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" /> Promover a
                        Onboarding B2B
                      </Button>
                      {!currentSession.crmProspectId && (
                        <p className="text-[10px] text-amber-600 font-medium text-center">
                          Debes generar el ID de CRM primero.
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Revisa el expediente completo. Puedes aprobarlo para el
                        CRM o regresarlo al cliente para correcciones.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleSafeRequestCorrections(
                              currentSession.sessionId,
                            )
                          }
                          className="w-1/2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-9 text-xs gap-1.5"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Corregir
                        </Button>
                        <Button
                          disabled={
                            !currentSession.crmProspectId ||
                            currentSession.status === "approved"
                          }
                          onClick={() =>
                            handleSafeApproveSession(currentSession.sessionId)
                          }
                          className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-xs gap-1.5 shadow-sm"
                        >
                          <Send className="h-3.5 w-3.5" />{" "}
                          {currentSession.status === "approved"
                            ? "Enviado"
                            : "Aprobar Expediente"}
                        </Button>
                      </div>
                      {!currentSession.crmProspectId && (
                        <p className="text-[10px] text-amber-600 font-medium text-center mt-2">
                          Debes generar el ID de CRM antes de aprobar.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODAL: VISOR DE EXPEDIENTE COMPLETO */}
      {isFullDetailsOpen && currentSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 lg:p-8 animate-in fade-in">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white shadow-2xl border-0 overflow-hidden animate-in zoom-in-95">
            <CardHeader className="bg-slate-50 border-b border-slate-200 flex-none shrink-0 py-4 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" /> Expediente
                    Completo
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {currentSession.sessionId} -{" "}
                    {currentSession.ultimoAvance?.empresa?.razonSocial}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullDetailsOpen(false)}
                  className="text-slate-400 hover:bg-slate-200 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Building2 className="h-4 w-4 text-indigo-500" />{" "}
                      Información General
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Razón Social:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.empresa?.razonSocial}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">RFC:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.empresa?.rfc}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Régimen Fiscal:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.empresa
                            ?.regimenFiscal || "No especificado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <User className="h-4 w-4 text-indigo-500" /> Contacto y
                      Legal
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="col-span-2">
                        <span className="text-slate-500">
                          Representante Legal:
                        </span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.contacto
                            ?.nombreRepresentante || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">
                          Correo Electrónico:
                        </span>{" "}
                        <p className="font-semibold text-slate-900">
                          {
                            currentSession.ultimoAvance?.contacto
                              ?.correoContacto
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Teléfono:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.contacto
                            ?.telefonoContacto || "No especificado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <MapPin className="h-4 w-4 text-indigo-500" /> Domicilio
                      Fiscal
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="col-span-2">
                        <span className="text-slate-500">Calle:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.direccionFiscal
                            ?.calle || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Num. Exterior:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.direccionFiscal
                            ?.numeroExterior || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Código Postal:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.direccionFiscal
                            ?.codigoPostal || "N/A"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Colonia:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.direccionFiscal
                            ?.colonia || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Municipio:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.direccionFiscal
                            ?.municipio || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Estado:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.direccionFiscal
                            ?.estado || "No especificado"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <CreditCard className="h-4 w-4 text-indigo-500" /> Datos
                      Bancarios y Facturación
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Banco:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.facturacion?.banco ||
                            "No especificado"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">
                          Últimos 4 dígitos:
                        </span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.facturacion
                            ?.cuenta4Digitos || "No especificado"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Forma de Pago:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.facturacion
                            ?.formaPago || "No especificado"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Método de Pago:</span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.facturacion
                            ?.metodoPago || "No especificado"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">
                          Correo para Facturas:
                        </span>{" "}
                        <p className="font-semibold text-slate-900">
                          {currentSession.ultimoAvance?.facturacion
                            ?.correoFacturas || "No especificado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-indigo-500" />
                        Destinatarios de Mercancía (
                        {currentSession.ultimoAvance?.direccionesEntrega
                          ?.length || 0}
                        )
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-slate-50 border-slate-200"
                      >
                        Rol CRM: Ship-To Party
                      </Badge>
                    </div>

                    {currentSession.ultimoAvance?.direccionesEntrega &&
                    currentSession.ultimoAvance.direccionesEntrega.length >
                      0 ? (
                      <div className="space-y-3">
                        {currentSession.ultimoAvance.direccionesEntrega.map(
                          (planta: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                  <span
                                    className={`h-2 w-2 rounded-full ${planta.validada ? "bg-emerald-500" : "bg-amber-500"}`}
                                  />
                                  {planta.nombrePlanta ||
                                    `Planta / Bodega ${idx + 1}`}
                                </span>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant={
                                    planta.validada ? "outline" : "default"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveAlert({
                                      type: "validate_planta",
                                      sessionId: currentSession.sessionId,
                                      plantaIndex: idx,
                                    });
                                  }}
                                  className={`h-7 text-[11px] gap-1 px-2.5 transition-all ${
                                    planta.validada
                                      ? "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                      : "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                                  }`}
                                >
                                  {planta.validada ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-600" />{" "}
                                      Ubicación Validada
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="h-3 w-3" />{" "}
                                      Validar Ubicación
                                    </>
                                  )}
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                                <div>
                                  <p className="text-slate-500 font-medium">
                                    Dirección de Entrega:
                                  </p>
                                  <p className="font-semibold text-slate-900">
                                    {planta.calle} #
                                    {planta.numeroExterior || "S/N"}
                                  </p>
                                  <p>
                                    {planta.colonia}, C.P. {planta.codigoPostal}
                                  </p>
                                  <p>
                                    {planta.municipio}, {planta.estado}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-medium">
                                    Encargado de Recepción:
                                  </p>
                                  <p className="font-semibold text-slate-900">
                                    {planta.contactoRecepcion ||
                                      "No especificado"}
                                  </p>
                                  <p className="text-slate-600">
                                    Tel:{" "}
                                    {planta.telefonoRecepcion ||
                                      "No especificado"}
                                  </p>
                                  {planta.horarioRecepcion && (
                                    <p className="text-[11px] text-indigo-600 mt-1 italic">
                                      Horario: {planta.horarioRecepcion}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 flex items-center gap-1">
                                  <FileText className="h-3.5 w-3.5 text-indigo-500" />{" "}
                                  Comprobante de Domicilio
                                </span>
                                {planta.comprobanteDomicilioUrl ? (
                                  <a
                                    href={planta.comprobanteDomicilioUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                                  >
                                    Ver Documento{" "}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : (
                                  <span className="text-amber-600 font-medium flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> Sin
                                    adjunto
                                  </span>
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-lg text-center border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500 italic">
                          Sin plantas adicionales. La mercancía se entregará en
                          el domicilio fiscal registrado.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL DE ALERTAS PERSONALIZADO */}
      {activeAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in">
          <Card className="max-w-md w-full bg-white shadow-2xl border-0 overflow-hidden animate-in zoom-in-95">
            <CardHeader
              className={`border-b border-slate-100 pb-4 ${activeAlert.type === "approve" ? "bg-amber-50" : ""} ${activeAlert.type === "correct" ? "bg-red-50" : ""} ${activeAlert.type === "sync" || activeAlert.type === "promote" ? "bg-slate-50" : ""} ${activeAlert.type === "validate_planta" ? "bg-indigo-50" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${activeAlert.type === "approve" ? "bg-amber-100 text-amber-600" : ""} ${activeAlert.type === "correct" ? "bg-red-100 text-red-600" : ""} ${activeAlert.type === "sync" || activeAlert.type === "promote" || activeAlert.type === "validate_planta" ? "bg-indigo-100 text-indigo-600" : ""}`}
                >
                  {activeAlert.type === "validate_planta" ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
                <CardTitle className="text-base text-slate-900">
                  {activeAlert.type === "sync" && "Generar Prospecto en CRM"}
                  {activeAlert.type === "promote" && "Promover a Onboarding"}
                  {activeAlert.type === "approve" && "Aprobar & Enriquecer CRM"}
                  {activeAlert.type === "validate_planta" &&
                    "Validar Ubicación de Entrega"}
                  {activeAlert.type === "correct" &&
                    "Solicitar Correcciones al Cliente"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-sm text-slate-600 space-y-4">
              {activeAlert.type === "correct" ? (
                <div className="space-y-5">
                  <p className="text-slate-600 text-xs">
                    Selecciona las secciones que el cliente debe corregir. El
                    enlace se reactivará automáticamente.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      1. Seleccionar Secciones
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CORRECTION_OPTIONS.map((opt) => {
                        const isSelected =
                          correctionNotesMap[opt.id] !== undefined;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleCorrectionSection(opt.id)}
                            className={`flex items-center gap-2 p-2 rounded-md border text-xs text-left transition-colors ${
                              isSelected
                                ? "bg-red-50 border-red-200 text-red-700 font-semibold"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <opt.icon className="h-3.5 w-3.5" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {Object.keys(correctionNotesMap).length > 0 && (
                    <div className="space-y-3 mt-4 border-t border-slate-100 pt-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        2. Comentarios por Sección
                      </label>
                      {Object.keys(correctionNotesMap).map((sectionId) => {
                        const opt = CORRECTION_OPTIONS.find(
                          (o) => o.id === sectionId,
                        );
                        return (
                          <div key={sectionId} className="space-y-1">
                            <span className="text-xs font-semibold text-slate-700">
                              {opt?.label}
                            </span>
                            <textarea
                              className="w-full text-xs p-2 border rounded-md border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-400 min-h-[60px]"
                              placeholder={`Escribe el error a corregir en ${opt?.label}...`}
                              value={correctionNotesMap[sectionId]}
                              onChange={(e) =>
                                updateCorrectionNote(sectionId, e.target.value)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <p>
                  {activeAlert.type === "validate_planta"
                    ? "¿Estás seguro de que deseas cambiar el estado de validación de esta planta de entrega?"
                    : `¿Deseas confirmar esta acción para la sesión ${activeAlert.sessionId}?`}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-2">
                <Button variant="outline" onClick={() => setActiveAlert(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={confirmAlertAction}
                  disabled={
                    activeAlert.type === "correct" &&
                    (Object.keys(correctionNotesMap).length === 0 ||
                      Object.values(correctionNotesMap).some(
                        (note) => note.trim() === "",
                      ))
                  }
                  className={
                    activeAlert.type === "correct"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }
                >
                  {activeAlert.type === "correct"
                    ? "Enviar Solicitudes"
                    : "Sí, Continuar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
