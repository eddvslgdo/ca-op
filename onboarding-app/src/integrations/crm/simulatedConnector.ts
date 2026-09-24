import type {
  CrmConnector,
  CrmIntegrationResult,
  CustomerOnboardingPayloadV1,
  IntegrationEnvelopeV1,
  LeadPayloadV1,
} from './contracts'

function simulatedResult(correlationId: string): CrmIntegrationResult {
  return {
    status: 'pending_configuration',
    correlationId,
    errorCode: 'CRM_NOT_CONFIGURED',
    errorMessage: 'La integración CRM aún no ha sido definida por TI.',
  }
}

export const simulatedCrmConnector: CrmConnector = {
  async createProspect(
    envelope: IntegrationEnvelopeV1<LeadPayloadV1>,
  ): Promise<CrmIntegrationResult> {
    return simulatedResult(envelope.correlationId)
  },

  async updateProspect(
    envelope: IntegrationEnvelopeV1<CustomerOnboardingPayloadV1>,
  ): Promise<CrmIntegrationResult> {
    return simulatedResult(envelope.correlationId)
  },
}
