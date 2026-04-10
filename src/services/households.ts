import { api } from './apiClient'
import type { Household, HouseholdMemberRole, HouseholdAuditEntry } from '@/types'

export const householdService = {
  getForUser: (_userId?: string) =>
    api.get<Household>('/households/mine').catch(() => null as unknown as Household),

  getById: (id: string) =>
    api.get<Household>(`/households/${id}`).catch(() => null as unknown as Household),

  create: (_managerId: string, name: string) =>
    api.post<Household>('/households', { name }),

  invite: (householdId: string, email: string, role: HouseholdMemberRole) =>
    api.post<{ token: string; inviteUrl: string }>(`/households/${householdId}/invite`, { email, role })
      .then((r) => r.token),

  acceptInvite: (token: string, _userId?: string) =>
    api.post<Household>('/households/accept-invite', { token }),

  removeMember: (householdId: string, memberId: string, _actorId?: string) =>
    api.delete<void>(`/households/${householdId}/members/${memberId}`),

  changeRole: (householdId: string, memberId: string, role: HouseholdMemberRole, _actorId?: string) =>
    api.patch<void>(`/households/${householdId}/members/${memberId}/role`, { role }),

  getAuditLog: (householdId: string) =>
    api.get<HouseholdAuditEntry[]>(`/households/${householdId}/audit`),
}
