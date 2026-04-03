import { useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { useNotifications } from '@/contexts/NotificationContext'
import { NotificationDrawer } from './NotificationDrawer'
import { cn } from '@/utils/classNames'

export function NotificationBell() {
  const { unreadCount } = useNotifications()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-okte-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-pill bg-danger text-white text-[10px] font-bold flex items-center justify-center'
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <NotificationDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
