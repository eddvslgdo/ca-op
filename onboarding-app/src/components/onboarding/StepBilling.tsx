import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BillingData } from "@/types/onboarding"
import { CreditCard, Receipt } from "lucide-react"

interface StepBillingProps {
  data: BillingData
  onChange: (fields: Partial<BillingData>) => void
}

export function StepBilling({ data, onChange }: StepBillingProps) {
  return (
    <div className="space-y-6 w-full text-left">
      
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2 flex items-center gap-1.5">
          <CreditCard className="h-4 w-4 text-indigo-600" /> Datos Bancarios
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <Label>Nombre del Banco *</Label>
            <Input
              placeholder="Ej. BBVA, Santander, Banamex"
              value={data.banco}
              onChange={(e) => onChange({ banco: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Últimos 4 dígitos de la cuenta de pago *</Label>
            <Input
              placeholder="Ej. 9199"
              maxLength={4}
              value={data.cuenta4Digitos}
              onChange={(e) => onChange({ cuenta4Digitos: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2 flex items-center gap-1.5">
          <Receipt className="h-4 w-4 text-indigo-600" /> Preferencias de Facturación
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <Label>Forma de Pago Frecuente *</Label>
            <select
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1"
              value={data.formaPago}
              onChange={(e) => onChange({ formaPago: e.target.value })}
            >
              <option value="">Selecciona una forma de pago...</option>
              <option value="03 - Transferencia electrónica de fondos">03 - Transferencia electrónica de fondos</option>
              <option value="02 - Cheque nominativo">02 - Cheque nominativo</option>
              <option value="99 - Por definir">99 - Por definir</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <Label>Método de Pago *</Label>
            <select
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1"
              value={data.metodoPago}
              onChange={(e) => onChange({ metodoPago: e.target.value })}
            >
              <option value="">Selecciona un método...</option>
              <option value="PUE - Pago en una sola exhibición">PUE - Pago en una sola exhibición</option>
              <option value="PPD - Pago en parcialidades o diferido">PPD - Pago en parcialidades o diferido</option>
            </select>
          </div>

          <div className="space-y-1.5 col-span-1 md:col-span-2">
            <Label>Correo Electrónico para envío de Facturas (XML/PDF) *</Label>
            <Input
              type="email"
              placeholder="facturacion@tuempresa.com"
              value={data.correoFacturas}
              onChange={(e) => onChange({ correoFacturas: e.target.value })}
            />
          </div>
        </div>
      </div>

    </div>
  )
}