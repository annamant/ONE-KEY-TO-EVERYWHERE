import { Router } from 'express'
import { getDb } from '../db/connection'
import { generateId } from '../utils/generateId'
import { notifyAdmins } from '../utils/notifyAdmins'
import { sendEmail, ownerWaitlistAckEmail, memberWaitlistAckEmail } from '../utils/email'
import { clampString, optionalClampString } from '../utils/validate'

const router = Router()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function rowToOwnerEntry(row: Record<string, unknown>) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name ?? null,
    email: row.email,
    phone: row.phone ?? null,
    city: row.city,
    propertyType: row.property_type ?? null,
    message: row.message ?? null,
    status: row.status,
    adminNotes: row.admin_notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function rowToMemberEntry(row: Record<string, unknown>) {
  return {
    id: row.id,
    firstName: row.first_name,
    email: row.email,
    status: row.status,
    adminNotes: row.admin_notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// POST /api/waitlist/owner — property owner enquiry (Open Your Doors)
router.post('/owner', async (req, res, next) => {
  try {
    const firstName = clampString(req.body?.firstName, 80, 'firstName')
    const lastName = optionalClampString(req.body?.lastName, 80, 'lastName')
    const email = clampString(req.body?.email, 254, 'email').toLowerCase()
    const phone = optionalClampString(req.body?.phone, 40, 'phone')
    const city = clampString(req.body?.city, 120, 'city')
    const propertyType = optionalClampString(req.body?.propertyType, 80, 'propertyType')
    const message = optionalClampString(req.body?.message, 2000, 'message')

    if (!firstName || !email || !city) {
      res.status(400).json({ error: 'First name, email, and property location are required' })
      return
    }
    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'Enter a valid email address' })
      return
    }

    const db = getDb()
    const recent = db.prepare(`
      SELECT id FROM owner_waitlist
      WHERE lower(email) = lower(?) AND created_at > datetime('now', '-7 days')
      LIMIT 1
    `).get(email)
    if (recent) {
      res.status(409).json({ error: 'You already submitted an enquiry recently. Our team will be in touch.' })
      return
    }

    const now = new Date().toISOString()
    const id = generateId('ow')
    db.prepare(`
      INSERT INTO owner_waitlist (id, first_name, last_name, email, phone, city, property_type, message, status, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?, 'pending', ?, ?)
    `).run(id, firstName, lastName ?? null, email, phone ?? null, city, propertyType ?? null, message ?? null, now, now)

    notifyAdmins({
      type: 'admin_alert',
      title: 'New property owner enquiry',
      body: `${firstName} ${lastName ?? ''} — ${city}`.trim(),
      link: '/admin/requests?tab=owners',
    })

    const ack = ownerWaitlistAckEmail(firstName)
    await sendEmail({ ...ack, to: email })

    res.status(201).json(rowToOwnerEntry(
      db.prepare('SELECT * FROM owner_waitlist WHERE id = ?').get(id) as Record<string, unknown>
    ))
  } catch (e) { next(e) }
})

// POST /api/waitlist/member — member interest (founding waitlist)
router.post('/member', async (req, res, next) => {
  try {
    const firstName = clampString(req.body?.firstName, 80, 'firstName')
    const email = clampString(req.body?.email, 254, 'email').toLowerCase()
    if (!firstName || !email) {
      res.status(400).json({ error: 'First name and email are required' })
      return
    }
    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'Enter a valid email address' })
      return
    }

    const db = getDb()
    const existing = db.prepare('SELECT id FROM member_waitlist WHERE lower(email) = lower(?)').get(email)
    if (existing) {
      res.status(409).json({ error: 'This email is already on the waitlist' })
      return
    }

    const now = new Date().toISOString()
    const id = generateId('mw')
    try {
      db.prepare(`
        INSERT INTO member_waitlist (id, first_name, email, status, created_at, updated_at)
        VALUES (?,?,?, 'pending', ?, ?)
      `).run(id, firstName, email, now, now)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('UNIQUE')) {
        res.status(409).json({ error: 'This email is already on the waitlist' })
        return
      }
      throw err
    }

    notifyAdmins({
      type: 'admin_alert',
      title: 'New member waitlist signup',
      body: `${firstName} (${email})`,
      link: '/admin/requests?tab=waitlist',
    })

    const ack = memberWaitlistAckEmail(firstName)
    await sendEmail({ ...ack, to: email })

    res.status(201).json(rowToMemberEntry(
      db.prepare('SELECT * FROM member_waitlist WHERE id = ?').get(id) as Record<string, unknown>
    ))
  } catch (e) { next(e) }
})

export { rowToOwnerEntry, rowToMemberEntry }
export default router
