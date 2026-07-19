/** Soft, non-currency framing for how much membership a member still has.
 *  Internally the ledger still tracks discrete units (= length of stay), but
 *  members only ever see week/month-scale language — never keys, nights, or days.
 */

export function formatMembershipRemaining(balance: number): string {
  if (balance <= 0) return 'No membership remaining'
  const weeks = balance / 7
  if (weeks >= 40) return 'About a year remaining'
  if (weeks >= 28) return 'About 9 months remaining'
  if (weeks >= 20) return 'About 6 months remaining'
  if (weeks >= 14) return 'About 4 months remaining'
  if (weeks >= 11) return 'About 3 months remaining'
  if (weeks >= 7.5) return 'About 2 months remaining'
  if (weeks >= 5.5) return 'About 6 weeks remaining'
  if (weeks >= 3.75) return 'About 4 weeks remaining'
  if (weeks >= 2.5) return 'About 3 weeks remaining'
  if (weeks >= 1.5) return 'About 2 weeks remaining'
  if (weeks >= 0.85) return 'About a week remaining'
  if (weeks >= 0.35) return 'Less than a week remaining'
  return 'Your membership is nearly used'
}

/** Percent of credited membership still available (for progress bars). */
export function membershipRemainingPercent(balance: number, totalCredited: number): number {
  if (totalCredited <= 0) return balance > 0 ? 100 : 0
  return Math.max(0, Math.min(100, Math.round((balance / totalCredited) * 100)))
}

export function canCoverWithMembership(balance: number, unitsNeeded: number): boolean {
  return balance >= unitsNeeded
}
