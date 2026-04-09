import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getDb } from '../db/connection'
import { signToken } from '../utils/jwt'
import { authenticate } from '../middleware/auth'
import { generateId } from '../utils/generateId'

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

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' })
      return
    }

    const db = getDb()
    const row = db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(email) as Record<string, unknown> | undefined
    if (!row) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }
    if (row.status === 'suspended') {
      res.status(403).json({ error: 'Your account has been suspended' })
      return
    }

    const valid = bcrypt.compareSync(password, row.password_hash as string)
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const user = rowToUser(row)
    const token = signToken({ userId: user.id as string, role: user.role as string })
    res.json({ user, token })
  } catch (e) {
    next(e)
  }
})

// POST /api/auth/signup
router.post('/signup', (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body as {
      email?: string; password?: string; firstName?: string; lastName?: string; role?: string
    }
    if (!email || !password || !firstName || !lastName || !role) {
      res.status(400).json({ error: 'All fields are required' })
      return
    }
    if (!['member', 'owner'].includes(role)) {
      res.status(400).json({ error: 'Role must be member or owner' })
      return
    }

    const db = getDb()
    const existing = db.prepare('SELECT id FROM users WHERE lower(email) = lower(?)').get(email)
    if (existing) {
      res.status(409).json({ error: 'Email already in use' })
      return
    }

    const hash = bcrypt.hashSync(password, 10)
    const now = new Date().toISOString()
    const id = generateId('user')
    db.prepare(`
      INSERT INTO users (id,email,password_hash,first_name,last_name,role,status,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(id, email.toLowerCase(), hash, firstName, lastName, role, 'active', now, now)

    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown>
    const user = rowToUser(row)
    const token = signToken({ userId: id, role })
    res.status(201).json({ user, token })
  } catch (e) {
    next(e)
  }
})

// GET /api/auth/me
router.get('/me', authenticate, (req, res, next) => {
  try {
    const db = getDb()
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.userId) as Record<string, unknown> | undefined
    if (!row) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(rowToUser(row))
  } catch (e) {
    next(e)
  }
})

export default router
