import { useNavigate } from 'react-router-dom'
import { HomeModernIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

export function RoleSelectPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  if (!currentUser) return null

  const showMember = currentUser.role === 'member' || currentUser.role === 'admin'
  const showOwner = currentUser.role === 'owner' || currentUser.role === 'admin'
  const showAdmin = currentUser.role === 'admin'

  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-heading-xl text-text-primary font-semibold mb-2">
          Welcome, {currentUser.firstName}!
        </h1>
        <p className="text-body-sm text-text-muted mb-8">
          You're signed in as a <strong>{currentUser.role}</strong>. Go to your dashboard.
        </p>
        <div className={`grid grid-cols-1 ${showMember && showOwner ? 'sm:grid-cols-2' : ''} gap-4 mb-6`}>
          {showMember && (
            <div className="bg-surface rounded-card shadow-card p-6 text-center">
              <UserGroupIcon className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="text-body-md font-semibold mb-2">Member Dashboard</h3>
              <p className="text-caption text-text-muted mb-4">Search & access every home in the Club</p>
              <Button fullWidth size="sm" onClick={() => navigate('/member/dashboard')}>
                Member Portal
              </Button>
            </div>
          )}
          {showOwner && (
            <div className="bg-surface rounded-card shadow-card p-6 text-center">
              <HomeModernIcon className="w-10 h-10 text-accent mx-auto mb-3" />
              <h3 className="text-body-md font-semibold mb-2">Owner Dashboard</h3>
              <p className="text-caption text-text-muted mb-4">List & manage your properties</p>
              <Button variant="secondary" fullWidth size="sm" onClick={() => navigate('/owner/dashboard')}>
                Owner Portal
              </Button>
            </div>
          )}
          {showAdmin && (
            <div className="bg-surface rounded-card shadow-card p-6 text-center sm:col-span-2">
              <ShieldCheckIcon className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="text-body-md font-semibold mb-2">Admin Console</h3>
              <p className="text-caption text-text-muted mb-4">Approve members, review listings, manage the Club</p>
              <Button fullWidth size="sm" onClick={() => navigate('/admin/dashboard')}>
                Admin Portal
              </Button>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/${currentUser.role}/dashboard`)}
        >
          Go to my dashboard →
        </Button>
      </div>
    </div>
  )
}
