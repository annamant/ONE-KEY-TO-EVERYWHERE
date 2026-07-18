import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const SECRET = process.env.JWT_SECRET ?? 'okte-dev-secret-change-in-production'
const EXPIRES_IN = '30d'

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  // Fail fast in production rather than silently signing tokens with a known secret.
  throw new Error('JWT_SECRET must be set in production')
}

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, SECRET) as { userId: string; role: string }
  } catch {
    return null
  }
}

export function signEmailVerificationToken(userId: string): string {
  return jwt.sign(
    { userId, purpose: 'email_verification', jti: crypto.randomUUID() },
    SECRET,
    { expiresIn: '24h' }
  )
}

export function verifyEmailVerificationToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, SECRET) as { userId: string; purpose?: string }
    if (payload.purpose !== 'email_verification') return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}

export function signPasswordResetToken(userId: string): string {
  // Include a random jti so two tokens issued to the same user in the same
  // second still differ — the token is stored as PRIMARY KEY in the DB.
  return jwt.sign(
    { userId, purpose: 'password_reset', jti: crypto.randomUUID() },
    SECRET,
    { expiresIn: '1h' }
  )
}

export function verifyPasswordResetToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, SECRET) as { userId: string; purpose?: string }
    if (payload.purpose !== 'password_reset') return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}
