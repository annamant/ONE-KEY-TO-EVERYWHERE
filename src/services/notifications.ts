import { api } from './apiClient'
import type { Notification } from '@/types'

export const notificationService = {
  list: (_userId?: string) =>
    api.get<Notification[]>('/notifications'),

  markRead: (_userId: string | undefined, id: string) =>
    api.patch<void>(`/notifications/${id}/read`),

  markAllRead: (_userId?: string) =>
    api.patch<void>('/notifications/read-all'),

  push: (_userId: string, _data: unknown): never => {
    throw new Error('push is backend-only')
  },

  getUnreadCount: (_userId?: string): number => {
    throw new Error('Use NotificationContext state')
  },
}
