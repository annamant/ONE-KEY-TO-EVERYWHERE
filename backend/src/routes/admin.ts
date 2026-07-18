import { Router } from 'express'
import { getDb } from '../db/connection'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { rowToOwnerEntry, rowToMemberEntry } from './waitlist'
import { sendEmail, membershipApprovedEmail } from '../utils/email'
import { notifyUser } from '../utils/notifyAdmins'

const router = Router()

function rowToUser(row: Record<string, unknown>) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    status: row.status,
    avatarUrl: row.avatar_url ?? null,
    phone: row.phone ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// GET /api/admin/requests — all pending items for admin review
router.get('/requests', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDb()

    const pendingMembers = (db.prepare(`
      SELECT * FROM users
      WHERE role = 'member' AND status = 'pending_verification'
      ORDER BY created_at DESC
    `).all() as Record<string, unknown>[]).map(rowToUser)

    const ownerWaitlist = (db.prepare(`
      SELECT * FROM owner_waitlist
      WHERE status = 'pending' OR status = 'contacted'
      ORDER BY created_at DESC
    `).all() as Record<string, unknown>[]).map(rowToOwnerEntry)

    const memberWaitlist = (db.prepare(`
      SELECT * FROM member_waitlist
      WHERE status = 'pending' OR status = 'contacted'
      ORDER BY created_at DESC
    `).all() as Record<string, unknown>[]).map(rowToMemberEntry)

    res.json({
      pendingMembers,
      ownerWaitlist,
      memberWaitlist,
      counts: {
        pendingMembers: pendingMembers.length,
        ownerWaitlist: ownerWaitlist.length,
        memberWaitlist: memberWaitlist.length,
        total: pendingMembers.length + ownerWaitlist.length + memberWaitlist.length,
      },
    })
  } catch (e) { next(e) }
})

// PATCH /api/admin/owner-waitlist/:id
router.patch('/owner-waitlist/:id', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { id } = req.params
    const { status, adminNotes } = req.body as { status?: string; adminNotes?: string }
    const valid = ['pending', 'contacted', 'approved', 'rejected']
    if (status && !valid.includes(status)) {
      res.status(400).json({ error: 'Invalid status' })
      return
    }

    const db = getDb()
    const now = new Date().toISOString()
    const row = db.prepare('SELECT * FROM owner_waitlist WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!row) { res.status(404).json({ error: 'Not found' }); return }

    const newStatus = status ?? row.status
    const notes = adminNotes !== undefined ? adminNotes : row.admin_notes
    db.prepare('UPDATE owner_waitlist SET status = ?, admin_notes = ?, updated_at = ? WHERE id = ?')
      .run(newStatus, notes ?? null, now, id)

    res.json(rowToOwnerEntry(
      db.prepare('SELECT * FROM owner_waitlist WHERE id = ?').get(id) as Record<string, unknown>
    ))
  } catch (e) { next(e) }
})

// PATCH /api/admin/member-waitlist/:id
router.patch('/member-waitlist/:id', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { id } = req.params
    const { status, adminNotes } = req.body as { status?: string; adminNotes?: string }
    const valid = ['pending', 'contacted', 'invited', 'rejected']
    if (status && !valid.includes(status)) {
      res.status(400).json({ error: 'Invalid status' })
      return
    }

    const db = getDb()
    const now = new Date().toISOString()
    const row = db.prepare('SELECT * FROM member_waitlist WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!row) { res.status(404).json({ error: 'Not found' }); return }

    const newStatus = status ?? row.status
    const notes = adminNotes !== undefined ? adminNotes : row.admin_notes
    db.prepare('UPDATE member_waitlist SET status = ?, admin_notes = ?, updated_at = ? WHERE id = ?')
      .run(newStatus, notes ?? null, now, id)

    res.json(rowToMemberEntry(
      db.prepare('SELECT * FROM member_waitlist WHERE id = ?').get(id) as Record<string, unknown>
    ))
  } catch (e) { next(e) }
})

// POST /api/admin/members/:id/approve — approve membership + send confirmation email
router.post('/members/:id/approve', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params
    const db = getDb()
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!row) { res.status(404).json({ error: 'User not found' }); return }
    if (row.role !== 'member') { res.status(400).json({ error: 'Only member accounts can be approved' }); return }
    if (row.status === 'active') { res.status(400).json({ error: 'Member is already active' }); return }

    const now = new Date().toISOString()
    db.prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?').run('active', now, id)
    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown>
    const user = rowToUser(updated)

    const email = membershipApprovedEmail(user.firstName as string)
    await sendEmail({ ...email, to: user.email as string })

    notifyUser(id, {
      type: 'membership_approved',
      title: 'Membership approved',
      body: 'Your Club membership has been approved. You can now browse and book homes.',
      link: '/member/dashboard',
    })

    res.json(user)
  } catch (e) { next(e) }
})

// GET /api/admin/settings
router.get('/settings', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDb()
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
    const settings: Record<string, string> = {}
    for (const r of rows) settings[r.key] = r.value
    res.json(settings)
  } catch (e) { next(e) }
})

// PUT /api/admin/settings
router.put('/settings', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>
    const allowed = [
      'platformName', 'supportEmail', 'defaultTier',
      'maxKeys', 'minKeys', 'reviewDays', 'cancellationWindow', 'maintenanceMode',
    ]
    const db = getDb()
    const now = new Date().toISOString()
    const upsert = db.prepare(`
      INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?,?,?,?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by
    `)
    for (const key of allowed) {
      if (body[key] !== undefined) {
        upsert.run(key, String(body[key]), now, req.user!.userId)
      }
    }
    res.json({ ok: true })
  } catch (e) { next(e) }
})

export default router
