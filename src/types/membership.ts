// Two product lines:
// 1) Week memberships (1 / 2 / 4 weeks) — what members normally buy.
// 2) Season packages (6 / 12 calendar months) — forward-sale commitment
//    packages with deep discounts. Calendar-window access, not a night bank.
//
// Pricing base: €56 per person per overnight × band capacity.
// Season packages apply a large commitment discount on that base.

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

/** Everyday membership lengths — weeks only. */
export interface MembershipDurationInfo {
  weeks: number
  label: string
  /** Internal stay-units for week memberships. Not shown as a currency. */
  units: number
  perks: string[]
}

export const MEMBERSHIP_DURATIONS: MembershipDurationInfo[] = [
  {
    weeks: 1,
    label: '1 week',
    units: 7,
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
    perks: [
      'Access to every home in the Club',
      'Use your membership whenever you like',
      'Free cancellation up to 48h before',
      'Dedicated Club concierge',
      'Early access to new homes',
      'Priority during peak season',
    ],
  },
]

/**
 * Forward-sale season packages: calendar months of Club access,
 * heavily discounted vs the week-rate base. Not sold as a night bank.
 */
export interface SeasonPackageInfo {
  months: number
  label: string
  /** Short pitch shown on the card. */
  pitch: string
  /** Commitment discount (0–1) vs full calendar-period base. */
  discount: number
  perks: string[]
}

export const SEASON_PACKAGES: SeasonPackageInfo[] = [
  {
    months: 6,
    label: '6 months',
    pitch: 'Lock in half a year — and pause whenever life gets in the way.',
    discount: 0.4,
    perks: [
      'Club access for 6 calendar months',
      'Pause anytime — your remaining time freezes until you resume',
      'Every home open to you for the season',
      'Dedicated Club concierge',
      'Priority during peak season',
      'Invite four guests to the Club waitlist',
    ],
  },
  {
    months: 12,
    label: '12 months',
    pitch: 'A full year in the Club — with pause built in, so nothing is wasted.',
    discount: 0.55,
    perks: [
      'Club access for 12 calendar months',
      'Pause anytime — your remaining time freezes until you resume',
      'Every home open to you all year',
      'Dedicated Club concierge',
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
  price: number
}

export interface SeasonQuote {
  groupBand: GroupBandInfo
  package: SeasonPackageInfo
  /** Undiscounted base for the calendar period (for strikethrough). */
  fullPrice: number
  price: number
  discountPercent: number
}

export function quoteMembership(groupBand: GroupBand, weeks: number): MembershipQuote {
  const band = GROUP_BANDS.find((b) => b.band === groupBand) ?? GROUP_BANDS[0]
  const duration = MEMBERSHIP_DURATIONS.find((d) => d.weeks === weeks) ?? MEMBERSHIP_DURATIONS[0]
  const price = band.dailyRate * duration.units
  return { groupBand: band, duration, price }
}

/** Base for season packages: band daily rate × ~30 units per calendar month. */
export function quoteSeasonPackage(groupBand: GroupBand, months: number): SeasonQuote {
  const band = GROUP_BANDS.find((b) => b.band === groupBand) ?? GROUP_BANDS[0]
  const pkg = SEASON_PACKAGES.find((p) => p.months === months) ?? SEASON_PACKAGES[0]
  const fullPrice = band.dailyRate * pkg.months * 30
  const price = Math.round(fullPrice * (1 - pkg.discount))
  return {
    groupBand: band,
    package: pkg,
    fullPrice,
    price,
    discountPercent: Math.round(pkg.discount * 100),
  }
}

/** Stay units credited for a season package (calendar months × ~30 nights). */
export function seasonPackageUnits(months: number): number {
  return months * 30
}

export type PackageKind = 'weeks' | 'season'

/** Selection payload used when a member requests / buys a package. */
export interface PackageSelection {
  kind: PackageKind
  groupBand: GroupBand
  weeks?: number
  months?: number
  units: number
  price: number
  label: string
}

export function selectionFromWeekQuote(quote: MembershipQuote): PackageSelection {
  return {
    kind: 'weeks',
    groupBand: quote.groupBand.band,
    weeks: quote.duration.weeks,
    units: quote.duration.units,
    price: quote.price,
    label: `${quote.duration.label} · ${quote.groupBand.label} guests`,
  }
}

export function selectionFromSeasonQuote(quote: SeasonQuote): PackageSelection {
  return {
    kind: 'season',
    groupBand: quote.groupBand.band,
    months: quote.package.months,
    units: seasonPackageUnits(quote.package.months),
    price: quote.price,
    label: `${quote.package.label} · ${quote.groupBand.label} guests`,
  }
}
