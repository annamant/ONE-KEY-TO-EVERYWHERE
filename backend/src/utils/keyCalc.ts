/**
 * How much membership a stay uses. Internal ledger units only —
 * never exposed to members as a named currency.
 */

function countUnits(checkIn: string, checkOut: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / msPerDay)
}

export interface MembershipUse {
  units: number
}

export function calculateMembershipUse(checkIn: string, checkOut: string): MembershipUse {
  return { units: countUnits(checkIn, checkOut) }
}

/** @deprecated Use calculateMembershipUse */
export function calculateKeyCost(checkIn: string, checkOut: string) {
  const { units } = calculateMembershipUse(checkIn, checkOut)
  return { nights: units, total: units }
}

/** @deprecated */
export type KeyCostBreakdown = { nights: number; total: number }
