import { differenceInDays, parseISO } from 'date-fns'

/** How much membership a stay uses. Internal only — never shown as a currency. */
export interface MembershipUse {
  /** Length of stay in calendar overnight units (internal ledger amount). */
  units: number
}

export function calculateMembershipUse(checkIn: string, checkOut: string): MembershipUse {
  const units = differenceInDays(parseISO(checkOut), parseISO(checkIn))
  return { units }
}

/** @deprecated Use calculateMembershipUse */
export const calculateKeyCost = (checkIn: string, checkOut: string) => {
  const { units } = calculateMembershipUse(checkIn, checkOut)
  return { nights: units, total: units }
}

/** @deprecated Use MembershipUse */
export type KeyCostBreakdown = { nights: number; total: number }
