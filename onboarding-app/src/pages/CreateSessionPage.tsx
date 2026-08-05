import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  Copy,
  Check,
  Key,
  ArrowLeft,
  Clock,
  Loader2,
  FileText,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Receipt,
  BookmarkPlus,
  Layers,
  Plus,
  Trash2,
  X,
  Save,
  RefreshCw,
  Building2,
  User,
} from "lucide-react";
import type { MagicLinkSession, SessionWorkflow } from "@/types/onboarding";
import { supabase } from "@/lib/supabase";

const defaultSalesArea = {
  isExpanded: true,
  organizacionVentas: "POLAQUIMIA SA DE CV",
  canalDistribucion: "Industrial",
  division: "Nacional",
  oficinaVentas: "Gte. Div. Ind. PQ",
  grupoVendedores: "Gte. Vta. Industrial",
  condicionesPago: "CONT Contado",
  incoterms: "En fábrica",
  lugarEntrega: "CIA",
  moneda: "MXN - Peso mexicano",
  prioridadEntrega: "Normal",
  grupoClientes: "Industria",
};

export function CreateSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // LEEMOS EL ID INFALIBLEMENTE (ya sea por URL o por estado interno)
  const promoteSessionId =
    location.state?.promoteSessionId ||
    searchParams.get("promover") ||
    searchParams.get("promote");

  const [pageStep, setPageStep] = useState<"form" | "loading" | "success">(
    "form",
  );
  const [copiedCustom, setCopiedCustom] = useState(false);

  // SI ES PROMOCIÓN, BLOQUEAMOS EL FLUJO A ONBOARDING INMEDIATAMENTE
  const [workflow, setWorkflow] = useState<SessionWorkflow>(
    promoteSessionId ? "onboarding" : "lead",
  );

  const [isTaxesExpanded, setIsTaxesExpanded] = useState(!!promoteSessionId);
  const [isCrmExpanded, setIsCrmExpanded] = useState(!!promoteSessionId);

  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [unidadNegocio, setUnidadNegocio] = useState("Industrial PQ");
  const [tipoCliente, setTipoCliente] = useState("");

  const [existingAvance, setExistingAvance] = useState<any>(null);

  const [taxConfig, setTaxConfig] = useState({
    iva: "1 - Sujeto a impuestos",
    ieps: "0 - Exento de impto.",
  });
  const [salesAreas, setSalesAreas] = useState([{ ...defaultSalesArea }]);

  const [savedProfiles, setSavedProfiles] = useState<Record<string, any>>({});
  const [profileModal, setProfileModal] = useState({
    isOpen: false,
    areaIndex: -1,
    profileName: "",
    isLoading: false,
    error: "",
  });
  const [generatedSession, setGeneratedSession] =
    useState<MagicLinkSession | null>(null);

  useEffect(() => {
    fetchProfiles();
    if (promoteSessionId) {
      loadSessionToPromote(promoteSessionId);
    }
  }, [promoteSessionId]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("commercial_profiles")
        .select("*");
      if (!error && data) {
        const profilesObj: Record<string, any> = {};
        data.forEach((row) => {
          profilesObj[row.profile_key] = {
            nombre: row.profile_name,
            config: row.config,
          };
        });
        setSavedProfiles(profilesObj);
      }
    } catch (err) {
      console.error("Error al cargar perfiles:", err);
    }
  };

  const loadSessionToPromote = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("session_id", sessionId)
        .single();
      if (error) throw error;

      if (data) {
        setWorkflow("onboarding");
        setIsCrmExpanded(true);
        setIsTaxesExpanded(true);
        setContactEmail(data.ultimo_avance?.contacto?.correoContacto || "");
        setPhoneNumber(data.ultimo_avance?.contacto?.telefonoContacto || "");

        if (data.config_comercial && Array.isArray(data.config_comercial)) {
          setUnidadNegocio(
            data.config_comercial[0]?.unidadNegocio || "Industrial PQ",
          );
          setTipoCliente(data.config_comercial[0]?.tipoCliente || "");
        } else if (data.config_comercial) {
          setUnidadNegocio(
            data.config_comercial.unidadNegocio || "Industrial PQ",
          );
          setTipoCliente(data.config_comercial.tipoCliente || "");
        }

        setExistingAvance(data.ultimo_avance);
      }
    } catch (err) {
      console.error("Error al cargar sesión a promover", err);
    }
  };

  const unidadesNegocio = [
    "Industrial PQ",
    "Agrícola",
    "Adyuvantes",
    "Industrial DJP",
  ];
  const tiposCliente = [
    "Agroindustrial",
    "Distribuidor",
    "Fabricante",
    "Representante",
  ];
  const orgVentasOptions = [
    "POLAQUIMIA SA DE CV",
    "DR. JOSE POLAK",
    "POLATECNIA SA DE CV",
  ];
  const canalDistOptions = [
    "Industrial",
    "Agrícola",
    "Canal Dist. Común",
    "Ventas directas",
  ];
  const divisionOptions = ["Nacional", "Exportación", "Sector Común"];
  const oficinaVentasOptions = [
    "Gte. Div. Ind. PQ",
    "Gte. Div. Ag. PQ",
    "Gte. Div. Ind. DJP",
  ];
  const grupoVendedoresOptions = [
    "Gte. Vta. Industrial",
    "Gte. Vta. Agrícola",
    "Jefe Polatecnia",
  ];
  const incotermsOptions = [
    "En fábrica",
    "Coste, seguro y flete",
    "Transporte pagado hasta",
  ];
  const monedaOptions = [
    "MXN - Peso mexicano",
    "USD - Dolar de EE. UU.",
    "EUR - Euro",
  ];
  const prioridadOptions = ["Alta", "Normal"];
  const grupoClientesOptions = [
    "Industria",
    "Competencia",
    "Sector público",
    "Subsidiaria parcial",
  ];

  const handleAddSalesArea = () =>
    setSalesAreas([...salesAreas, { ...defaultSalesArea }]);
  const handleRemoveSalesArea = (index: number) =>
    setSalesAreas(salesAreas.filter((_, i) => i !== index));
  const toggleSalesArea = (index: number) => {
    const newAreas = [...salesAreas];
    newAreas[index].isExpanded = !newAreas[index].isExpanded;
    setSalesAreas(newAreas);
  };
  const updateSalesArea = (index: number, field: string, value: string) => {
    const newAreas = [...salesAreas];
    newAreas[index] = { ...newAreas[index], [field]: value };
    setSalesAreas(newAreas);
  };

  const handleApplyProfile = (index: number, profileKey: string) => {
    if (!profileKey) return;
    const selectedProfile = savedProfiles[profileKey];
    if (selectedProfile) {
      const newAreas = [...salesAreas];
      newAreas[index] = { ...newAreas[index], ...selectedProfile.config };
      setSalesAreas(newAreas);
    }
  };

  const openSaveProfileModal = (index: number) =>
    setProfileModal({
      isOpen: true,
      areaIndex: index,
      profileName: "",
      isLoading: false,
      error: "",
    });

  const executeSaveProfile = async () => {
    const { areaIndex, profileName } = profileModal;
    if (!profileName || profileName.trim() === "") {
      setProfileModal((p) => ({ ...p, error: "El nombre es obligatorio." }));
      return;
    }
    setProfileModal((p) => ({ ...p, isLoading: true, error: "" }));

    const newKey =
      profileName.toLowerCase().replace(/[^a-z0-9]/g, "_") +
      "_" +
      Math.floor(Math.random() * 1000);
    const currentConfig = { ...salesAreas[areaIndex] };
    delete (currentConfig as any).isExpanded;

    try {
      const { error } = await supabase
        .from("commercial_profiles")
        .insert([
          {
            profile_key: newKey,
            profile_name: profileName,
            config: currentConfig,
          },
        ]);
      if (error) throw error;
      setSavedProfiles((p) => ({
        ...p,
        [newKey]: { nombre: profileName, config: currentConfig },
      }));
      setProfileModal({
        isOpen: false,
        areaIndex: -1,
        profileName: "",
        isLoading: false,
        error: "",
      });
    } catch (err) {
      console.error(err);
      setProfileModal((p) => ({
        ...p,
        isLoading: false,
        error: "Hubo un error de conexión al guardar.",
      }));
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageStep("loading");

    try {
      const highEntropyToken = `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      const rawSessionId =
        promoteSessionId ||
        `SES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const configComercialFinal = salesAreas.map(
        ({ isExpanded, ...areaConfig }) => ({
          ...areaConfig,
          unidadNegocio,
          tipoCliente,
          impuestos: taxConfig,
        }),
      );

      const avanceFinal = existingAvance || {
        empresa: {
          razonSocial: "",
          rfc: "",
          regimenFiscal: "",
          usoCFDI: "",
          giroComercial: "",
        },
        direccionFiscal: {
          calle: "",
          numeroExterior: "",
          colonia: "",
          codigoPostal: "",
          estado: "",
          municipio: "",
        },
        direccionesEntrega: [],
        contacto: {
          nombreRepresentante: "",
          correoContacto: contactEmail,
          telefonoContacto: phoneNumber,
        },
        facturacion: {
          banco: "",
          cuenta4Digitos: "",
          metodoPago: "",
          formaPago: "",
          correoFacturas: "",
        },
      };

      if (promoteSessionId) {
        const { error: updateError } = await supabase
          .from("sessions")
          .update({
            workflow: "onboarding",
            status: "active",
            config_comercial: configComercialFinal,
            token: highEntropyToken,
            expires_at: expiresAt.toISOString(),
            ultimo_avance: {
              ...avanceFinal,
              contacto: {
                ...avanceFinal.contacto,
                correoContacto: contactEmail,
                telefonoContacto: phoneNumber,
              },
            },
          })
          .eq("session_id", promoteSessionId);

        if (updateError) throw updateError;

        await supabase.from("audit_logs").insert([
          {
            session_id: promoteSessionId,
            usuario: "SAC (Operador)",
            accion: `Promovido a Onboarding Completo`,
            resultado: "Exitoso",
          },
        ]);
      } else {
        const { error: insertError } = await supabase.from("sessions").insert([
          {
            session_id: rawSessionId,
            token: highEntropyToken,
            workflow: workflow,
            status: "active",
            config_comercial: configComercialFinal,
            ultimo_avance: avanceFinal,
            reactivaciones_count: 0,
            expires_at: expiresAt.toISOString(),
          },
        ]);

        if (insertError) throw insertError;

        await supabase.from("audit_logs").insert([
          {
            session_id: rawSessionId,
            usuario: "SAC (Operador)",
            accion: `Creación de Sesión (${workflow.toUpperCase()})`,
            resultado: "Exitoso",
          },
        ]);
      }

      setGeneratedSession({
        sessionId: rawSessionId,
        workflow: workflow as any,
        token: highEntropyToken,
        clienteExisteEnCRM: false,
        configComercial: configComercialFinal as any,
        fechaCreacion: now.toLocaleDateString("es-MX"),
        fechaExpiracion: expiresAt.toLocaleDateString("es-MX"),
        reactivacionesCount: 0,
        status: "active",
        ultimoAvance: avanceFinal as any,
        documentosTemporales: {},
        auditLogs: [],
      });
      setPageStep("success");
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema procesando la sesión.");
      setPageStep("form");
    }
  };

  const handleCopy = () => {
    if (generatedSession) {
      navigator.clipboard.writeText(
        `${window.location.origin}/registro/magic-link?token=${generatedSession.token}`,
      );
      setCopiedCustom(true);
      setTimeout(() => setCopiedCustom(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans relative">
      {pageStep === "form" && (
        <div className="w-full max-w-[850px] mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-500 hover:text-slate-900 -ml-4 gap-2 text-sm rounded-md"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al Tablero
          </Button>
        </div>
      )}

      <Card className="max-w-[850px] w-full bg-white shadow-sm border-slate-200 rounded-lg overflow-hidden">
        {pageStep === "form" && !promoteSessionId && (
          <CardHeader className="bg-white border-b border-slate-100 px-8 py-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-md border shrink-0 mt-1 bg-indigo-50 text-indigo-600 border-indigo-100">
                <FileText className="h-6 w-6" />
              </div>
              <div className="w-full">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Crear Nueva Sesión de Registro
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Asignación de credenciales y parámetros CRM para cliente
                  externo.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent className={pageStep === "form" ? "p-8" : "p-0"}>
          {pageStep === "form" && (
            <form
              onSubmit={handleCreateSession}
              className="space-y-8 animate-in fade-in"
            >
              {/* --- LÓGICA DIVIDIDA: VISTA PROMOCIÓN vs VISTA CREACIÓN --- */}
              {promoteSessionId ? (
                <div className="space-y-6">
                  {/* BANNER RÁPIDO DE PROMOCIÓN */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-sm">
                    <div>
                      <Badge className="bg-emerald-600 mb-2 border-0">
                        Modo Promoción a Onboarding
                      </Badge>
                      <h2 className="text-xl font-bold text-emerald-950">
                        {existingAvance?.empresa?.razonSocial ||
                          "Cargando empresa..."}
                      </h2>
                      <p className="text-sm text-emerald-700 font-mono mt-1">
                        ID: {promoteSessionId}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-md border border-emerald-100 text-sm shadow-sm">
                      <p className="font-semibold text-slate-800">
                        {contactEmail || "Sin correo"}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {phoneNumber || "Sin teléfono"}
                      </p>
                    </div>
                  </div>

                  {/* PARÁMETROS COMERCIALES INICIALES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pt-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-800">
                        Unidad de Negocio{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:ring-indigo-600"
                        value={unidadNegocio}
                        onChange={(e) => setUnidadNegocio(e.target.value)}
                      >
                        {unidadesNegocio.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-800">
                        Tipo de Cliente
                      </Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:ring-indigo-600"
                        value={tipoCliente}
                        onChange={(e) => setTipoCliente(e.target.value)}
                      >
                        <option value="">Selecciona...</option>
                        {tiposCliente.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* FORMULARIO ESTÁNDAR PARA NUEVA SESIÓN */}
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => {
                        setWorkflow("lead");
                        setIsCrmExpanded(false);
                        setIsTaxesExpanded(false);
                      }}
                      className={`relative p-4 rounded-md border cursor-pointer transition-all ${workflow === "lead" ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600" : "border-slate-200 bg-white hover:border-indigo-300"}`}
                    >
                      <p
                        className={`font-semibold text-sm mb-0.5 ${workflow === "lead" ? "text-indigo-900" : "text-slate-900"}`}
                      >
                        Prospecto Comercial (Lead)
                      </p>
                      <p className="text-xs text-slate-500">
                        Recopilación de información básica.
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        setWorkflow("onboarding");
                        setIsCrmExpanded(true);
                        setIsTaxesExpanded(true);
                      }}
                      className={`relative p-4 rounded-md border transition-all ${workflow === "onboarding" ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 cursor-pointer" : "border-slate-200 bg-white hover:border-emerald-300 cursor-pointer"}`}
                    >
                      <p
                        className={`font-semibold text-sm mb-0.5 ${workflow === "onboarding" ? "text-emerald-900" : "text-slate-900"}`}
                      >
                        Onboarding Completo
                      </p>
                      <p className="text-xs text-slate-500">
                        Expediente fiscal y configuración CRM requerida.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-800">
                        Correo Electrónico{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-800">
                        Teléfono (Opcional)
                      </Label>
                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-800">
                        Unidad de Negocio{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:ring-indigo-600"
                        value={unidadNegocio}
                        onChange={(e) => setUnidadNegocio(e.target.value)}
                      >
                        {unidadesNegocio.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-800">
                        Tipo de Cliente
                      </Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:ring-indigo-600"
                        value={tipoCliente}
                        onChange={(e) => setTipoCliente(e.target.value)}
                      >
                        <option value="">Selecciona...</option>
                        {tiposCliente.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {workflow === "onboarding" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  {/* IMPUESTOS */}
                  <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm transition-all duration-300">
                    <div
                      className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => setIsTaxesExpanded(!isTaxesExpanded)}
                    >
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-slate-600" />
                        <span className="font-semibold text-slate-800 text-sm">
                          Impuestos Cliente (Globales)
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-white text-slate-500 border-slate-200 text-[10px] rounded-sm ml-2"
                        >
                          Aplica a todas las org.
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-500 hover:bg-slate-200 rounded-sm"
                      >
                        {isTaxesExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {isTaxesExpanded && (
                      <div className="p-5 overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="pb-2 font-medium">País</th>
                              <th className="pb-2 font-medium">
                                Tipo impuesto
                              </th>
                              <th className="pb-2 font-medium">
                                Clasificación fiscal (SAP)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr>
                              <td className="py-3 font-medium text-slate-800">
                                MX - México
                              </td>
                              <td className="py-3 text-slate-600">
                                MWST (IVA repercutido)
                              </td>
                              <td className="py-3">
                                <select
                                  className="flex h-8 w-full max-w-[200px] rounded-sm border border-slate-300 px-2 bg-white"
                                  value={taxConfig.iva}
                                  onChange={(e) =>
                                    setTaxConfig({
                                      ...taxConfig,
                                      iva: e.target.value,
                                    })
                                  }
                                >
                                  <option value="1 - Sujeto a impuestos">
                                    1 - Sujeto a impuestos
                                  </option>
                                  <option value="0 - Exento">0 - Exento</option>
                                </select>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 font-medium text-slate-800">
                                MX - México
                              </td>
                              <td className="py-3 text-slate-600">
                                ZMX1 (I.E.P.S. MEXICO)
                              </td>
                              <td className="py-3">
                                <select
                                  className="flex h-8 w-full max-w-[200px] rounded-sm border border-slate-300 px-2 bg-white"
                                  value={taxConfig.ieps}
                                  onChange={(e) =>
                                    setTaxConfig({
                                      ...taxConfig,
                                      ieps: e.target.value,
                                    })
                                  }
                                >
                                  <option value="1 - Sujeto a impuestos">
                                    1 - Sujeto a impuestos
                                  </option>
                                  <option value="0 - Exento de impto.">
                                    0 - Exento de impto.
                                  </option>
                                </select>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* ÁREAS DE VENTA */}
                  <div className="bg-white border border-indigo-100 rounded-md overflow-hidden shadow-sm transition-all duration-300">
                    <div
                      className="bg-indigo-50/50 px-5 py-3 border-b border-indigo-100 flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors"
                      onClick={() => setIsCrmExpanded(!isCrmExpanded)}
                    >
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-indigo-600" />
                        <span className="font-semibold text-indigo-900 text-sm">
                          Áreas de Venta CRM ({salesAreas.length})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-indigo-600 hover:bg-indigo-100 rounded-sm"
                      >
                        {isCrmExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {isCrmExpanded && (
                      <div className="p-5 space-y-6 bg-slate-50/30">
                        {salesAreas.map((area, index) => (
                          <div
                            key={index}
                            className="bg-white border border-slate-200 rounded-md shadow-sm relative transition-all"
                          >
                            <div
                              className="bg-slate-100/50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                              onClick={() => toggleSalesArea(index)}
                            >
                              <div className="flex items-center gap-2">
                                {area.isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-slate-400" />
                                )}
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                  Conjunto de Datos {index + 1}{" "}
                                  {!area.isExpanded &&
                                    `- ${area.organizacionVentas} (${area.canalDistribucion})`}
                                </span>
                              </div>
                              {salesAreas.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSalesArea(index);
                                  }}
                                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1 px-2"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Quitar
                                </Button>
                              )}
                            </div>

                            {area.isExpanded && (
                              <div className="p-4 animate-in fade-in">
                                <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Layers className="h-4 w-4 text-slate-400" />
                                    <select
                                      className="flex h-8 w-full md:w-64 rounded-sm border border-slate-300 bg-white px-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
                                      onChange={(e) =>
                                        handleApplyProfile(
                                          index,
                                          e.target.value,
                                        )
                                      }
                                      defaultValue=""
                                    >
                                      <option value="" disabled>
                                        Aplicar perfil a esta área...
                                      </option>
                                      {Object.entries(savedProfiles).map(
                                        ([key, perfil]) => (
                                          <option key={key} value={key}>
                                            {perfil.nombre}
                                          </option>
                                        ),
                                      )}
                                    </select>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openSaveProfileModal(index)}
                                    className="h-8 text-xs gap-1.5 border-slate-300 text-slate-700 bg-white hover:bg-slate-100 shadow-sm"
                                  >
                                    <BookmarkPlus className="h-3.5 w-3.5 text-indigo-600" />{" "}
                                    Guardar como Perfil Nuevo
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                  <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-500 uppercase">
                                      Organización de Ventas
                                    </Label>
                                    <select
                                      className="flex h-8 w-full rounded-sm border border-slate-200 px-2 text-xs"
                                      value={area.organizacionVentas}
                                      onChange={(e) =>
                                        updateSalesArea(
                                          index,
                                          "organizacionVentas",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      {orgVentasOptions.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-500 uppercase">
                                      Canal Distribución
                                    </Label>
                                    <select
                                      className="flex h-8 w-full rounded-sm border border-slate-200 px-2 text-xs"
                                      value={area.canalDistribucion}
                                      onChange={(e) =>
                                        updateSalesArea(
                                          index,
                                          "canalDistribucion",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      {canalDistOptions.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-500 uppercase">
                                      División
                                    </Label>
                                    <select
                                      className="flex h-8 w-full rounded-sm border border-slate-200 px-2 text-xs"
                                      value={area.division}
                                      onChange={(e) =>
                                        updateSalesArea(
                                          index,
                                          "division",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      {divisionOptions.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-500 uppercase">
                                      Oficina de Ventas
                                    </Label>
                                    <select
                                      className="flex h-8 w-full rounded-sm border border-slate-200 px-2 text-xs"
                                      value={area.oficinaVentas}
                                      onChange={(e) =>
                                        updateSalesArea(
                                          index,
                                          "oficinaVentas",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      {oficinaVentasOptions.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-500 uppercase">
                                      Grupo Vendedores
                                    </Label>
                                    <select
                                      className="flex h-8 w-full rounded-sm border border-slate-200 px-2 text-xs"
                                      value={area.grupoVendedores}
                                      onChange={(e) =>
                                        updateSalesArea(
                                          index,
                                          "grupoVendedores",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      {grupoVendedoresOptions.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-500 uppercase">
                                      Grupo de clientes
                                    </Label>
                                    <select
                                      className="flex h-8 w-full rounded-sm border border-slate-200 px-2 text-xs"
                                      value={area.grupoClientes}
                                      onChange={(e) =>
                                        updateSalesArea(
                                          index,
                                          "grupoClientes",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      {grupoClientesOptions.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-500 uppercase">
                                      Incoterms
                                    </Label>
                                    <select
                                      className="flex h-8 w-full rounded-sm border border-slate-200 px-2 text-xs"
                                      value={area.incoterms}
                                      onChange={(e) =>
                                        updateSalesArea(
                                          index,
                                          "incoterms",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      {incotermsOptions.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-500 uppercase">
                                      Lugar de Entrega
                                    </Label>
                                    <Input
                                      className="h-8 text-xs rounded-sm border-slate-200"
                                      value={area.lugarEntrega}
                                      onChange={(e) =>
                                        updateSalesArea(
                                          index,
                                          "lugarEntrega",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-500 uppercase">
                                      Moneda
                                    </Label>
                                    <select
                                      className="flex h-8 w-full rounded-sm border border-slate-200 px-2 text-xs"
                                      value={area.moneda}
                                      onChange={(e) =>
                                        updateSalesArea(
                                          index,
                                          "moneda",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      {monedaOptions.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-500 uppercase">
                                      Prioridad de Entrega
                                    </Label>
                                    <select
                                      className="flex h-8 w-full rounded-sm border border-slate-200 px-2 text-xs"
                                      value={area.prioridadEntrega}
                                      onChange={(e) =>
                                        updateSalesArea(
                                          index,
                                          "prioridadEntrega",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      {prioridadOptions.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddSalesArea}
                          className="w-full border-dashed border-2 border-slate-300 text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 h-10 gap-2"
                        >
                          <Plus className="h-4 w-4" /> Agregar Nueva Área de
                          Ventas
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  className={`w-full text-white h-11 text-sm font-semibold rounded-md shadow-sm gap-2 ${promoteSessionId ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
                >
                  <Sparkles className="h-4 w-4" />{" "}
                  {promoteSessionId
                    ? "Guardar Configuración y Enviar a Cliente"
                    : "Generar Sesión y Preparar Link"}
                </Button>
              </div>
            </form>
          )}

          {pageStep === "loading" && (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
              <div className="text-center">
                <h3 className="text-base font-semibold text-slate-900">
                  Procesando solicitud
                </h3>
              </div>
            </div>
          )}
          {pageStep === "success" && generatedSession && (
            <div className="py-16 px-8 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 fade-in">
              <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-50">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  Configuración Comercial Lista
                </h3>
              </div>
              <div className="w-full max-w-md p-5 rounded-md bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
                    Acceso Seguro (Magic Link)
                  </span>
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5 shadow-sm rounded-sm font-medium">
                    <Clock className="h-3 w-3" /> Válido 72h
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  <Input
                    value={`${window.location.origin}/registro/magic-link?token=${generatedSession.token}`}
                    readOnly
                    className="bg-white font-mono text-xs text-slate-600 h-10"
                  />
                  <Button
                    onClick={handleCopy}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 h-10 shadow-sm text-sm rounded-md"
                  >
                    {copiedCustom ? "Enlace Copiado" : "Copiar Enlace"}
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="h-10 px-6 font-medium text-slate-600 hover:text-slate-900 border-slate-300 rounded-md"
              >
                Volver al Workspace
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DE PERFIL */}
      {profileModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <Card className="w-full max-w-md bg-white shadow-2xl border-0 overflow-hidden animate-in zoom-in-95">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookmarkPlus className="h-5 w-5 text-indigo-600" />
                  Guardar Perfil Comercial
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setProfileModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="h-8 w-8 text-slate-400 hover:bg-slate-200 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800">
                  Nombre del Perfil
                </Label>
                <Input
                  placeholder="Ej. DJP Exportación Especial"
                  value={profileModal.profileName}
                  onChange={(e) =>
                    setProfileModal((prev) => ({
                      ...prev,
                      profileName: e.target.value,
                    }))
                  }
                  className={`h-10 ${profileModal.error ? "border-red-500 focus:ring-red-500" : "focus:ring-indigo-600"}`}
                  autoFocus
                />
                {profileModal.error ? (
                  <p className="text-xs text-red-500">{profileModal.error}</p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Este nombre aparecerá en la lista para todo tu equipo.
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() =>
                    setProfileModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="w-1/2"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={executeSaveProfile}
                  disabled={profileModal.isLoading}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                >
                  {profileModal.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}{" "}
                  {profileModal.isLoading ? "Guardando..." : "Guardar en Nube"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
