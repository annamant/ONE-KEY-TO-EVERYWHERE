import { Router } from 'express'
import { getDb } from '../db/connection'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { generateId } from '../utils/generateId'
import { getSettings } from '../utils/settings'
import { clampString } from '../utils/validate'

const router = Router()

function rowToEntry(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amount: row.amount,
    balanceAfter: row.balance_after,
    description: row.description,
    bookingId: row.booking_id ?? null,
    adminId: row.admin_id ?? null,
    adminNote: row.admin_note ?? null,
    createdAt: row.created_at,
  }
}

function getWalletForUser(userId: string) {
  const db = getDb()
  const entries = db.prepare('SELECT * FROM ledger_entries WHERE user_id = ? ORDER BY rowid ASC').all(userId) as Record<string, unknown>[]
  const balance = entries.length > 0 ? (entries[entries.length - 1].balance_after as number) : 0
  const totalCredited = entries.filter((e) => (e.amount as number) > 0).reduce((s, e) => s + (e.amount as number), 0)
  const totalDebited  = Math.abs(entries.filter((e) => (e.amount as number) < 0).reduce((s, e) => s + (e.amount as number), 0))
  return { userId, balance, totalCredited, totalDebited }
}

// GET /api/ledger/wallet  — current user's wallet
router.get('/wallet', authenticate, (req, res, next) => {
  try {
    res.json(getWalletForUser(req.user!.userId))
  } catch (e) { next(e) }
})

// GET /api/ledger/entries  — current user's entries
router.get('/entries', authenticate, (req, res, next) => {
  try {
    const { limit, offset, types } = req.query as Record<string, string | undefined>
    const db = getDb()
    const lim = Math.min(Number(limit ?? 50), 200)
    const off = Number(offset ?? 0)
    let rows = db.prepare(
      'SELECT * FROM ledger_entries WHERE user_id = ? ORDER BY rowid DESC LIMIT ? OFFSET ?'
    ).all(req.user!.userId, lim, off) as Record<string, unknown>[]
    if (types) {
      const typeList = types.split(',').filter(Boolean)
      rows = rows.filter((r) => typeList.includes(r.type as string))
    }
    res.json(rows.map(rowToEntry))
  } catch (e) { next(e) }
})

// GET /api/ledger/admin  (admin — all entries)
router.get('/admin', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { userId, types } = req.query as Record<string, string | undefined>
    const db = getDb()
    let sql = 'SELECT * FROM ledger_entries WHERE 1=1'
    const params: unknown[] = []
    if (userId) { sql += ' AND user_id = ?'; params.push(userId) }
    sql += ' ORDER BY rowid DESC LIMIT 500'
    let rows = db.prepare(sql).all(...params) as Record<string, unknown>[]
    if (types) {
      const typeList = types.split(',').filter(Boolean)
      rows = rows.filter((r) => typeList.includes(r.type as string))
    }
    res.json(rows.map(rowToEntry))
  } catch (e) { next(e) }
})

// POST /api/ledger/admin/correction  (admin — credit or debit any user)
router.post('/admin/correction', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { userId, amount, direction, note, type, bookingId } = req.body as {
      userId?: string; amount?: number; direction?: string; note?: string; type?: string; bookingId?: string
    }
    if (!userId || amount === undefined || !direction) {
      res.status(400).json({ error: 'userId, amount and direction are required' }); return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: 'amount must be a positive number' }); return
    }
    if (direction !== 'credit' && direction !== 'debit') {
      res.status(400).json({ error: 'direction must be credit or debit' }); return
    }

    const db = getDb()
    const apply = db.transaction(() => {
      const wallet = db.prepare(
        'SELECT balance_after FROM ledger_entries WHERE user_id = ? ORDER BY rowid DESC LIMIT 1'
      ).get(userId) as { balance_after: number } | undefined
      const currentBalance = wallet?.balance_after ?? 0

      const signed = direction === 'credit' ? Math.abs(amount) : -Math.abs(amount)
      const newBalance = currentBalance + signed
      if (newBalance < 0) {
        throw Object.assign(new Error('Correction would result in negative balance'), { status: 400 })
      }

      const now = new Date().toISOString()
      const id = generateId('ledger')
      const entryType = type ?? (direction === 'credit' ? 'admin_correction' : 'booking_debit')
      const desc = note ? clampString(note, 500, 'note') : 'Admin correction'
      db.prepare(`
        INSERT INTO ledger_entries (id,user_id,type,amount,balance_after,description,booking_id,admin_id,admin_note,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)
      `).run(id, userId, entryType, signed, newBalance, desc, bookingId ?? null, req.user!.userId, note ?? null, now)

      return db.prepare('SELECT * FROM ledger_entries WHERE id = ?').get(id) as Record<string, unknown>
    })

    res.status(201).json(rowToEntry(apply()))
  } catch (e) { next(e) }
})

/**
 * POST /api/ledger/admin/package-credit
 * Manual membership purchase workflow (pre-Stripe): credit stay units after bank transfer.
 */
router.post('/admin/package-credit', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { userId, units, note } = req.body as { userId?: string; units?: number; note?: string }
    if (!userId || units === undefined) {
      res.status(400).json({ error: 'userId and units are required' }); return
    }
    const settings = getSettings()
    const n = Number(units)
    if (!Number.isInteger(n) || n < settings.minKeys || n > settings.maxKeys) {
      res.status(400).json({ error: `units must be an integer between ${settings.minKeys} and ${settings.maxKeys}` }); return
    }

    const db = getDb()
    const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(userId) as { id: string; role: string } | undefined
    if (!user || user.role !== 'member') {
      res.status(400).json({ error: 'Package credit is only for members' }); return
    }

    const apply = db.transaction(() => {
      const wallet = db.prepare(
        'SELECT balance_after FROM ledger_entries WHERE user_id = ? ORDER BY rowid DESC LIMIT 1'
      ).get(userId) as { balance_after: number } | undefined
      const balance = wallet?.balance_after ?? 0
      const now = new Date().toISOString()
      const id = generateId('ledger')
      const desc = note ? clampString(note, 500, 'note') : `Membership package credit (${n} units)`
      db.prepare(`
        INSERT INTO ledger_entries (id,user_id,type,amount,balance_after,description,booking_id,admin_id,admin_note,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)
      `).run(id, userId, 'package_credit', n, balance + n, desc, null, req.user!.userId, desc, now)
      return db.prepare('SELECT * FROM ledger_entries WHERE id = ?').get(id) as Record<string, unknown>
    })

    res.status(201).json(rowToEntry(apply()))
  } catch (e) { next(e) }
})

export default router
