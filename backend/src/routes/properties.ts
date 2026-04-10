import { Router } from 'express'
import { getDb } from '../db/connection'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { generateId } from '../utils/generateId'

const router = Router()

function rowToProp(row: Record<string, unknown>) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    region: row.region,
    country: row.country,
    city: row.city,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    sleeps: row.sleeps,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    keysPerNight: row.keys_per_night,
    minStay: row.min_stay,
    maxStay: row.max_stay,
    tier: row.tier,
    status: row.status,
    amenities: JSON.parse(row.amenities as string || '[]'),
    houseRules: JSON.parse(row.house_rules as string || '[]'),
    coverImage: row.cover_image,
    images: JSON.parse(row.images as string || '[]'),
    blackoutDates: JSON.parse(row.blackout_dates as string || '[]'),
    listingQualityScore: row.listing_quality_score,
    totalBookings: row.total_bookings,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// GET /api/properties/admin  (admin — all statuses)
router.get('/admin', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { status } = req.query as { status?: string }
    const db = getDb()
    let sql = 'SELECT * FROM properties WHERE 1=1'
    const params: unknown[] = []
    if (status) { sql += ' AND status = ?'; params.push(status) }
    sql += ' ORDER BY created_at DESC'
    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[]
    res.json(rows.map(rowToProp))
  } catch (e) { next(e) }
})

// GET /api/properties/owner  (owner — own listings)
router.get('/owner', authenticate, requireRole('owner'), (req, res, next) => {
  try {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM properties WHERE owner_id = ? ORDER BY created_at DESC').all(req.user!.userId) as Record<string, unknown>[]
    res.json(rows.map(rowToProp))
  } catch (e) { next(e) }
})

// GET /api/properties  (public — approved only, with search filters)
router.get('/', authenticate, (req, res, next) => {
  try {
    const { region, sleeps, maxKeys, minKeys, query, amenities, checkIn, checkOut } = req.query as Record<string, string | undefined>
    const db = getDb()
    let sql = "SELECT * FROM properties WHERE status = 'approved'"
    const params: unknown[] = []

    if (region)  { sql += ' AND region = ?';              params.push(region) }
    if (sleeps)  { sql += ' AND sleeps >= ?';             params.push(Number(sleeps)) }
    if (maxKeys) { sql += ' AND keys_per_night <= ?';     params.push(Number(maxKeys)) }
    if (minKeys) { sql += ' AND keys_per_night >= ?';     params.push(Number(minKeys)) }
    if (query) {
      const q = `%${query.toLowerCase()}%`
      sql += ' AND (lower(title) LIKE ? OR lower(city) LIKE ? OR lower(country) LIKE ? OR lower(description) LIKE ?)'
      params.push(q, q, q, q)
    }

    let rows = db.prepare(sql).all(...params) as Record<string, unknown>[]
    let results = rows.map(rowToProp)

    // Amenities filter (post-query since stored as JSON)
    if (amenities) {
      const required = amenities.split(',').filter(Boolean)
      if (required.length > 0) {
        results = results.filter((p) => required.every((a) => (p.amenities as string[]).includes(a)))
      }
    }

    // Blackout date filter
    if (checkIn && checkOut) {
      results = results.filter((p) =>
        !(p.blackoutDates as string[]).some((bd) => bd >= checkIn! && bd < checkOut!)
      )
    }

    res.json(results)
  } catch (e) { next(e) }
})

// POST /api/properties  (owner — create)
router.post('/', authenticate, requireRole('owner'), (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>
    const now = new Date().toISOString()
    const id = generateId('prop')
    const db = getDb()
    db.prepare(`
      INSERT INTO properties
        (id,owner_id,title,slug,description,region,country,city,address,latitude,longitude,
         sleeps,bedrooms,bathrooms,keys_per_night,min_stay,max_stay,tier,status,amenities,
         house_rules,cover_image,images,blackout_dates,listing_quality_score,total_bookings,
         created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      id, req.user!.userId,
      body.title, body.slug ?? id, body.description,
      body.region, body.country, body.city, body.address,
      body.latitude, body.longitude,
      body.sleeps, body.bedrooms, body.bathrooms, body.keysPerNight,
      body.minStay ?? 1, body.maxStay ?? 30, body.tier,
      'pending_approval',
      JSON.stringify(body.amenities ?? []),
      JSON.stringify(body.houseRules ?? []),
      body.coverImage ?? '',
      JSON.stringify(body.images ?? []),
      JSON.stringify(body.blackoutDates ?? []),
      70, 0, now, now
    )
    const row = db.prepare('SELECT * FROM properties WHERE id = ?').get(id) as Record<string, unknown>
    res.status(201).json(rowToProp(row))
  } catch (e) { next(e) }
})

// GET /api/properties/:id
router.get('/:id', authenticate, (req, res, next) => {
  try {
    const db = getDb()
    const row = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined
    if (!row) { res.status(404).json({ error: 'Property not found' }); return }
    res.json(rowToProp(row))
  } catch (e) { next(e) }
})

// PATCH /api/properties/:id  (owner — update own)
router.patch('/:id', authenticate, requireRole('owner', 'admin'), (req, res, next) => {
  try {
    const { id } = req.params
    const db = getDb()
    const existing = db.prepare('SELECT * FROM properties WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!existing) { res.status(404).json({ error: 'Property not found' }); return }
    if (req.user!.role === 'owner' && existing.owner_id !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' }); return
    }

    const body = req.body as Record<string, unknown>
    const now = new Date().toISOString()
    const allowedFields: Record<string, string> = {
      title: 'title', slug: 'slug', description: 'description',
      region: 'region', country: 'country', city: 'city', address: 'address',
      latitude: 'latitude', longitude: 'longitude',
      sleeps: 'sleeps', bedrooms: 'bedrooms', bathrooms: 'bathrooms',
      keysPerNight: 'keys_per_night', minStay: 'min_stay', maxStay: 'max_stay',
      tier: 'tier', coverImage: 'cover_image',
    }
    const jsonFields: Record<string, string> = {
      amenities: 'amenities', houseRules: 'house_rules',
      images: 'images', blackoutDates: 'blackout_dates',
    }

    const sets: string[] = ['updated_at = ?']
    const params: unknown[] = [now]
    for (const [key, col] of Object.entries(allowedFields)) {
      if (body[key] !== undefined) { sets.push(`${col} = ?`); params.push(body[key]) }
    }
    for (const [key, col] of Object.entries(jsonFields)) {
      if (body[key] !== undefined) { sets.push(`${col} = ?`); params.push(JSON.stringify(body[key])) }
    }
    params.push(id)
    db.prepare(`UPDATE properties SET ${sets.join(', ')} WHERE id = ?`).run(...params)
    const row = db.prepare('SELECT * FROM properties WHERE id = ?').get(id) as Record<string, unknown>
    res.json(rowToProp(row))
  } catch (e) { next(e) }
})

// POST /api/properties/:id/status  (admin — review)
router.post('/:id/status', authenticate, requireRole('admin'), (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body as { status?: string }
    const validStatuses = ['draft','pending_approval','approved','rejected','suspended']
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' }); return
    }
    const db = getDb()
    const now = new Date().toISOString()
    db.prepare('UPDATE properties SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id)
    const row = db.prepare('SELECT * FROM properties WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!row) { res.status(404).json({ error: 'Property not found' }); return }
    res.json(rowToProp(row))
  } catch (e) { next(e) }
})

// PATCH /api/properties/:id/blackouts  (owner)
router.patch('/:id/blackouts', authenticate, requireRole('owner', 'admin'), (req, res, next) => {
  try {
    const { id } = req.params
    const { dates } = req.body as { dates?: string[] }
    if (!Array.isArray(dates)) { res.status(400).json({ error: 'dates must be an array' }); return }
    const db = getDb()
    const existing = db.prepare('SELECT * FROM properties WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!existing) { res.status(404).json({ error: 'Property not found' }); return }
    if (req.user!.role === 'owner' && existing.owner_id !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' }); return
    }
    const now = new Date().toISOString()
    db.prepare('UPDATE properties SET blackout_dates = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(dates), now, id)
    const row = db.prepare('SELECT * FROM properties WHERE id = ?').get(id) as Record<string, unknown>
    res.json(rowToProp(row))
  } catch (e) { next(e) }
})

export default router
