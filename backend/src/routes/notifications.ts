import { Router } from 'express'
import { getDb } from '../db/connection'
import { authenticate } from '../middleware/auth'

const router = Router()

function rowToNotif(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    read: row.read === 1 || row.read === true,
    link: row.link ?? null,
    createdAt: row.created_at,
  }
}

// GET /api/notifications
router.get('/', authenticate, (req, res, next) => {
  try {
    const db = getDb()
    const rows = db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
    ).all(req.user!.userId) as Record<string, unknown>[]
    res.json(rows.map(rowToNotif))
  } catch (e) { next(e) }
})

// PATCH /api/notifications/read-all  (must be before /:id/read)
router.patch('/read-all', authenticate, (req, res, next) => {
  try {
    const db = getDb()
    db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user!.userId)
    res.status(204).send()
  } catch (e) { next(e) }
})

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, (req, res, next) => {
  try {
    const db = getDb()
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.userId)
    res.status(204).send()
  } catch (e) { next(e) }
})

export default router
