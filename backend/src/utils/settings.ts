import { getDb } from '../db/connection'

const DEFAULTS = {
  platformName: 'One Key to Everywhere',
  supportEmail: 'support@okte.com',
  defaultTier: 'premium',
  maxKeys: 500,
  minKeys: 10,
  reviewDays: 2,
  /** Hours before check-in when free cancellation ends. */
  cancellationWindow: 48,
  maintenanceMode: false,
} as const

export type PlatformSettings = {
  platformName: string
  supportEmail: string
  defaultTier: string
  maxKeys: number
  minKeys: number
  reviewDays: number
  cancellationWindow: number
  maintenanceMode: boolean
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return value === 'true' || value === '1'
}

function parseIntSetting(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function getSettings(): PlatformSettings {
  const db = getDb()
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
  const map: Record<string, string> = {}
  for (const r of rows) map[r.key] = r.value

  return {
    platformName: map.platformName ?? DEFAULTS.platformName,
    supportEmail: map.supportEmail ?? DEFAULTS.supportEmail,
    defaultTier: map.defaultTier ?? DEFAULTS.defaultTier,
    maxKeys: parseIntSetting(map.maxKeys, DEFAULTS.maxKeys),
    minKeys: parseIntSetting(map.minKeys, DEFAULTS.minKeys),
    reviewDays: parseIntSetting(map.reviewDays, DEFAULTS.reviewDays),
    cancellationWindow: parseIntSetting(map.cancellationWindow, DEFAULTS.cancellationWindow),
    maintenanceMode: parseBool(map.maintenanceMode, DEFAULTS.maintenanceMode),
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TIERS = new Set(['standard', 'premium', 'luxury'])

export function validateSettingsPatch(body: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}

  if (body.platformName !== undefined) {
    const v = String(body.platformName).trim()
    if (!v || v.length > 80) throw Object.assign(new Error('platformName must be 1–80 characters'), { status: 400 })
    out.platformName = v
  }
  if (body.supportEmail !== undefined) {
    const v = String(body.supportEmail).trim().toLowerCase()
    if (!EMAIL_RE.test(v)) throw Object.assign(new Error('supportEmail must be a valid email'), { status: 400 })
    out.supportEmail = v
  }
  if (body.defaultTier !== undefined) {
    const v = String(body.defaultTier)
    if (!TIERS.has(v)) throw Object.assign(new Error('defaultTier must be standard, premium, or luxury'), { status: 400 })
    out.defaultTier = v
  }
  for (const key of ['maxKeys', 'minKeys', 'reviewDays', 'cancellationWindow'] as const) {
    if (body[key] !== undefined) {
      const n = Number(body[key])
      if (!Number.isInteger(n) || n < 0 || n > 10000) {
        throw Object.assign(new Error(`${key} must be an integer between 0 and 10000`), { status: 400 })
      }
      out[key] = String(n)
    }
  }
  if (out.maxKeys !== undefined && out.minKeys !== undefined && Number(out.minKeys) > Number(out.maxKeys)) {
    throw Object.assign(new Error('minKeys cannot exceed maxKeys'), { status: 400 })
  }
  if (body.maintenanceMode !== undefined) {
    const v = String(body.maintenanceMode)
    if (v !== 'true' && v !== 'false') {
      throw Object.assign(new Error('maintenanceMode must be true or false'), { status: 400 })
    }
    out.maintenanceMode = v
  }

  return out
}
