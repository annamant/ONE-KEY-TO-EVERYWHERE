import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { ApiError } from '@/services/apiClient'

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
  const [suspended, setSuspended] = useState(false)

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
    setSuspended(false)
    try {
      const user = await login(email, password)
      toast('Welcome back!', 'success')
      if (user.role === 'member' && user.status === 'pending_verification' && !from?.includes('/household/invite/')) {
        navigate('/member/pending', { replace: true })
        return
      }
      const redirect = from ?? `/${user.role}/dashboard`
      navigate(redirect, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setSuspended(true)
      } else {
        setErrors({ form: err instanceof Error ? err.message : 'Login failed' })
      }
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
          {suspended ? (
            <div className="text-center py-6">
              <div className="px-4 py-3 bg-danger-light text-danger text-body-sm rounded-lg mb-4">
                Your account has been suspended.
              </div>
              <p className="text-body-sm text-text-muted mb-4">
                Please contact the Club team if you believe this is an error.
              </p>
              <Button variant="outline" fullWidth onClick={() => { setSuspended(false); setEmail(''); setPassword('') }}>
                Back to sign in
              </Button>
            </div>
          ) : (
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
                  placeholder="you@example.com"
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
          )}
        </div>

        {!suspended && (
          <p className="text-center text-body-sm text-text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
