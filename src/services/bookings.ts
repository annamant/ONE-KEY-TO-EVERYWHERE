import { api } from './apiClient'
import type { Booking, BookingStatus } from '@/types'

export const bookingService = {
  getById: (id: string) =>
    api.get<Booking>(`/bookings/${id}`).catch(() => null as unknown as Booking),

  listForUser: (_userId?: string) =>
    api.get<Booking[]>('/bookings'),

  listForProperty: (propertyId: string) =>
    api.get<Booking[]>(`/bookings/property/${propertyId}`),

  adminList: (filters?: { status?: BookingStatus; memberId?: string; propertyId?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status)     params.set('status', filters.status)
    if (filters?.memberId)   params.set('memberId', filters.memberId)
    if (filters?.propertyId) params.set('propertyId', filters.propertyId)
    const qs = params.toString()
    return api.get<Booking[]>(`/bookings/admin${qs ? `?${qs}` : ''}`)
  },

  create: (params: { memberId: string; propertyId: string; checkIn: string; checkOut: string; guests: number; householdId?: string }) =>
    api.post<Booking>('/bookings', params),

  cancel: (id: string, reason?: string) =>
    api.post<Booking>(`/bookings/${id}/cancel`, { reason }),
}
