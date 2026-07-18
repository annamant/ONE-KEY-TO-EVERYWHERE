import { api } from './apiClient'

export type PlatformSettings = {
  platformName?: string
  supportEmail?: string
  defaultTier?: string
  maxKeys?: string
  minKeys?: string
  reviewDays?: string
  cancellationWindow?: string
  maintenanceMode?: string
}

export const settingsService = {
  get: () => api.get<PlatformSettings>('/admin/settings'),
  update: (patch: PlatformSettings) => api.put<{ ok: boolean }>('/admin/settings', patch),
}
