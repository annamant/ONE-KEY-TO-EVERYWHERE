// A membership is sold as (duration) × (group-size band).
// Internally it grants a bank of stay-units equal to the membership length;
// members never see a named currency — only soft "membership remaining".
//
// Pricing: €56 per person per overnight, billed at the band's capacity.
// Longer memberships (from 3 months) get a commitment discount.

export type GroupBand = 'up_to_2' | 'three_to_four' | 'five_to_six' | 'seven_plus'

/** Internal yield target — not shown on public pricing. */
export const RATE_PER_PERSON_PER_NIGHT = 56

export interface GroupBandInfo {
  band: GroupBand
  label: string
  guestRange: string
  /** Guests billed for this band (top of the range; 8 for open-ended 7+). */
  billableGuests: number
  dailyRate: number
}

export const GROUP_BANDS: GroupBandInfo[] = [
  { band: 'up_to_2', label: 'Up to 2', guestRange: '1–2 guests', billableGuests: 2, dailyRate: 2 * RATE_PER_PERSON_PER_NIGHT },
  { band: 'three_to_four', label: '3–4', guestRange: '3–4 guests', billableGuests: 4, dailyRate: 4 * RATE_PER_PERSON_PER_NIGHT },
  { band: 'five_to_six', label: '5–6', guestRange: '5–6 guests', billableGuests: 6, dailyRate: 6 * RATE_PER_PERSON_PER_NIGHT },
  { band: 'seven_plus', label: '7+', guestRange: '7+ guests', billableGuests: 8, dailyRate: 8 * RATE_PER_PERSON_PER_NIGHT },
]

export interface MembershipDurationInfo {
  weeks: number
  label: string
  /** Internal stay-units granted (= weeks × 7). Not shown to members as a currency. */
  units: number
  /** Commitment discount from 3 months upward (0–1). */
  discount: number
  perks: string[]
}

export const MEMBERSHIP_DURATIONS: MembershipDurationInfo[] = [
  {
    weeks: 1,
    label: '1 week',
    units: 7,
    discount: 0,
    perks: [
      'Access to every home in the Club',
      'Use your membership whenever you like',
      'Free cancellation up to 48h before',
      'Club support via email',
    ],
  },
  {
    weeks: 2,
    label: '2 weeks',
    units: 14,
    discount: 0,
    perks: [
      'Access to every home in the Club',
      'Use your membership whenever you like',
      'Free cancellation up to 48h before',
      'Priority Club support',
      'Early access to new homes',
    ],
  },
  {
    weeks: 4,
    label: '4 weeks',
    units: 28,
    discount: 0,
    perks: [
      'Access to every home in the Club',
      'Use your membership whenever you like',
      'Free cancellation up to 48h before',
      'Dedicated Club concierge',
      'Early access to new homes',
      'Priority during peak season',
    ],
  },
  {
    weeks: 12,
    label: '3 months',
    units: 84,
    discount: 0.1,
    perks: [
      'Access to every home in the Club',
      'Use your membership whenever you like',
      'Free cancellation up to 48h before',
      'Dedicated Club concierge',
      'Early access to new homes',
      'Priority during peak season',
      'Invite two guests to the Club waitlist',
    ],
  },
  {
    weeks: 24,
    label: '6 months',
    units: 168,
    discount: 0.2,
    perks: [
      'Access to every home in the Club',
      'Use your membership whenever you like',
      'Free cancellation up to 48h before',
      'Dedicated Club concierge',
      'Early access to new homes',
      'Priority during peak season',
      'Invite four guests to the Club waitlist',
      'Annual Club gathering invitation',
    ],
  },
  {
    weeks: 48,
    label: '12 months',
    units: 336,
    discount: 0.3,
    perks: [
      'Access to every home in the Club',
      'Use your membership whenever you like',
      'Free cancellation up to 48h before',
      'Dedicated Club concierge',
      'Early access to new homes',
      'Priority during peak season',
      'Invite six guests to the Club waitlist',
      'Annual Club gathering invitation',
      'Founding-member recognition',
    ],
  },
]

export interface MembershipQuote {
  groupBand: GroupBandInfo
  duration: MembershipDurationInfo
  /** Undiscounted total before commitment discount. */
  fullPrice: number
  /** Payable total after discount. */
  price: number
  discountPercent: number
}

export function quoteMembership(groupBand: GroupBand, weeks: number): MembershipQuote {
  const band = GROUP_BANDS.find((b) => b.band === groupBand) ?? GROUP_BANDS[0]
  const duration = MEMBERSHIP_DURATIONS.find((d) => d.weeks === weeks) ?? MEMBERSHIP_DURATIONS[0]
  const fullPrice = band.dailyRate * duration.units
  const price = Math.round(fullPrice * (1 - duration.discount))
  return {
    groupBand: band,
    duration,
    fullPrice,
    price,
    discountPercent: Math.round(duration.discount * 100),
  }
}
