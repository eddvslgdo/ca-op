import { supabase } from '@/lib/supabase'

export interface PublicLeadInput {
  legalName: string
  taxId: string
  contactName: string
  contactEmail: string
  contactPhone: string
  commercialInterest: string
}

export interface PublicLeadCreated {
  leadId: string
  sessionId: string
}

export async function createPublicLead(input: PublicLeadInput): Promise<PublicLeadCreated> {
  const { data, error } = await supabase.rpc('create_public_lead', {
    p_legal_name: input.legalName,
    p_tax_id: input.taxId,
    p_contact_name: input.contactName,
    p_contact_email: input.contactEmail,
    p_contact_phone: input.contactPhone,
    p_commercial_interest: input.commercialInterest,
  })

  if (error) throw error
  const created = data?.[0]
  if (!created) throw new Error('Supabase no devolvió la referencia del Lead creado.')

  return { leadId: created.lead_id, sessionId: created.session_id }
}
