import { Router } from 'express'
import { getDb } from '../db/connection'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { generateId } from '../utils/generateId'
import { getSettings } from '../utils/settings'
import { clampString } from '../utils/validate'
import { notifyAdmins, notifyUser } from '../utils/notifyAdmins'

const router = Router()

const GROUP_BANDS = new Set(['up_to_2', 'three_to_four', 'five_to_six', 'seven_plus'])
const WEEK_OPTIONS = new Set([1, 2, 4])
const SEASON_OPTIONS = new Set([6, 12])
const RATE_PER_PERSON_PER_NIGHT = 56
const BILLABLE: Record<string, number> = {
  up_to_2: 2,
  three_to_four: 3,
  five_to_six: 5,
  seven_plus: 7,
}
const WEEK_UNITS: Record<number, number> = { 1: 7, 2: 14, 4: 28 }
const SEASON_DISCOUNT: Record<number, number> = { 6: 0.4, 12: 0.55 }

function rowToPackageRequest(row: Record<string, unknown>) {
  return {
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
    fulfilledBy: row.fulfilled_by ?? null,
    fulfilledAt: row.fulfilled_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function computePackageQuote(body: {
  kind?: string
  groupBand?: string
  weeks?: number
  months?: number
}): { kind: 'weeks' | 'season'; groupBand: string; weeks: number | null; months: number | null; units: number; price: number; label: string } {
  const kind = body.kind
  const groupBand = body.groupBand
  if (kind !== 'weeks' && kind !== 'season') {
    throw Object.assign(new Error('kind must be weeks or season'), { status: 400 })
  }
  if (!groupBand || !GROUP_BANDS.has(groupBand)) {
    throw Object.assign(new Error('Invalid groupBand'), { status: 400 })
  }
  const billable = BILLABLE[groupBand]
  const dailyRate = billable * RATE_PER_PERSON_PER_NIGHT

  if (kind === 'weeks') {
    const weeks = Number(body.weeks)
    if (!WEEK_OPTIONS.has(weeks)) {
      throw Object.assign(new Error('weeks must be 1, 2, or 4'), { status: 400 })
    }
    const units = WEEK_UNITS[weeks]
    const price = dailyRate * units
    const bandLabel =
      groupBand === 'up_to_2' ? 'Up to 2' :
      groupBand === 'three_to_four' ? '3–4' :
      groupBand === 'five_to_six' ? '5–6' : '7+'
    return {
      kind,
      groupBand,
      weeks,
      months: null,
      units,
      price,
      label: `${weeks} week${weeks === 1 ? '' : 's'} · ${bandLabel} guests`,
    }
  }

  const months = Number(body.months)
  if (!SEASON_OPTIONS.has(months)) {
    throw Object.assign(new Error('months must be 6 or 12'), { status: 400 })
  }
  const units = months * 30
  const fullPrice = dailyRate * units
  const price = Math.round(fullPrice * (1 - SEASON_DISCOUNT[months]))
  const bandLabel =
    groupBand === 'up_to_2' ? 'Up to 2' :
    groupBand === 'three_to_four' ? '3–4' :
    groupBand === 'five_to_six' ? '5–6' : '7+'
  return {
    kind,
    groupBand,
    weeks: null,
    months,
    units,
    price,
    label: `${months} months · ${bandLabel} guests`,
  }
}

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
    // 1-week packages are 7 units; allow any positive credit up to maxKeys.
    if (!Number.isInteger(n) || n < 1 || n > settings.maxKeys) {
      res.status(400).json({ error: `units must be an integer between 1 and ${settings.maxKeys}` }); return
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

// POST /api/ledger/package-requests — member requests a membership package
router.post('/package-requests', authenticate, requireRole('member'), (req, res, next) => {
  try {
    const quote = computePackageQuote(req.body as {
      kind?: string; groupBand?: string; weeks?: number; months?: number
    })
    const db = getDb()
    const user = db.prepare('SELECT id, role, status, first_name, last_name, email FROM users WHERE id = ?')
      .get(req.user!.userId) as {
        id: string; role: string; status: string; first_name: string; last_name: string; email: string
      } | undefined
    if (!user || user.role !== 'member') {
      res.status(403).json({ error: 'Only members can request packages' }); return
    }
    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Account suspended' }); return
    }

    const existing = db.prepare(`
      SELECT id FROM package_purchase_requests
      WHERE user_id = ? AND status = 'pending'
    `).get(user.id)
    if (existing) {
      res.status(409).json({
        error: 'You already have a pending package request. We will confirm once payment is received.',
      }); return
    }

    const now = new Date().toISOString()
    const id = generateId('pkgreq')
    db.prepare(`
      INSERT INTO package_purchase_requests
        (id, user_id, kind, group_band, weeks, months, units, price_eur, label, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(
      id, user.id, quote.kind, quote.groupBand, quote.weeks, quote.months,
      quote.units, quote.price, quote.label, now, now,
    )

    notifyAdmins({
      type: 'package_request',
      title: 'New membership package request',
      body: `${user.first_name} ${user.last_name} requested ${quote.label} (€${quote.price.toLocaleString('en-EU')}).`,
      link: '/admin/requests?tab=packages',
    })

    notifyUser(user.id, {
      type: 'package_request',
      title: 'Package request received',
      body: `We received your request for ${quote.label}. Pay the invoice and we will credit your membership.`,
      link: '/member/packages',
    })

    const row = db.prepare('SELECT * FROM package_purchase_requests WHERE id = ?').get(id) as Record<string, unknown>
    res.status(201).json(rowToPackageRequest(row))
  } catch (e) { next(e) }
})

// GET /api/ledger/package-requests — current member's requests
router.get('/package-requests', authenticate, requireRole('member'), (req, res, next) => {
  try {
    const db = getDb()
    const rows = db.prepare(`
      SELECT * FROM package_purchase_requests
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(req.user!.userId) as Record<string, unknown>[]
    res.json(rows.map(rowToPackageRequest))
  } catch (e) { next(e) }
})

// POST /api/ledger/admin/package-requests/:id/fulfill — credit units after payment
router.post('/admin/package-requests/:id/fulfill', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { id } = req.params
    const note = req.body?.note ? clampString(String(req.body.note), 500, 'note') : null
    const db = getDb()
    const settings = getSettings()

    const apply = db.transaction(() => {
      const reqRow = db.prepare('SELECT * FROM package_purchase_requests WHERE id = ?')
        .get(id) as Record<string, unknown> | undefined
      if (!reqRow) {
        throw Object.assign(new Error('Package request not found'), { status: 404 })
      }
      if (reqRow.status !== 'pending') {
        throw Object.assign(new Error('Package request is no longer pending'), { status: 400 })
      }

      const userId = reqRow.user_id as string
      const units = reqRow.units as number
      if (!Number.isInteger(units) || units < 1 || units > settings.maxKeys) {
        throw Object.assign(new Error(`Invalid units on request`), { status: 400 })
      }

      const wallet = db.prepare(
        'SELECT balance_after FROM ledger_entries WHERE user_id = ? ORDER BY rowid DESC LIMIT 1'
      ).get(userId) as { balance_after: number } | undefined
      const balance = wallet?.balance_after ?? 0
      const now = new Date().toISOString()
      const ledgerId = generateId('ledger')
      const desc = note ?? `Membership package: ${reqRow.label as string}`
      db.prepare(`
        INSERT INTO ledger_entries (id,user_id,type,amount,balance_after,description,booking_id,admin_id,admin_note,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)
      `).run(ledgerId, userId, 'package_credit', units, balance + units, desc, null, req.user!.userId, desc, now)

      db.prepare(`
        UPDATE package_purchase_requests
        SET status = 'fulfilled', admin_note = ?, fulfilled_by = ?, fulfilled_at = ?, updated_at = ?
        WHERE id = ?
      `).run(note, req.user!.userId, now, now, id)

      return { userId, units, label: reqRow.label as string }
    })

    const result = apply()
    notifyUser(result.userId, {
      type: 'package_credit',
      title: 'Membership credited',
      body: `Your ${result.label} membership has been credited. You can book Club homes now.`,
      link: '/member/wallet',
    })

    const row = db.prepare('SELECT * FROM package_purchase_requests WHERE id = ?').get(id) as Record<string, unknown>
    res.json(rowToPackageRequest(row))
  } catch (e) { next(e) }
})

// POST /api/ledger/admin/package-requests/:id/reject
router.post('/admin/package-requests/:id/reject', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { id } = req.params
    const note = req.body?.note ? clampString(String(req.body.note), 500, 'note') : null
    const db = getDb()
    const reqRow = db.prepare('SELECT * FROM package_purchase_requests WHERE id = ?')
      .get(id) as Record<string, unknown> | undefined
    if (!reqRow) {
      res.status(404).json({ error: 'Package request not found' }); return
    }
    if (reqRow.status !== 'pending') {
      res.status(400).json({ error: 'Package request is no longer pending' }); return
    }
    const now = new Date().toISOString()
    db.prepare(`
      UPDATE package_purchase_requests
      SET status = 'rejected', admin_note = ?, updated_at = ?
      WHERE id = ?
    `).run(note, now, id)

    notifyUser(reqRow.user_id as string, {
      type: 'package_request',
      title: 'Package request update',
      body: note
        ? `Your membership package request was not completed: ${note}`
        : 'Your membership package request was cancelled. Contact the Club if you need help.',
      link: '/member/packages',
    })

    const row = db.prepare('SELECT * FROM package_purchase_requests WHERE id = ?').get(id) as Record<string, unknown>
    res.json(rowToPackageRequest(row))
  } catch (e) { next(e) }
})

export default router
