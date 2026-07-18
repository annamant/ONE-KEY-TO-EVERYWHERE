import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getDb } from '../db/connection'
import { signToken, signPasswordResetToken, verifyPasswordResetToken, signEmailVerificationToken, verifyEmailVerificationToken } from '../utils/jwt'
import { authenticate } from '../middleware/auth'
import { generateId } from '../utils/generateId'
import { notifyAdmins } from '../utils/notifyAdmins'
import { sendEmail, passwordResetEmail, emailVerificationEmail } from '../utils/email'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8
const MAX_PASSWORD = 128
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000
const RESEND_COOLDOWN_MS = 30 * 1000

function rowToUser(row: Record<string, unknown>) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    status: row.status,
    emailVerified: Boolean(row.email_verified_at),
    avatarUrl: row.avatar_url ?? null,
    phone: row.phone ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Issues a fresh email-verification token, persists it, and sends the email.
 *  Failures are logged but never thrown — signup/refresh must not break on email errors. */
async function sendVerificationEmailFor(userId: string): Promise<void> {
  const db = getDb()
  const row = db.prepare('SELECT email, first_name FROM users WHERE id = ?').get(userId) as
    | { email: string; first_name: string }
    | undefined
  if (!row) return

  const token = signEmailVerificationToken(userId)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + EMAIL_VERIFICATION_TTL_MS).toISOString()
  db.prepare(`
    INSERT INTO email_verification_tokens (token, user_id, expires_at, created_at)
    VALUES (?,?,?,?)
  `).run(token, userId, expiresAt, now.toISOString())

  try {
    const mail = emailVerificationEmail(row.first_name, token)
    await sendEmail({ ...mail, to: row.email })
  } catch (e) {
    console.error('[email] failed to send verification email:', e)
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
      res.status(403).json({ error: 'Your account has been suspended', code: 'account_suspended' })
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
    if (role !== 'member') {
      res.status(403).json({
        error: 'Property owners join via Open Your Doors. Submit an enquiry at /open-doors and our team will be in touch.',
      })
      return
    }
    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'Enter a valid email address' })
      return
    }
    if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
      res.status(400).json({ error: `Password must be between ${MIN_PASSWORD} and ${MAX_PASSWORD} characters` })
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
    `).run(id, email.toLowerCase(), hash, firstName, lastName, role, 'pending_verification', now, now)

    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown>
    const user = rowToUser(row)
    const token = signToken({ userId: id, role })

    notifyAdmins({
      type: 'admin_alert',
      title: 'New membership application',
      body: `${firstName} ${lastName} (${email.toLowerCase()})`,
      link: `/admin/requests?tab=membership`,
    })

    // Send the email confirmation link via Resend (or log to console in dev).
    // Fire-and-forget: a failed send must not break signup.
    void sendVerificationEmailFor(id)

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

// POST /api/auth/forgot-password — request a reset link
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body as { email?: string }
    if (!email || !EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'Enter a valid email address' })
      return
    }

    const db = getDb()
    const row = db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(email) as Record<string, unknown> | undefined

    // Always respond 200 to avoid leaking which emails are registered.
    if (row) {
      const token = signPasswordResetToken(row.id as string)
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString()
      db.prepare(`
        INSERT INTO password_reset_tokens (token, user_id, expires_at, created_at)
        VALUES (?,?,?,?)
      `).run(token, row.id, expiresAt, now.toISOString())

      try {
        const mail = passwordResetEmail(row.first_name as string, token)
        await sendEmail({ ...mail, to: row.email as string })
      } catch (e) {
        console.error('[email] failed to send password reset email:', e)
      }
    }

    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

// POST /api/auth/reset-password — set a new password with a token
router.post('/reset-password', (req, res, next) => {
  try {
    const { token, password } = req.body as { token?: string; password?: string }
    if (!token || !password) {
      res.status(400).json({ error: 'token and password are required' })
      return
    }
    if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
      res.status(400).json({ error: `Password must be between ${MIN_PASSWORD} and ${MAX_PASSWORD} characters` })
      return
    }

    const payload = verifyPasswordResetToken(token)
    if (!payload) {
      res.status(400).json({ error: 'Invalid or expired reset token' })
      return
    }

    const db = getDb()
    const stored = db.prepare('SELECT * FROM password_reset_tokens WHERE token = ?').get(token) as Record<string, unknown> | undefined
    if (!stored || stored.used_at) {
      res.status(400).json({ error: 'Invalid or expired reset token' })
      return
    }
    if (new Date(stored.expires_at as string) < new Date()) {
      res.status(400).json({ error: 'Reset token has expired' })
      return
    }

    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId) as Record<string, unknown> | undefined
    if (!userRow) {
      res.status(400).json({ error: 'Invalid or expired reset token' })
      return
    }

    const hash = bcrypt.hashSync(password, 10)
    const now = new Date().toISOString()
    db.transaction(() => {
      db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(hash, now, payload.userId)
      db.prepare('UPDATE password_reset_tokens SET used_at = ? WHERE token = ?').run(now, token)
    })()

    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

// POST /api/auth/verify-email — confirm email address with a token from the email
router.post('/verify-email', (req, res, next) => {
  try {
    const { token } = req.body as { token?: string }
    if (!token) {
      res.status(400).json({ error: 'token is required' })
      return
    }

    const payload = verifyEmailVerificationToken(token)
    if (!payload) {
      res.status(400).json({ error: 'Invalid or expired verification link' })
      return
    }

    const db = getDb()
    const stored = db.prepare('SELECT * FROM email_verification_tokens WHERE token = ?').get(token) as Record<string, unknown> | undefined
    if (!stored || stored.used_at) {
      res.status(400).json({ error: 'Invalid or expired verification link' })
      return
    }
    if (new Date(stored.expires_at as string) < new Date()) {
      res.status(400).json({ error: 'Verification link has expired' })
      return
    }

    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId) as Record<string, unknown> | undefined
    if (!userRow) {
      res.status(400).json({ error: 'Invalid or expired verification link' })
      return
    }

    const now = new Date().toISOString()
    db.transaction(() => {
      if (userRow.email_verified_at) {
        // Already verified — just mark this token used.
        db.prepare('UPDATE email_verification_tokens SET used_at = ? WHERE token = ?').run(now, token)
        return
      }
      db.prepare('UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?').run(now, now, payload.userId)
      db.prepare('UPDATE email_verification_tokens SET used_at = ? WHERE token = ?').run(now, token)
    })()

    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

// POST /api/auth/resend-verification — send a fresh verification link to the caller's own email
router.post('/resend-verification', authenticate, async (req, res, next) => {
  try {
    const db = getDb()
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.userId) as Record<string, unknown> | undefined
    if (!row) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    if (row.email_verified_at) {
      res.status(409).json({ error: 'Your email is already verified' })
      return
    }

    // Throttle resends to avoid abuse.
    const latest = db.prepare(`
      SELECT created_at FROM email_verification_tokens
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(req.user!.userId) as { created_at: string } | undefined
    if (latest && Date.now() - new Date(latest.created_at).getTime() < RESEND_COOLDOWN_MS) {
      res.status(429).json({ error: 'A verification email was just sent. Please wait a few seconds before requesting another.' })
      return
    }

    await sendVerificationEmailFor(req.user!.userId)
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

export default router
