export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_modified'
  | 'keys_credited'
  | 'keys_debited'
  | 'household_invite'
  | 'property_approved'
  | 'property_rejected'
  | 'payout_processed'
  | 'admin_alert'
  | 'reservation_received'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  link?: string
  createdAt: string
}
