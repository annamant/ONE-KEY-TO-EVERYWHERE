import { Router } from 'express'
import { getDb } from '../db/connection'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { rowToOwnerEntry, rowToMemberEntry } from './waitlist'
import { sendEmail, membershipApprovedEmail } from '../utils/email'
import { notifyUser } from '../utils/notifyAdmins'
import { generateId } from '../utils/generateId'
import { getSettings, validateSettingsPatch } from '../utils/settings'

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

function creditPackage(db: ReturnType<typeof getDb>, userId: string, units: number, adminId: string, note: string) {
  const settings = getSettings()
  // Package products include 1-week (7 units); allow any positive credit up to maxKeys.
  if (!Number.isInteger(units) || units < 1 || units > settings.maxKeys) {
    throw Object.assign(
      new Error(`Package credit must be an integer between 1 and ${settings.maxKeys} units`),
      { status: 400 }
    )
  }
  const wallet = db.prepare(
    'SELECT balance_after FROM ledger_entries WHERE user_id = ? ORDER BY rowid DESC LIMIT 1'
  ).get(userId) as { balance_after: number } | undefined
  const balance = wallet?.balance_after ?? 0
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO ledger_entries (id,user_id,type,amount,balance_after,description,booking_id,admin_id,admin_note,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(
    generateId('ledger'),
    userId,
    'package_credit',
    units,
    balance + units,
    note,
    null,
    adminId,
    note,
    now,
  )
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

    const packageRequests = (db.prepare(`
      SELECT r.*, u.email, u.first_name, u.last_name, u.status AS user_status
      FROM package_purchase_requests r
      JOIN users u ON u.id = r.user_id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `).all() as Record<string, unknown>[]).map((row) => ({
      id: row.id,
      userId: row.user_id,
      kind: row.kind,
      groupBand: row.group_band,
      weeks: row.weeks ?? null,
      months: row.months ?? null,
      units: row.units,
      priceEur: row.price_eur,
      label: row.label,
      status: row.status,
      adminNote: row.admin_note ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      member: {
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        status: row.user_status,
      },
    }))

    res.json({
      pendingMembers,
      ownerWaitlist,
      memberWaitlist,
      packageRequests,
      counts: {
        pendingMembers: pendingMembers.length,
        ownerWaitlist: ownerWaitlist.length,
        memberWaitlist: memberWaitlist.length,
        packageRequests: packageRequests.length,
        total: pendingMembers.length + ownerWaitlist.length + memberWaitlist.length + packageRequests.length,
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

/**
 * POST /api/admin/members/:id/approve
 * Body: { units?: number } — optional membership package credit (manual launch workflow).
 */
router.post('/members/:id/approve', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params
    const { units } = req.body as { units?: number }
    const db = getDb()
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!row) { res.status(404).json({ error: 'User not found' }); return }
    if (row.role !== 'member') { res.status(400).json({ error: 'Only member accounts can be approved' }); return }
    if (row.status !== 'pending_verification') {
      res.status(400).json({ error: 'Only pending members can be approved' }); return
    }

    const now = new Date().toISOString()
    db.transaction(() => {
      db.prepare('UPDATE users SET status = ?, email_verified_at = COALESCE(email_verified_at, ?), updated_at = ? WHERE id = ?')
        .run('active', now, now, id)
      if (units !== undefined && units !== null) {
        creditPackage(db, id, Number(units), req.user!.userId, `Membership package credit (${units} units)`)
      }
    })()

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown>
    const user = rowToUser(updated)

    const email = membershipApprovedEmail(user.firstName as string)
    await sendEmail({ ...email, to: user.email as string })

    notifyUser(id, {
      type: 'membership_approved',
      title: 'Membership approved',
      body: units
        ? `Your Club membership has been approved with ${units} stay units.`
        : 'Your Club membership has been approved. An admin will credit your package after payment.',
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
    const patch = validateSettingsPatch(req.body as Record<string, unknown>)
    const db = getDb()
    const now = new Date().toISOString()
    const upsert = db.prepare(`
      INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?,?,?,?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by
    `)
    for (const [key, value] of Object.entries(patch)) {
      upsert.run(key, value, now, req.user!.userId)
    }
    res.json({ ok: true })
  } catch (e) { next(e) }
})

export default router
