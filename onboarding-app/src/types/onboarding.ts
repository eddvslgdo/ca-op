// ==========================================
// 1. ESTADO, WORKFLOW Y AUDITORÍA DE SESIÓN (RN-077 a RN-089)
// ==========================================
export type SessionWorkflow = "lead" | "onboarding" // RN-081
export type SessionStatus = "active" | "expired" | "submitted" | "approved" | "corrections_requested"

export interface AuditLogEntry {
  id: string
  fechaHora: string
  usuario: string
  accion: string
  resultado: string
}

// ==========================================
// 2. CONFIGURACIÓN COMERCIAL INTERNA SAC (RN-080)
// ==========================================
export interface CommercialConfig {
  unidadNegocio: string // Obligatorio desde el inicio (Adyuvantes, Industrial DJP, etc.)
  tipoCliente?: string
  organizacionVentas: string
  canalDistribucion: string
  division: string
  oficinaVentas: string
  grupoVendedores: string
  condicionesPago: string
  incoterms: string
  lugarEntrega: string
  moneda: string
  usoCFDI: string
  clasificacionIVA: string
  clasificacionIEPS: string
}

// ==========================================
// 3. LA SESIÓN COMO ENTIDAD PRINCIPAL (RN-083)
// ==========================================
export interface MagicLinkSession {
  sessionId: string 
  workflow: SessionWorkflow // Determina qué ve el cliente
  crmProspectId?: string 
  token: string
  clienteExisteEnCRM: boolean 
  configComercial: CommercialConfig 
  fechaCreacion: string
  fechaExpiracion: string
  reactivacionesCount: number
  status: SessionStatus
  ultimoAvance: OnboardingFormValues // Conserva todo el avance (RN-086)
  documentosTemporales: Record<string, { nombreArchivo: string; urlTemp: string; estatus: "ok" | "rechazado" }>
  auditLogs: AuditLogEntry[]
}

// ==========================================
// 4. ESTRUCTURA DEL FORMULARIO DEL CLIENTE
// ==========================================
export interface CompanyData {
  razonSocial: string
  rfc: string
  regimenFiscal: string
  giroComercial: string
}

export interface AddressData {
  calle: string
  numeroExterior: string
  numeroInterior?: string
  colonia: string
  codigoPostal: string
  estado: string
  municipio: string
}

export interface DeliveryAddressData {
  id: string
  nombrePlanta: string
  contactoRecepcion: string
  telefonoRecepcion: string
  calle: string
  numeroExterior: string
  colonia: string
  codigoPostal: string
  estado: string
  municipio: string
  comprobanteDomicilioUrl?: string
  horarioRecepcion?: string
}

export interface LegalContactData {
  nombreRepresentante: string
  correoContacto: string
  telefonoContacto: string
}

export interface BillingData {
  metodoPago: string
  formaPago: string
  banco: string
  cuenta4Digitos: string
  correoFacturas: string
}

export interface OnboardingFormValues {
  empresa: CompanyData
  direccionFiscal: AddressData
  direccionesEntrega: DeliveryAddressData[]
  contacto: LegalContactData
  facturacion: BillingData
}