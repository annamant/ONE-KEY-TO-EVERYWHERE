/**
 * Key cost calculation — ported from src/utils/keyCalc.ts in the frontend.
 * 1 key = 1 night, at any Club home, with no per-property rate and no seasonal
 * variation. A stay's cost is simply how many nights it covers.
 */

function countNights(checkIn: string, checkOut: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / msPerDay)
}

export interface KeyCostBreakdown {
  nights: number
  total: number
}

export function calculateKeyCost(checkIn: string, checkOut: string): KeyCostBreakdown {
  const nights = countNights(checkIn, checkOut)
  return { nights, total: nights }
}
