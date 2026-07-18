import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { api, ApiError } from '@/services/apiClient'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

type Status = 'verifying' | 'success' | 'error' | 'missing-token'

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const { refreshCurrentUser, currentUser } = useAuth()

  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'missing-token')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('missing-token')
      return
    }
    let cancelled = false
    void (async () => {
      try {
        await api.post('/auth/verify-email', { token })
        if (cancelled) return
        // Refresh the cached session so emailVerified reflects the new state.
        await refreshCurrentUser()
        if (cancelled) return
        setStatus('success')
      } catch (e) {
        if (cancelled) return
        setError(e instanceof ApiError ? e.message : 'Verification failed')
        setStatus('error')
      }
    })()
    return () => { cancelled = true }
  }, [token, refreshCurrentUser])

  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-okte-navy-900 flex items-center justify-center mx-auto mb-4">
            <span className="text-accent font-bold text-heading-md">K</span>
          </div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Confirm your email</h1>
          <p className="text-body-sm text-text-muted mt-1">
            Verifying your One Key to Everywhere account
          </p>
        </div>

        <div className="bg-surface rounded-card shadow-card p-6">
          {status === 'verifying' && (
            <div className="text-center py-6">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-body-sm text-text-muted">Verifying…</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <CheckCircleIcon className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-heading-md text-text-primary mb-2">Email confirmed</h3>
              <p className="text-body-sm text-text-muted mb-4">
                Thanks{currentUser?.firstName ? `, ${currentUser.firstName}` : ''}. Your email is now verified.
                {currentUser?.status === 'pending_verification'
                  ? ' Your membership is still under review — we’ll email you once it’s approved.'
                  : ' Taking you to your dashboard…'}
              </p>
              <Button
                fullWidth
                onClick={() =>
                  navigate(currentUser?.status === 'active' ? '/member/dashboard' : '/member/pending', { replace: true })
                }
              >
                Continue
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-4">
              <ExclamationTriangleIcon className="w-12 h-12 text-danger mx-auto mb-3" />
              <h3 className="text-heading-md text-text-primary mb-2">We couldn’t verify your email</h3>
              <p className="text-body-sm text-text-muted mb-4">
                {error ?? 'The verification link is invalid or has expired.'}
              </p>
              <p className="text-body-sm text-text-muted mb-4">
                Sign in to request a fresh verification link.
              </p>
              <Link to="/auth/login" className="text-primary text-body-sm hover:underline">
                Back to sign in
              </Link>
            </div>
          )}

          {status === 'missing-token' && (
            <div className="text-center py-4">
              <ExclamationTriangleIcon className="w-12 h-12 text-danger mx-auto mb-3" />
              <h3 className="text-heading-md text-text-primary mb-2">Missing verification token</h3>
              <p className="text-body-sm text-text-muted mb-4">
                The link you followed doesn’t include a verification token. Please use the link from your email.
              </p>
              <Link to="/auth/login" className="text-primary text-body-sm hover:underline">
                Back to sign in
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-body-sm text-text-muted mt-6">
          <Link to="/auth/login" className="text-primary hover:underline">← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
