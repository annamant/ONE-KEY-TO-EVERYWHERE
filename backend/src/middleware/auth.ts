import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { getDb } from '../db/connection'

export interface AuthUser {
  userId: string
  role: 'member' | 'owner' | 'admin'
  status: 'active' | 'suspended' | 'pending_verification'
  email: string
  emailVerified: boolean
}

declare global {
  // Express request augmentation (required by @types/express)
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return
  }
  const token = header.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  const db = getDb()
  const row = db.prepare(
    'SELECT id, role, status, email, email_verified_at FROM users WHERE id = ?'
  ).get(payload.userId) as
    | { id: string; role: AuthUser['role']; status: AuthUser['status']; email: string; email_verified_at: string | null }
    | undefined

  if (!row) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }
  if (row.status === 'suspended') {
    res.status(403).json({ error: 'Your account has been suspended', code: 'account_suspended' })
    return
  }

  req.user = {
    userId: row.id,
    role: row.role,
    status: row.status,
    email: row.email,
    emailVerified: Boolean(row.email_verified_at),
  }
  next()
}

/** Require membership to be active (approved). Admins/owners bypass. */
export function requireActiveMember(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  if (req.user.role === 'member' && req.user.status !== 'active') {
    res.status(403).json({ error: 'Membership pending approval' })
    return
  }
  next()
}

/** Block sensitive member actions until email is verified. */
export function requireVerifiedEmail(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  if (req.user.role === 'member' && !req.user.emailVerified) {
    res.status(403).json({ error: 'Please verify your email before continuing', code: 'email_unverified' })
    return
  }
  next()
}
