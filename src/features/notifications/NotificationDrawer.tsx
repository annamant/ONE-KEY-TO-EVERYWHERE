import { useNavigate } from 'react-router-dom'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import {
  BellIcon,
  KeyIcon,
  HomeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid'
import { useNotifications } from '@/contexts/NotificationContext'
import { formatRelative } from '@/utils/format'
import { cn } from '@/utils/classNames'
import { Button } from '@/components/ui/Button'
import type { NotificationType } from '@/types'

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
}

const typeIcon: Record<NotificationType, React.ElementType> = {
  booking_confirmed: CalendarDaysIcon,
  booking_cancelled: CalendarDaysIcon,
  booking_modified: CalendarDaysIcon,
  keys_credited: KeyIcon,
  keys_debited: KeyIcon,
  household_invite: UserGroupIcon,
  property_approved: HomeIcon,
  property_rejected: HomeIcon,
  payout_processed: KeyIcon,
  admin_alert: ExclamationTriangleIcon,
  reservation_received: CalendarDaysIcon,
}

const typeColor: Record<NotificationType, string> = {
  booking_confirmed: 'bg-blue-50 text-blue-600',
  booking_cancelled: 'bg-danger-light text-danger',
  booking_modified: 'bg-okte-gold-50 text-okte-gold-600',
  keys_credited: 'bg-success-light text-success',
  keys_debited: 'bg-okte-gold-50 text-okte-gold-600',
  household_invite: 'bg-purple-50 text-purple-600',
  property_approved: 'bg-success-light text-success',
  property_rejected: 'bg-danger-light text-danger',
  payout_processed: 'bg-success-light text-success',
  admin_alert: 'bg-warning-light text-warning',
  reservation_received: 'bg-blue-50 text-blue-600',
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const { notifications, markRead, markAllRead } = useNotifications()
  const navigate = useNavigate()

  const handleClick = async (notifId: string, link?: string) => {
    await markRead(notifId)
    if (link) {
      navigate(link)
      onClose()
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40" onClick={onClose} />
      )}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-80 bg-surface shadow-modal z-50 flex flex-col transition-transform duration-200',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h2 className="text-heading-md text-text-primary">Notifications</h2>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={markAllRead}
                className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-okte-slate-100 transition-colors"
                title="Mark all as read"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-okte-slate-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-okte-slate-100 flex items-center justify-center mb-3">
                <BellIcon className="w-6 h-6 text-text-muted" />
              </div>
              <p className="text-body-sm text-text-muted">No notifications yet</p>
            </div>
          ) : (
            <ul>
              {notifications.map((n) => {
                const Icon = typeIcon[n.type] ?? BellIcon
                const iconStyle = typeColor[n.type] ?? 'bg-okte-slate-100 text-text-muted'
                return (
                  <li
                    key={n.id}
                    onClick={() => handleClick(n.id, n.link)}
                    className={cn(
                      'flex gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-okte-slate-50 transition-colors',
                      !n.read && 'bg-okte-navy-50/30'
                    )}
                  >
                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', iconStyle)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-body-sm font-medium', n.read ? 'text-text-muted' : 'text-text-primary')}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-caption text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-caption text-text-subtle mt-1">{formatRelative(n.createdAt)}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
