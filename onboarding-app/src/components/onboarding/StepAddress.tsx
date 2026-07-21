import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AddressData, LegalContactData } from "@/types/onboarding"
import { MapPin } from "lucide-react"

interface StepAddressProps {
  fiscalAddress: AddressData
  contactData: LegalContactData
  onFiscalChange: (data: Partial<AddressData>) => void
  onContactChange: (data: Partial<LegalContactData>) => void
}

export function StepAddress({
  fiscalAddress,
  contactData,
  onFiscalChange,
  onContactChange,
}: StepAddressProps) {
  return (
    <div className="space-y-6 w-full text-left">
      
      {/* 1. SECCIÓN DOMICILIO FISCAL */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2 flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-indigo-600" /> Domicilio Fiscal (Registrado ante el SAT)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1 col-span-2">
            <Label htmlFor="calleF">Calle *</Label>
            <Input
              id="calleF"
              placeholder="Ej. Av. Insurgentes Sur"
              value={fiscalAddress.calle}
              onChange={(e) => onFiscalChange({ calle: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="numExtF">Num. Ext *</Label>
              <Input
                id="numExtF"
                placeholder="123"
                value={fiscalAddress.numeroExterior}
                onChange={(e) => onFiscalChange({ numeroExterior: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="numIntF">Num. Int</Label>
              <Input
                id="numIntF"
                placeholder="Piso 4"
                value={fiscalAddress.numeroInterior || ""}
                onChange={(e) => onFiscalChange({ numeroInterior: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="cpF">Código Postal *</Label>
            <Input
              id="cpF"
              placeholder="03100"
              maxLength={5}
              value={fiscalAddress.codigoPostal}
              onChange={(e) => onFiscalChange({ codigoPostal: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="coloniaF">Colonia *</Label>
            <Input
              id="coloniaF"
              placeholder="Ej. Del Valle"
              value={fiscalAddress.colonia}
              onChange={(e) => onFiscalChange({ colonia: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="municipioF">Alcaldía / Municipio *</Label>
            <Input
              id="municipioF"
              placeholder="Ej. Benito Juárez"
              value={fiscalAddress.municipio}
              onChange={(e) => onFiscalChange({ municipio: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN CONTACTO LEGAL */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
          Representante Legal / Contacto Principal
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1 col-span-3">
            <Label htmlFor="nombreRep">Nombre Completo del Representante Legal *</Label>
            <Input
              id="nombreRep"
              placeholder="Ej. Roberto Gómez Bolaños"
              value={contactData.nombreRepresentante}
              onChange={(e) => onContactChange({ nombreRepresentante: e.target.value })}
            />
          </div>

          <div className="space-y-1 col-span-2">
            <Label htmlFor="correo">Correo Electrónico *</Label>
            <Input
              id="correo"
              type="email"
              placeholder="contacto@empresa.com"
              value={contactData.correoContacto}
              onChange={(e) => onContactChange({ correoContacto: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="55 1234 5678"
              value={contactData.telefonoContacto}
              onChange={(e) => onContactChange({ telefonoContacto: e.target.value })}
            />
          </div>
        </div>
      </div>

    </div>
  )
}