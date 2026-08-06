// ==========================================
// 1. ESTADO, WORKFLOW Y AUDITORÍA DE SESIÓN (RN-077 a RN-089)
// ==========================================
export type SessionWorkflow = "lead" | "onboarding" // RN-081
export type SessionStatus = "active" | "expired" | "submitted" | "approved" | "corrections_requested" | "completed_by_client"

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
export interface TaxConfig {
  iva: string
  ieps: string
}

export interface CommercialConfig {
  // Datos Generales heredados por área
  unidadNegocio: string
  tipoCliente?: string
  impuestos?: TaxConfig
  
  // Datos específicos del área de ventas (SAP) - Opcionales para los Leads
  organizacionVentas?: string
  canalDistribucion?: string
  division?: string
  oficinaVentas?: string
  grupoVendedores?: string
  condicionesPago?: string
  incoterms?: string
  lugarEntrega?: string
  moneda?: string
  prioridadEntrega?: string
  grupoClientes?: string
}

// ==========================================
// 3. LA SESIÓN COMO ENTIDAD PRINCIPAL (RN-083)
// ==========================================
export interface MagicLinkSession {
  sessionId: string 
  workflow: SessionWorkflow 
  crmProspectId?: string 
  token: string
  clienteExisteEnCRM: boolean 
  configComercial: CommercialConfig[] // AHORA ES UN ARREGLO (Múltiples Áreas de Venta)
  fechaCreacion: string
  fechaExpiracion: string
  reactivacionesCount: number
  status: SessionStatus
  ultimoAvance: OnboardingFormValues 
  propietario?: string // NUEVO: Ejecutivo responsable
  documentosTemporales?: Record<string, { nombreArchivo: string; urlTemp: string; estatus: "ok" | "rechazado" }>
  auditLogs: AuditLogEntry[]
}

// ==========================================
// 4. ESTRUCTURA DEL FORMULARIO DEL CLIENTE
// ==========================================
export interface CompanyData {
  razonSocial: string
  rfc: string
  regimenFiscal: string
  usoCFDI?: string 
  giroComercial?: string // Añadido como opcional para no romper la vista SAC
}

// ESTRUCTURA ACTUALIZADA: Basada en Constancia de Situación Fiscal (SAT)
export interface AddressData {
  codigoPostal: string
  tipoVialidad: string
  calle: string         // Equivale a "Nombre de Vialidad"
  numeroExterior: string
  numeroInterior?: string
  colonia: string
  localidad?: string
  municipio: string     // Equivale a "Municipio o Demarcación Territorial"
  estado: string        // Equivale a "Entidad Federativa"
  entreCalle?: string
  yCalle?: string
}

export interface DeliveryAddressData {
  id?: string
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
  validada?: boolean // NUEVO: Estatus de validación por parte de SAC
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
  documentosTemporales?: Record<string, string> // NUEVO: Guarda las URLs de los PDFs subidos a Supabase
}