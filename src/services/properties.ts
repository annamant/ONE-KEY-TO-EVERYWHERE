import { api } from './apiClient'
import type { Property, PropertyStatus, SearchFilters } from '@/types'

export const propertyService = {
  list: (filters?: SearchFilters) => {
    const params = new URLSearchParams()
    if (filters?.region)                  params.set('region', filters.region)
    if (filters?.sleeps)                  params.set('sleeps', String(filters.sleeps))
    if (filters?.maxKeys)                 params.set('maxKeys', String(filters.maxKeys))
    if (filters?.minKeys)                 params.set('minKeys', String(filters.minKeys))
    if (filters?.query)                   params.set('query', filters.query)
    if (filters?.amenities?.length)       params.set('amenities', filters.amenities!.join(','))
    if (filters?.checkIn)                 params.set('checkIn', filters.checkIn)
    if (filters?.checkOut)                params.set('checkOut', filters.checkOut)
    const qs = params.toString()
    return api.get<Property[]>(`/properties${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) =>
    api.get<Property>(`/properties/${id}`).catch(() => null as unknown as Property),

  listByOwner: (_ownerId?: string) =>
    api.get<Property[]>('/properties/owner'),

  adminList: (filters?: { status?: PropertyStatus }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.set('status', filters.status)
    const qs = params.toString()
    return api.get<Property[]>(`/properties/admin${qs ? `?${qs}` : ''}`)
  },

  create: (_ownerId: string, data: Omit<Property, 'id' | 'ownerId' | 'status' | 'listingQualityScore' | 'totalBookings' | 'createdAt' | 'updatedAt'>) =>
    api.post<Property>('/properties', data),

  update: (id: string, patch: Partial<Property>) =>
    api.patch<Property>(`/properties/${id}`, patch),

  setStatus: (id: string, status: PropertyStatus, _adminNote?: string) =>
    api.post<Property>(`/properties/${id}/status`, { status }),

  setBlackouts: (id: string, dates: string[]) =>
    api.patch<Property>(`/properties/${id}/blackouts`, { dates }),
}
