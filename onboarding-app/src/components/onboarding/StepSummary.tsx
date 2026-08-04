import type { OnboardingFormValues } from "@/types/onboarding";
import {
  Building2,
  MapPin,
  Truck,
  CreditCard,
  FileCheck,
  CheckSquare,
  Square,
} from "lucide-react";

interface StepSummaryProps {
  formData: OnboardingFormValues;
  isAgreed: boolean; // <--- Recibimos el estado del padre
  onAgreeChange: (agreed: boolean) => void; // <--- Avisamos al padre del cambio
}

export function StepSummary({
  formData,
  isAgreed,
  onAgreeChange,
}: StepSummaryProps) {
  const fiscal = formData?.direccionFiscal || {};
  const contact = formData?.contacto || {};
  const company = formData?.empresa || {};
  const billing = formData?.facturacion || {};
  const deliveries = formData?.direccionesEntrega || [];

  return (
    <div className="space-y-6 w-full text-left animate-in fade-in">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
        {/* 1. Datos Fiscales */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Building2 className="h-4 w-4 text-indigo-600" />
            <span>Datos Fiscales de la Empresa</span>
          </div>
          <div className="text-xs text-slate-600 pl-6 space-y-0.5">
            <p>
              <strong className="text-slate-800">Razón Social:</strong>{" "}
              {company.razonSocial || "No capturado"}
            </p>
            <p>
              <strong className="text-slate-800">RFC:</strong>{" "}
              {company.rfc || "No capturado"}
            </p>
            <p>
              <strong className="text-slate-800">Régimen Fiscal:</strong>{" "}
              {company.regimenFiscal || "No capturado"}
            </p>
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
              {fiscal.calle
                ? `${fiscal.calle} #${fiscal.numeroExterior}, ${fiscal.colonia}, C.P. ${fiscal.codigoPostal}, ${fiscal.municipio}`
                : "No capturado"}
            </p>
            <p>
              <strong className="text-slate-800">Representante:</strong>{" "}
              {contact.nombreRepresentante || "No capturado"} (
              {contact.correoContacto || "Sin correo"})
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* 3. Plantas de Entrega */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Truck className="h-4 w-4 text-indigo-600" />
            <span>
              Destinatarios de Mercancía ({deliveries.length} Registrados)
            </span>
          </div>
          <div className="text-xs text-slate-600 pl-6 space-y-0.5">
            {deliveries.length > 0 ? (
              deliveries.map((plant, idx) => (
                <p key={plant.id || idx}>
                  <strong className="text-slate-800">
                    • {plant.nombrePlanta}:
                  </strong>{" "}
                  {plant.calle}, C.P. {plant.codigoPostal} (Contacto:{" "}
                  {plant.contactoRecepcion})
                </p>
              ))
            ) : (
              <p className="italic text-slate-500">
                Mismo domicilio que el fiscal.
              </p>
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
            <p>
              <strong className="text-slate-800">Banco:</strong>{" "}
              {billing.banco || "No capturado"} (Cuenta termino: ****
              {billing.cuenta4Digitos || "0000"})
            </p>
            <p>
              <strong className="text-slate-800">Correo para Facturas:</strong>{" "}
              {billing.correoFacturas || "No capturado"}
            </p>
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

      {/* Declaración bajo protesta de decir verdad y Términos Legales */}
      <label
        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors select-none ${
          isAgreed
            ? "border-indigo-600 bg-indigo-50/30"
            : "border-slate-300 bg-white hover:bg-slate-50"
        }`}
      >
        <div className="mt-0.5 text-indigo-600 shrink-0">
          {/* Checkbox nativo oculto para que maneje el clic perfectamente */}
          <input
            type="checkbox"
            className="hidden"
            checked={isAgreed}
            onChange={(e) => onAgreeChange(e.target.checked)}
          />
          {isAgreed ? (
            <CheckSquare className="h-5 w-5" />
          ) : (
            <Square className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <div className="text-xs text-slate-700">
          <p
            className={`font-bold text-sm ${isAgreed ? "text-indigo-900" : "text-slate-900"}`}
          >
            Declaración Bajo Protesta de Decir Verdad y Tratamiento de Datos
          </p>
          <p className="text-slate-600 mt-1.5 leading-relaxed">
            Manifiesto que la información y documentación proporcionada es
            verídica, actual y corresponde legalmente a la empresa representada.
            Asimismo, confirmo que he leído y acepto el{" "}
            <a
              href="#"
              className="text-indigo-600 font-semibold hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Aviso de Privacidad
            </a>{" "}
            y los{" "}
            <a
              href="#"
              className="text-indigo-600 font-semibold hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Términos y Condiciones
            </a>{" "}
            para el tratamiento de mis datos comerciales.
          </p>
        </div>
      </label>
    </div>
  );
}
