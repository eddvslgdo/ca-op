import type { OnboardingFormValues } from "@/types/onboarding";
import {
  Building2,
  User,
  MapPin,
  Truck,
  CreditCard,
  FileText,
} from "lucide-react";

interface StepSummaryProps {
  formData: OnboardingFormValues;
}

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
    <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-3 text-base">
      <Icon className="h-5 w-5 text-indigo-500" /> {title}
    </h3>
    <div className="space-y-2 text-sm">{children}</div>
  </div>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) => (
  <div className="grid grid-cols-3 gap-2">
    <span className="text-slate-500 font-medium col-span-1">{label}:</span>
    <span className="text-slate-800 font-semibold col-span-2">{value || "N/A"}</span>
  </div>
);

export function StepSummary({ formData }: StepSummaryProps) {
  const {
    empresa,
    contacto,
    direccionFiscal,
    direccionesEntrega,
    facturacion,
  } = formData;

  const fullFiscalAddress = [
    direccionFiscal.calle,
    direccionFiscal.numeroExterior,
    direccionFiscal.numeroInterior,
    direccionFiscal.colonia,
    `C.P. ${direccionFiscal.codigoPostal}`,
    direccionFiscal.municipio,
    direccionFiscal.estado,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Resumen Final</h2>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          Por favor, revisa cuidadosamente toda tu información. Una vez enviada,
          pasará a nuestro equipo de validación.
        </p>
      </div>

      <div className="space-y-6 bg-slate-50/70 p-4 rounded-lg">
        {/* Datos de la Empresa */}
        <Section title="Datos Generales de la Empresa" icon={Building2}>
          <InfoRow label="Razón Social" value={empresa.razonSocial} />
          <InfoRow label="RFC" value={empresa.rfc} />
          <InfoRow label="Régimen Fiscal" value={empresa.regimenFiscal} />
          <InfoRow label="Uso de CFDI" value={empresa.usoCFDI} />
        </Section>

        {/* Datos de Contacto */}
        <Section title="Contacto Principal y Representante Legal" icon={User}>
          <InfoRow
            label="Representante"
            value={contacto.nombreRepresentante}
          />
          <InfoRow label="Correo" value={contacto.correoContacto} />
          <InfoRow label="Teléfono" value={contacto.telefonoContacto} />
        </Section>

        {/* Domicilio Fiscal */}
        <Section title="Domicilio Fiscal" icon={MapPin}>
          <InfoRow label="Dirección" value={fullFiscalAddress} />
        </Section>

        {/* Plantas de Entrega */}
        <Section title="Plantas de Entrega Adicionales" icon={Truck}>
          {direccionesEntrega.length > 0 ? (
            direccionesEntrega.map((planta, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-3 rounded border border-slate-200 text-xs"
              >
                <p className="font-bold text-slate-800 mb-1">
                  {planta.nombrePlanta}
                </p>
                <p className="text-slate-600">
                  <span className="text-slate-500">Contacto:</span>{" "}
                  {planta.contactoRecepcion} ({planta.telefonoRecepcion})
                </p>
                <p className="text-slate-600">
                  <span className="text-slate-500">Dirección:</span>{" "}
                  {[
                    planta.calle,
                    planta.numeroExterior,
                    planta.colonia,
                    `C.P. ${planta.codigoPostal}`,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-500 italic text-sm">
              No se registraron plantas adicionales. Se usará el domicilio
              fiscal.
            </p>
          )}
        </Section>

        {/* Facturación */}
        <Section title="Datos de Facturación y Pago" icon={CreditCard}>
          <InfoRow label="Banco" value={facturacion.banco} />
          <InfoRow
            label="Cuenta (4 dig.)"
            value={facturacion.cuenta4Digitos}
          />
          <InfoRow label="Forma de Pago" value={facturacion.formaPago} />
          <InfoRow label="Método de Pago" value={facturacion.metodoPago} />
          <InfoRow
            label="Correo para facturas"
            value={facturacion.correoFacturas}
          />
        </Section>
      </div>
    </div>
  );
}