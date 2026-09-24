export interface LeadContact {
  name: string
  email: string
  phone: string
}

export interface LeadRecord {
  id: string
  legalName: string
  taxId: string
  contact: LeadContact
  commercialInterest: string
  crmProspectId?: string
  createdAt: string
  updatedAt: string
}

export interface FiscalAddress {
  postalCode: string
  roadType: string
  street: string
  exteriorNumber: string
  interiorNumber?: string
  neighborhood: string
  locality?: string
  municipality: string
  state: string
  betweenStreet?: string
  andStreet?: string
}

export interface FiscalProfile {
  legalName: string
  taxId: string
  taxRegime: string
  cfdiUse?: string
  address: FiscalAddress
}

export interface BillingProfile {
  bankName: string
  bankAccountLast4: string
  paymentMethod: string
  paymentForm: string
  billingEmail: string
}

export interface DocumentReference {
  id: string
  type: 'tax_certificate' | 'address_proof' | 'legal_id' | 'other'
  fileName: string
  storagePath: string
  mimeType: string
  sizeBytes: number
  status: 'temporary' | 'transfer_pending' | 'transferred' | 'transfer_failed' | 'purged'
  corporateDocumentId?: string
}
