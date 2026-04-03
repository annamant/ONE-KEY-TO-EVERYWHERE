import { differenceInDays, parseISO, getMonth } from 'date-fns'
import type { Property } from '@/types'

// Off-peak months (November, December, January, February)
const OFF_PEAK_MONTHS = [10, 11, 0, 1]

function getSeasonalMultiplier(checkIn: string): number {
  const month = getMonth(parseISO(checkIn))
  return OFF_PEAK_MONTHS.includes(month) ? 0.8 : 1.0
}

function getLongStayBonus(nights: number): number {
  if (nights >= 14) return 0.85
  if (nights >= 7) return 0.9
  return 1.0
}

export interface KeyCostBreakdown {
  nights: number
  baseKeysPerNight: number
  seasonalMultiplier: number
  longStayMultiplier: number
  total: number
}

export function calculateKeyCost(
  property: Property,
  checkIn: string,
  checkOut: string
): KeyCostBreakdown {
  const nights = differenceInDays(parseISO(checkOut), parseISO(checkIn))
  const seasonalMultiplier = getSeasonalMultiplier(checkIn)
  const longStayMultiplier = getLongStayBonus(nights)
  const total = Math.round(
    property.keysPerNight * nights * seasonalMultiplier * longStayMultiplier
  )
  return {
    nights,
    baseKeysPerNight: property.keysPerNight,
    seasonalMultiplier,
    longStayMultiplier,
    total,
  }
}
