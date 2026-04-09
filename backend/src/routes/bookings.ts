import { Router } from 'express'
import { getDb } from '../db/connection'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { generateId } from '../utils/generateId'
import { calculateKeyCost } from '../utils/keyCalc'

const router = Router()

function rowToBooking(row: Record<string, unknown>) {
  return {
    id: row.id,
    memberId: row.member_id,
    propertyId: row.property_id,
    householdId: row.household_id ?? null,
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: row.nights,
    guests: row.guests,
    keysCharged: row.keys_charged,
    status: row.status,
    cancellationReason: row.cancellation_reason ?? null,
    cancelledAt: row.cancelled_at ?? null,
    confirmedAt: row.confirmed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// GET /api/bookings/admin  (admin)
router.get('/admin', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { status, memberId, propertyId } = req.query as Record<string, string | undefined>
    const db = getDb()
    let sql = 'SELECT * FROM bookings WHERE 1=1'
    const params: unknown[] = []
    if (status)     { sql += ' AND status = ?';      params.push(status) }
    if (memberId)   { sql += ' AND member_id = ?';   params.push(memberId) }
    if (propertyId) { sql += ' AND property_id = ?'; params.push(propertyId) }
    sql += ' ORDER BY created_at DESC'
    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[]
    res.json(rows.map(rowToBooking))
  } catch (e) { next(e) }
})

// GET /api/bookings/property/:propertyId  (owner)
router.get('/property/:propertyId', authenticate, requireRole('owner', 'admin'), (req, res, next) => {
  try {
    const db = getDb()
    const rows = db.prepare(
      "SELECT * FROM bookings WHERE property_id = ? AND status != 'cancelled' ORDER BY check_in ASC"
    ).all(req.params.propertyId) as Record<string, unknown>[]
    res.json(rows.map(rowToBooking))
  } catch (e) { next(e) }
})

// GET /api/bookings  (current user's bookings)
router.get('/', authenticate, (req, res, next) => {
  try {
    const db = getDb()
    const rows = db.prepare(
      'SELECT * FROM bookings WHERE member_id = ? ORDER BY created_at DESC'
    ).all(req.user!.userId) as Record<string, unknown>[]
    res.json(rows.map(rowToBooking))
  } catch (e) { next(e) }
})

// POST /api/bookings  (member — create)
router.post('/', authenticate, requireRole('member'), (req, res, next) => {
  try {
    const { propertyId, checkIn, checkOut, guests, householdId } = req.body as {
      propertyId?: string; checkIn?: string; checkOut?: string; guests?: number; householdId?: string
    }
    if (!propertyId || !checkIn || !checkOut || guests === undefined) {
      res.status(400).json({ error: 'propertyId, checkIn, checkOut and guests are required' }); return
    }

    const db = getDb()
    const prop = db.prepare('SELECT * FROM properties WHERE id = ?').get(propertyId) as Record<string, unknown> | undefined
    if (!prop || prop.status !== 'approved') {
      res.status(404).json({ error: 'Property not found or not available' }); return
    }

    const cost = calculateKeyCost(prop.keys_per_night as number, checkIn, checkOut)

    // Atomic: debit ledger + insert booking
    const createBooking = db.transaction(() => {
      // Get current balance
      const wallet = db.prepare(
        'SELECT balance_after FROM ledger_entries WHERE user_id = ? ORDER BY rowid DESC LIMIT 1'
      ).get(req.user!.userId) as { balance_after: number } | undefined
      const balance = wallet?.balance_after ?? 0

      if (balance < cost.total) {
        throw Object.assign(new Error('Insufficient key balance'), { status: 402 })
      }

      const now = new Date().toISOString()
      const bookingId = generateId('booking')
      const ledgerId = generateId('ledger')

      db.prepare(`
        INSERT INTO bookings (id,member_id,property_id,household_id,check_in,check_out,nights,guests,keys_charged,status,confirmed_at,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(bookingId, req.user!.userId, propertyId, householdId ?? null, checkIn, checkOut, cost.nights, guests, cost.total, 'confirmed', now, now, now)

      db.prepare(`
        INSERT INTO ledger_entries (id,user_id,type,amount,balance_after,description,booking_id,created_at)
        VALUES (?,?,?,?,?,?,?,?)
      `).run(ledgerId, req.user!.userId, 'booking_debit', -cost.total, balance - cost.total,
        `${prop.title} — ${cost.nights} nights`, bookingId, now)

      // Increment property total_bookings
      db.prepare('UPDATE properties SET total_bookings = total_bookings + 1, updated_at = ? WHERE id = ?').run(now, propertyId)

      return db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId) as Record<string, unknown>
    })

    const row = createBooking()
    res.status(201).json(rowToBooking(row))
  } catch (e) { next(e) }
})

// GET /api/bookings/:id
router.get('/:id', authenticate, (req, res, next) => {
  try {
    const db = getDb()
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined
    if (!row) { res.status(404).json({ error: 'Booking not found' }); return }
    // Only the member, owner of the property, or admin can access
    if (req.user!.role === 'member' && row.member_id !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' }); return
    }
    res.json(rowToBooking(row))
  } catch (e) { next(e) }
})

// POST /api/bookings/:id/cancel
router.post('/:id/cancel', authenticate, (req, res, next) => {
  try {
    const { reason } = req.body as { reason?: string }
    const db = getDb()
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined
    if (!row) { res.status(404).json({ error: 'Booking not found' }); return }
    if (req.user!.role !== 'admin' && row.member_id !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' }); return
    }
    if (row.status === 'cancelled') {
      res.status(400).json({ error: 'Booking already cancelled' }); return
    }

    const cancel = db.transaction(() => {
      const now = new Date().toISOString()
      db.prepare(`
        UPDATE bookings SET status = 'cancelled', cancellation_reason = ?, cancelled_at = ?, updated_at = ? WHERE id = ?
      `).run(reason ?? null, now, now, req.params.id)

      // Refund keys
      const keysCharged = row.keys_charged as number
      const wallet = db.prepare(
        'SELECT balance_after FROM ledger_entries WHERE user_id = ? ORDER BY rowid DESC LIMIT 1'
      ).get(row.member_id as string) as { balance_after: number } | undefined
      const balance = wallet?.balance_after ?? 0

      db.prepare(`
        INSERT INTO ledger_entries (id,user_id,type,amount,balance_after,description,booking_id,created_at)
        VALUES (?,?,?,?,?,?,?,?)
      `).run(generateId('ledger'), row.member_id, 'cancellation_refund', keysCharged, balance + keysCharged,
        'Refund: booking cancellation', req.params.id, now)

      return db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as Record<string, unknown>
    })

    res.json(rowToBooking(cancel()))
  } catch (e) { next(e) }
})

export default router
