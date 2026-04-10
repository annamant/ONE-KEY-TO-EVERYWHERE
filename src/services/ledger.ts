import { api } from './apiClient'
import type { LedgerEntry, LedgerEntryType, KeyWallet } from '@/types'
import { exportCsv } from '@/utils/exportCsv'
import { formatDate } from '@/utils/format'

export const ledgerService = {
  getWallet: (_userId?: string) =>
    api.get<KeyWallet>('/ledger/wallet'),

  listEntries: (_userId?: string, options?: { limit?: number; offset?: number; types?: LedgerEntryType[] }) => {
    const params = new URLSearchParams()
    if (options?.limit)  params.set('limit', String(options.limit))
    if (options?.offset) params.set('offset', String(options.offset))
    if (options?.types?.length) params.set('types', options.types.join(','))
    const qs = params.toString()
    return api.get<LedgerEntry[]>(`/ledger/entries${qs ? `?${qs}` : ''}`)
  },

  credit: (
    userId: string,
    amount: number,
    description: string,
    type: LedgerEntryType = 'package_credit',
    adminId?: string,
    adminNote?: string
  ) =>
    api.post<LedgerEntry>('/ledger/admin/correction', {
      userId, amount, direction: 'credit', note: adminNote ?? description, type,
    }),

  debit: (
    userId: string,
    amount: number,
    description: string,
    bookingId?: string,
    type: LedgerEntryType = 'booking_debit'
  ) =>
    api.post<LedgerEntry>('/ledger/admin/correction', {
      userId, amount, direction: 'debit', note: description, bookingId, type,
    }),

  adminList: (filters?: { userId?: string; types?: LedgerEntryType[] }) => {
    const params = new URLSearchParams()
    if (filters?.userId) params.set('userId', filters.userId)
    if (filters?.types?.length) params.set('types', filters.types.join(','))
    const qs = params.toString()
    return api.get<LedgerEntry[]>(`/ledger/admin${qs ? `?${qs}` : ''}`)
  },

  exportCsv: async (_userId?: string) => {
    const entries = await api.get<LedgerEntry[]>('/ledger/entries?limit=1000')
    const rows = (entries as LedgerEntry[]).map((e) => ({
      date: formatDate(e.createdAt),
      type: e.type,
      description: e.description,
      amount: e.amount,
      balance: e.balanceAfter,
      booking_id: e.bookingId ?? '',
      admin_note: e.adminNote ?? '',
    }))
    exportCsv(`key-statement-${Date.now()}.csv`, rows)
  },
}
