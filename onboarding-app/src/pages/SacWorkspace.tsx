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
  Briefcase,
  Star,
  Layers,
  FileCheck,
} from "lucide-react";
import type { MagicLinkSession } from "@/types/onboarding";
import { supabase } from "@/lib/supabase";

interface SacWorkspaceProps {
  sessions: MagicLinkSession[];
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
  | "approve"
  | "correct"
  | "validate_planta"
  | null;

export function SacWorkspace({
  sessions,
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

  // ESTADO PARA CORRECCIONES
  const [correctionSections, setCorrectionSections] = useState<string[]>([]);
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

  const handleSafeApproveSession = (sessionId: string) =>
    setActiveAlert({ type: "approve", sessionId });

  const handleSafeRequestCorrections = (sessionId: string) => {
    setCorrectionNotesMap({});
    setActiveAlert({ type: "correct", sessionId });
  };

  const handleSafePromoteToOnboarding = (
    sessionId: string,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    navigate(`/sac/nueva-sesion?promover=${sessionId}`, {
      state: { promoteSessionId: sessionId },
    });
  };

  const CORRECTION_OPTIONS = [
    { id: "empresa", label: "Datos de Empresa", icon: Building2 },
    { id: "domicilio", label: "Domicilio Fiscal", icon: MapPin },
    { id: "entregas", label: "Destinatarios", icon: Truck },
    { id: "facturacion", label: "Datos Bancarios", icon: CreditCard },
    { id: "documentos", label: "Documentos Adjuntos", icon: FileText },
  ];

  const toggleCorrectionSection = (sectionId: string) => {
    setCorrectionNotesMap((prev) => {
      const newMap = { ...prev };
      if (newMap[sectionId] !== undefined) {
        delete newMap[sectionId];
      } else {
        newMap[sectionId] = "";
      }
      return newMap;
    });
  };

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
      case "approve":
        onApproveSession(activeAlert.sessionId);
        break;
      case "correct":
        try {
          // --- NUEVA LÓGICA: RESETEO DE VALIDACIÓN ---
          let updatePayload: any = {
            status: "corrections_requested",
            notas_correccion: JSON.stringify(correctionNotesMap),
          };

          // Si mandamos a corregir 'entregas', reseteamos el estatus de validación a false
          if (
            correctionNotesMap["entregas"] !== undefined &&
            currentSession?.ultimoAvance?.direccionesEntrega
          ) {
            const resetDirecciones =
              currentSession.ultimoAvance.direccionesEntrega.map(
                (planta: any) => ({
                  ...planta,
                  validada: false,
                }),
              );

            updatePayload.ultimo_avance = {
              ...currentSession.ultimoAvance,
              direccionesEntrega: resetDirecciones,
            };
          }

          const { error } = await supabase
            .from("sessions")
            .update(updatePayload)
            .eq("session_id", activeAlert.sessionId);

          if (error) throw error;
          if (onRefresh) onRefresh();
        } catch (err) {
          console.error("Error al actualizar estado a corrección:", err);
        }

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

  const getFaseMacro = (sess: MagicLinkSession) => {
    if (sess.status === "approved") {
      return {
        label: "Cliente Creado",
        color: "bg-purple-100 text-purple-700 border-purple-200",
        icon: Star,
      };
    }
    if (sess.workflow === "onboarding") {
      return {
        label: "Onboarding",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: Layers,
      };
    }
    return {
      label: "Prospecto (Lead)",
      color: "bg-slate-100 text-slate-700 border-slate-200",
      icon: User,
    };
  };

  const hasUnvalidatedPlants =
    currentSession?.ultimoAvance?.direccionesEntrega?.some(
      (planta: any) => !planta.validada,
    ) || false;

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
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-sm font-bold text-slate-700 py-4 w-[25%]">
                    ID Sesión / Empresa
                  </TableHead>
                  <TableHead className="text-sm font-bold text-slate-700 w-[15%]">
                    Fase del Proceso
                  </TableHead>
                  <TableHead className="text-sm font-bold text-slate-700 w-[20%]">
                    Estado Operativo
                  </TableHead>
                  <TableHead className="text-sm font-bold text-slate-700 w-[20%]">
                    Unidad de Negocio
                  </TableHead>
                  <TableHead className="text-sm font-bold text-slate-700 text-right w-[20%]">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((sess) => {
                  const fase = getFaseMacro(sess);
                  return (
                    <TableRow
                      key={sess.sessionId}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setSelectedSession(sess)}
                    >
                      <TableCell className="py-4">
                        <p className="text-sm font-mono text-indigo-600 font-bold">
                          {sess.sessionId}
                        </p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {sess.ultimoAvance?.empresa?.razonSocial ||
                            "Sin Nombre"}
                        </p>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs py-1 px-2.5 shadow-sm font-semibold gap-1.5 ${fase.color}`}
                        >
                          <fase.icon className="h-3.5 w-3.5" /> {fase.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-2 items-start">
                          {sess.status === "active" && (
                            <Badge
                              variant="outline"
                              className="text-xs py-1 px-2 bg-slate-50 text-slate-600 border-slate-300"
                            >
                              <Clock className="h-3 w-3 mr-1.5" /> Esperando al
                              Cliente
                            </Badge>
                          )}
                          {sess.status === "completed_by_client" && (
                            <Badge
                              variant="outline"
                              className="text-xs py-1 px-2 bg-blue-50 text-blue-700 border-blue-200"
                            >
                              <ShieldCheck className="h-3 w-3 mr-1.5 animate-pulse" />{" "}
                              Por Validar (SAC)
                            </Badge>
                          )}
                          {sess.status === "corrections_requested" && (
                            <Badge
                              variant="outline"
                              className="text-xs py-1 px-2 bg-orange-50 text-orange-700 border-orange-200"
                            >
                              <AlertTriangle className="h-3 w-3 mr-1.5" /> En
                              Corrección
                            </Badge>
                          )}
                          {sess.status === "approved" && (
                            <Badge
                              variant="outline"
                              className="text-xs py-1 px-2 bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              <Check className="h-3 w-3 mr-1.5" /> Expediente
                              Cerrado
                            </Badge>
                          )}
                          {sess.status === "expired" && (
                            <Badge
                              variant="outline"
                              className="text-xs py-1 px-2 bg-red-50 text-red-700 border-red-200"
                            >
                              <XCircle className="h-3 w-3 mr-1.5" /> Enlace
                              Vencido
                            </Badge>
                          )}

                          {sess.crmProspectId ? (
                            <Badge
                              variant="outline"
                              className="text-xs py-1 px-2 bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5"
                            >
                              <Database className="h-3 w-3" />{" "}
                              {sess.crmProspectId}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs py-1 px-2 bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5"
                            >
                              <Database className="h-3 w-3" /> Pendiente CRM
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="text-xs py-1 px-2.5 bg-slate-100 text-slate-700 font-medium"
                        >
                          {Array.isArray(sess.configComercial) &&
                          sess.configComercial.length > 0
                            ? sess.configComercial[0].unidadNegocio
                            : "No Definida"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2 h-full">
                          {sess.status === "approved" && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSession(sess);
                                setIsFullDetailsOpen(true);
                              }}
                              size="sm"
                              className="bg-slate-900 hover:bg-slate-800 text-white text-xs gap-1.5 h-8 shadow-sm"
                            >
                              <Eye className="h-3.5 w-3.5" /> Ver Cliente
                            </Button>
                          )}

                          {sess.status !== "completed_by_client" &&
                            sess.status !== "approved" && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onReactivateSession(sess.sessionId);
                                }}
                                size="sm"
                                disabled={sess.status !== "expired"}
                                variant={
                                  sess.status === "expired"
                                    ? "default"
                                    : "outline"
                                }
                                className={`text-xs gap-1.5 h-8 transition-all ${
                                  sess.status === "expired"
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md border-0"
                                    : "bg-slate-50 border-slate-200 text-slate-400 shadow-none cursor-not-allowed opacity-70"
                                }`}
                              >
                                <RefreshCw
                                  className={`h-3.5 w-3.5 ${sess.status === "expired" ? "animate-pulse" : ""}`}
                                />{" "}
                                {sess.status === "expired"
                                  ? "Reactivar Enlace"
                                  : "Enlace Vigente"}
                              </Button>
                            )}

                          {sess.workflow === "lead" &&
                            sess.status === "completed_by_client" &&
                            sess.crmProspectId && (
                              <Button
                                onClick={(e) =>
                                  handleSafePromoteToOnboarding(
                                    sess.sessionId,
                                    e,
                                  )
                                }
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-8 shadow-sm"
                              >
                                <ArrowUpRight className="h-3.5 w-3.5" />{" "}
                                Promover a Onboarding
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeTab === "audit" && (
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-sm font-bold text-slate-700">
                    Fecha y Hora
                  </TableHead>
                  <TableHead className="text-sm font-bold text-slate-700">
                    Usuario
                  </TableHead>
                  <TableHead className="text-sm font-bold text-slate-700">
                    Acción Registrada
                  </TableHead>
                  <TableHead className="text-sm font-bold text-slate-700 text-right">
                    Resultado
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions
                  .flatMap((s) => s.auditLogs)
                  .map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm font-mono text-slate-600">
                        {log.fechaHora}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-slate-800">
                        {log.usuario}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {log.accion}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
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

      {/* PANEL SLIDE-OVER (INSPECTOR DE SESIÓN LATERLA) */}
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
                  Cliente
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
                        disabled={currentSession.status !== "expired"}
                        variant={
                          currentSession.status === "expired"
                            ? "default"
                            : "outline"
                        }
                        className={`h-6 text-[10px] gap-1 transition-all ${
                          currentSession.status === "expired"
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border-0"
                            : "bg-slate-50 border-slate-200 text-slate-400 shadow-none cursor-not-allowed opacity-70"
                        }`}
                      >
                        <RefreshCw className="h-3 w-3" />{" "}
                        {currentSession.status === "expired"
                          ? "Reactivar (+3 Días)"
                          : "Enlace Vigente"}
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
                    <Eye className="h-3 w-3 mr-1" /> Ver Detalle Completo
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
                        onClick={(e) =>
                          handleSafePromoteToOnboarding(
                            currentSession.sessionId,
                            e,
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
                            currentSession.status === "approved" ||
                            hasUnvalidatedPlants
                          }
                          onClick={() =>
                            handleSafeApproveSession(currentSession.sessionId)
                          }
                          className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-xs gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          <Send className="h-3.5 w-3.5" />{" "}
                          {currentSession.status === "approved"
                            ? "Enviado"
                            : "Aprobar Expediente"}
                        </Button>
                      </div>
                      {!currentSession.crmProspectId &&
                        !hasUnvalidatedPlants && (
                          <p className="text-[10px] text-amber-600 font-medium text-center mt-2">
                            Debes generar el ID de CRM antes de aprobar.
                          </p>
                        )}
                      {hasUnvalidatedPlants && (
                        <p className="text-[10px] text-red-600 font-medium text-center mt-2 flex items-center justify-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Debes validar
                          todas las plantas de entrega.
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

      {/* MODAL: VISOR DE EXPEDIENTE COMPLETO ENRIQUECIDO Y DINÁMICO */}
      {isFullDetailsOpen && currentSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 lg:p-8 animate-in fade-in">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-50 shadow-2xl border-0 overflow-hidden animate-in zoom-in-95">
            <CardHeader className="bg-white border-b border-slate-200 flex-none shrink-0 py-4 px-6 md:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl md:text-2xl text-slate-900 flex items-center gap-2">
                    <FileCheck className="h-6 w-6 text-indigo-600" /> Expediente
                    Cliente / Prospecto
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">
                      {currentSession.sessionId}
                    </span>{" "}
                    -{" "}
                    {currentSession.ultimoAvance?.empresa?.razonSocial ||
                      "Razón Social Pendiente"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullDetailsOpen(false)}
                  className="text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full h-10 w-10"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 md:p-8">
              {/* SECCIÓN: CONFIGURACIÓN COMERCIAL (DINÁMICA: LEAD VS ONBOARDING) */}
              {currentSession.configComercial &&
                Array.isArray(currentSession.configComercial) &&
                currentSession.configComercial.length > 0 && (
                  <div className="mb-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-indigo-900 flex items-center gap-2 border-b border-slate-100 pb-2 text-base">
                      <Briefcase className="h-5 w-5 text-indigo-600" />{" "}
                      Parámetros CRM (Configurado por SAC)
                    </h4>

                    {/* SI ES ONBOARDING MUESTRA ÁREAS DE VENTA COMPLETAS */}
                    {currentSession.workflow === "onboarding" ? (
                      <div className="grid grid-cols-1 gap-4">
                        {currentSession.configComercial.map(
                          (config: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100/50"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <Badge
                                  variant="secondary"
                                  className="bg-white border-indigo-100 text-indigo-800 font-semibold text-xs"
                                >
                                  Área de Ventas {idx + 1}
                                </Badge>
                                <span className="text-xs text-indigo-700 font-medium">
                                  {config.unidadNegocio}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                                <div>
                                  <span className="text-slate-500 text-xs block mb-0.5">
                                    Org. Ventas:
                                  </span>
                                  <p className="font-medium text-slate-900">
                                    {config.organizacionVentas || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-xs block mb-0.5">
                                    Canal y Div:
                                  </span>
                                  <p className="font-medium text-slate-900">
                                    {config.canalDistribucion} /{" "}
                                    {config.division}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-xs block mb-0.5">
                                    Oficina Ventas:
                                  </span>
                                  <p className="font-medium text-slate-900">
                                    {config.oficinaVentas || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-xs block mb-0.5">
                                    Grupo Vendedores:
                                  </span>
                                  <p className="font-medium text-slate-900">
                                    {config.grupoVendedores || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-xs block mb-0.5">
                                    Grupo Clientes:
                                  </span>
                                  <p className="font-medium text-slate-900">
                                    {config.grupoClientes || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-xs block mb-0.5">
                                    Incoterms:
                                  </span>
                                  <p className="font-medium text-slate-900">
                                    {config.incoterms || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-xs block mb-0.5">
                                    Lugar Entrega:
                                  </span>
                                  <p className="font-medium text-slate-900">
                                    {config.lugarEntrega || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-xs block mb-0.5">
                                    Moneda:
                                  </span>
                                  <p className="font-medium text-slate-900">
                                    {config.moneda || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-xs block mb-0.5">
                                    Prioridad Entrega:
                                  </span>
                                  <p className="font-medium text-slate-900">
                                    {config.prioridadEntrega || "N/A"}
                                  </p>
                                </div>
                              </div>
                              {config.impuestos && (
                                <div className="mt-4 pt-3 border-t border-indigo-200/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-slate-500 text-xs block mb-0.5">
                                      Impuesto (IVA):
                                    </span>
                                    <p className="font-medium text-slate-900">
                                      {config.impuestos.iva || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 text-xs block mb-0.5">
                                      Impuesto (IEPS):
                                    </span>
                                    <p className="font-medium text-slate-900">
                                      {config.impuestos.ieps || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      /* SI ES LEAD SOLO MUESTRA LO BÁSICO */
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Unidad de Negocio:
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 border-slate-200 text-slate-800 font-medium"
                          >
                            {currentSession.configComercial[0].unidadNegocio ||
                              "N/A"}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Tipo de Cliente:
                          </span>
                          <p className="font-medium text-slate-900">
                            {currentSession.configComercial[0].tipoCliente ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* COLUMNA IZQUIERDA (Aplica para ambos) */}
                <div className="space-y-6">
                  {/* INFORMACIÓN GENERAL */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2 text-base">
                      <Building2 className="h-5 w-5 text-indigo-500" />{" "}
                      Información General
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                      <div className="col-span-2">
                        <span className="text-slate-500 text-xs block mb-0.5">
                          Razón Social:
                        </span>
                        <p className="font-medium text-slate-900 text-sm">
                          {currentSession.ultimoAvance?.empresa?.razonSocial ||
                            "No especificado"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs block mb-0.5">
                          RFC:
                        </span>
                        <p className="font-medium text-slate-900 text-sm font-mono">
                          {currentSession.ultimoAvance?.empresa?.rfc ||
                            "No especificado"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 text-xs block mb-0.5">
                          Régimen Fiscal:
                        </span>
                        <p className="font-medium text-slate-900 text-sm">
                          {currentSession.ultimoAvance?.empresa
                            ?.regimenFiscal || "No especificado"}
                        </p>
                      </div>

                      {currentSession.workflow === "onboarding" && (
                        <>
                          <div>
                            <span className="text-slate-500 text-xs block mb-0.5">
                              Uso CFDI:
                            </span>
                            <p className="font-medium text-slate-900 text-sm">
                              {currentSession.ultimoAvance?.empresa?.usoCFDI ||
                                "No especificado"}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs block mb-0.5">
                              Giro Comercial:
                            </span>
                            <p className="font-medium text-slate-900 text-sm">
                              {currentSession.ultimoAvance?.empresa
                                ?.giroComercial || "No especificado"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* CONTACTO */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2 text-base">
                      <User className="h-5 w-5 text-indigo-500" /> Contacto y
                      Legal
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                      <div className="col-span-2">
                        <span className="text-slate-500 text-xs block mb-0.5">
                          Representante Legal:
                        </span>
                        <p className="font-medium text-slate-900 text-sm">
                          {currentSession.ultimoAvance?.contacto
                            ?.nombreRepresentante || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs block mb-0.5">
                          Correo Electrónico:
                        </span>
                        <p className="font-medium text-slate-900 text-sm">
                          {
                            currentSession.ultimoAvance?.contacto
                              ?.correoContacto
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs block mb-0.5">
                          Teléfono:
                        </span>
                        <p className="font-medium text-slate-900 text-sm">
                          {currentSession.ultimoAvance?.contacto
                            ?.telefonoContacto || "No especificado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DOMICILIO FISCAL (Solo si lo llenó o es onboarding) */}
                  {(currentSession.workflow === "onboarding" ||
                    currentSession.ultimoAvance?.direccionFiscal
                      ?.codigoPostal) && (
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2 text-base">
                        <MapPin className="h-5 w-5 text-indigo-500" /> Domicilio
                        Fiscal
                      </h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                        <div className="col-span-2">
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Calle:
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {currentSession.ultimoAvance?.direccionFiscal
                              ?.calle || "No especificado"}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Num. Exterior:
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {currentSession.ultimoAvance?.direccionFiscal
                              ?.numeroExterior || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Código Postal:
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {currentSession.ultimoAvance?.direccionFiscal
                              ?.codigoPostal || "N/A"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Colonia:
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {currentSession.ultimoAvance?.direccionFiscal
                              ?.colonia || "No especificado"}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Municipio:
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {currentSession.ultimoAvance?.direccionFiscal
                              ?.municipio || "No especificado"}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Estado:
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {currentSession.ultimoAvance?.direccionFiscal
                              ?.estado || "No especificado"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* COLUMNA DERECHA (Exclusiva Onboarding) */}
                {currentSession.workflow === "onboarding" && (
                  <div className="space-y-6">
                    {/* DATOS BANCARIOS */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2 text-base">
                        <CreditCard className="h-5 w-5 text-indigo-500" /> Datos
                        Bancarios y Facturación
                      </h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                        <div>
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Banco:
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {currentSession.ultimoAvance?.facturacion?.banco ||
                              "No especificado"}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Últimos 4 dígitos:
                          </span>
                          <p className="font-medium text-slate-900 text-sm font-mono">
                            {currentSession.ultimoAvance?.facturacion
                              ?.cuenta4Digitos || "----"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Forma de Pago:
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {currentSession.ultimoAvance?.facturacion
                              ?.formaPago || "No especificado"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Método de Pago:
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {currentSession.ultimoAvance?.facturacion
                              ?.metodoPago || "No especificado"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 text-xs block mb-0.5">
                            Correo para Facturas:
                          </span>
                          <p className="font-medium text-slate-900 text-sm">
                            {currentSession.ultimoAvance?.facturacion
                              ?.correoFacturas || "No especificado"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* DESTINATARIOS */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-base">
                          <Truck className="h-5 w-5 text-indigo-500" />{" "}
                          Destinatarios (
                          {currentSession.ultimoAvance?.direccionesEntrega
                            ?.length || 0}
                          )
                        </h4>
                      </div>

                      {currentSession.ultimoAvance?.direccionesEntrega &&
                      currentSession.ultimoAvance.direccionesEntrega.length >
                        0 ? (
                        <div className="space-y-4">
                          {currentSession.ultimoAvance.direccionesEntrega.map(
                            (planta: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <span
                                      className={`h-2.5 w-2.5 rounded-full ${planta.validada ? "bg-emerald-500" : "bg-amber-500"}`}
                                    />
                                    {planta.nombrePlanta ||
                                      `Planta / Bodega ${idx + 1}`}
                                  </span>
                                  {/* BOTÓN DE VALIDACIÓN DE PLANTA (MODAL) */}
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
                                        Validada
                                      </>
                                    ) : (
                                      <>
                                        <ShieldCheck className="h-3 w-3" />{" "}
                                        Validar
                                      </>
                                    )}
                                  </Button>
                                </div>

                                {/* NUEVA CUADRICULA DETALLADA DE PLANTA EN EL MODAL */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 border-t border-slate-100 pt-3">
                                  <div>
                                    <p className="text-slate-500 text-xs font-medium uppercase mb-1">
                                      Dirección de Entrega:
                                    </p>
                                    <p className="font-medium text-slate-900">
                                      {planta.calle} #
                                      {planta.numeroExterior || "S/N"}
                                    </p>
                                    <p>
                                      {planta.colonia}, C.P.{" "}
                                      {planta.codigoPostal}
                                    </p>
                                    <p>
                                      {planta.municipio}, {planta.estado}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 text-xs font-medium uppercase mb-1">
                                      Encargado de Recepción:
                                    </p>
                                    <p className="font-medium text-slate-900">
                                      {planta.contactoRecepcion ||
                                        "No especificado"}
                                    </p>
                                    <p className="text-slate-600 mt-0.5">
                                      Tel: {planta.telefonoRecepcion || "N/A"}
                                    </p>
                                    {planta.horarioRecepcion && (
                                      <p className="text-indigo-600 italic mt-1 font-medium">
                                        Horario: {planta.horarioRecepcion}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                                  <span className="text-slate-500 flex items-center gap-1.5 font-medium uppercase">
                                    <FileText className="h-4 w-4 text-indigo-500" />{" "}
                                    Comprobante
                                  </span>
                                  {planta.comprobanteDomicilioUrl ? (
                                    <a
                                      href={planta.comprobanteDomicilioUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                                    >
                                      Ver{" "}
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  ) : (
                                    <span className="text-amber-600 font-semibold">
                                      Sin adjunto
                                    </span>
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-lg text-center border border-dashed border-slate-300">
                          <p className="text-sm text-slate-500 italic">
                            Sin plantas adicionales.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* DOCUMENTOS LEGALES ADJUNTOS (Siempre visible para dar contexto) */}
                <div className="col-span-1 md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 mt-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 text-base">
                    <FileCheck className="h-5 w-5 text-indigo-600" /> Documentos
                    Legales Adjuntos
                  </h4>

                  {currentSession.workflow === "lead" ? (
                    <div className="p-4 bg-white rounded-lg text-center border border-dashed border-slate-300">
                      <p className="text-sm text-slate-500 italic flex items-center justify-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Los
                        documentos legales se solicitan únicamente al promover a
                        Onboarding.
                      </p>
                    </div>
                  ) : currentSession.ultimoAvance?.documentosTemporales &&
                    Object.keys(
                      currentSession.ultimoAvance.documentosTemporales,
                    ).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {currentSession.ultimoAvance.documentosTemporales.csf && (
                        <a
                          href={
                            currentSession.ultimoAvance.documentosTemporales.csf
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-md transition group"
                        >
                          <div className="bg-rose-50 p-2 rounded text-rose-600 group-hover:bg-rose-100 transition">
                            <FileText className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-slate-800 text-sm group-hover:text-indigo-700">
                            Constancia Fiscal (CSF)
                          </span>
                        </a>
                      )}
                      {currentSession.ultimoAvance.documentosTemporales
                        .comprobante && (
                        <a
                          href={
                            currentSession.ultimoAvance.documentosTemporales
                              .comprobante
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-md transition group"
                        >
                          <div className="bg-amber-50 p-2 rounded text-amber-600 group-hover:bg-amber-100 transition">
                            <FileText className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-slate-800 text-sm group-hover:text-indigo-700">
                            Comprobante Domicilio
                          </span>
                        </a>
                      )}
                      {currentSession.ultimoAvance.documentosTemporales.ine && (
                        <a
                          href={
                            currentSession.ultimoAvance.documentosTemporales.ine
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-md transition group"
                        >
                          <div className="bg-blue-50 p-2 rounded text-blue-600 group-hover:bg-blue-100 transition">
                            <User className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-slate-800 text-sm group-hover:text-indigo-700">
                            Identificación (INE)
                          </span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-lg text-center border border-dashed border-slate-300">
                      <p className="text-sm text-slate-500 italic">
                        El cliente aún no ha cargado los documentos requeridos.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL DE ALERTAS NORMAL */}
      {activeAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in">
          <Card className="max-w-md w-full bg-white shadow-2xl border-0 overflow-hidden animate-in zoom-in-95">
            <CardHeader
              className={`border-b border-slate-100 pb-4 ${activeAlert.type === "approve" ? "bg-amber-50" : ""} ${activeAlert.type === "correct" ? "bg-red-50" : ""} ${activeAlert.type === "sync" ? "bg-slate-50" : ""} ${activeAlert.type === "validate_planta" ? "bg-indigo-50" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${activeAlert.type === "approve" ? "bg-amber-100 text-amber-600" : ""} ${activeAlert.type === "correct" ? "bg-red-100 text-red-600" : ""} ${activeAlert.type === "sync" || activeAlert.type === "validate_planta" ? "bg-indigo-100 text-indigo-600" : ""}`}
                >
                  {activeAlert.type === "validate_planta" ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
                <CardTitle className="text-base text-slate-900">
                  {activeAlert.type === "sync" && "Generar Prospecto en CRM"}
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
                            className={`flex items-center gap-2 p-2 rounded-md border text-xs text-left transition-colors ${isSelected ? "bg-red-50 border-red-200 text-red-700 font-semibold" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                          >
                            <opt.icon className="h-3.5 w-3.5" /> {opt.label}
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
