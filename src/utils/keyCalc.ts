import { differenceInDays, parseISO } from 'date-fns'

// 1 key = 1 night, at any Club home, with no per-property rate and no seasonal
// variation. A stay's cost is simply how many nights it covers.
export interface KeyCostBreakdown {
  nights: number
  total: number
}

export function calculateKeyCost(checkIn: string, checkOut: string): KeyCostBreakdown {
  const nights = differenceInDays(parseISO(checkOut), parseISO(checkIn))
  return { nights, total: nights }
}
