import { Router } from 'express'
import { getDb } from '../db/connection'
import { authenticate, requireActiveMember, requireVerifiedEmail } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { generateId } from '../utils/generateId'
import { assertBookingAllowed, refundFraction } from '../utils/bookingRules'
import { getSettings } from '../utils/settings'
import { notifyUser } from '../utils/notifyAdmins'

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
    membershipUsed: row.keys_charged,
    status: row.status,
    cancellationReason: row.cancellation_reason ?? null,
    cancelledAt: row.cancelled_at ?? null,
    confirmedAt: row.confirmed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function getBalance(db: ReturnType<typeof getDb>, userId: string): number {
  const wallet = db.prepare(
    'SELECT balance_after FROM ledger_entries WHERE user_id = ? ORDER BY rowid DESC LIMIT 1'
  ).get(userId) as { balance_after: number } | undefined
  return wallet?.balance_after ?? 0
}

function canAccessBooking(
  user: { userId: string; role: string },
  booking: Record<string, unknown>,
  propertyOwnerId: string | undefined
): boolean {
  if (user.role === 'admin') return true
  if (user.role === 'member') return booking.member_id === user.userId
  if (user.role === 'owner') return propertyOwnerId === user.userId
  return false
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

// GET /api/bookings/owner — bookings for the authenticated owner's properties
router.get('/owner', authenticate, requireRole('owner', 'admin'), (req, res, next) => {
  try {
    const db = getDb()
    const rows = req.user!.role === 'admin'
      ? db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all() as Record<string, unknown>[]
      : db.prepare(`
          SELECT b.* FROM bookings b
          JOIN properties p ON p.id = b.property_id
          WHERE p.owner_id = ?
          ORDER BY b.created_at DESC
        `).all(req.user!.userId) as Record<string, unknown>[]
    res.json(rows.map(rowToBooking))
  } catch (e) { next(e) }
})

// GET /api/bookings/property/:propertyId  (owner of that property or admin)
router.get('/property/:propertyId', authenticate, requireRole('owner', 'admin'), (req, res, next) => {
  try {
    const db = getDb()
    const prop = db.prepare('SELECT owner_id FROM properties WHERE id = ?').get(req.params.propertyId) as
      | { owner_id: string }
      | undefined
    if (!prop) { res.status(404).json({ error: 'Property not found' }); return }
    if (req.user!.role === 'owner' && prop.owner_id !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' }); return
    }
    const rows = db.prepare(
      "SELECT * FROM bookings WHERE property_id = ? AND status != 'cancelled' ORDER BY check_in ASC"
    ).all(req.params.propertyId) as Record<string, unknown>[]
    res.json(rows.map(rowToBooking))
  } catch (e) { next(e) }
})

// GET /api/bookings  (current user's bookings)
router.get('/', authenticate, requireActiveMember, (req, res, next) => {
  try {
    const db = getDb()
    const rows = db.prepare(
      'SELECT * FROM bookings WHERE member_id = ? ORDER BY created_at DESC'
    ).all(req.user!.userId) as Record<string, unknown>[]
    res.json(rows.map(rowToBooking))
  } catch (e) { next(e) }
})

// POST /api/bookings  (member — create)
router.post('/', authenticate, requireRole('member'), requireActiveMember, requireVerifiedEmail, (req, res, next) => {
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

    const existing = db.prepare(
      'SELECT id, check_in, check_out, status FROM bookings WHERE property_id = ?'
    ).all(propertyId) as { id: string; check_in: string; check_out: string; status: string }[]

    const cost = assertBookingAllowed({
      property: prop as never,
      checkIn,
      checkOut,
      guests: Number(guests),
      existingBookings: existing,
    })

    const settings = getSettings()
    if (cost.total > settings.maxKeys) {
      res.status(400).json({ error: `Stay exceeds maximum membership use of ${settings.maxKeys}` }); return
    }
    if (cost.total < settings.minKeys && cost.nights >= settings.minKeys) {
      // minKeys is package floor; stay cost can be below it
    }

    const createBooking = db.transaction(() => {
      const balance = getBalance(db, req.user!.userId)
      if (balance < cost.total) {
        throw Object.assign(new Error('Membership does not cover this stay'), { status: 402 })
      }

      // Re-check overlaps inside the transaction
      const locked = db.prepare(
        'SELECT id, check_in, check_out, status FROM bookings WHERE property_id = ?'
      ).all(propertyId) as { id: string; check_in: string; check_out: string; status: string }[]
      assertBookingAllowed({
        property: prop as never,
        checkIn,
        checkOut,
        guests: Number(guests),
        existingBookings: locked,
      })

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
        `${prop.title}`, bookingId, now)

      db.prepare('UPDATE properties SET total_bookings = total_bookings + 1, updated_at = ? WHERE id = ?').run(now, propertyId)

      return db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId) as Record<string, unknown>
    })

    const row = createBooking()

    const owner = db.prepare('SELECT owner_id FROM properties WHERE id = ?').get(propertyId) as { owner_id: string } | undefined
    if (owner) {
      notifyUser(owner.owner_id, {
        type: 'booking_confirmed',
        title: 'New reservation',
        body: `A guest booked ${prop.title as string}`,
        link: `/owner/reservations/${row.id}`,
      })
    }

    res.status(201).json(rowToBooking(row))
  } catch (e) { next(e) }
})

// GET /api/bookings/:id
router.get('/:id', authenticate, (req, res, next) => {
  try {
    const db = getDb()
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined
    if (!row) { res.status(404).json({ error: 'Booking not found' }); return }

    const prop = db.prepare('SELECT owner_id FROM properties WHERE id = ?').get(row.property_id) as
      | { owner_id: string }
      | undefined
    if (!canAccessBooking(req.user!, row, prop?.owner_id)) {
      res.status(403).json({ error: 'Forbidden' }); return
    }

    // Owners get limited guest fields for their reservation detail UI
    if (req.user!.role === 'owner' || req.user!.role === 'admin') {
      const guest = db.prepare(
        'SELECT id, first_name, last_name, email, phone, avatar_url FROM users WHERE id = ?'
      ).get(row.member_id) as Record<string, unknown> | undefined
      res.json({
        ...rowToBooking(row),
        guest: guest ? {
          id: guest.id,
          firstName: guest.first_name,
          lastName: guest.last_name,
          email: guest.email,
          phone: guest.phone ?? null,
          avatarUrl: guest.avatar_url ?? null,
        } : null,
      })
      return
    }

    res.json(rowToBooking(row))
  } catch (e) { next(e) }
})

// PATCH /api/bookings/:id — member modify dates
router.patch('/:id', authenticate, requireRole('member'), requireActiveMember, requireVerifiedEmail, (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.body as { checkIn?: string; checkOut?: string }
    if (!checkIn || !checkOut) {
      res.status(400).json({ error: 'checkIn and checkOut are required' }); return
    }

    const db = getDb()
    const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined
    if (!existing) { res.status(404).json({ error: 'Booking not found' }); return }
    if (existing.member_id !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' }); return
    }
    if (!['confirmed', 'pending'].includes(existing.status as string)) {
      res.status(400).json({ error: 'Only confirmed bookings can be modified' }); return
    }

    const settings = getSettings()
    const fraction = refundFraction(existing.check_in as string, settings.cancellationWindow)
    if (fraction < 1) {
      res.status(400).json({ error: `Changes must be made at least ${settings.cancellationWindow} hours before check-in` }); return
    }

    const prop = db.prepare('SELECT * FROM properties WHERE id = ?').get(existing.property_id) as Record<string, unknown> | undefined
    if (!prop || prop.status !== 'approved') {
      res.status(404).json({ error: 'Property not found or not available' }); return
    }

    const others = db.prepare(
      'SELECT id, check_in, check_out, status FROM bookings WHERE property_id = ?'
    ).all(existing.property_id) as { id: string; check_in: string; check_out: string; status: string }[]

    const cost = assertBookingAllowed({
      property: prop as never,
      checkIn,
      checkOut,
      guests: Number(existing.guests),
      existingBookings: others,
      excludeBookingId: existing.id as string,
    })

    const modify = db.transaction(() => {
      const oldCost = existing.keys_charged as number
      const delta = cost.total - oldCost
      const balance = getBalance(db, req.user!.userId)
      if (delta > 0 && balance < delta) {
        throw Object.assign(new Error('Membership does not cover the new stay length'), { status: 402 })
      }

      const now = new Date().toISOString()
      db.prepare(`
        UPDATE bookings SET check_in = ?, check_out = ?, nights = ?, keys_charged = ?, updated_at = ?
        WHERE id = ?
      `).run(checkIn, checkOut, cost.nights, cost.total, now, existing.id)

      if (delta !== 0) {
        db.prepare(`
          INSERT INTO ledger_entries (id,user_id,type,amount,balance_after,description,booking_id,created_at)
          VALUES (?,?,?,?,?,?,?,?)
        `).run(
          generateId('ledger'),
          req.user!.userId,
          delta > 0 ? 'booking_debit' : 'cancellation_refund',
          -delta,
          balance - delta,
          delta > 0 ? 'Booking modification (extra nights)' : 'Booking modification (refund)',
          existing.id,
          now,
        )
      }

      return db.prepare('SELECT * FROM bookings WHERE id = ?').get(existing.id) as Record<string, unknown>
    })

    res.json(rowToBooking(modify()))
  } catch (e) { next(e) }
})

// PATCH /api/bookings/:id/override  (admin)
router.patch('/:id/override', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { id } = req.params
    const { status, note } = req.body as { status?: string; note?: string }
    const validStatuses = ['pending','confirmed','active','completed','cancelled','no_show']
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' }); return
    }

    const db = getDb()
    const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!existing) { res.status(404).json({ error: 'Booking not found' }); return }
    if (existing.status === status) {
      res.status(400).json({ error: 'Booking already has that status' }); return
    }

    const now = new Date().toISOString()
    const override = db.transaction(() => {
      const prev = existing.status as string
      const cancelledAt = status === 'cancelled' ? now : existing.cancelled_at ?? null
      db.prepare(`
        UPDATE bookings SET status = ?, cancelled_at = ?, updated_at = ? WHERE id = ?
      `).run(status, cancelledAt, now, id)

      db.prepare(`
        INSERT INTO booking_overrides (id, booking_id, admin_id, previous_status, new_status, note, created_at)
        VALUES (?,?,?,?,?,?,?)
      `).run(generateId('override'), id, req.user!.userId, prev, status, note ?? null, now)

      return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Record<string, unknown>
    })

    res.json(rowToBooking(override()))
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

    const settings = getSettings()
    const fraction = req.user!.role === 'admin'
      ? 1
      : refundFraction(row.check_in as string, settings.cancellationWindow)

    const cancel = db.transaction(() => {
      const now = new Date().toISOString()
      db.prepare(`
        UPDATE bookings SET status = 'cancelled', cancellation_reason = ?, cancelled_at = ?, updated_at = ? WHERE id = ?
      `).run(reason ?? null, now, now, req.params.id)

      const membershipUsed = row.keys_charged as number
      const refundAmount = Math.round(membershipUsed * fraction)
      if (refundAmount > 0) {
        const balance = getBalance(db, row.member_id as string)
        db.prepare(`
          INSERT INTO ledger_entries (id,user_id,type,amount,balance_after,description,booking_id,created_at)
          VALUES (?,?,?,?,?,?,?,?)
        `).run(
          generateId('ledger'),
          row.member_id,
          'cancellation_refund',
          refundAmount,
          balance + refundAmount,
          fraction < 1 ? 'Partial refund: late cancellation' : 'Refund: booking cancellation',
          req.params.id,
          now,
        )
      }

      return db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as Record<string, unknown>
    })

    res.json(rowToBooking(cancel()))
  } catch (e) { next(e) }
})

export default router
