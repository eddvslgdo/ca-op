export type AppEnvironment = 'local' | 'development' | 'production'
export type IntegrationMode = 'simulated' | 'disabled' | 'live'

const appEnvironment = (import.meta.env.VITE_APP_ENV || 'local') as AppEnvironment
const crmMode = (import.meta.env.VITE_CRM_MODE || 'disabled') as IntegrationMode
const emailMode = (import.meta.env.VITE_EMAIL_MODE || 'console') as
  | 'console'
  | 'disabled'
  | 'live'

export const env = Object.freeze({
  appEnvironment,
  crmMode,
  emailMode,
  isProduction: appEnvironment === 'production',
  isLocal: appEnvironment === 'local',
})
