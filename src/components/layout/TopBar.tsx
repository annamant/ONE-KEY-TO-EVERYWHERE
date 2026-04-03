import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import { cn } from '@/utils/classNames'

interface TopBarProps {
  onMenuClick?: () => void
  title?: string
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const portalLabel = {
    member: 'Member Portal',
    owner: 'Owner Portal',
    admin: 'Admin Console',
  }

  return (
    <header className="h-topbar flex items-center justify-between px-4 lg:px-6 bg-surface border-b border-border shadow-topbar flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-okte-slate-100 transition-colors lg:hidden"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        )}
        {title && (
          <h1 className="text-heading-md text-text-primary font-semibold hidden sm:block">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />

        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-okte-slate-100 transition-colors"
            >
              <Avatar
                src={currentUser.avatarUrl}
                name={`${currentUser.firstName} ${currentUser.lastName}`}
                size="sm"
              />
              <div className="hidden sm:block text-left">
                <p className="text-body-sm font-medium text-text-primary leading-none">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-caption text-text-muted">
                  {portalLabel[currentUser.role]}
                </p>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-text-muted hidden sm:block" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-52 bg-surface rounded-xl shadow-modal border border-border z-20 py-1 animate-slide-up">
                  <div className="px-4 py-2.5 border-b border-border">
                    <p className="text-body-sm font-medium text-text-primary truncate">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-caption text-text-muted truncate">{currentUser.email}</p>
                  </div>
                  <Link
                    to={`/${currentUser.role}/profile`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-text-primary hover:bg-okte-slate-50 transition-colors"
                  >
                    <UserCircleIcon className="w-4 h-4 text-text-muted" />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-body-sm text-danger hover:bg-danger-light transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
