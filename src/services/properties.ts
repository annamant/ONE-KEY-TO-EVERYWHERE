import { api } from './apiClient'
import type { Property, PropertyStatus, SearchFilters } from '@/types'

export const propertyService = {
  list: (filters?: SearchFilters) => {
    const params = new URLSearchParams()
    if (filters?.region)                  params.set('region', filters.region)
    if (filters?.sleeps)                  params.set('sleeps', String(filters.sleeps))
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

  uploadImages: (id: string, files: File[]) => {
    const form = new FormData()
    for (const file of files) form.append('images', file)
    return api.postForm<Property>(`/properties/${id}/images`, form)
  },

  removeImage: (id: string, url: string) =>
    api.delete<Property>(`/properties/${id}/images`, { url }),

  uploadTempImages: (files: File[]) => {
    const form = new FormData()
    for (const file of files) form.append('images', file)
    return api.postForm<{ urls: string[] }>('/uploads/images', form)
  },

  setStatus: (id: string, status: PropertyStatus, reason?: string) =>
    api.post<Property>(`/properties/${id}/status`, { status, reason }),

  setBlackouts: (id: string, dates: string[]) =>
    api.patch<Property>(`/properties/${id}/blackouts`, { dates }),
}
