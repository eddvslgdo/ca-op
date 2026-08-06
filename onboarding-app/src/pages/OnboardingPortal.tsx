import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  MapPin,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  Truck,
  CreditCard,
  Loader2,
  AlertTriangle,
  CloudLightning,
} from "lucide-react";
import { StepCompany } from "@/components/onboarding/StepCompany";
import { StepAddress } from "@/components/onboarding/StepAddress";
import { StepDelivery } from "@/components/onboarding/StepDelivery";
import { StepBilling } from "@/components/onboarding/StepBilling";
import {
  StepDocuments,
  type StepDocumentsData,
} from "@/components/onboarding/StepDocuments";
import { StepSummary } from "@/components/onboarding/StepSummary";
import type { OnboardingFormValues, BillingData } from "@/types/onboarding";
import { supabase } from "@/lib/supabase";

export function OnboardingPortal() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Estados de carga y validación
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const [workflow, setWorkflow] = useState<"lead" | "onboarding">("lead");
  const [dbSessionId, setDbSessionId] = useState("");

  // NUEVO: Estado para almacenar al propietario (ejecutivo)
  const [propietario, setPropietario] = useState("No asignado");

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // NUEVO ESTADO: Control de errores de validación en pantalla
  const [validationError, setValidationError] = useState<string | null>(null);

  // Estados: Control de Correcciones
  const [sessionStatus, setSessionStatus] = useState<string>("");
  const [correctionNotes, setCorrectionNotes] = useState<
    Record<string, string>
  >({});

  // Casilla legal y Archivos PDF
  const [isAgreed, setIsAgreed] = useState(false);
  const [documentFiles, setDocumentFiles] = useState<StepDocumentsData>({
    csf: null,
    comprobante: null,
    ine: null,
  });

  const [formData, setFormData] = useState<OnboardingFormValues>({
    empresa: { razonSocial: "", rfc: "", regimenFiscal: "", usoCFDI: "" },
    direccionFiscal: {
      codigoPostal: "",
      tipoVialidad: "",
      calle: "",
      numeroExterior: "",
      numeroInterior: "",
      colonia: "",
      localidad: "",
      municipio: "",
      estado: "",
      entreCalle: "",
      yCalle: "",
    },
    direccionesEntrega: [],
    contacto: {
      nombreRepresentante: "",
      correoContacto: "",
      telefonoContacto: "",
    },
    facturacion: {
      banco: "",
      cuenta4Digitos: "",
      metodoPago: "",
      formaPago: "",
      correoFacturas: "",
    },
  });

  // EFECTO: Buscar la sesión en Supabase usando el Token
  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
      setIsLoading(false);
      return;
    }

    const fetchSessionData = async () => {
      try {
        const { data, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("token", token)
          .single();

        if (error || !data) {
          setInvalidToken(true);
        } else {
          setSessionStatus(data.status);

          // Recuperamos el propietario para enviarlo en los correos
          setPropietario(data.propietario || "No asignado");

          // DESEMPAQUETAMOS EL JSON DE CORRECCIONES
          if (data.notas_correccion) {
            try {
              const parsedNotes = JSON.parse(data.notas_correccion);
              setCorrectionNotes(parsedNotes);
            } catch (e) {
              console.error("Error parseando notas de corrección");
            }
          }

          // Bloquear si ya fue completado o aprobado
          if (
            data.status === "completed_by_client" ||
            data.status === "approved"
          ) {
            setIsSubmitted(true);
          }

          setWorkflow(data.workflow);
          setDbSessionId(data.session_id || data.sessionId || data.id);

          // Pre-cargamos el formulario con los datos de Supabase
          if (data.ultimo_avance) {
            setFormData(data.ultimo_avance);
          }
        }
      } catch (err) {
        setInvalidToken(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [token]);

  const totalSteps = workflow === "lead" ? 1 : 6;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Helpers para limpiar errores visuales al teclear
  const clearError = () => setValidationError(null);

  const updateCompanyData = (fields: Partial<typeof formData.empresa>) => {
    clearError();
    setFormData((prev) => ({
      ...prev,
      empresa: { ...prev.empresa, ...fields },
    }));
  };

  const updateFiscalAddress = (
    fields: Partial<typeof formData.direccionFiscal>,
  ) => {
    clearError();
    setFormData((prev) => ({
      ...prev,
      direccionFiscal: { ...prev.direccionFiscal, ...fields },
    }));
  };

  const updateDeliveryAddresses = (
    addresses: typeof formData.direccionesEntrega,
  ) => {
    clearError();
    setFormData((prev) => ({ ...prev, direccionesEntrega: addresses }));
  };

  const updateContactData = (fields: Partial<typeof formData.contacto>) => {
    clearError();
    setFormData((prev) => ({
      ...prev,
      contacto: { ...prev.contacto, ...fields },
    }));
  };

  const updateBillingData = (fields: Partial<BillingData>) => {
    clearError();
    setFormData((prev) => ({
      ...prev,
      facturacion: { ...prev.facturacion, ...fields },
    }));
  };

  const uploadDocumentsToStorage = async (): Promise<
    Record<string, string>
  > => {
    const uploadedUrls: Record<string, string> = {};
    for (const [key, file] of Object.entries(documentFiles)) {
      if (file) {
        const filePath = `${dbSessionId || token}/${key}_${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from("onboarding-documents")
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("onboarding-documents")
            .getPublicUrl(filePath);
          uploadedUrls[key] = publicUrlData.publicUrl;
        } else {
          console.error(`Error al subir ${key}:`, uploadError);
        }
      }
    }
    return uploadedUrls;
  };

  // NUEVO: SISTEMA DE VALIDACIÓN POR PASO
  const validateCurrentStep = (): string | null => {
    // Validación Paso 1 (Aplica para Lead y Onboarding)
    if (currentStep === 1) {
      const { razonSocial, rfc } = formData.empresa;
      const { nombreRepresentante, correoContacto, telefonoContacto } =
        formData.contacto;

      if (!razonSocial?.trim()) return "La Razón Social es obligatoria.";
      if (!rfc?.trim()) return "El RFC es obligatorio.";
      if (!nombreRepresentante?.trim())
        return "El Nombre del Contacto Principal es obligatorio.";
      if (!correoContacto?.trim())
        return "El Correo Electrónico es obligatorio.";
      if (!telefonoContacto?.trim())
        return "El Teléfono de contacto es obligatorio.";
    }

    // Validaciones Exclusivas de Onboarding
    if (workflow === "onboarding") {
      if (currentStep === 2) {
        const { calle, codigoPostal, colonia, municipio, estado } =
          formData.direccionFiscal;
        if (!calle?.trim()) return "La Calle es obligatoria.";
        if (!codigoPostal?.trim()) return "El Código Postal es obligatorio.";
        if (!colonia?.trim()) return "La Colonia es obligatoria.";
        if (!municipio?.trim())
          return "El Municipio o Alcaldía es obligatorio.";
        if (!estado?.trim()) return "El Estado es obligatorio.";
      }

      if (currentStep === 4) {
        const { banco, cuenta4Digitos, metodoPago, formaPago, correoFacturas } =
          formData.facturacion;
        if (!banco?.trim()) return "El Banco es obligatorio.";
        if (!cuenta4Digitos?.trim() || cuenta4Digitos.length !== 4)
          return "La cuenta bancaria debe tener exactamente los últimos 4 dígitos.";
        if (!metodoPago?.trim()) return "El Método de Pago es obligatorio.";
        if (!formaPago?.trim()) return "La Forma de Pago es obligatoria.";
        if (!correoFacturas?.trim())
          return "El Correo para recibir facturas es obligatorio.";
      }

      if (currentStep === 5) {
        if (!documentFiles.csf && !formData.documentosTemporales?.csf)
          return "Debes adjuntar tu Constancia de Situación Fiscal (PDF).";
        if (
          !documentFiles.comprobante &&
          !formData.documentosTemporales?.comprobante
        )
          return "Debes adjuntar tu Comprobante de Domicilio (PDF).";
        if (!documentFiles.ine && !formData.documentosTemporales?.ine)
          return "Debes adjuntar tu Identificación Oficial (PDF).";
      }
    }

    return null; // Pasó la validación sin errores
  };

  const handleNext = async () => {
    // 1. Validamos antes de intentar avanzar
    const errorMsg = validateCurrentStep();
    if (errorMsg) {
      setValidationError(errorMsg);
      return; // Detenemos la ejecución si falta algo
    }

    setValidationError(null);
    setIsSaving(true);

    try {
      if (currentStep < totalSteps) {
        const { data: savedRows } = await supabase
          .from("sessions")
          .update({ ultimo_avance: formData })
          .eq("token", token)
          .select();

        if (!savedRows || savedRows.length === 0) {
          console.warn("⚠️ Advertencia: Supabase bloqueó el auto-guardado.");
        }

        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const uploadedDocUrls = await uploadDocumentsToStorage();
        const finalFormData = {
          ...formData,
          // Conservamos los documentos anteriores si el cliente no subió nuevos
          documentosTemporales: {
            ...formData.documentosTemporales,
            ...uploadedDocUrls,
          },
        };

        const { data: updatedRows, error: updateError } = await supabase
          .from("sessions")
          .update({
            ultimo_avance: finalFormData,
            status: "completed_by_client",
            notas_correccion: null,
          })
          .eq("token", token)
          .select();

        if (updateError) throw updateError;

        if (!updatedRows || updatedRows.length === 0) {
          setValidationError(
            "Error de Permisos: La base de datos no permitió guardar tu información.",
          );
          setIsSaving(false);
          return;
        }

        await supabase.from("audit_logs").insert([
          {
            session_id: dbSessionId || token,
            usuario: "Cliente (Portal)",
            accion: "Finalización de Captura y Carga de Expediente",
            resultado: "Exitoso",
          },
        ]);

        // --- NUEVO: CORREO DE ALERTA PARA EL EQUIPO SAC ---
        await supabase.functions
          .invoke("enviar-correo", {
            body: {
              tipo: "sac_alert",
              destinatario: "ehdzvs01@gmail.com", // <--- CAMBIA ESTO AL CORREO DE TU EQUIPO SAC
              datos: {
                razonSocial:
                  finalFormData.empresa.razonSocial || "Cliente en proceso",
                sessionId: dbSessionId || token,
                propietario: propietario,
                mensajeAlerta:
                  "El cliente ha completado su captura (o correcciones) y ha enviado su expediente para revisión de SAC.",
              },
            },
          })
          .catch(console.error);

        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setValidationError(
        "Hubo un problema de conexión guardando tu progreso. Por favor intenta nuevamente.",
      );
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setValidationError(null);
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // HELPERS PARA MAPEAR EL PASO ACTUAL CON EL ID DE CORRECCIÓN
  const getStepKey = (step: number) => {
    if (workflow === "lead") return "empresa";
    switch (step) {
      case 1:
        return "empresa";
      case 2:
        return "domicilio";
      case 3:
        return "entregas";
      case 4:
        return "facturacion";
      case 5:
        return "documentos";
      default:
        return "";
    }
  };

  const currentStepKey = getStepKey(currentStep);
  const currentStepError = correctionNotes[currentStepKey];
  const hasAnyError = Object.keys(correctionNotes).length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">
          Autenticando enlace seguro...
        </p>
      </div>
    );
  }

  if (invalidToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-slate-200 shadow-xl">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <CardTitle className="text-xl mb-2 text-slate-900">
            Enlace Inválido o Expirado
          </CardTitle>
          <CardDescription>
            Este enlace de registro no existe o ha caducado. Por favor, solicita
            a tu ejecutivo comercial de Grupo Polak que genere uno nuevo.
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start relative">
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white">
            P
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
              Grupo Polak
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 hidden md:block">
              {workflow === "lead"
                ? "Registro de Prospecto Comercial"
                : "Portal de Incorporación de Clientes B2B"}
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> En Revisión
          </div>
        ) : isSaving ? (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando...
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 transition-all duration-300">
            <CloudLightning className="h-3.5 w-3.5" /> Progreso guardado
          </div>
        )}
      </header>

      <main className="w-full max-w-3xl space-y-6 p-4 md:p-8 mt-4">
        {isSubmitted ? (
          <Card className="shadow-xl border-slate-200 text-center p-8 md:p-12 space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-8 border-emerald-50">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                ¡Datos Enviados Correctamente!
              </h2>
              <p className="text-sm md:text-base text-slate-600 max-w-md mx-auto">
                Tu información ha sido guardada de forma segura. Nuestro
                departamento de SAC (Servicio a Clientes) validará tu expediente
                comercial en breve.
              </p>
            </div>
            <div className="pt-6">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Puedes cerrar esta ventana.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* BANNER DINÁMICO DE CORRECCIONES */}
            {sessionStatus === "corrections_requested" && hasAnyError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-bold text-red-800">
                      Acción Requerida: Correcciones en tu expediente
                    </h3>
                    <p className="text-sm text-red-700 mt-1 leading-relaxed">
                      Nuestro equipo de validación solicita que actualices
                      algunos detalles antes de continuar.
                    </p>

                    {currentStepError ? (
                      <div className="mt-3 bg-white/70 p-3 rounded border border-red-100 text-sm text-red-900 font-medium italic shadow-sm">
                        <span className="block text-[10px] uppercase font-bold text-red-500 not-italic mb-1">
                          Comentario para este paso:
                        </span>
                        "{currentStepError}"
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-red-600/80 font-medium">
                        (Avanza a las secciones marcadas en rojo para ver los
                        comentarios).
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 px-2">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>
                  Paso {currentStep} de {totalSteps}
                </span>
                <span>{Math.round(progressPercentage)}% Completado</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />

              {/* INDICADORES DE PASO */}
              {workflow === "onboarding" ? (
                <div className="grid grid-cols-6 gap-2 pt-2 text-center text-[10px] md:text-xs">
                  <div
                    className={`flex flex-col items-center gap-1 ${correctionNotes["empresa"] ? "text-red-600 font-bold" : currentStep >= 1 ? "text-indigo-700 font-bold" : "text-slate-400"}`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span className="hidden md:block">Empresa</span>
                  </div>
                  <div
                    className={`flex flex-col items-center gap-1 ${correctionNotes["domicilio"] ? "text-red-600 font-bold" : currentStep >= 2 ? "text-indigo-700 font-bold" : "text-slate-400"}`}
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="hidden md:block">Domicilio</span>
                  </div>
                  <div
                    className={`flex flex-col items-center gap-1 ${correctionNotes["entregas"] ? "text-red-600 font-bold" : currentStep >= 3 ? "text-indigo-700 font-bold" : "text-slate-400"}`}
                  >
                    <Truck className="h-4 w-4" />
                    <span className="hidden md:block">Entregas</span>
                  </div>
                  <div
                    className={`flex flex-col items-center gap-1 ${correctionNotes["facturacion"] ? "text-red-600 font-bold" : currentStep >= 4 ? "text-indigo-700 font-bold" : "text-slate-400"}`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden md:block">Facturación</span>
                  </div>
                  <div
                    className={`flex flex-col items-center gap-1 ${correctionNotes["documentos"] ? "text-red-600 font-bold" : currentStep >= 5 ? "text-indigo-700 font-bold" : "text-slate-400"}`}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden md:block">Documentos</span>
                  </div>
                  <div
                    className={`flex flex-col items-center gap-1 ${currentStep >= 6 ? "text-indigo-700 font-bold" : "text-slate-400"}`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden md:block">Resumen</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 pt-2 text-center text-xs">
                  <div
                    className={`flex flex-col items-center gap-1 ${correctionNotes["empresa"] ? "text-red-600 font-bold" : "text-indigo-700 font-bold"}`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Datos Base del Prospecto</span>
                  </div>
                </div>
              )}
            </div>

            <Card
              className={`shadow-xl transition-colors duration-300 animate-in fade-in slide-in-from-bottom-4 ${currentStepError ? "border-red-300 ring-4 ring-red-50" : "border-slate-200"}`}
            >
              <CardContent className="min-h-[350px] p-6 md:p-8 border-y border-slate-100 bg-white">
                {currentStep === 1 && (
                  <StepCompany
                    data={formData.empresa}
                    onChange={updateCompanyData}
                    workflow={workflow}
                    contactData={formData.contacto}
                    onContactChange={updateContactData}
                  />
                )}
                {workflow === "onboarding" && (
                  <>
                    {currentStep === 2 && (
                      <StepAddress
                        fiscalAddress={formData.direccionFiscal}
                        contactData={formData.contacto}
                        onFiscalChange={updateFiscalAddress}
                        onContactChange={updateContactData}
                      />
                    )}
                    {currentStep === 3 && (
                      <StepDelivery
                        deliveryAddresses={formData.direccionesEntrega}
                        onDeliveryChange={updateDeliveryAddresses}
                      />
                    )}
                    {currentStep === 4 && (
                      <StepBilling
                        data={formData.facturacion}
                        onChange={updateBillingData}
                      />
                    )}
                    {currentStep === 5 && (
                      <StepDocuments
                        documents={documentFiles}
                        onDocumentsChange={setDocumentFiles}
                      />
                    )}
                    {currentStep === 6 && (
                      <StepSummary
                        formData={formData}
                        isAgreed={isAgreed}
                        onAgreeChange={setIsAgreed}
                      />
                    )}
                  </>
                )}
              </CardContent>

              {/* BANNER ESTILIZADO DE ERROR DE VALIDACIÓN */}
              {validationError && (
                <div className="px-6 md:px-8 pb-4">
                  <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-md flex items-center gap-2.5 text-sm font-medium animate-in zoom-in-95">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p>{validationError}</p>
                  </div>
                </div>
              )}

              <CardFooter className="flex justify-between p-6 bg-slate-50/50 rounded-b-xl border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSaving}
                  className={`gap-2 h-11 px-6 font-semibold border-slate-300 text-slate-700 ${workflow === "lead" ? "invisible" : ""}`}
                >
                  <ArrowLeft className="h-4 w-4" /> Anterior
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={
                    isSaving ||
                    (currentStep === totalSteps &&
                      workflow === "onboarding" &&
                      !isAgreed)
                  }
                  className="gap-2 h-11 px-6 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                    </>
                  ) : currentStep === totalSteps ? (
                    <>
                      Enviar Información <Send className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Guardar y Continuar <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
