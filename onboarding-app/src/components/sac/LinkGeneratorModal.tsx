import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Link2, Copy, Check, Key, Sparkles, X, Clock, Loader2, MailCheck } from "lucide-react"
import type { MagicLinkSession, CommercialConfig, SessionWorkflow } from "@/types/onboarding"

interface LinkGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onSessionCreated: (session: MagicLinkSession) => void
}

export function LinkGeneratorModal({ isOpen, onClose, onSessionCreated }: LinkGeneratorModalProps) {
  const [modalStep, setModalStep] = useState<"form" | "loading" | "success">("form")
  const [copiedCustom, setCopiedCustom] = useState(false)
  const [workflow, setWorkflow] = useState<SessionWorkflow>("lead")

  const [companyName, setCompanyName] = useState("")
  const [rfc, setRfc] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  
  // CATÁLOGOS SAP/CRM BÁSICOS
  const unidadesNegocio = ["Adyuvantes", "Agrícola", "Exportación", "Industrial DJP", "Industrial PQ", "Polatecnia", "Agroindustriales", "DJP Smart Chemicals"]
  const tiposCliente = ["Agroindustrial", "Distribuidor", "Fabricante", "Representadas", "Representante", "Revendedor", "Subdistribuidor", "Agricultor", "Ganadero", "I&D", "Post Patent", "Formuladores Locales", "Smart Chemicals", "Polatecnia"]
  
  // CATÁLOGOS SAP/CRM AVANZADOS
  const orgVentasOptions = ["POLAQUIMIA SA DE CV", "DR. JOSE POLAK", "POLATECNIA SA DE CV", "Compras", "Agrícola", "Contraloría", "Industrial", "Adyuvantes", "Marketing", "Exportaciones", "Nuevos productos", "Polatecnia"]
  const canalDistOptions = ["Agrícola", "Canal Dist. Común", "Industrial", "Ventas directas", "Ventas indirectas"]
  const divisionOptions = ["Exportación", "Nacional", "Sector Común", "Sector producto 01", "Servicios", "Trading"]
  const oficinaVentasOptions = ["Adyuvantes", "Gte. Div. Ind. PQ", "Expo. PQ Industrial", "Gte. Div. Ag. PQ", "Expo. PQ Agrícola", "Gte. Div. Ind. DJP", "Exportación DJP", "Trading DJP", "Exportación PT", "Gerente Polatecnia", "Mezcla de surfactant", "Mezcla de surfac. NP"]
  const grupoVendedoresOptions = ["Adyuvantes", "Gte. Vta. Industrial", "GV Expo PQ Ind", "Gte. Vta. Agrícola", "GV Expo PQ Ag", "Gte. Vta. Ind. DJP", "Gte. Expo DJP", "Gte. Trading DJP", "Gte. Expo PT", "Jefe Polatecnia", "Gte. Mezcla de surfactant", "Gte. Mezcla de surfac. NP"]
  const incotermsOptions = ["Coste, seguro y flete", "Costes y flete", "En fábrica", "Entregado con derechos de aduana pagados", "Entregado en el buque", "Entregado en el lugar", "Entregado en el muelle (derechos pagad.)", "Entregado en frontera", "Entregado en la terminal", "Entregado en lugar descargado", "Entregado sin pago de derechos de aduana", "Franco a bordo", "Franco al costado del buque", "Franco transportista", "Transporte pagado hasta", "Transporte y seguro pagados hasta"]
  const monedaOptions = ["EUR - Euro", "MXN - Peso mexicano", "SLE - Leone", "USD - Dolar de EE. UU.", "VED - Bolívar soberano", "XAD - Dinar contable árabe", "ZWG - Oro de Zimbabue"]
  const prioridadOptions = ["Alta", "Normal"]
  const grupoClientesOptions = ["Cliente incompleto", "Cliente privado", "Competencia", "Industria", "Minoristas", "Sector público", "Subsidiaria completa", "Subsidiaria parcial"]

  const [commercialConfig, setCommercialConfig] = useState<CommercialConfig>({
    unidadNegocio: "Industrial PQ",
    tipoCliente: "",
    organizacionVentas: "POLAQUIMIA SA DE CV",
    canalDistribucion: "Industrial",
    division: "Nacional",
    oficinaVentas: "Gte. Div. Ind. PQ",
    grupoVendedores: "Gte. Vta. Industrial",
    condicionesPago: "CONT Contado",
    incoterms: "En fábrica",
    lugarEntrega: "CIA",
    moneda: "MXN - Peso mexicano",
    prioridadEntrega: "Normal",
    grupoClientes: "Industria"
  })

  const [generatedSession, setGeneratedSession] = useState<MagicLinkSession | null>(null)

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
    setModalStep("loading")

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
          empresa: { razonSocial: companyName, rfc, regimenFiscal: "", usoCFDI: "", giroComercial: "" },
          direccionFiscal: { calle: "", numeroExterior: "", colonia: "", codigoPostal: "", estado: "", municipio: "" },
          direccionesEntrega: [],
          contacto: { nombreRepresentante: "", correoContacto: contactEmail, telefonoContacto: "" },
          facturacion: { banco: "", cuenta4Digitos: "", metodoPago: "", formaPago: "", correoFacturas: "" }
        },
        documentosTemporales: {},
        auditLogs: [{ id: `LOG-1`, fechaHora: new Date().toLocaleString("es-MX"), usuario: "SAC (Operador)", accion: `Creación de Sesión (${workflow.toUpperCase()})`, resultado: "Exitoso" }]
      }

      setGeneratedSession(newSession)
      onSessionCreated(newSession)
      setModalStep("success")
    }, 1500)
  }

  const handleCopy = () => {
    if (generatedSession) {
      navigator.clipboard.writeText(`https://onboarding.grupopolak.com/registro/magic-link?token=${generatedSession.token}`)
      setCopiedCustom(true)
      setTimeout(() => setCopiedCustom(false), 2000)
    }
  }

  const updateConfig = (field: keyof CommercialConfig, value: string) => {
    setCommercialConfig((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 py-8 overflow-y-auto">
      <Card className="max-w-4xl w-full bg-white shadow-2xl border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 my-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
          <X className="h-5 w-5" />
        </button>

        {modalStep === "form" && (
          <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Link2 className="h-5 w-5" /></div>
              <div>
                <CardTitle className="text-base text-slate-900">Crear Sesión de Registro (RN-077)</CardTitle>
                <CardDescription className="text-xs">Selecciona el tipo de proceso y asigna los parámetros obligatorios.</CardDescription>
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent className={modalStep === "form" ? "p-6" : "p-0"}>
          {modalStep === "form" && (
            <form onSubmit={handleCreateSession} className="space-y-6 animate-in fade-in">
              
              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setWorkflow("lead")} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${workflow === "lead" ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-300"}`}>
                  <p className="font-bold text-sm text-slate-900">Prospecto (Lead)</p>
                  <p className="text-xs text-slate-500">Formulario corto. Solo requiere información básica.</p>
                </div>
                <div onClick={() => setWorkflow("onboarding")} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${workflow === "onboarding" ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-300"}`}>
                  <p className="font-bold text-sm text-slate-900">Onboarding Completo</p>
                  <p className="text-xs text-slate-500">Exige preconfigurar reglas de venta para el CRM.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Razón Social *</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>RFC *</Label>
                  <Input value={rfc} onChange={(e) => setRfc(e.target.value.toUpperCase())} className="uppercase" required />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Correo de Contacto *</Label>
                  <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                </div>
                
                <div className="space-y-1.5 md:col-span-1">
                  <Label className="text-indigo-700 font-bold">Unidad Negocio *</Label>
                  <select className="flex h-9 w-full rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1 font-semibold" value={commercialConfig.unidadNegocio} onChange={(e) => updateConfig("unidadNegocio", e.target.value)}>
                    {unidadesNegocio.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-1">
                  <Label>Tipo de Cliente</Label>
                  <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1" value={commercialConfig.tipoCliente} onChange={(e) => updateConfig("tipoCliente", e.target.value)}>
                    <option value="">Selecciona...</option>
                    {tiposCliente.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {workflow === "onboarding" && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4">
                  <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                      <Key className="h-4 w-4 text-emerald-600" /> Datos de Venta (CRM)
                    </span>
                    <Badge variant="outline" className="bg-white text-slate-600 text-[10px]">Oculto para el cliente</Badge>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs max-h-[40vh] overflow-y-auto">
                    {/* Columna Izquierda */}
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label>Organización de ventas</Label>
                        <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3" value={commercialConfig.organizacionVentas} onChange={(e) => updateConfig("organizacionVentas", e.target.value)}>
                          {orgVentasOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>División</Label>
                        <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3" value={commercialConfig.division} onChange={(e) => updateConfig("division", e.target.value)}>
                          {divisionOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Grupo de vendedores</Label>
                        <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3" value={commercialConfig.grupoVendedores} onChange={(e) => updateConfig("grupoVendedores", e.target.value)}>
                          {grupoVendedoresOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Incoterms</Label>
                        <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3" value={commercialConfig.incoterms} onChange={(e) => updateConfig("incoterms", e.target.value)}>
                          {incotermsOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Moneda</Label>
                        <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3" value={commercialConfig.moneda} onChange={(e) => updateConfig("moneda", e.target.value)}>
                          {monedaOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label>Canal de distribución</Label>
                        <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3" value={commercialConfig.canalDistribucion} onChange={(e) => updateConfig("canalDistribucion", e.target.value)}>
                          {canalDistOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Oficina de ventas</Label>
                        <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3" value={commercialConfig.oficinaVentas} onChange={(e) => updateConfig("oficinaVentas", e.target.value)}>
                          {oficinaVentasOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Grupo de clientes</Label>
                        <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3" value={commercialConfig.grupoClientes} onChange={(e) => updateConfig("grupoClientes", e.target.value)}>
                          {grupoClientesOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Condiciones de pago</Label>
                        <Input value={commercialConfig.condicionesPago} disabled className="bg-slate-100 font-medium" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-indigo-600 font-medium">Lugar de entrega (según incoterms)</Label>
                        <Input placeholder="Ej. CIA" value={commercialConfig.lugarEntrega} onChange={(e) => updateConfig("lugarEntrega", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Prioridad de entrega</Label>
                        <select className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3" value={commercialConfig.prioridadEntrega} onChange={(e) => updateConfig("prioridadEntrega", e.target.value)}>
                          {prioridadOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
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

          {/* ... Estados de Carga y Éxito ... */}
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
                  En caso de que el cliente no reciba el correo, puedes copiar este enlace directo:
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