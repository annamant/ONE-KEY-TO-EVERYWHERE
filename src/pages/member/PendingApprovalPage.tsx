import { useNavigate } from 'react-router-dom'
import { ClockIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function PendingApprovalPage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="page-content max-w-lg mx-auto py-16">
      <Card className="text-center p-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: '#F5F0E8' }}
        >
          <ClockIcon className="w-7 h-7" style={{ color: '#C4882F' }} />
        </div>
        <h1 className="text-heading-xl font-semibold text-text-primary mb-2">
          Membership under review
        </h1>
        <p className="text-body-sm text-text-muted mb-6 leading-relaxed">
          Thanks{currentUser?.firstName ? `, ${currentUser.firstName}` : ''}. Your application is with the Club.
          Club homes in Ostuni become visible only after we approve your membership.
        </p>
        <p className="text-caption text-text-muted mb-8">
          We’ll email you when you’re in. No need to do anything else for now.
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
      </Card>
    </div>
  )
}
