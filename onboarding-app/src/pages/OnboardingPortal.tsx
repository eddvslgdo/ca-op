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

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Estados: Control de Correcciones
  const [sessionStatus, setSessionStatus] = useState<string>("");
  const [correctionNotes, setCorrectionNotes] = useState<string>("");

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
          if (data.notas_correccion) {
            setCorrectionNotes(data.notas_correccion);
          }

          // Bloquear si ya fue completado o aprobado
          if (
            data.status === "completed_by_client" ||
            data.status === "approved"
          ) {
            setIsSubmitted(true);
          }

          setWorkflow(data.workflow);
          // Intentamos capturar el ID de diferentes formas por si la columna cambia de nombre
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

  const updateCompanyData = (fields: Partial<typeof formData.empresa>) =>
    setFormData((prev) => ({
      ...prev,
      empresa: { ...prev.empresa, ...fields },
    }));
  const updateFiscalAddress = (
    fields: Partial<typeof formData.direccionFiscal>,
  ) =>
    setFormData((prev) => ({
      ...prev,
      direccionFiscal: { ...prev.direccionFiscal, ...fields },
    }));
  const updateDeliveryAddresses = (
    addresses: typeof formData.direccionesEntrega,
  ) => setFormData((prev) => ({ ...prev, direccionesEntrega: addresses }));
  const updateContactData = (fields: Partial<typeof formData.contacto>) =>
    setFormData((prev) => ({
      ...prev,
      contacto: { ...prev.contacto, ...fields },
    }));
  const updateBillingData = (fields: Partial<BillingData>) =>
    setFormData((prev) => ({
      ...prev,
      facturacion: { ...prev.facturacion, ...fields },
    }));

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

  const handleNext = async () => {
    if (workflow === "lead" && currentStep === 1) {
      if (
        !formData.contacto.telefonoContacto ||
        formData.contacto.telefonoContacto.trim() === ""
      ) {
        alert(
          "El número de teléfono es obligatorio para completar el registro.",
        );
        return;
      }
    } else if (workflow === "onboarding" && currentStep === 2) {
      if (
        !formData.contacto.telefonoContacto ||
        formData.contacto.telefonoContacto.trim() === ""
      ) {
        alert("El número de teléfono de contacto es obligatorio.");
        return;
      }
    }

    setIsSaving(true);
    try {
      if (currentStep < totalSteps) {
        // Auto-guardado (usando token para garantizar la fila)
        const { data: savedRows } = await supabase
          .from("sessions")
          .update({ ultimo_avance: formData })
          .eq("token", token)
          .select();

        if (!savedRows || savedRows.length === 0) {
          console.warn(
            "⚠️ Advertencia: Supabase bloqueó el auto-guardado. Revisa tus políticas RLS.",
          );
        }

        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // PASO FINAL: Subir PDFs y cerrar la sesión
        const uploadedDocUrls = await uploadDocumentsToStorage();
        const finalFormData = {
          ...formData,
          documentosTemporales: uploadedDocUrls,
        };

        // Hacemos UPDATE usando el token (infalible) y forzamos a que retorne la fila editada
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

        // 🚨 CANDADO ESTRICTO DE FALLO SILENCIOSO 🚨
        if (!updatedRows || updatedRows.length === 0) {
          alert(
            "⚠️ ERROR CRÍTICO DE PERMISOS: La base de datos no permitió guardar la información. Por favor, ve a Supabase > Authentication > Policies y asegúrate de tener una política de 'UPDATE' habilitada para la tabla 'sessions'.",
          );
          setIsSaving(false);
          return; // Detenemos la ejecución, no le mostramos la pantalla de éxito
        }

        // Si pasó el candado, registramos auditoría
        await supabase.from("audit_logs").insert([
          {
            session_id: dbSessionId || token,
            usuario: "Cliente (Portal)",
            accion: "Finalización de Captura y Carga de Expediente",
            resultado: "Exitoso",
          },
        ]);

        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(
        "Hubo un problema de conexión guardando tu progreso. Por favor intenta nuevamente.",
      );
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
            {sessionStatus === "corrections_requested" && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-red-800">
                      Acción Requerida: Correcciones en tu expediente
                    </h3>
                    <p className="text-sm text-red-700 mt-1 leading-relaxed">
                      Nuestro equipo de validación ha revisado tu información y
                      nos solicita actualizar los siguientes detalles antes de
                      continuar. Por favor, corrige la información en los pasos
                      indicados y vuelve a enviar el formulario.
                    </p>
                    {correctionNotes && (
                      <div className="mt-3 bg-white/70 p-3 rounded border border-red-100 text-sm text-red-900 font-medium italic">
                        "{correctionNotes}"
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

              {workflow === "onboarding" ? (
                <div className="grid grid-cols-6 gap-2 pt-2 text-center text-[10px] md:text-xs">
                  <div
                    className={`flex flex-col items-center gap-1 ${currentStep >= 1 ? "text-indigo-700 font-bold" : "text-slate-400"}`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span className="hidden md:block">Empresa</span>
                  </div>
                  <div
                    className={`flex flex-col items-center gap-1 ${currentStep >= 2 ? "text-indigo-700 font-bold" : "text-slate-400"}`}
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="hidden md:block">Domicilio</span>
                  </div>
                  <div
                    className={`flex flex-col items-center gap-1 ${currentStep >= 3 ? "text-indigo-700 font-bold" : "text-slate-400"}`}
                  >
                    <Truck className="h-4 w-4" />
                    <span className="hidden md:block">Entregas</span>
                  </div>
                  <div
                    className={`flex flex-col items-center gap-1 ${currentStep >= 4 ? "text-indigo-700 font-bold" : "text-slate-400"}`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden md:block">Facturación</span>
                  </div>
                  <div
                    className={`flex flex-col items-center gap-1 ${currentStep >= 5 ? "text-indigo-700 font-bold" : "text-slate-400"}`}
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
                  <div className="flex flex-col items-center gap-1 text-indigo-700 font-bold">
                    <Building2 className="h-4 w-4" />
                    <span>Datos Base del Prospecto</span>
                  </div>
                </div>
              )}
            </div>

            <Card className="shadow-xl border-slate-200 animate-in fade-in slide-in-from-bottom-4">
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

              <CardFooter className="flex justify-between p-6 bg-slate-50/50">
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
