import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Link2, Copy, Check, Key, Sparkles, X, Clock, Loader2, CheckCircle2, MailCheck } from "lucide-react"
import type { MagicLinkSession, CommercialConfig, SessionWorkflow } from "@/types/onboarding"

interface LinkGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onSessionCreated: (session: MagicLinkSession) => void
}

export function LinkGeneratorModal({ isOpen, onClose, onSessionCreated }: LinkGeneratorModalProps) {
  // ESTADOS DEL MODAL: "form" -> "loading" -> "success"
  const [modalStep, setModalStep] = useState<"form" | "loading" | "success">("form")
  
  const [copiedCustom, setCopiedCustom] = useState(false)
  const [workflow, setWorkflow] = useState<SessionWorkflow>("lead")

  const [companyName, setCompanyName] = useState("")
  const [rfc, setRfc] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  
  const unidadesNegocio = [
    "Adyuvantes", "Agrícola", "Exportación", "Industrial DJP", 
    "Industrial PQ", "Polatecnia", "Agroindustriales", "DJP Smart Chemicals"
  ]

  const tiposCliente = [
    "Agroindustrial", "Distribuidor", "Fabricante", "Representadas", 
    "Representante", "Revendedor", "Subdistribuidor", "Agricultor", 
    "Ganadero", "I&D", "Post Patent", "Formuladores Locales", 
    "Smart Chemicals", "Polatecnia"
  ]

  const [commercialConfig, setCommercialConfig] = useState<CommercialConfig>({
    unidadNegocio: "Industrial PQ",
    tipoCliente: "",
    organizacionVentas: "Polak Grupo Industrial",
    canalDistribucion: "Industrial",
    division: "Nacional",
    oficinaVentas: "Gte. Div. Ind. PQ",
    grupoVendedores: "Gte. Vta. Industrial",
    condicionesPago: "CONT Contado",
    incoterms: "En fábrica",
    lugarEntrega: "CIA",
    moneda: "MXN",
    usoCFDI: "G03 Gastos en general",
    clasificacionIVA: "1 - Sujeto a impuestos",
    clasificacionIEPS: "0 - Exento de impto.",
  })

  const [generatedSession, setGeneratedSession] = useState<MagicLinkSession | null>(null)

  // Resetea el modal cuando se abre
  useEffect(() => {
    if (isOpen) {
      setModalStep("form")
      setGeneratedSession(null)
      setCompanyName("")
      setRfc("")
      setContactEmail("")
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Cambiamos al estado de carga
    setModalStep("loading")

    // 2. Simulamos el tiempo de respuesta del servidor (1.5 segundos)
    setTimeout(() => {
      const highEntropyToken = `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

      const newSession: MagicLinkSession = {
        sessionId: `SES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        workflow: workflow,
        token: highEntropyToken,
        clienteExisteEnCRM: false,
        configComercial: commercialConfig,
        fechaCreacion: now.toLocaleDateString("es-MX"),
        fechaExpiracion: expiresAt.toLocaleDateString("es-MX"),
        reactivacionesCount: 0,
        status: "active",
        ultimoAvance: {
          empresa: { razonSocial: companyName, rfc, regimenFiscal: "", giroComercial: "" },
          direccionFiscal: { calle: "", numeroExterior: "", colonia: "", codigoPostal: "", estado: "", municipio: "" },
          direccionesEntrega: [],
          contacto: { nombreRepresentante: "", correoContacto: contactEmail, telefonoContacto: "" },
          facturacion: { banco: "", cuenta4Digitos: "", metodoPago: "", formaPago: "", correoFacturas: "" }
        },
        documentosTemporales: {},
        auditLogs: [
          {
            id: `LOG-1`,
            fechaHora: new Date().toLocaleString("es-MX"),
            usuario: "SAC (Operador)",
            accion: `Creación de Sesión (${workflow.toUpperCase()})`,
            resultado: "Exitoso"
          }
        ]
      }

      setGeneratedSession(newSession)
      onSessionCreated(newSession)
      
      // 3. Pasamos al estado de éxito
      setModalStep("success")
    }, 1500)
  }

  const handleCopy = () => {
    if (generatedSession) {
      const fullLink = `https://onboarding.grupopolak.com/registro/magic-link?token=${generatedSession.token}`
      navigator.clipboard.writeText(fullLink)
      setCopiedCustom(true)
      setTimeout(() => setCopiedCustom(false), 2000)
    }
  }

  const updateConfig = (field: keyof CommercialConfig, value: string) => {
    setCommercialConfig((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 py-8 overflow-y-auto">
      <Card className="max-w-3xl w-full bg-white shadow-2xl border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 my-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
          <X className="h-5 w-5" />
        </button>

        {/* HEADER */}
        {modalStep === "form" && (
          <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Link2 className="h-5 w-5" /></div>
              <div>
                <CardTitle className="text-base text-slate-900">Crear Sesión de Registro (RN-077)</CardTitle>
                <CardDescription className="text-xs">
                  Selecciona el tipo de proceso y asigna los parámetros obligatorios.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent className={modalStep === "form" ? "p-6" : "p-0"}>
          
          {/* ESTADO 1: FORMULARIO */}
          {modalStep === "form" && (
            <form onSubmit={handleCreateSession} className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setWorkflow("lead")}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${workflow === "lead" ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-300"}`}
                >
                  <p className="font-bold text-sm text-slate-900">Prospecto (Lead)</p>
                  <p className="text-xs text-slate-500">Formulario corto. Captura información básica.</p>
                </div>
                <div
                  onClick={() => setWorkflow("onboarding")}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${workflow === "onboarding" ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-300"}`}
                >
                  <p className="font-bold text-sm text-slate-900">Onboarding Completo</p>
                  <p className="text-xs text-slate-500">Solicita domicilios, datos bancarios y documentos.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <Label>Razón Social *</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>RFC *</Label>
                  <Input value={rfc} onChange={(e) => setRfc(e.target.value.toUpperCase())} className="uppercase" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Correo de Contacto *</Label>
                  <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-indigo-700 font-bold">Unidad de Negocio CRM *</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1 font-semibold focus:ring-indigo-500" 
                    value={commercialConfig.unidadNegocio} 
                    onChange={(e) => updateConfig("unidadNegocio", e.target.value)}
                  >
                    {unidadesNegocio.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label>Tipo de Cliente (Opcional)</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1" 
                    value={commercialConfig.tipoCliente} 
                    onChange={(e) => updateConfig("tipoCliente", e.target.value)}
                  >
                    <option value="">Selecciona una opción...</option>
                    {tiposCliente.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* DATOS AVANZADOS CRM (SOLO ONBOARDING) */}
              {workflow === "onboarding" && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4">
                  <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                      <Key className="h-4 w-4 text-emerald-600" /> Configuración Comercial Interna
                    </span>
                    <Badge variant="outline" className="bg-white text-slate-600 text-[10px]">Oculto para el cliente</Badge>
                  </div>

                  <div className="p-4 space-y-5 text-xs max-h-[30vh] overflow-y-auto">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-700 border-b pb-1">1. Estructura de Ventas</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Organización de ventas</Label>
                          <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1"
                            value={commercialConfig.organizacionVentas} onChange={(e) => updateConfig("organizacionVentas", e.target.value)}>
                            <option>Polak Grupo Industrial</option>
                            <option>Polak Químicos Especializados</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label>Canal de distribución</Label>
                          <Input value={commercialConfig.canalDistribucion} onChange={(e) => updateConfig("canalDistribucion", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label>División</Label>
                          <Input value={commercialConfig.division} onChange={(e) => updateConfig("division", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label>Oficina / Grupo Vendedores</Label>
                          <Input value={commercialConfig.oficinaVentas} onChange={(e) => updateConfig("oficinaVentas", e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-700 border-b pb-1">2. Condiciones de Pago e Impuestos</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Moneda</Label>
                          <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1"
                            value={commercialConfig.moneda} onChange={(e) => updateConfig("moneda", e.target.value)}>
                            <option>MXN</option>
                            <option>USD</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label>Condiciones de Pago</Label>
                          <Input value={commercialConfig.condicionesPago} disabled className="bg-slate-100" />
                        </div>
                        <div className="space-y-1">
                          <Label>IVA (Clasificación Fiscal)</Label>
                          <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1"
                            value={commercialConfig.clasificacionIVA} onChange={(e) => updateConfig("clasificacionIVA", e.target.value)}>
                            <option>1 - Sujeto a impuestos</option>
                            <option>0 - Exento</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label>IEPS (Biocidas)</Label>
                          <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1"
                            value={commercialConfig.clasificacionIEPS} onChange={(e) => updateConfig("clasificacionIEPS", e.target.value)}>
                            <option>0 - Exento de impto.</option>
                            <option>Aplica (Biocidas)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-10">
                <Sparkles className="h-4 w-4" /> Generar Sesión & Enviar Correo
              </Button>
            </form>
          )}

          {/* ESTADO 2: CARGANDO */}
          {modalStep === "loading" && (
            <div className="py-24 flex flex-col items-center justify-center space-y-4 animate-in fade-in">
              <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Procesando Sesión...</h3>
                <p className="text-sm text-slate-500">Generando identificador y despachando correo.</p>
              </div>
            </div>
          )}

          {/* ESTADO 3: ÉXITO */}
          {modalStep === "success" && generatedSession && (
            <div className="p-8 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 fade-in">
              <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-50">
                <MailCheck className="h-10 w-10 text-emerald-600" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">¡Sesión Generada con Éxito!</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  Se ha enviado automáticamente el enlace de registro al correo electrónico: <br/>
                  <strong className="text-slate-900 block mt-1">{contactEmail}</strong>
                </p>
              </div>

              <div className="w-full p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 mt-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Enlace de Respaldo</span>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] gap-1 shadow-sm">
                    <Clock className="h-3 w-3" /> Expira: {generatedSession.fechaExpiracion}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  En caso de que el cliente no reciba el correo en su bandeja de entrada o lo solicite nuevamente por otro medio, puedes copiar este enlace directo:
                </p>
                <div className="flex gap-2">
                  <Input value={`https://onboarding.grupopolak.com/registro/magic-link?token=${generatedSession.token}`} readOnly className="bg-white font-mono text-[11px] text-slate-700 h-10" />
                  <Button onClick={handleCopy} className="bg-indigo-600 text-white hover:bg-indigo-700 gap-1.5 min-w-[120px] h-10 shadow-sm">
                    {copiedCustom ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedCustom ? "¡Copiado!" : "Copiar Link"}
                  </Button>
                </div>
              </div>

              <Button onClick={onClose} className="w-full h-12 font-semibold bg-slate-900 hover:bg-slate-800 text-white mt-2">
                Entendido, volver al tablero
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}