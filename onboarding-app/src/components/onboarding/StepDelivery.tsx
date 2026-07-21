import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { DeliveryAddressData } from "@/types/onboarding"
import { Plus, Trash2, FileUp, CheckCircle2, Truck, Sparkles, Loader2 } from "lucide-react"

interface StepDeliveryProps {
  deliveryAddresses: DeliveryAddressData[]
  onDeliveryChange: (addresses: DeliveryAddressData[]) => void
}

export function StepDelivery({
  deliveryAddresses,
  onDeliveryChange,
}: StepDeliveryProps) {
  const [sameAsFiscal, setSameAsFiscal] = useState(deliveryAddresses.length === 0)
  const [extractingOcrId, setExtractingOcrId] = useState<string | null>(null)

  const handleAddDeliveryAddress = () => {
    const newAddress: DeliveryAddressData = {
      id: `DEL-${Date.now()}`,
      nombrePlanta: `Planta / Bodega ${deliveryAddresses.length + 1}`,
      contactoRecepcion: "",
      telefonoRecepcion: "",
      calle: "",
      numeroExterior: "",
      colonia: "",
      codigoPostal: "",
      estado: "",
      municipio: "",
      horarioRecepcion: "08:00 - 17:00 hrs",
    }
    onDeliveryChange([...deliveryAddresses, newAddress])
    setSameAsFiscal(false)
  }

  const handleRemoveDeliveryAddress = (id: string) => {
    onDeliveryChange(deliveryAddresses.filter((a) => a.id !== id))
  }

  const handleUpdateDeliveryAddress = (id: string, fields: Partial<DeliveryAddressData>) => {
    onDeliveryChange(
      deliveryAddresses.map((addr) => (addr.id === id ? { ...addr, ...fields } : addr))
    )
  }

  const handleOcrComprobante = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setExtractingOcrId(id)

    setTimeout(() => {
      handleUpdateDeliveryAddress(id, {
        calle: "Av. Parque Industrial Lerma",
        numeroExterior: "45",
        colonia: "Parque Industrial",
        codigoPostal: "52000",
        municipio: "Lerma",
        estado: "Estado de México",
        comprobanteDomicilioUrl: file.name,
      })
      setExtractingOcrId(null)
    }, 1200)
  }

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-indigo-600" /> Direcciones de Entrega (Destinatarios de Mercancía)
          </h3>
          <p className="text-[11px] text-slate-500">Registra las plantas o almacenes donde recibes embarques de producto.</p>
        </div>

        <Button 
          type="button" 
          onClick={handleAddDeliveryAddress} 
          size="sm" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 h-8"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar Planta
        </Button>
      </div>

      <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
        <input
          type="checkbox"
          id="sameFiscal"
          checked={sameAsFiscal}
          onChange={(e) => {
            setSameAsFiscal(e.target.checked)
            if (e.target.checked) onDeliveryChange([])
          }}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
        />
        <label htmlFor="sameFiscal" className="text-slate-700 cursor-pointer font-medium">
          El domicilio de entrega principal es el mismo que el Domicilio Fiscal
        </label>
      </div>

      {deliveryAddresses.map((addr, index) => (
        <div key={addr.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-4 shadow-sm relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-indigo-600" /> Destinatario #{index + 1}: {addr.nombrePlanta}
            </span>
            
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => handleRemoveDeliveryAddress(addr.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
            </Button>
          </div>

          <div className="border border-dashed border-indigo-200 bg-indigo-50/40 p-3 rounded-lg flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              {extractingOcrId === addr.id ? (
                <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
              ) : addr.comprobanteDomicilioUrl ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Sparkles className="h-5 w-5 text-indigo-600" />
              )}
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {addr.comprobanteDomicilioUrl ? `Comprobante Cargado: ${addr.comprobanteDomicilioUrl}` : "Comprobante de Domicilio de esta Planta (OCR)"}
                </p>
                <p className="text-[10px] text-slate-500">Subir recibo de agua/luz para autocompletar la dirección de entrega.</p>
              </div>
            </div>

            <div className="relative">
              <Button variant="outline" size="sm" className="text-[11px] gap-1 h-7 bg-white">
                <FileUp className="h-3 w-3" /> {addr.comprobanteDomicilioUrl ? "Cambiar PDF" : "Subir PDF"}
              </Button>
              <input
                type="file"
                accept=".pdf,.png,.jpg"
                onChange={(e) => handleOcrComprobante(addr.id, e)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <Label>Identificador de Planta / Almacén *</Label>
              <Input
                placeholder="Ej. Planta Toluca Bodega B"
                value={addr.nombrePlanta}
                onChange={(e) => handleUpdateDeliveryAddress(addr.id, { nombrePlanta: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Contacto de Recepción *</Label>
              <Input
                placeholder="Ej. Ing. Juan Pérez"
                value={addr.contactoRecepcion}
                onChange={(e) => handleUpdateDeliveryAddress(addr.id, { contactoRecepcion: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Teléfono Directo Almacén *</Label>
              <Input
                placeholder="Ej. 722 123 4567"
                value={addr.telefonoRecepcion}
                onChange={(e) => handleUpdateDeliveryAddress(addr.id, { telefonoRecepcion: e.target.value })}
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Calle y Número *</Label>
              <Input
                placeholder="Calle, Av. o Parque Industrial"
                value={addr.calle}
                onChange={(e) => handleUpdateDeliveryAddress(addr.id, { calle: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Código Postal *</Label>
              <Input
                placeholder="52000"
                maxLength={5}
                value={addr.codigoPostal}
                onChange={(e) => handleUpdateDeliveryAddress(addr.id, { codigoPostal: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Colonia *</Label>
              <Input
                placeholder="Colonia"
                value={addr.colonia}
                onChange={(e) => handleUpdateDeliveryAddress(addr.id, { colonia: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Municipio / Estado *</Label>
              <Input
                placeholder="Municipio"
                value={addr.municipio}
                onChange={(e) => handleUpdateDeliveryAddress(addr.id, { municipio: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Horario de Recepción</Label>
              <Input
                placeholder="Ej. L-V 08:00 - 16:00"
                value={addr.horarioRecepcion}
                onChange={(e) => handleUpdateDeliveryAddress(addr.id, { horarioRecepcion: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}