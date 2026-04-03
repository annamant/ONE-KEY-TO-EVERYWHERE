export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show'

export interface Booking {
  id: string
  memberId: string
  propertyId: string
  householdId?: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  keysCharged: number
  status: BookingStatus
  cancellationReason?: string
  cancelledAt?: string
  confirmedAt?: string
  createdAt: string
  updatedAt: string
}
