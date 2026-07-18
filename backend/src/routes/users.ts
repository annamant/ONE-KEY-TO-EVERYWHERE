import { Router } from 'express'
import { getDb } from '../db/connection'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
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

// GET /api/users  (admin only — with optional filters)
router.get('/', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { role, status, query } = req.query as Record<string, string | undefined>
    const db = getDb()
    let sql = 'SELECT * FROM users WHERE 1=1'
    const params: unknown[] = []
    if (role) { sql += ' AND role = ?'; params.push(role) }
    if (status) { sql += ' AND status = ?'; params.push(status) }
    if (query) {
      sql += ' AND (lower(first_name) LIKE ? OR lower(last_name) LIKE ? OR lower(email) LIKE ?)'
      const q = `%${query.toLowerCase()}%`
      params.push(q, q, q)
    }
    sql += ' ORDER BY created_at DESC'
    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[]
    res.json(rows.map(rowToUser))
  } catch (e) { next(e) }
})

// GET /api/users/:id
router.get('/:id', authenticate, (req, res, next) => {
  try {
    const { id } = req.params
    // users can only access own profile unless admin
    if (req.user!.role !== 'admin' && req.user!.userId !== id) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    const db = getDb()
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!row) { res.status(404).json({ error: 'User not found' }); return }
    res.json(rowToUser(row))
  } catch (e) { next(e) }
})

// PATCH /api/users/:id
router.patch('/:id', authenticate, (req, res, next) => {
  try {
    const { id } = req.params
    if (req.user!.role !== 'admin' && req.user!.userId !== id) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    const { firstName, lastName, phone, avatarUrl } = req.body as Record<string, string | undefined>
    const db = getDb()
    const now = new Date().toISOString()
    const sets: string[] = ['updated_at = ?']
    const params: unknown[] = [now]
    if (firstName !== undefined) { sets.push('first_name = ?'); params.push(firstName) }
    if (lastName !== undefined)  { sets.push('last_name = ?');  params.push(lastName) }
    if (phone !== undefined)     { sets.push('phone = ?');      params.push(phone) }
    if (avatarUrl !== undefined) { sets.push('avatar_url = ?'); params.push(avatarUrl) }
    params.push(id)
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...params)
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown>
    res.json(rowToUser(row))
  } catch (e) { next(e) }
})

// POST /api/users/:id/role  (admin only — change a user's role)
router.post('/:id/role', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { id } = req.params
    const { role } = req.body as { role?: string }
    const validRoles = ['member', 'owner', 'admin']
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid role' }); return
    }
    if (id === req.user!.userId) {
      res.status(400).json({ error: 'You cannot change your own role' }); return
    }

    const db = getDb()
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!existing) { res.status(404).json({ error: 'User not found' }); return }
    if (existing.role === role) {
      res.status(400).json({ error: 'User already has that role' }); return
    }

    const now = new Date().toISOString()
    // Promoting a suspended/pending user to admin implies activation
    const newStatus = role === 'admin' ? 'active' : existing.status
    db.prepare('UPDATE users SET role = ?, status = ?, updated_at = ? WHERE id = ?').run(role, newStatus, now, id)
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown>
    res.json(rowToUser(row))
  } catch (e) { next(e) }
})

// POST /api/users/:id/moderate  (admin only)
router.post('/:id/moderate', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params
    const { action } = req.body as { action?: string }
    const statusMap: Record<string, string> = { suspend: 'suspended', restore: 'active', verify: 'active' }
    const newStatus = action ? statusMap[action] : undefined
    if (!newStatus) { res.status(400).json({ error: 'Invalid action' }); return }

    const db = getDb()
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!existing) { res.status(404).json({ error: 'User not found' }); return }

    const now = new Date().toISOString()
    db.prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?').run(newStatus, now, id)
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown>
    const user = rowToUser(row)

    if (action === 'verify' && existing.role === 'member') {
      const email = membershipApprovedEmail(user.firstName as string)
      await sendEmail({ ...email, to: user.email as string })
      notifyUser(id, {
        type: 'membership_approved',
        title: 'Membership approved',
        body: 'Your Club membership has been approved. You can now browse and book homes.',
        link: '/member/dashboard',
      })
    }

    res.json(user)
  } catch (e) { next(e) }
})

export default router
