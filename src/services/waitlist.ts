import { api } from './apiClient'
import type { User } from '@/types'
import type { PackagePurchaseRequest } from './packages'

export type OwnerWaitlistEntry = {
  id: string
  firstName: string
  lastName: string | null
  email: string
  phone: string | null
  city: string
  propertyType: string | null
  message: string | null
  status: 'pending' | 'contacted' | 'approved' | 'rejected'
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

export type MemberWaitlistEntry = {
  id: string
  firstName: string
  email: string
  status: 'pending' | 'contacted' | 'invited' | 'rejected'
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

export type AdminRequestsSummary = {
  pendingMembers: User[]
  ownerWaitlist: OwnerWaitlistEntry[]
  memberWaitlist: MemberWaitlistEntry[]
  packageRequests: PackagePurchaseRequest[]
  counts: {
    pendingMembers: number
    ownerWaitlist: number
    memberWaitlist: number
    packageRequests: number
    total: number
  }
}

export const waitlistService = {
  submitOwner: (data: {
    firstName: string
    lastName?: string
    email: string
    phone?: string
    city: string
    propertyType?: string
    message?: string
  }) => api.post<OwnerWaitlistEntry>('/waitlist/owner', data),

  submitMember: (data: { firstName: string; email: string }) =>
    api.post<MemberWaitlistEntry>('/waitlist/member', data),
}

export const adminRequestsService = {
  list: () => api.get<AdminRequestsSummary>('/admin/requests'),

  updateOwnerWaitlist: (id: string, patch: { status?: string; adminNotes?: string }) =>
    api.patch<OwnerWaitlistEntry>(`/admin/owner-waitlist/${id}`, patch),

  updateMemberWaitlist: (id: string, patch: { status?: string; adminNotes?: string }) =>
    api.patch<MemberWaitlistEntry>(`/admin/member-waitlist/${id}`, patch),

  approveMember: (id: string) => api.post<User>(`/admin/members/${id}/approve`),

  fulfillPackageRequest: (id: string, note?: string) =>
    api.post<PackagePurchaseRequest>(`/ledger/admin/package-requests/${id}/fulfill`, { note }),

  rejectPackageRequest: (id: string, note?: string) =>
    api.post<PackagePurchaseRequest>(`/ledger/admin/package-requests/${id}/reject`, { note }),
}
