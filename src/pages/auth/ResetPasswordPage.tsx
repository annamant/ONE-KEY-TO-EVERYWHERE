import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { api, ApiError } from '@/services/apiClient'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => navigate('/auth/login', { replace: true }), 2000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reset failed')
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
          <h1 className="text-heading-xl text-text-primary font-semibold">Choose a new password</h1>
          <p className="text-body-sm text-text-muted mt-1">Enter your new password below</p>
        </div>

        <div className="bg-surface rounded-card shadow-card p-6">
          {done ? (
            <div className="text-center py-4">
              <CheckCircleIcon className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-heading-md text-text-primary mb-2">Password updated</h3>
              <p className="text-body-sm text-text-muted mb-4">
                Your password has been changed. Redirecting to sign in…
              </p>
              <Link to="/auth/login" className="text-primary text-body-sm hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center py-4">
              <div className="px-4 py-3 bg-danger-light text-danger text-body-sm rounded-lg mb-4">
                This reset link is missing a token.
              </div>
              <Link to="/auth/forgot-password" className="text-primary text-body-sm hover:underline">
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 bg-danger-light text-danger text-body-sm rounded-lg">
                  {error}
                </div>
              )}
              <FormField label="New password" htmlFor="password" required>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                />
              </FormField>
              <FormField label="Confirm password" htmlFor="confirm" required>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </FormField>
              <Button type="submit" fullWidth loading={loading}>
                Reset password
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-body-sm text-text-muted mt-6">
          <Link to="/auth/login" className="text-primary hover:underline">← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
