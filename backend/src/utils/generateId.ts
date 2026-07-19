import crypto from 'crypto'

/** Short readable IDs for DB rows (not secrets). */
export function generateId(prefix: string): string {
  const suffix = crypto.randomBytes(4).toString('hex')
  return `${prefix}-${Date.now()}-${suffix}`
}

/** Cryptographically strong token for invites / secrets. */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}
