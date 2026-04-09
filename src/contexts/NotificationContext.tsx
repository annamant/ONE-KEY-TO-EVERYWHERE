import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { Notification } from '@/types'
import { mockNotifications } from '@/services'
import { useAuth } from './AuthContext'

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    if (!currentUser) return
    setLoading(true)
    mockNotifications.list(currentUser.id).then((notifs) => {
      setNotifications(notifs)
      setLoading(false)
    })
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      refresh()
    } else {
      setNotifications([])
    }
  }, [currentUser, refresh])

  const markRead = useCallback(
    async (id: string) => {
      if (!currentUser) return
      await mockNotifications.markRead(currentUser.id, id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    },
    [currentUser]
  )

  const markAllRead = useCallback(async () => {
    if (!currentUser) return
    await mockNotifications.markAllRead(currentUser.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [currentUser])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, markRead, markAllRead, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
