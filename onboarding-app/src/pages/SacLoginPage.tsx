import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { Building2, Loader2, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { env } from '@/config/env'

interface SacLoginPageProps {
  session: Session | null
}

export function SacLoginPage({ session }: SacLoginPageProps) {
  const [email, setEmail] = useState(env.isLocal ? 'sac.local@ca-op.test' : '')
  const [password, setPassword] = useState(env.isLocal ? 'CaOp-Local-2026!' : '')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (session) return <Navigate to="/" replace />

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErrorMessage('No fue posible iniciar sesión. Verifica tus credenciales.')
    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm border-slate-800 shadow-2xl">
        <CardHeader className="space-y-3">
          <div className="h-11 w-11 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Acceso interno SAC</CardTitle>
            <CardDescription>El workspace requiere una cuenta interna autorizada.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="sac-email">Correo</Label>
              <Input id="sac-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sac-password">Contraseña</Label>
              <Input id="sac-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {errorMessage && <p className="text-sm text-red-600" role="alert">{errorMessage}</p>}
            <Button disabled={isSubmitting} className="w-full bg-indigo-600 text-white gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
              Ingresar
            </Button>
          </form>
          {env.isLocal && <p className="mt-4 text-[11px] text-slate-500">Credenciales precargadas únicamente para el entorno local.</p>}
        </CardContent>
      </Card>
    </main>
  )
}
