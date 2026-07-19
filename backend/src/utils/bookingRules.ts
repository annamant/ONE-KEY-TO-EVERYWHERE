import { calculateKeyCost } from './keyCalc'

export interface PropertyAvailability {
  id: string
  sleeps: number
  min_stay: number
  max_stay: number
  blackout_dates: string // JSON array
  status: string
  title?: string
}

export interface ExistingBooking {
  id: string
  check_in: string
  check_out: string
  status: string
}

/** Dates as YYYY-MM-DD; half-open [checkIn, checkOut). */
export function validateStayDates(checkIn: string, checkOut: string): void {
  const inDate = new Date(`${checkIn}T00:00:00Z`)
  const outDate = new Date(`${checkOut}T00:00:00Z`)
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
    throw Object.assign(new Error('Invalid check-in or check-out date'), { status: 400 })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    throw Object.assign(new Error('Dates must be YYYY-MM-DD'), { status: 400 })
  }
  if (outDate <= inDate) {
    throw Object.assign(new Error('Check-out must be after check-in'), { status: 400 })
  }
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  if (inDate < today) {
    throw Object.assign(new Error('Check-in must be today or in the future'), { status: 400 })
  }
}

function rangesOverlap(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  return aIn < bOut && bIn < aOut
}

export function assertBookingAllowed(opts: {
  property: PropertyAvailability
  checkIn: string
  checkOut: string
  guests: number
  existingBookings: ExistingBooking[]
  excludeBookingId?: string
}): { nights: number; total: number } {
  const { property, checkIn, checkOut, guests, existingBookings, excludeBookingId } = opts

  validateStayDates(checkIn, checkOut)

  if (!Number.isInteger(guests) || guests < 1) {
    throw Object.assign(new Error('guests must be a positive integer'), { status: 400 })
  }
  if (guests > Number(property.sleeps)) {
    throw Object.assign(new Error(`This property sleeps up to ${property.sleeps} guests`), { status: 400 })
  }

  const cost = calculateKeyCost(checkIn, checkOut)
  if (cost.nights < 1) {
    throw Object.assign(new Error('Stay must be at least 1 night'), { status: 400 })
  }
  if (cost.nights < Number(property.min_stay)) {
    throw Object.assign(new Error(`Minimum stay is ${property.min_stay} nights`), { status: 400 })
  }
  if (cost.nights > Number(property.max_stay)) {
    throw Object.assign(new Error(`Maximum stay is ${property.max_stay} nights`), { status: 400 })
  }

  let blackouts: string[] = []
  try {
    blackouts = JSON.parse(property.blackout_dates || '[]') as string[]
  } catch {
    blackouts = []
  }
  const hitsBlackout = blackouts.some((bd) => bd >= checkIn && bd < checkOut)
  if (hitsBlackout) {
    throw Object.assign(new Error('Selected dates include a blackout date'), { status: 409 })
  }

  const active = existingBookings.filter(
    (b) =>
      b.id !== excludeBookingId &&
      b.status !== 'cancelled' &&
      b.status !== 'no_show' &&
      rangesOverlap(checkIn, checkOut, b.check_in, b.check_out)
  )
  if (active.length > 0) {
    throw Object.assign(new Error('Property is not available for those dates'), { status: 409 })
  }

  return cost
}

/** Refund fraction based on hours until check-in vs cancellation window. */
export function refundFraction(checkIn: string, cancellationWindowHours: number, now = new Date()): number {
  const checkInDate = new Date(`${checkIn}T00:00:00Z`)
  const hoursUntil = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  if (hoursUntil >= cancellationWindowHours) return 1
  if (hoursUntil <= 0) return 0
  // Inside window: no refund
  return 0
}
