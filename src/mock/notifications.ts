import type { Notification, NotificationType } from '@/types'
import { db, delay, generateId } from './db'

const mockNotifications = {
  async list(userId: string): Promise<Notification[]> {
    await delay()
    return (db.notifications[userId] ?? []).slice().reverse()
  },

  async markRead(userId: string, notifId: string): Promise<void> {
    await delay()
    const notifs = db.notifications[userId] ?? []
    const n = notifs.find((n) => n.id === notifId)
    if (n) n.read = true
  },

  async markAllRead(userId: string): Promise<void> {
    await delay()
    const notifs = db.notifications[userId] ?? []
    notifs.forEach((n) => (n.read = true))
  },

  async push(
    userId: string,
    data: { type: NotificationType; title: string; body: string; link?: string }
  ): Promise<Notification> {
    const notif: Notification = {
      id: generateId('notif'),
      userId,
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    }
    if (!db.notifications[userId]) db.notifications[userId] = []
    db.notifications[userId].push(notif)
    return notif
  },

  getUnreadCount(userId: string): number {
    return (db.notifications[userId] ?? []).filter((n) => !n.read).length
  },
}

export default mockNotifications
export { mockNotifications }
