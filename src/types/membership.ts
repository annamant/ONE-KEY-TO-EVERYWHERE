// A membership is sold as (duration in weeks) × (group-size band). It grants a bank of
// keys equal to the number of days in that duration — 1 key = 1 night, spendable at any
// Club home, split across as many separate stays as the member likes, until the bank
// runs out. There is no per-property rate and no seasonal variation.

export type GroupBand = 'up_to_2' | 'three_to_four' | 'five_to_six' | 'seven_plus'

export interface GroupBandInfo {
  band: GroupBand
  label: string
  guestRange: string
  dailyRate: number
}

export const GROUP_BANDS: GroupBandInfo[] = [
  { band: 'up_to_2', label: 'Up to 2', guestRange: '1–2 guests', dailyRate: 45 },
  { band: 'three_to_four', label: '3–4', guestRange: '3–4 guests', dailyRate: 65 },
  { band: 'five_to_six', label: '5–6', guestRange: '5–6 guests', dailyRate: 90 },
  { band: 'seven_plus', label: '7+', guestRange: '7+ guests', dailyRate: 120 },
]

export interface MembershipDurationInfo {
  weeks: number
  label: string
  days: number
  /** Discount applied to the daily rate for committing to a longer membership. */
  commitmentMultiplier: number
  perks: string[]
}

export const MEMBERSHIP_DURATIONS: MembershipDurationInfo[] = [
  {
    weeks: 1,
    label: '1 week',
    days: 7,
    commitmentMultiplier: 1,
    perks: ['Access to every home in the Club', 'Keys never expire', 'Free cancellation up to 48h before', 'Club support via email'],
  },
  {
    weeks: 2,
    label: '2 weeks',
    days: 14,
    commitmentMultiplier: 0.95,
    perks: ['Access to every home in the Club', 'Keys never expire', 'Free cancellation up to 48h before', 'Priority Club support', 'Early access to new homes'],
  },
  {
    weeks: 4,
    label: '4 weeks',
    days: 28,
    commitmentMultiplier: 0.9,
    perks: ['Access to every home in the Club', 'Keys never expire', 'Free cancellation up to 48h before', 'Dedicated Club concierge', 'Early access to new homes', 'Priority during peak season'],
  },
]

export interface MembershipQuote {
  groupBand: GroupBandInfo
  duration: MembershipDurationInfo
  days: number
  price: number
  pricePerDay: number
}

export function quoteMembership(groupBand: GroupBand, weeks: number): MembershipQuote {
  const band = GROUP_BANDS.find((b) => b.band === groupBand) ?? GROUP_BANDS[0]
  const duration = MEMBERSHIP_DURATIONS.find((d) => d.weeks === weeks) ?? MEMBERSHIP_DURATIONS[0]
  const pricePerDay = Math.round(band.dailyRate * duration.commitmentMultiplier)
  const price = pricePerDay * duration.days
  return { groupBand: band, duration, days: duration.days, price, pricePerDay }
}
