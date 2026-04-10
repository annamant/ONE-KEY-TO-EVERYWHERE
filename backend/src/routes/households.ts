import { Router } from 'express'
import { getDb } from '../db/connection'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { generateId } from '../utils/generateId'

const router = Router()

function buildHousehold(
  h: Record<string, unknown>,
  members: Record<string, unknown>[],
  invites: Record<string, unknown>[]
) {
  return {
    id: h.id,
    name: h.name,
    ownerId: h.owner_id,
    members: members.map((m) => ({
      userId: m.user_id,
      householdId: m.household_id,
      role: m.role,
      status: m.status,
      joinedAt: m.joined_at,
    })),
    invites: invites.map((i) => ({
      id: i.id,
      householdId: i.household_id,
      email: i.invitee_email,
      role: i.role,
      token: i.token,
      expiresAt: i.expires_at,
      usedAt: i.used_at ?? null,
      createdAt: i.created_at,
    })),
    createdAt: h.created_at,
  }
}

function getHouseholdById(id: string) {
  const db = getDb()
  const h = db.prepare('SELECT * FROM households WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!h) return null
  const members = db.prepare('SELECT * FROM household_members WHERE household_id = ?').all(id) as Record<string, unknown>[]
  const invites = db.prepare('SELECT * FROM invite_tokens WHERE household_id = ?').all(id) as Record<string, unknown>[]
  return buildHousehold(h, members, invites)
}

// GET /api/households/mine
router.get('/mine', authenticate, requireRole('member'), (req, res, next) => {
  try {
    const db = getDb()
    const membership = db.prepare(
      "SELECT household_id FROM household_members WHERE user_id = ? AND status = 'active' LIMIT 1"
    ).get(req.user!.userId) as { household_id: string } | undefined
    if (!membership) { res.json(null); return }
    res.json(getHouseholdById(membership.household_id))
  } catch (e) { next(e) }
})

// POST /api/households
router.post('/', authenticate, requireRole('member'), (req, res, next) => {
  try {
    const { name } = req.body as { name?: string }
    if (!name) { res.status(400).json({ error: 'name is required' }); return }

    const db = getDb()
    // Check user doesn't already belong to one
    const existing = db.prepare(
      "SELECT household_id FROM household_members WHERE user_id = ? AND status = 'active' LIMIT 1"
    ).get(req.user!.userId)
    if (existing) { res.status(409).json({ error: 'User already belongs to a household' }); return }

    const now = new Date().toISOString()
    const id = generateId('household')
    db.prepare('INSERT INTO households (id,name,owner_id,created_at,updated_at) VALUES (?,?,?,?,?)').run(id, name, req.user!.userId, now, now)
    db.prepare('INSERT INTO household_members (household_id,user_id,role,status,joined_at) VALUES (?,?,?,?,?)').run(id, req.user!.userId, 'Manager', 'active', now)
    db.prepare('INSERT INTO household_audit (id,household_id,actor_id,target_id,action,detail,created_at) VALUES (?,?,?,?,?,?,?)').run(
      generateId('audit'), id, req.user!.userId, null, 'household_created', `Household "${name}" created`, now
    )

    res.status(201).json(getHouseholdById(id))
  } catch (e) { next(e) }
})

// GET /api/households/:id
router.get('/:id', authenticate, (req, res, next) => {
  try {
    const h = getHouseholdById(req.params.id)
    if (!h) { res.status(404).json({ error: 'Household not found' }); return }
    res.json(h)
  } catch (e) { next(e) }
})

// POST /api/households/:id/invite
router.post('/:id/invite', authenticate, requireRole('member'), (req, res, next) => {
  try {
    const { email, role } = req.body as { email?: string; role?: string }
    if (!email || !role) { res.status(400).json({ error: 'email and role are required' }); return }

    const db = getDb()
    const membership = db.prepare(
      "SELECT role FROM household_members WHERE household_id = ? AND user_id = ? AND status = 'active'"
    ).get(req.params.id, req.user!.userId) as { role: string } | undefined
    if (!membership || membership.role !== 'Manager') {
      res.status(403).json({ error: 'Only managers can invite' }); return
    }

    const token = generateId('invite')
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const inviteId = generateId('inv')
    db.prepare('INSERT INTO invite_tokens (token,household_id,role,invitee_email,expires_at,created_at) VALUES (?,?,?,?,?,?)').run(
      token, req.params.id, role, email, expiresAt, now
    )
    db.prepare('INSERT INTO household_audit (id,household_id,actor_id,target_id,action,detail,created_at) VALUES (?,?,?,?,?,?,?)').run(
      generateId('audit'), req.params.id, req.user!.userId, null, 'member_invited', `Invited ${email} as ${role}`, now
    )
    void inviteId
    res.json({ token, inviteUrl: `/member/household/invite/${token}` })
  } catch (e) { next(e) }
})

// POST /api/households/accept-invite
router.post('/accept-invite', authenticate, requireRole('member'), (req, res, next) => {
  try {
    const { token } = req.body as { token?: string }
    if (!token) { res.status(400).json({ error: 'token is required' }); return }

    const db = getDb()
    const invite = db.prepare('SELECT * FROM invite_tokens WHERE token = ?').get(token) as Record<string, unknown> | undefined
    if (!invite) { res.status(400).json({ error: 'Invalid or expired invite token' }); return }
    if (invite.used_at) { res.status(400).json({ error: 'Invite already used' }); return }
    if (new Date(invite.expires_at as string) < new Date()) { res.status(400).json({ error: 'Invite expired' }); return }

    const now = new Date().toISOString()
    db.prepare('UPDATE invite_tokens SET used_at = ? WHERE token = ?').run(now, token)
    db.prepare('INSERT INTO household_members (household_id,user_id,role,status,joined_at) VALUES (?,?,?,?,?)').run(
      invite.household_id, req.user!.userId, invite.role, 'active', now
    )
    const user = db.prepare('SELECT first_name FROM users WHERE id = ?').get(req.user!.userId) as { first_name: string } | undefined
    db.prepare('INSERT INTO household_audit (id,household_id,actor_id,target_id,action,detail,created_at) VALUES (?,?,?,?,?,?,?)').run(
      generateId('audit'), invite.household_id, req.user!.userId, null, 'member_joined',
      `${user?.first_name ?? 'User'} joined the household`, now
    )

    res.json(getHouseholdById(invite.household_id as string))
  } catch (e) { next(e) }
})

// DELETE /api/households/:id/members/:memberId
router.delete('/:id/members/:memberId', authenticate, requireRole('member', 'admin'), (req, res, next) => {
  try {
    const { id, memberId } = req.params
    const db = getDb()
    const membership = db.prepare(
      "SELECT role FROM household_members WHERE household_id = ? AND user_id = ? AND status = 'active'"
    ).get(id, req.user!.userId) as { role: string } | undefined
    if (req.user!.role !== 'admin' && (!membership || membership.role !== 'Manager')) {
      res.status(403).json({ error: 'Only managers or admins can remove members' }); return
    }
    const now = new Date().toISOString()
    db.prepare("UPDATE household_members SET status = 'removed' WHERE household_id = ? AND user_id = ?").run(id, memberId)
    const target = db.prepare('SELECT first_name FROM users WHERE id = ?').get(memberId) as { first_name: string } | undefined
    db.prepare('INSERT INTO household_audit (id,household_id,actor_id,target_id,action,detail,created_at) VALUES (?,?,?,?,?,?,?)').run(
      generateId('audit'), id, req.user!.userId, memberId, 'member_removed',
      `${target?.first_name ?? 'Member'} removed from the household`, now
    )
    res.status(204).send()
  } catch (e) { next(e) }
})

// PATCH /api/households/:id/members/:memberId/role
router.patch('/:id/members/:memberId/role', authenticate, requireRole('member', 'admin'), (req, res, next) => {
  try {
    const { id, memberId } = req.params
    const { role } = req.body as { role?: string }
    if (!role || !['Manager','Booker','Viewer'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' }); return
    }
    const db = getDb()
    const membership = db.prepare(
      "SELECT role FROM household_members WHERE household_id = ? AND user_id = ? AND status = 'active'"
    ).get(id, req.user!.userId) as { role: string } | undefined
    if (req.user!.role !== 'admin' && (!membership || membership.role !== 'Manager')) {
      res.status(403).json({ error: 'Only managers or admins can change roles' }); return
    }
    const now = new Date().toISOString()
    const oldMember = db.prepare(
      "SELECT role FROM household_members WHERE household_id = ? AND user_id = ?"
    ).get(id, memberId) as { role: string } | undefined
    db.prepare("UPDATE household_members SET role = ? WHERE household_id = ? AND user_id = ?").run(role, id, memberId)
    const target = db.prepare('SELECT first_name FROM users WHERE id = ?').get(memberId) as { first_name: string } | undefined
    db.prepare('INSERT INTO household_audit (id,household_id,actor_id,target_id,action,detail,created_at) VALUES (?,?,?,?,?,?,?)').run(
      generateId('audit'), id, req.user!.userId, memberId, 'role_changed',
      `${target?.first_name ?? 'Member'}'s role changed from ${oldMember?.role ?? '?'} to ${role}`, now
    )
    res.status(204).send()
  } catch (e) { next(e) }
})

// GET /api/households/:id/audit
router.get('/:id/audit', authenticate, (req, res, next) => {
  try {
    const db = getDb()
    const rows = db.prepare(
      'SELECT * FROM household_audit WHERE household_id = ? ORDER BY created_at DESC'
    ).all(req.params.id) as Record<string, unknown>[]
    res.json(rows.map((r) => ({
      id: r.id,
      householdId: r.household_id,
      actorId: r.actor_id,
      targetId: r.target_id ?? null,
      action: r.action,
      detail: r.detail,
      createdAt: r.created_at,
    })))
  } catch (e) { next(e) }
})

export default router
