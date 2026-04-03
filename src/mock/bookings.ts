import type { Booking, BookingStatus } from '@/types'
import { db, delay, generateId } from './db'
import { mockLedger } from './ledger'
import { mockProperties } from './properties'
import { mockNotifications } from './notifications'
import { calculateKeyCost } from '@/utils/keyCalc'
import { formatDateRange } from '@/utils/format'

const mockBookings = {
  async getById(id: string): Promise<Booking | null> {
    await delay()
    return db.bookings.find((b) => b.id === id) ?? null
  },

  async listForUser(userId: string): Promise<Booking[]> {
    await delay()
    return db.bookings
      .filter((b) => b.memberId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async listForProperty(propertyId: string): Promise<Booking[]> {
    await delay()
    return db.bookings
      .filter((b) => b.propertyId === propertyId && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
  },

  async adminList(filters?: {
    status?: BookingStatus
    memberId?: string
    propertyId?: string
  }): Promise<Booking[]> {
    await delay()
    let results = [...db.bookings]
    if (filters?.status) results = results.filter((b) => b.status === filters.status)
    if (filters?.memberId) results = results.filter((b) => b.memberId === filters.memberId)
    if (filters?.propertyId) results = results.filter((b) => b.propertyId === filters.propertyId)
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async create(params: {
    memberId: string
    propertyId: string
    checkIn: string
    checkOut: string
    guests: number
    householdId?: string
  }): Promise<Booking> {
    await delay()
    const property = db.properties.find((p) => p.id === params.propertyId)
    if (!property) throw new Error('Property not found')

    const { total: keysCharged, nights } = calculateKeyCost(
      property,
      params.checkIn,
      params.checkOut
    )

    // Debit keys (throws if insufficient)
    await mockLedger.debit(
      params.memberId,
      keysCharged,
      `${property.title} — ${nights} nights`,
      undefined,
      'booking_debit'
    )

    const now = new Date().toISOString()
    const booking: Booking = {
      id: generateId('booking'),
      memberId: params.memberId,
      propertyId: params.propertyId,
      householdId: params.householdId,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights,
      guests: params.guests,
      keysCharged,
      status: 'confirmed',
      confirmedAt: now,
      createdAt: now,
      updatedAt: now,
    }
    db.bookings.push(booking)

    // Update ledger entry with booking id
    const lastEntry = db.ledgerEntries[db.ledgerEntries.length - 1]
    lastEntry.bookingId = booking.id

    // Increment property total bookings
    property.totalBookings++

    // Send notifications
    await mockNotifications.push(params.memberId, {
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      body: `Your ${property.title} booking (${formatDateRange(params.checkIn, params.checkOut)}) is confirmed.`,
      link: `/member/bookings/${booking.id}`,
    })
    await mockNotifications.push(property.ownerId, {
      type: 'reservation_received',
      title: 'New Reservation',
      body: `A new booking was made for ${property.title} (${formatDateRange(params.checkIn, params.checkOut)}).`,
      link: `/owner/reservations/${booking.id}`,
    })

    return booking
  },

  async cancel(id: string, reason?: string): Promise<Booking> {
    await delay()
    const booking = db.bookings.find((b) => b.id === id)
    if (!booking) throw new Error('Booking not found')
    if (booking.status === 'cancelled') throw new Error('Already cancelled')

    const refundAmount = booking.keysCharged
    const property = db.properties.find((p) => p.id === booking.propertyId)
    const propertyName = property?.title ?? 'property'

    await mockLedger.credit(
      booking.memberId,
      refundAmount,
      `Refund: ${propertyName} cancellation`,
      'cancellation_refund'
    )

    const now = new Date().toISOString()
    booking.status = 'cancelled'
    booking.cancellationReason = reason
    booking.cancelledAt = now
    booking.updatedAt = now

    await mockNotifications.push(booking.memberId, {
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      body: `Your ${propertyName} booking has been cancelled. ${refundAmount} keys refunded.`,
      link: '/member/wallet',
    })

    return booking
  },

  async modify(
    id: string,
    newDates: { checkIn: string; checkOut: string }
  ): Promise<Booking> {
    await delay()
    const booking = db.bookings.find((b) => b.id === id)
    if (!booking) throw new Error('Booking not found')
    if (!['confirmed', 'pending'].includes(booking.status))
      throw new Error('Cannot modify this booking')

    const property = db.properties.find((p) => p.id === booking.propertyId)
    if (!property) throw new Error('Property not found')

    const { total: newKeysCharged, nights: newNights } = calculateKeyCost(
      property,
      newDates.checkIn,
      newDates.checkOut
    )
    const diff = newKeysCharged - booking.keysCharged

    if (diff > 0) {
      await mockLedger.debit(
        booking.memberId,
        diff,
        `Modification: ${property.title} — key top-up`,
        booking.id,
        'modification_debit'
      )
    } else if (diff < 0) {
      await mockLedger.credit(
        booking.memberId,
        Math.abs(diff),
        `Modification: ${property.title} — key refund`,
        'modification_refund'
      )
    }

    booking.checkIn = newDates.checkIn
    booking.checkOut = newDates.checkOut
    booking.nights = newNights
    booking.keysCharged = newKeysCharged
    booking.updatedAt = new Date().toISOString()

    return booking
  },

  async override(id: string, patch: Partial<Booking>): Promise<Booking> {
    await delay()
    const booking = db.bookings.find((b) => b.id === id)
    if (!booking) throw new Error('Booking not found')
    Object.assign(booking, patch, { updatedAt: new Date().toISOString() })
    return booking
  },
}

export default mockBookings
export { mockBookings }
