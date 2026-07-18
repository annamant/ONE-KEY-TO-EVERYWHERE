import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { mockHouseholds } from '@/services'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'

const REASON_MESSAGES: Record<string, string> = {
  not_found: 'This invite link is invalid or no longer exists.',
  used: 'This invite has already been used.',
  expired: 'This invite link has expired. Ask the household manager to send a new one.',
}

export function HouseholdInvitePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [householdName, setHouseholdName] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('This invite link is invalid.')
      setLoading(false)
      return
    }

    let cancelled = false
    mockHouseholds.previewInvite(token)
      .then((preview) => {
        if (cancelled) return
        if (!preview.valid) {
          setError(REASON_MESSAGES[preview.reason ?? 'not_found'] ?? 'This invite link is invalid.')
          return
        }
        setHouseholdName(preview.householdName ?? 'a household')
        setRole(preview.role ?? 'Member')
      })
      .catch(() => {
        if (!cancelled) setError('Could not verify this invite link. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [token])

  const handleAccept = async () => {
    if (!currentUser || !token) return
    setAccepting(true)
    setError('')
    try {
      await mockHouseholds.acceptInvite(token, currentUser.id)
      setAccepted(true)
      toast('You joined the household!', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-alt">
        <PageSpinner />
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center">
          <h2 className="text-heading-md text-text-primary mb-2">Sign in required</h2>
          <p className="text-body-sm text-text-muted mb-4">
            {error
              ? error
              : `Sign in to accept your invitation${householdName ? ` to ${householdName}` : ''}.`}
          </p>
          {!error ? (
            <Button onClick={() => navigate('/auth/login', { state: { from: { pathname: location.pathname } } })} fullWidth>
              Sign In
            </Button>
          ) : (
            <Button fullWidth onClick={() => navigate('/')}>Go to Home</Button>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-alt">
      <Card className="max-w-sm w-full text-center">
        {accepted ? (
          <>
            <CheckCircleIcon className="w-14 h-14 text-success mx-auto mb-4" />
            <h2 className="text-heading-lg text-text-primary font-semibold mb-2">Welcome to the household!</h2>
            <p className="text-body-sm text-text-muted mb-6">You can now see and participate in household bookings.</p>
            <Button fullWidth onClick={() => navigate('/member/household')}>View Household</Button>
          </>
        ) : error ? (
          <>
            <XCircleIcon className="w-14 h-14 text-danger mx-auto mb-4" />
            <h2 className="text-heading-lg text-text-primary font-semibold mb-2">Invite not valid</h2>
            <p className="text-body-sm text-text-muted mb-6">{error}</p>
            <Button fullWidth onClick={() => navigate('/member/dashboard')}>Go to Dashboard</Button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-okte-navy-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏡</span>
            </div>
            <h2 className="text-heading-lg text-text-primary font-semibold mb-2">You're invited!</h2>
            <p className="text-body-sm text-text-muted mb-6">
              You've been invited to join <strong>{householdName}</strong> as {role} on One Key to Everywhere.
            </p>
            <Button fullWidth loading={accepting} onClick={handleAccept}>
              Accept Invitation
            </Button>
            <Button variant="ghost" fullWidth className="mt-2" onClick={() => navigate('/member/dashboard')}>
              Decline
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}
