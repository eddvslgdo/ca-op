import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Info, AlertCircle } from "lucide-react"
import type { CompanyData } from "@/types/onboarding"

interface StepCompanyProps {
  data: CompanyData
  onChange: (data: Partial<CompanyData>) => void
}

export function StepCompany({ data, onChange }: StepCompanyProps) {
  const [showCfdiWarning, setShowCfdiWarning] = useState(false)

  const regimenes = [
    { id: "601", nombre: "601 - General de Ley Personas Morales" },
    { id: "612", nombre: "612 - Personas Físicas con Actividades Empresariales y Profesionales" },
    { id: "626", nombre: "626 - Régimen Simplificado de Confianza (RESICO)" },
    { id: "603", nombre: "603 - Personas Morales con Fines no Lucrativos" },
  ]

  // VALIDACIÓN ON-BLUR (Solo cuando el usuario termina de escribir y da clic fuera)
  const handleRazonSocialBlur = () => {
    const rawValue = data.razonSocial.toUpperCase()
    
    // Expresión regular para detectar sufijos societarios SOLO al final del texto
    const sufijosSocietarios = /(,\s*|\s+)(S\.?A\.?\s*DE\s*C\.?V\.?|S\.?A\.?P\.?I\.?\s*DE\s*C\.?V\.?|S\.?\s*DE\s*R\.?L\.?\s*(DE\s*C\.?V\.?)?|S\.?A\.?|S\.?C\.?|S\.?A\.?S\.?|S\.?\s*EN\s*N\.?C\.?|S\.?\s*EN\s*C\.?)$/i

    if (sufijosSocietarios.test(rawValue)) {
      const cleanedValue = rawValue.replace(sufijosSocietarios, '').trim()
      onChange({ razonSocial: cleanedValue })
      setShowCfdiWarning(true)
      
      // Ocultar la advertencia después de 6 segundos
      setTimeout(() => setShowCfdiWarning(false), 6000)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="space-y-4">
        {/* Razón Social con Autocorrección onBlur */}
        <div className="space-y-1.5 relative">
          <Label htmlFor="razonSocial" className="text-slate-800 font-semibold">
            Razón Social (Idéntica a la Constancia de Situación Fiscal) <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="razonSocial"
            placeholder="Ej. QUIMICA MEXICANA DEL BAJIO" 
            value={data.razonSocial}
            onChange={(e) => onChange({ razonSocial: e.target.value.toUpperCase() })}
            onBlur={handleRazonSocialBlur} // <-- AQUÍ ESTÁ EL CAMBIO CLAVE
            className="uppercase font-medium focus:ring-indigo-500"
          />
          <p className="text-[11px] text-slate-500 flex items-start gap-1 mt-1">
            <Info className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
            Por disposición oficial (CFDI 4.0), omite el régimen de capital (S.A. de C.V., S. de R.L., etc.). El sistema lo limpiará automáticamente al terminar de escribir.
          </p>

          {showCfdiWarning && (
            <div className="absolute top-full mt-2 left-0 right-0 z-10 bg-amber-50 border border-amber-200 text-amber-800 text-xs p-2.5 rounded-md flex items-center gap-2 shadow-sm animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
              <span>Se ha removido el régimen de capital automáticamente para cumplir con los lineamientos del SAT (CFDI 4.0).</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="rfc" className="text-slate-800 font-semibold">RFC <span className="text-red-500">*</span></Label>
            <Input 
              id="rfc"
              placeholder="Ej. QMB980412KK0" 
              value={data.rfc}
              onChange={(e) => onChange({ rfc: e.target.value.toUpperCase() })}
              maxLength={13}
              className="uppercase font-mono focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="regimenFiscal" className="text-slate-800 font-semibold">Régimen Fiscal <span className="text-red-500">*</span></Label>
            <select 
              id="regimenFiscal"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={data.regimenFiscal}
              onChange={(e) => onChange({ regimenFiscal: e.target.value })}
            >
              <option value="">Selecciona un régimen...</option>
              {regimenes.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <Label htmlFor="giroComercial" className="text-slate-800 font-semibold">Giro Comercial o Actividad Principal</Label>
          <Input 
            id="giroComercial"
            placeholder="Ej. Fabricación de productos químicos para la industria agrícola" 
            value={data.giroComercial}
            onChange={(e) => onChange({ giroComercial: e.target.value })}
            className="focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  )
}