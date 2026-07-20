import { useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/Button'
import {
  GROUP_BANDS,
  MEMBERSHIP_DURATIONS,
  RATE_PER_PERSON_PER_NIGHT,
  SEASON_PACKAGES,
  quoteMembership,
  quoteSeasonPackage,
  selectionFromSeasonQuote,
  selectionFromWeekQuote,
  type GroupBand,
  type PackageSelection,
} from '@/types/membership'

const CLUB_CONTACT_EMAIL = 'anna@onekeytoeverywhere.com'

interface MembershipPricingPickerProps {
  primaryCtaLabel: string
  seasonCtaLabel?: (label: string) => string
  footerCtaLabel?: string
  onSelectWeek: (selection: PackageSelection) => void
  onSelectSeason: (selection: PackageSelection) => void
  onFooterCta?: () => void
  submitting?: boolean
}

export function MembershipPricingPicker({
  primaryCtaLabel,
  seasonCtaLabel = (label) => `Reserve ${label.toLowerCase()}`,
  footerCtaLabel,
  onSelectWeek,
  onSelectSeason,
  onFooterCta,
  submitting = false,
}: MembershipPricingPickerProps) {
  const [groupBand, setGroupBand] = useState<GroupBand>('three_to_four')
  const [weeks, setWeeks] = useState(2)
  const [seasonBand, setSeasonBand] = useState<GroupBand>('three_to_four')

  const quote = quoteMembership(groupBand, weeks)

  return (
    <>
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div>
              <p className="text-caption font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B6B6B' }}>
                1. Group size
              </p>
              <div className="grid grid-cols-2 gap-3">
                {GROUP_BANDS.map((b) => (
                  <button
                    key={b.band}
                    type="button"
                    onClick={() => setGroupBand(b.band)}
                    className="text-left px-4 py-3 rounded-xl border-2 transition-colors"
                    style={{
                      borderColor: groupBand === b.band ? '#0A0A0A' : '#E5E5E5',
                      background: groupBand === b.band ? '#0A0A0A' : '#FFFFFF',
                    }}
                  >
                    <p className="text-body-md font-semibold" style={{ color: groupBand === b.band ? '#FFFFFF' : '#0A0A0A' }}>
                      {b.label}
                    </p>
                    <p className="text-caption" style={{ color: groupBand === b.band ? '#CCCCCC' : '#6B6B6B' }}>
                      {b.guestRange}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-body-sm mt-3" style={{ color: '#6B6B6B' }}>
                &ldquo;Up to 2&rdquo; is priced for two guests (€{RATE_PER_PERSON_PER_NIGHT}/person × 2).
                Solo traveller?{' '}
                <a
                  href={`mailto:${CLUB_CONTACT_EMAIL}?subject=${encodeURIComponent('Solo membership enquiry')}`}
                  className="font-medium underline underline-offset-2 transition-colors hover:text-text-primary"
                  style={{ color: '#0A0A0A' }}
                >
                  Get in touch with us
                </a>
                .
              </p>
            </div>

            <div>
              <p className="text-caption font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B6B6B' }}>
                2. Membership length
              </p>
              <div className="grid grid-cols-3 gap-3">
                {MEMBERSHIP_DURATIONS.map((d) => (
                  <button
                    key={d.weeks}
                    type="button"
                    onClick={() => setWeeks(d.weeks)}
                    className="text-left px-4 py-3 rounded-xl border-2 transition-colors"
                    style={{
                      borderColor: weeks === d.weeks ? '#0A0A0A' : '#E5E5E5',
                      background: weeks === d.weeks ? '#0A0A0A' : '#FFFFFF',
                    }}
                  >
                    <p className="text-body-md font-semibold" style={{ color: weeks === d.weeks ? '#FFFFFF' : '#0A0A0A' }}>
                      {d.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: '#F5F5F5', border: '1px solid #E5E5E5' }}>
              <p className="text-body-sm" style={{ color: '#1A1A1A' }}>
                <strong>Your group size is a baseline, not a ceiling.</strong> If the exact size you booked isn&apos;t available,
                we place you in a larger home at no extra cost — think of it like an airline upgrading an overbooked seat.
                You&apos;re never charged more, and you&apos;re never turned away.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl p-6 sticky top-24" style={{ background: '#0A0A0A' }}>
              <p className="text-caption font-semibold uppercase tracking-widest mb-2" style={{ color: '#C4882F' }}>
                {quote.groupBand.label} guests · {quote.duration.label}
              </p>
              <p className="font-display text-display-lg font-bold mb-1" style={{ color: '#FFFFFF' }}>
                €{quote.price.toLocaleString('en-EU')}
              </p>
              <p className="text-caption mb-2" style={{ color: '#CCCCCC' }}>
                one-time membership
              </p>
              <p className="text-caption mb-6" style={{ color: '#999999' }}>
                €{RATE_PER_PERSON_PER_NIGHT}/person × {quote.billableGuests} guest
                {quote.billableGuests === 1 ? '' : 's'} × {quote.nights} nights
              </p>

              <div className="mb-6 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <p className="text-body-sm" style={{ color: '#EFEFEF' }}>
                  Opens every home in the Club. Split your time across as many stays as you like —
                  your membership doesn&apos;t expire.
                </p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {quote.duration.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C4882F' }} />
                    <span className="text-body-sm" style={{ color: '#EFEFEF' }}>{perk}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="md"
                fullWidth
                loading={submitting}
                onClick={() => onSelectWeek(selectionFromWeekQuote(quote))}
                style={{ background: '#C4882F', color: '#0A0A0A', border: 'none', fontWeight: 700 }}
              >
                {primaryCtaLabel}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#F5F5F5', borderTop: '1px solid #E5E5E5' }} className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-caption font-semibold uppercase tracking-widest mb-3" style={{ color: '#C4882F' }}>
              For those who already know
            </p>
            <h2 className="font-display text-heading-xl font-bold mb-3" style={{ color: '#0A0A0A' }}>
              Reserve your season.
            </h2>
            <p className="text-body-md max-w-xl mx-auto" style={{ color: '#6B6B6B' }}>
              Commit to 6 or 12 calendar months at a private rate. Life gets busy?
              Pause whenever you need — your remaining time freezes until you come back.
            </p>
          </div>

          <div className="mb-8">
            <p className="text-caption font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: '#6B6B6B' }}>
              Group size for your season
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {GROUP_BANDS.map((b) => (
                <button
                  key={b.band}
                  type="button"
                  onClick={() => setSeasonBand(b.band)}
                  className="text-center px-3 py-2.5 rounded-xl border-2 transition-colors"
                  style={{
                    borderColor: seasonBand === b.band ? '#0A0A0A' : '#E5E5E5',
                    background: seasonBand === b.band ? '#0A0A0A' : '#FFFFFF',
                  }}
                >
                  <p className="text-body-sm font-semibold" style={{ color: seasonBand === b.band ? '#FFFFFF' : '#0A0A0A' }}>
                    {b.label}
                  </p>
                </button>
              ))}
            </div>
            <p className="text-body-sm mt-4 text-center max-w-md mx-auto" style={{ color: '#6B6B6B' }}>
              Solo traveller?{' '}
              <a
                href={`mailto:${CLUB_CONTACT_EMAIL}?subject=${encodeURIComponent('Solo season membership enquiry')}`}
                className="font-medium underline underline-offset-2 transition-colors hover:text-text-primary"
                style={{ color: '#0A0A0A' }}
              >
                Get in touch with us
              </a>
              .
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SEASON_PACKAGES.map((pkg) => {
              const seasonQuote = quoteSeasonPackage(seasonBand, pkg.months)
              return (
                <div
                  key={pkg.months}
                  className="rounded-2xl p-6 flex flex-col"
                  style={{ background: '#0A0A0A', border: pkg.months === 12 ? '2px solid #C4882F' : '1px solid #1A1A1A' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-caption font-semibold uppercase tracking-widest" style={{ color: '#C4882F' }}>
                      {pkg.label} in the Club
                    </p>
                    <span
                      className="text-caption font-bold px-2 py-1 rounded-md"
                      style={{ background: '#C4882F', color: '#0A0A0A' }}
                    >
                      Save {seasonQuote.discountPercent}%
                    </span>
                  </div>
                  <p className="text-body-sm mb-5" style={{ color: '#CCCCCC' }}>
                    {pkg.pitch}
                  </p>
                  <p className="font-display text-display-lg font-bold mb-1" style={{ color: '#FFFFFF' }}>
                    €{seasonQuote.price.toLocaleString('en-EU')}
                  </p>
                  <p className="text-caption mb-5" style={{ color: '#CCCCCC' }}>
                    <span style={{ textDecoration: 'line-through', opacity: 0.65 }}>
                      €{seasonQuote.fullPrice.toLocaleString('en-EU')}
                    </span>
                    {' · '}
                    {seasonQuote.groupBand.label} guests · one-time
                  </p>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {pkg.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C4882F' }} />
                        <span className="text-body-sm" style={{ color: '#EFEFEF' }}>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="md"
                    fullWidth
                    loading={submitting}
                    onClick={() => onSelectSeason(selectionFromSeasonQuote(seasonQuote))}
                    style={{ background: '#C4882F', color: '#0A0A0A', border: 'none', fontWeight: 700 }}
                  >
                    {seasonCtaLabel(pkg.label)}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: '#FFFFFF', borderTop: '1px solid #E5E5E5' }}>
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold text-center mb-8" style={{ color: '#0A0A0A' }}>
            How membership works
          </h2>
          <div className="space-y-4">
            {[
              { n: '1', text: 'Most members choose 1, 2, or 4 weeks — sized for their group. That\'s the everyday path into the Club. No per-home rate, no seasonal markup.' },
              { n: '2', text: 'If you already know you\'ll return, reserve a season: 6 or 12 calendar months at a private rate. And you can pause — when life intervenes, your remaining time freezes until you resume. Nothing is wasted.' },
              { n: '3', text: 'Your group size sets your starting price, not a hard limit on which homes you can pick. It\'s membership, not a rental — there\'s nothing to game.' },
            ].map(({ n, text }) => (
              <div key={n} className="flex gap-4 p-5 rounded-card text-left" style={{ background: '#F5F5F5', border: '1px solid #E5E5E5' }}>
                <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-caption font-bold" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>{n}</span>
                <p className="text-body-sm" style={{ color: '#0A0A0A' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {footerCtaLabel && onFooterCta && (
        <section className="py-16 text-center" style={{ background: '#0A0A0A' }}>
          <div className="max-w-xl mx-auto px-6">
            <h2 className="font-display text-heading-xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
              Be part of something different.
            </h2>
            <Button
              size="lg"
              onClick={onFooterCta}
              style={{ background: '#C4882F', color: '#0A0A0A', border: 'none', fontWeight: 700 }}
            >
              {footerCtaLabel}
            </Button>
          </div>
        </section>
      )}
    </>
  )
}
