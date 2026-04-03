export type LedgerEntryType =
  | 'membership_credit'
  | 'package_credit'
  | 'booking_debit'
  | 'cancellation_refund'
  | 'modification_refund'
  | 'modification_debit'
  | 'admin_correction'
  | 'promo_credit'
  | 'bonus_credit'

export interface LedgerEntry {
  id: string
  userId: string
  type: LedgerEntryType
  amount: number
  balanceAfter: number
  description: string
  bookingId?: string
  adminId?: string
  adminNote?: string
  createdAt: string
}

export interface KeyWallet {
  userId: string
  balance: number
  totalCredited: number
  totalDebited: number
}
