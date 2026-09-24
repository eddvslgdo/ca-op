import type {
  BillingProfile,
  DocumentReference,
  FiscalProfile,
  LeadContact,
} from '@/domain/customer/models'

export const CRM_CONTRACT_VERSION = '1.0' as const

export interface LeadPayloadV1 {
  externalLeadId: string
  legalName: string
  taxId: string
  contact: LeadContact
  commercialInterest: string
  ownerId?: string
  businessUnit?: string
}

export interface DeliveryAddressPayloadV1 {
  externalId: string
  name: string
  receptionContact: string
  receptionPhone: string
  street: string
  exteriorNumber: string
  neighborhood: string
  postalCode: string
  municipality: string
  state: string
  receptionHours?: string
}

export interface SalesAreaPayloadV1 {
  businessUnit: string
  customerType?: string
  salesOrganization?: string
  distributionChannel?: string
  division?: string
  salesOffice?: string
  sellerGroup?: string
  paymentTerms?: string
  incoterms?: string
  deliveryLocation?: string
  currency?: string
  deliveryPriority?: string
  customerGroup?: string
  vatClassification?: string
  exciseTaxClassification?: string
}

export interface CustomerOnboardingPayloadV1 {
  externalSessionId: string
  externalLeadId?: string
  crmProspectId: string
  fiscalProfile: FiscalProfile
  contact: LeadContact
  billing: BillingProfile
  deliveryAddresses: DeliveryAddressPayloadV1[]
  salesAreas: SalesAreaPayloadV1[]
  documents: Array<Pick<DocumentReference, 'id' | 'type' | 'corporateDocumentId'>>
  approvedAt: string
  approvedBy: string
}

export type CrmEventType = 'lead.ready' | 'customer.onboarding.approved'

export interface IntegrationEnvelopeV1<TPayload> {
  eventId: string
  eventType: CrmEventType
  schemaVersion: typeof CRM_CONTRACT_VERSION
  occurredAt: string
  correlationId: string
  idempotencyKey: string
  payload: TPayload
}

export interface CrmIntegrationResult {
  status: 'simulated' | 'pending_configuration' | 'confirmed' | 'failed'
  correlationId: string
  crmProspectId?: string
  crmCustomerId?: string
  errorCode?: string
  errorMessage?: string
}

export interface CrmConnector {
  createProspect(
    envelope: IntegrationEnvelopeV1<LeadPayloadV1>,
  ): Promise<CrmIntegrationResult>
  updateProspect(
    envelope: IntegrationEnvelopeV1<CustomerOnboardingPayloadV1>,
  ): Promise<CrmIntegrationResult>
}
