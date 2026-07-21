import { useState } from "react"
import type { OnboardingFormValues } from "@/types/onboarding"
import { Building2, MapPin, Truck, CreditCard, FileCheck, CheckSquare, Square } from "lucide-react"

interface StepSummaryProps {
  formData: OnboardingFormValues
}

export function StepSummary({ formData }: StepSummaryProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const fiscal = formData?.direccionFiscal || {}
  const contact = formData?.contacto || {}
  const company = formData?.empresa || {}
  const billing = formData?.facturacion || {}
  const deliveries = formData?.direccionesEntrega || []

  return (
    <div className="space-y-6 w-full text-left">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
        
        {/* 1. Datos Fiscales */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Building2 className="h-4 w-4 text-indigo-600" />
            <span>Datos Fiscales de la Empresa</span>
          </div>
          <div className="text-xs text-slate-600 pl-6 space-y-0.5">
            <p><strong className="text-slate-800">Razón Social:</strong> {company.razonSocial || "POLAK GRUPO INDUSTRIAL S.A. DE C.V."}</p>
            <p><strong className="text-slate-800">RFC:</strong> {company.rfc || "PGI850412H90"}</p>
            <p><strong className="text-slate-800">Régimen Fiscal:</strong> {company.regimenFiscal || "601 - General de Ley Personas Morales"}</p>
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* 2. Domicilio Fiscal y Contacto */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <MapPin className="h-4 w-4 text-indigo-600" />
            <span>Domicilio Fiscal y Representante Legal</span>
          </div>
          <div className="text-xs text-slate-600 pl-6 space-y-0.5">
            <p>
              <strong className="text-slate-800">Dirección:</strong>{" "}
              {fiscal.calle ? `${fiscal.calle} #${fiscal.numeroExterior}, ${fiscal.colonia}, C.P. ${fiscal.codigoPostal}, ${fiscal.municipio}` : "Av. Insurgentes Sur #123, Del Valle, C.P. 03100, CDMX"}
            </p>
            <p>
              <strong className="text-slate-800">Representante:</strong>{" "}
              {contact.nombreRepresentante || "Roberto Gómez Bolaños"} ({contact.correoContacto || "contacto@empresa.com"})
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* 3. Plantas de Entrega */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Truck className="h-4 w-4 text-indigo-600" />
            <span>Destinatarios de Mercancía ({deliveries.length} Registrados)</span>
          </div>
          <div className="text-xs text-slate-600 pl-6 space-y-0.5">
            {deliveries.length > 0 ? (
              deliveries.map((plant, idx) => (
                <p key={plant.id || idx}>
                  <strong className="text-slate-800">• {plant.nombrePlanta}:</strong> {plant.calle}, C.P. {plant.codigoPostal} (Contacto: {plant.contactoRecepcion})
                </p>
              ))
            ) : (
              <p className="italic text-slate-500">Mismo domicilio que el fiscal.</p>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* 4. Datos Bancarios */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <CreditCard className="h-4 w-4 text-indigo-600" />
            <span>Datos Bancarios y Facturación</span>
          </div>
          <div className="text-xs text-slate-600 pl-6 space-y-0.5">
            <p><strong className="text-slate-800">Banco:</strong> {billing.banco || "BBVA Bancomer"} (Cuenta termino: ****{billing.cuenta4Digitos || "9199"})</p>
            <p><strong className="text-slate-800">Correo para Facturas:</strong> {billing.correoFacturas || contact.correoContacto || "facturas@empresa.com"}</p>
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* 5. Documentos */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <FileCheck className="h-4 w-4 text-emerald-600" />
            <span>Expediente Documental</span>
          </div>
          <p className="text-xs text-slate-600 pl-6">
            Documentos cargados y listos para validación del equipo de SAC.
          </p>
        </div>

      </div>

      {/* Declaración bajo protesta de decir verdad */}
      <div 
        className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setAcceptedTerms(!acceptedTerms)}
      >
        <div className="mt-0.5 text-indigo-600">
          {acceptedTerms ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-slate-400" />}
        </div>
        <div className="text-xs text-slate-700">
          <p className="font-medium text-slate-900">Declaración Bajo Protesta de Decir Verdad</p>
          <p className="text-slate-500 mt-0.5">
            Manifiesto que la información y documentación proporcionada es verídica y corresponde a la empresa representada.
          </p>
        </div>
      </div>
    </div>
  )
}