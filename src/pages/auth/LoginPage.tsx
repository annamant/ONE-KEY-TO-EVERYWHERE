import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { Divider } from '@/components/ui/Divider'

export function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    setErrors({})
    try {
      const user = await login(email, password)
      toast('Welcome back!', 'success')
      const redirect = from ?? `/${user.role}/dashboard`
      navigate(redirect, { replace: true })
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-okte-navy-900 flex items-center justify-center mx-auto mb-4">
            <span className="text-accent font-bold text-heading-md">K</span>
          </div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Welcome back</h1>
          <p className="text-body-sm text-text-muted mt-1">Sign in to your account</p>
        </div>

        <div className="bg-surface rounded-card shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="px-4 py-3 bg-danger-light text-danger text-body-sm rounded-lg">
                {errors.form}
              </div>
            )}

            <FormField label="Email" htmlFor="email" error={errors.email} required>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@demo.com"
                autoComplete="email"
                error={errors.email}
              />
            </FormField>

            <FormField label="Password" htmlFor="password" error={errors.password} required>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password}
              />
            </FormField>

            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-body-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>

          <Divider className="my-5" label="Demo credentials" />

          <div className="space-y-2 text-caption text-text-muted">
            <p className="text-center font-medium text-body-sm text-text-primary mb-2">Quick access</p>
            {[
              { email: 'alice@demo.com', role: 'Member' },
              { email: 'carol@demo.com', role: 'Owner' },
              { email: 'eve@demo.com', role: 'Admin' },
            ].map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => { setEmail(demo.email); setPassword('demo') }}
                className="w-full flex items-center justify-between px-3 py-2 bg-okte-slate-50 hover:bg-okte-slate-100 rounded-lg transition-colors text-left"
              >
                <span className="text-body-sm text-text-primary">{demo.email}</span>
                <span className="text-caption text-text-muted bg-okte-slate-200 px-2 py-0.5 rounded-pill">{demo.role}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-body-sm text-text-muted mt-6">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
