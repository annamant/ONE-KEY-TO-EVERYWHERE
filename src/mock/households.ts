import type {
  Household,
  HouseholdMember,
  HouseholdMemberRole,
  HouseholdInvite,
  HouseholdAuditEntry,
} from '@/types'
import { db, delay, generateId } from './db'
import { mockUsers } from './users'

const mockHouseholds = {
  async getForUser(userId: string): Promise<Household | null> {
    await delay()
    return (
      db.households.find(
        (h) => h.ownerId === userId || h.members.some((m) => m.userId === userId && m.status === 'active')
      ) ?? null
    )
  },

  async getById(id: string): Promise<Household | null> {
    await delay()
    return db.households.find((h) => h.id === id) ?? null
  },

  async create(ownerId: string, name: string): Promise<Household> {
    await delay()
    const existing = await mockHouseholds.getForUser(ownerId)
    if (existing) throw new Error('User already belongs to a household')

    const now = new Date().toISOString()
    const household: Household = {
      id: generateId('household'),
      name,
      ownerId,
      members: [
        {
          userId: ownerId,
          householdId: '',
          role: 'Manager',
          status: 'active',
          joinedAt: now,
        },
      ],
      invites: [],
      createdAt: now,
    }
    household.members[0].householdId = household.id
    db.households.push(household)

    db.householdAudit.push({
      id: generateId('audit'),
      householdId: household.id,
      actorId: ownerId,
      action: 'household_created',
      detail: `Household "${name}" created`,
      createdAt: now,
    })

    return household
  },

  async invite(householdId: string, email: string, role: HouseholdMemberRole): Promise<string> {
    await delay()
    const household = db.households.find((h) => h.id === householdId)
    if (!household) throw new Error('Household not found')

    const token = `invite-${generateId('tok')}`
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const invite: HouseholdInvite = {
      id: generateId('invite'),
      householdId,
      email,
      role,
      token,
      expiresAt,
      createdAt: now,
    }
    household.invites.push(invite)
    db.inviteTokens[token] = householdId

    const inviter = db.users.find((u) => u.id === household.ownerId)
    db.householdAudit.push({
      id: generateId('audit'),
      householdId,
      actorId: household.ownerId,
      action: 'member_invited',
      detail: `${inviter?.firstName ?? 'Someone'} invited ${email} as ${role}`,
      createdAt: now,
    })

    return token
  },

  async acceptInvite(token: string, userId: string): Promise<Household> {
    await delay()
    const householdId = db.inviteTokens[token]
    if (!householdId) throw new Error('Invalid or expired invite token')

    const household = db.households.find((h) => h.id === householdId)
    if (!household) throw new Error('Household not found')

    const invite = household.invites.find((i) => i.token === token)
    if (!invite) throw new Error('Invite not found')
    if (invite.usedAt) throw new Error('Invite already used')

    const now = new Date().toISOString()
    invite.usedAt = now

    const member: HouseholdMember = {
      userId,
      householdId: household.id,
      role: invite.role,
      status: 'active',
      joinedAt: now,
    }
    household.members.push(member)
    delete db.inviteTokens[token]

    const user = await mockUsers.getById(userId)
    db.householdAudit.push({
      id: generateId('audit'),
      householdId,
      actorId: userId,
      action: 'member_joined',
      detail: `${user?.firstName ?? 'User'} joined the household`,
      createdAt: now,
    })

    return household
  },

  async removeMember(householdId: string, memberId: string, actorId: string): Promise<void> {
    await delay()
    const household = db.households.find((h) => h.id === householdId)
    if (!household) throw new Error('Household not found')

    const member = household.members.find((m) => m.userId === memberId)
    if (!member) throw new Error('Member not found')
    member.status = 'removed'

    const actor = db.users.find((u) => u.id === actorId)
    const target = db.users.find((u) => u.id === memberId)
    db.householdAudit.push({
      id: generateId('audit'),
      householdId,
      actorId,
      targetId: memberId,
      action: 'member_removed',
      detail: `${actor?.firstName ?? 'Manager'} removed ${target?.firstName ?? 'member'} from the household`,
      createdAt: new Date().toISOString(),
    })
  },

  async changeRole(
    householdId: string,
    memberId: string,
    role: HouseholdMemberRole,
    actorId: string
  ): Promise<void> {
    await delay()
    const household = db.households.find((h) => h.id === householdId)
    if (!household) throw new Error('Household not found')

    const member = household.members.find((m) => m.userId === memberId)
    if (!member) throw new Error('Member not found')

    const oldRole = member.role
    member.role = role

    const target = db.users.find((u) => u.id === memberId)
    db.householdAudit.push({
      id: generateId('audit'),
      householdId,
      actorId,
      targetId: memberId,
      action: 'role_changed',
      detail: `${target?.firstName ?? 'Member'}'s role changed from ${oldRole} to ${role}`,
      createdAt: new Date().toISOString(),
    })
  },

  async getAuditLog(householdId: string): Promise<HouseholdAuditEntry[]> {
    await delay()
    return db.householdAudit
      .filter((a) => a.householdId === householdId)
      .slice()
      .reverse()
  },
}

export default mockHouseholds
export { mockHouseholds }
