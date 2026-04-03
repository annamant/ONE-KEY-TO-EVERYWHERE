import type { LedgerEntry, LedgerEntryType, KeyWallet } from '@/types'
import { db, delay, generateId } from './db'
import { exportCsv } from '@/utils/exportCsv'
import { formatDate } from '@/utils/format'

const mockLedger = {
  async getBalance(userId: string): Promise<number> {
    await delay()
    const entries = db.ledgerEntries.filter((e) => e.userId === userId)
    if (entries.length === 0) return 0
    return entries[entries.length - 1].balanceAfter
  },

  async getWallet(userId: string): Promise<KeyWallet> {
    await delay()
    const entries = db.ledgerEntries.filter((e) => e.userId === userId)
    const balance = entries.length > 0 ? entries[entries.length - 1].balanceAfter : 0
    const totalCredited = entries
      .filter((e) => e.amount > 0)
      .reduce((s, e) => s + e.amount, 0)
    const totalDebited = Math.abs(
      entries.filter((e) => e.amount < 0).reduce((s, e) => s + e.amount, 0)
    )
    return { userId, balance, totalCredited, totalDebited }
  },

  async listEntries(
    userId: string,
    options?: { limit?: number; offset?: number; types?: LedgerEntryType[] }
  ): Promise<LedgerEntry[]> {
    await delay()
    let entries = db.ledgerEntries
      .filter((e) => e.userId === userId)
      .slice()
      .reverse()
    if (options?.types) {
      entries = entries.filter((e) => options.types!.includes(e.type))
    }
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 50
    return entries.slice(offset, offset + limit)
  },

  async credit(
    userId: string,
    amount: number,
    description: string,
    type: LedgerEntryType = 'package_credit',
    adminId?: string,
    adminNote?: string
  ): Promise<LedgerEntry> {
    await delay()
    const currentBalance = await mockLedger.getBalance(userId)
    const entry: LedgerEntry = {
      id: generateId('ledger'),
      userId,
      type,
      amount,
      balanceAfter: currentBalance + amount,
      description,
      adminId,
      adminNote,
      createdAt: new Date().toISOString(),
    }
    db.ledgerEntries.push(entry)
    return entry
  },

  async debit(
    userId: string,
    amount: number,
    description: string,
    bookingId?: string,
    type: LedgerEntryType = 'booking_debit'
  ): Promise<LedgerEntry> {
    await delay()
    const currentBalance = await mockLedger.getBalance(userId)
    if (currentBalance < amount) throw new Error('Insufficient key balance')
    const entry: LedgerEntry = {
      id: generateId('ledger'),
      userId,
      type,
      amount: -amount,
      balanceAfter: currentBalance - amount,
      description,
      bookingId,
      createdAt: new Date().toISOString(),
    }
    db.ledgerEntries.push(entry)
    return entry
  },

  exportCsv(userId: string): void {
    const entries = db.ledgerEntries
      .filter((e) => e.userId === userId)
      .map((e) => ({
        date: formatDate(e.createdAt),
        type: e.type,
        description: e.description,
        amount: e.amount,
        balance: e.balanceAfter,
        booking_id: e.bookingId ?? '',
        admin_note: e.adminNote ?? '',
      }))
    exportCsv(`key-statement-${userId}-${Date.now()}.csv`, entries)
  },

  async adminList(filters?: { userId?: string; types?: LedgerEntryType[] }): Promise<LedgerEntry[]> {
    await delay()
    let entries = [...db.ledgerEntries].reverse()
    if (filters?.userId) entries = entries.filter((e) => e.userId === filters.userId)
    if (filters?.types) entries = entries.filter((e) => filters.types!.includes(e.type))
    return entries
  },
}

export default mockLedger
export { mockLedger }
