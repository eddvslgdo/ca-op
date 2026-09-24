export type OnboardingStatus =
  | 'active'
  | 'expired'
  | 'completed_by_client'
  | 'under_review'
  | 'corrections_requested'
  | 'approved'
  | 'integration_pending'
  | 'integration_failed'
  | 'integrated'
  | 'closed'
  | 'cancelled'

export type WorkflowType = 'lead' | 'onboarding'

export interface SessionReference {
  id: string
  leadId?: string
  crmProspectId?: string
  workflow: WorkflowType
  status: OnboardingStatus
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export const allowedSessionTransitions: Record<OnboardingStatus, OnboardingStatus[]> = {
  active: ['expired', 'completed_by_client', 'cancelled'],
  expired: ['active', 'cancelled'],
  completed_by_client: ['under_review', 'cancelled'],
  under_review: ['corrections_requested', 'approved', 'cancelled'],
  corrections_requested: ['active', 'cancelled'],
  approved: ['integration_pending', 'cancelled'],
  integration_pending: ['integration_failed', 'integrated'],
  integration_failed: ['integration_pending', 'cancelled'],
  integrated: ['closed'],
  closed: [],
  cancelled: [],
}

export function canTransitionSession(
  current: OnboardingStatus,
  next: OnboardingStatus,
): boolean {
  return allowedSessionTransitions[current].includes(next)
}
