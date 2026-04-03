export type HouseholdMemberRole = 'Manager' | 'Booker' | 'Viewer'
export type HouseholdMemberStatus = 'active' | 'pending' | 'removed'

export interface HouseholdMember {
  userId: string
  householdId: string
  role: HouseholdMemberRole
  status: HouseholdMemberStatus
  joinedAt: string
}

export interface HouseholdInvite {
  id: string
  householdId: string
  email: string
  role: HouseholdMemberRole
  token: string
  expiresAt: string
  usedAt?: string
  createdAt: string
}

export interface Household {
  id: string
  name: string
  ownerId: string
  members: HouseholdMember[]
  invites: HouseholdInvite[]
  createdAt: string
}

export type AuditAction =
  | 'household_created'
  | 'member_invited'
  | 'member_joined'
  | 'member_removed'
  | 'role_changed'
  | 'booking_made'
  | 'booking_cancelled'

export interface HouseholdAuditEntry {
  id: string
  householdId: string
  actorId: string
  targetId?: string
  action: AuditAction
  detail: string
  createdAt: string
}
