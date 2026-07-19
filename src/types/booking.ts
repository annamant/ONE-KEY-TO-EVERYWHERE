export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show'

export interface BookingGuest {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
}

export interface Booking {
  id: string
  memberId: string
  propertyId: string
  householdId?: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  /** Internal membership units used for this stay. Not shown to members as a currency. */
  membershipUsed: number
  status: BookingStatus
  cancellationReason?: string
  cancelledAt?: string
  confirmedAt?: string
  createdAt: string
  updatedAt: string
  /** Present on owner/admin booking detail responses. */
  guest?: BookingGuest | null
}
