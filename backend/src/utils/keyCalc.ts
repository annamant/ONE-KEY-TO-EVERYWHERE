/**
 * Key cost calculation — ported from src/utils/keyCalc.ts in the frontend.
 * Uses plain Date arithmetic to avoid importing date-fns into the backend.
 */

const OFF_PEAK_MONTHS = [10, 11, 0, 1] // Nov, Dec, Jan, Feb

function getSeasonalMultiplier(checkIn: string): number {
  const month = new Date(checkIn).getMonth()
  return OFF_PEAK_MONTHS.includes(month) ? 0.8 : 1.0
}

function getLongStayBonus(nights: number): number {
  if (nights >= 14) return 0.85
  if (nights >= 7) return 0.9
  return 1.0
}

function countNights(checkIn: string, checkOut: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / msPerDay)
}

export interface KeyCostBreakdown {
  nights: number
  baseKeysPerNight: number
  seasonalMultiplier: number
  longStayMultiplier: number
  total: number
}

export function calculateKeyCost(
  keysPerNight: number,
  checkIn: string,
  checkOut: string
): KeyCostBreakdown {
  const nights = countNights(checkIn, checkOut)
  const seasonalMultiplier = getSeasonalMultiplier(checkIn)
  const longStayMultiplier = getLongStayBonus(nights)
  const total = Math.round(keysPerNight * nights * seasonalMultiplier * longStayMultiplier)
  return { nights, baseKeysPerNight: keysPerNight, seasonalMultiplier, longStayMultiplier, total }
}
