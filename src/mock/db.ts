import type {
  User,
  Property,
  Booking,
  LedgerEntry,
  Household,
  HouseholdAuditEntry,
  Notification,
} from '@/types'
import {
  SEED_USERS,
  SEED_PROPERTIES,
  SEED_BOOKINGS,
  SEED_LEDGER,
  SEED_HOUSEHOLDS,
  SEED_HOUSEHOLD_AUDIT,
  SEED_NOTIFICATIONS,
} from './seed'

export interface MockDB {
  users: User[]
  properties: Property[]
  bookings: Booking[]
  ledgerEntries: LedgerEntry[]
  households: Household[]
  householdAudit: HouseholdAuditEntry[]
  notifications: Record<string, Notification[]>
  inviteTokens: Record<string, string> // token -> householdId
}

function initDb(): MockDB {
  return {
    users: structuredClone(SEED_USERS),
    properties: structuredClone(SEED_PROPERTIES),
    bookings: structuredClone(SEED_BOOKINGS),
    ledgerEntries: structuredClone(SEED_LEDGER),
    households: structuredClone(SEED_HOUSEHOLDS),
    householdAudit: structuredClone(SEED_HOUSEHOLD_AUDIT),
    notifications: structuredClone(SEED_NOTIFICATIONS),
    inviteTokens: {},
  }
}

export const db: MockDB = initDb()

export function resetDb(): void {
  const fresh = initDb()
  Object.assign(db, fresh)
}

export function delay(min = 50, max = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)))
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
