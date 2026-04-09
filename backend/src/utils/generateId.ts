import crypto from 'crypto'

export function generateId(prefix: string): string {
  const suffix = crypto.randomBytes(4).toString('hex')
  return `${prefix}-${Date.now()}-${suffix}`
}
