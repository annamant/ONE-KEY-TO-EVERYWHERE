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
    const { limit, offset } = req.query as Record<string, string | undefined>
    const db = getDb()
    const lim = Math.min(Math.max(Number(limit ?? 50), 1), 100)
    const off = Math.max(Number(offset ?? 0), 0)
    const rows = db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(req.user!.userId, lim, off) as Record<string, unknown>[]
    const unread = db.prepare(
      'SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read = 0'
    ).get(req.user!.userId) as { c: number }
    // Keep array response for existing clients; expose unread via header
    res.setHeader('X-Unread-Count', String(unread.c))
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
