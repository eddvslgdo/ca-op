import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Building2, MapPin, FileText, CheckCircle2, ArrowRight, ArrowLeft, Send, Truck, CreditCard } from "lucide-react"
import { StepCompany } from "@/components/onboarding/StepCompany"
import { StepAddress } from "@/components/onboarding/StepAddress"
import { StepDelivery } from "@/components/onboarding/StepDelivery"
import { StepBilling } from "@/components/onboarding/StepBilling"
import { StepDocuments } from "@/components/onboarding/StepDocuments"
import { StepSummary } from "@/components/onboarding/StepSummary"
import type { OnboardingFormValues, BillingData } from "@/types/onboarding"

// NUEVO: Recibimos el workflow para saber qué versión del portal mostrar (RN-081, RN-082)
interface OnboardingPortalProps {
  workflow?: "lead" | "onboarding"
}

export function OnboardingPortal({ workflow = "onboarding" }: OnboardingPortalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [formData, setFormData] = useState<OnboardingFormValues>({
    empresa: {
      razonSocial: "",
      rfc: "",
      regimenFiscal: "",
      giroComercial: "",
    },
    direccionFiscal: { calle: "", numeroExterior: "", colonia: "", codigoPostal: "", estado: "", municipio: "" },
    direccionesEntrega: [],
    contacto: { nombreRepresentante: "", correoContacto: "", telefonoContacto: "" },
    facturacion: { banco: "", cuenta4Digitos: "", metodoPago: "", formaPago: "", correoFacturas: "" }
  })

  // NUEVO: Dinamismo en los pasos. Lead = 1 paso. Onboarding = 6 pasos.
  const totalSteps = workflow === "lead" ? 1 : 6
  const progressPercentage = (currentStep / totalSteps) * 100

  const updateCompanyData = (fields: Partial<typeof formData.empresa>) => {
    setFormData((prev) => ({ ...prev, empresa: { ...prev.empresa, ...fields } }))
  }

  const updateFiscalAddress = (fields: Partial<typeof formData.direccionFiscal>) => {
    setFormData((prev) => ({ ...prev, direccionFiscal: { ...prev.direccionFiscal, ...fields } }))
  }

  const updateDeliveryAddresses = (addresses: typeof formData.direccionesEntrega) => {
    setFormData((prev) => ({ ...prev, direccionesEntrega: addresses }))
  }

  const updateContactData = (fields: Partial<typeof formData.contacto>) => {
    setFormData((prev) => ({ ...prev, contacto: { ...prev.contacto, ...fields } }))
  }

  const updateBillingData = (fields: Partial<BillingData>) => {
    setFormData((prev) => ({ ...prev, facturacion: { ...prev.facturacion, ...fields } }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsSubmitted(true)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start p-4 md:p-8">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Grupo Polak</h1>
          <p className="text-xs text-slate-500">
            {workflow === "lead" ? "Registro de Prospecto Comercial" : "Portal de Incorporación de Clientes B2B"}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
          isSubmitted ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}>
          <span className={`h-2 w-2 rounded-full ${isSubmitted ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
          {isSubmitted ? "En Revisión" : "Sesión Activa"}
        </div>
      </header>

      <main className="w-full max-w-2xl space-y-6">
        {isSubmitted ? (
          <Card className="shadow-sm border-slate-200 text-center p-8 space-y-4 animate-in fade-in zoom-in-95">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                {workflow === "lead" ? "¡Datos Enviados Correctamente!" : "¡Registro Enviado con Éxito!"}
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                {workflow === "lead" 
                  ? "Un ejecutivo comercial evaluará tu información para contactarte a la brevedad."
                  : "Tu solicitud de alta y expediente digital han sido recibidos. Nuestro equipo de Servicio a Clientes (SAC) validará la información en las próximas horas."}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 inline-block text-xs text-slate-500">
              Folio de Solicitud: <strong className="text-slate-800">POLAK-2026-08942</strong>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Paso {currentStep} de {totalSteps}</span>
                <span>{Math.round(progressPercentage)}% Completado</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              
              {/* NUEVO: Stepper Dinámico (Oculta pasos si es solo Lead) */}
              {workflow === "onboarding" ? (
                <div className="grid grid-cols-6 gap-2 pt-2 text-center text-xs">
                  <div className={`flex flex-col items-center gap-1 ${currentStep >= 1 ? "text-slate-900 font-semibold" : "text-slate-400"}`}><Building2 className="h-4 w-4" /><span>Empresa</span></div>
                  <div className={`flex flex-col items-center gap-1 ${currentStep >= 2 ? "text-slate-900 font-semibold" : "text-slate-400"}`}><MapPin className="h-4 w-4" /><span>Domicilio</span></div>
                  <div className={`flex flex-col items-center gap-1 ${currentStep >= 3 ? "text-slate-900 font-semibold" : "text-slate-400"}`}><Truck className="h-4 w-4" /><span>Entregas</span></div>
                  <div className={`flex flex-col items-center gap-1 ${currentStep >= 4 ? "text-slate-900 font-semibold" : "text-slate-400"}`}><CreditCard className="h-4 w-4" /><span>Facturación</span></div>
                  <div className={`flex flex-col items-center gap-1 ${currentStep >= 5 ? "text-slate-900 font-semibold" : "text-slate-400"}`}><FileText className="h-4 w-4" /><span>Documentos</span></div>
                  <div className={`flex flex-col items-center gap-1 ${currentStep >= 6 ? "text-slate-900 font-semibold" : "text-slate-400"}`}><CheckCircle2 className="h-4 w-4" /><span>Firma</span></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 pt-2 text-center text-xs">
                   <div className="flex flex-col items-center gap-1 text-slate-900 font-semibold"><Building2 className="h-4 w-4" /><span>Datos Base del Prospecto</span></div>
                </div>
              )}
            </div>

            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">
                  {currentStep === 1 && "Información General de la Empresa"}
                  {currentStep === 2 && "Domicilio Fiscal y Contacto"}
                  {currentStep === 3 && "Plantas y Direcciones de Entrega"}
                  {currentStep === 4 && "Datos Bancarios y Facturación"}
                  {currentStep === 5 && "Documentación Requerida"}
                  {currentStep === 6 && "Confirmación y Envío"}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && "Ingresa los datos fiscales principales de tu representada."}
                  {currentStep === 2 && "Proporciona la dirección fiscal registrada ante el SAT y el representante legal."}
                  {currentStep === 3 && "Registra los almacenes o plantas donde recibirás mercancía física."}
                  {currentStep === 4 && "Proporciona los datos de la cuenta desde donde realizarás los pagos."}
                  {currentStep === 5 && "Adjunta los expedientes en formato PDF o imagen."}
                  {currentStep === 6 && "Revisa la información antes de enviar el registro a validación."}
                </CardDescription>
              </CardHeader>

              <CardContent className="min-h-[260px] p-6 border-y border-slate-100 bg-white">
                {currentStep === 1 && <StepCompany data={formData.empresa} onChange={updateCompanyData} workflow={workflow} />}
                
                {workflow === "onboarding" && (
                  <>
                    {currentStep === 2 && <StepAddress fiscalAddress={formData.direccionFiscal} contactData={formData.contacto} onFiscalChange={updateFiscalAddress} onContactChange={updateContactData} />}
                    {currentStep === 3 && <StepDelivery deliveryAddresses={formData.direccionesEntrega} onDeliveryChange={updateDeliveryAddresses} />}
                    {currentStep === 4 && <StepBilling data={formData.facturacion} onChange={updateBillingData} />}
                    {currentStep === 5 && <StepDocuments />}
                    {currentStep === 6 && <StepSummary formData={formData} />}
                  </>
                )}
              </CardContent>

              <CardFooter className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className={`gap-2 ${workflow === "lead" ? "invisible" : ""}`}>
                  <ArrowLeft className="h-4 w-4" /> Anterior
                </Button>

                <Button onClick={handleNext} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  {currentStep === totalSteps ? (
                    <>Enviar Información <Send className="h-4 w-4" /></>
                  ) : (
                    <>Siguiente <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </>
        )}
      </main>
    </div>

  )
}