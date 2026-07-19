import { api } from './apiClient'
import type { GroupBand, PackageKind } from '@/types/membership'

export type PackageRequestStatus = 'pending' | 'fulfilled' | 'cancelled' | 'rejected'

export type PackagePurchaseRequest = {
  id: string
  userId: string
  kind: PackageKind
  groupBand: GroupBand
  weeks: number | null
  months: number | null
  units: number
  priceEur: number
  label: string
  status: PackageRequestStatus
  adminNote: string | null
  fulfilledBy: string | null
  fulfilledAt: string | null
  createdAt: string
  updatedAt: string
  member?: {
    email: string
    firstName: string
    lastName: string
    status: string
  }
}

export const packageService = {
  request: (data: { kind: PackageKind; groupBand: GroupBand; weeks?: number; months?: number }) =>
    api.post<PackagePurchaseRequest>('/ledger/package-requests', data),

  listMine: () => api.get<PackagePurchaseRequest[]>('/ledger/package-requests'),

  fulfill: (id: string, note?: string) =>
    api.post<PackagePurchaseRequest>(`/ledger/admin/package-requests/${id}/fulfill`, { note }),

  reject: (id: string, note?: string) =>
    api.post<PackagePurchaseRequest>(`/ledger/admin/package-requests/${id}/reject`, { note }),
}
