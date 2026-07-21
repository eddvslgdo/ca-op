import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, CheckCircle2, Building2 } from "lucide-react"
import type { PublicLead } from "@/types/onboarding"

interface PublicLeadFormProps {
  onLeadCreated: (lead: PublicLead) => void
}

export function PublicLeadForm({ onLeadCreated }: PublicLeadFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    razonSocial: "",
    rfc: "",
    nombreContacto: "",
    correoContacto: "",
    telefonoContacto: "",
    interesComercial: "Productos Químicos Industriales",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newLead: PublicLead = {
      id: `LEAD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      ...formData,
      fechaRegistro: new Date().toLocaleDateString("es-MX") + " " + new Date().toLocaleTimeString("es-MX"),
    }
    onLeadCreated(newLead)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 space-y-4 border-slate-200">
          <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <CardTitle className="text-lg text-slate-900">¡Gracias por tu interés en Grupo Polak!</CardTitle>
          <CardDescription className="text-xs">
            Hemos recibido tus datos de contacto. Un ejecutivo comercial se pondrá en contacto contigo a la brevedad para evaluar tus necesidades.
          </CardDescription>
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)} className="text-xs">
            Registrar otra empresa
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <header className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-xl">
            <Building2 className="h-6 w-6" /> Grupo Polak
          </div>
          <h1 className="text-lg font-bold text-slate-900">Solicitud de Información Comercial</h1>
          <p className="text-xs text-slate-500">Ingresa tus datos de contacto para iniciar comunicación con nuestro equipo.</p>
        </header>

        <Card className="shadow-sm border-slate-200">
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">Datos Mínimos del Prospecto</CardTitle>
              <CardDescription className="text-[11px]">No se solicitarán documentos fiscales ni bancarios en esta etapa.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label htmlFor="razon">Razón Social / Empresa *</Label>
                <Input 
                  id="razon" 
                  placeholder="Ej. Comercializadora del Norte S.A." 
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="rfc">RFC Prospecto *</Label>
                  <Input 
                    id="rfc" 
                    placeholder="Ej. CNO120415HH8" 
                    className="uppercase"
                    maxLength={13}
                    value={formData.rfc}
                    onChange={(e) => setFormData({...formData, rfc: e.target.value.toUpperCase()})}
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contacto">Nombre Contacto *</Label>
                  <Input 
                    id="contacto" 
                    placeholder="Ej. Ing. Carlos Mendoza" 
                    value={formData.nombreContacto}
                    onChange={(e) => setFormData({...formData, nombreContacto: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="correo">Correo Electrónico *</Label>
                  <Input 
                    id="correo" 
                    type="email" 
                    placeholder="carlos@empresa.com" 
                    value={formData.correoContacto}
                    onChange={(e) => setFormData({...formData, correoContacto: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="tel">Teléfono *</Label>
                  <Input 
                    id="tel" 
                    placeholder="55 1234 5678" 
                    value={formData.telefonoContacto}
                    onChange={(e) => setFormData({...formData, telefonoContacto: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="interes">Interés Comercial Principal</Label>
                <Input 
                  id="interes" 
                  placeholder="Ej. Materias primas para sector farmacéutico" 
                  value={formData.interesComercial}
                  onChange={(e) => setFormData({...formData, interesComercial: e.target.value})}
                />
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs">
                Enviar Solicitud <Send className="h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}