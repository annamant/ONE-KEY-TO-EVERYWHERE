import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const POLL_INTERVAL_MS = 15_000

export function PendingApprovalPage() {
  const { currentUser, logout, refreshCurrentUser } = useAuth()
  const navigate = useNavigate()
  const [justApproved, setJustApproved] = useState(false)

  // Poll /api/auth/me so the UI updates within seconds of an admin approving.
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = await refreshCurrentUser()
      if (user?.role === 'member' && user.status === 'active') {
        setJustApproved(true)
        clearInterval(interval)
        setTimeout(() => navigate('/member/dashboard', { replace: true }), 1500)
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refreshCurrentUser, navigate])

  return (
    <div className="page-content max-w-lg mx-auto py-16">
      <Card className="text-center p-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: justApproved ? '#E8F5E9' : '#F5F0E8' }}
        >
          {justApproved ? (
            <CheckCircleIcon className="w-7 h-7" style={{ color: '#2E7D32' }} />
          ) : (
            <ClockIcon className="w-7 h-7" style={{ color: '#C4882F' }} />
          )}
        </div>
        <h1 className="text-heading-xl font-semibold text-text-primary mb-2">
          {justApproved ? 'You’re in!' : 'Membership under review'}
        </h1>
        <p className="text-body-sm text-text-muted mb-6 leading-relaxed">
          {justApproved ? (
            <>Your membership has been approved. Taking you to your dashboard…</>
          ) : (
            <>
              Thanks{currentUser?.firstName ? `, ${currentUser.firstName}` : ''}. Your application is with the Club.
              Club homes in Ostuni become visible only after we approve your membership.
            </>
          )}
        </p>
        {!justApproved && (
          <>
            <p className="text-caption text-text-muted mb-8">
              We’ll email you when you’re in. This page refreshes automatically — no need to do anything else.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/member/profile')}>
                Edit profile
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
              >
                Sign out
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
