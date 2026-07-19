import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/Button'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { GROUP_BANDS, MEMBERSHIP_DURATIONS, quoteMembership, type GroupBand } from '@/types/membership'

export function PricingPage() {
  const navigate = useNavigate()
  const [groupBand, setGroupBand] = useState<GroupBand>('three_to_four')
  const [weeks, setWeeks] = useState(2)

  const quote = quoteMembership(groupBand, weeks)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <PublicNav />

      <section style={{ background: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }} className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-caption font-semibold uppercase tracking-widest mb-4" style={{ color: '#C4882F' }}>Membership plans</p>
          <h1 className="font-display text-display-lg font-bold mb-4" style={{ color: '#0A0A0A' }}>Build your membership.</h1>
          <p className="text-body-lg" style={{ color: '#6B6B6B' }}>
            Pick how long, pick your group size. Every membership opens every home in the Club.
          </p>
        </div>
      </section>

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
            </div>

            <div>
              <p className="text-caption font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B6B6B' }}>
                2. Membership length
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MEMBERSHIP_DURATIONS.map((d) => (
                  <button
                    key={d.weeks}
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
                    {d.discount > 0 && (
                      <p className="text-caption mt-0.5" style={{ color: weeks === d.weeks ? '#C4882F' : '#C4882F' }}>
                        Save {Math.round(d.discount * 100)}%
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: '#F5F5F5', border: '1px solid #E5E5E5' }}>
              <p className="text-body-sm" style={{ color: '#1A1A1A' }}>
                <strong>Your group size is a baseline, not a ceiling.</strong> If the exact size you booked isn't available,
                we place you in a larger home at no extra cost — think of it like an airline upgrading an overbooked seat.
                You're never charged more, and you're never turned away.
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
              {quote.discountPercent > 0 ? (
                <p className="text-caption mb-6" style={{ color: '#CCCCCC' }}>
                  <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>
                    €{quote.fullPrice.toLocaleString('en-EU')}
                  </span>
                  {' · '}
                  <span style={{ color: '#C4882F' }}>Save {quote.discountPercent}%</span>
                  {' · one-time membership'}
                </p>
              ) : (
                <p className="text-caption mb-6" style={{ color: '#CCCCCC' }}>
                  one-time membership
                </p>
              )}

              <div className="mb-6 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <p className="text-body-sm" style={{ color: '#EFEFEF' }}>
                  Opens every home in the Club. Split your time across as many stays as you like —
                  your membership doesn't expire.
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
                onClick={() => navigate('/auth/signup')}
                style={{ background: '#C4882F', color: '#0A0A0A', border: 'none', fontWeight: 700 }}
              >
                Choose this membership
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#F5F5F5', borderTop: '1px solid #E5E5E5' }} className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold text-center mb-8" style={{ color: '#0A0A0A' }}>
            How membership works
          </h2>
          <div className="space-y-4">
            {[
              { n: '1', text: 'You join for a set length — from 1 week up to 12 months — sized for your group. Longer memberships from 3 months include a commitment discount. There is no per-home rate and no seasonal markup.' },
              { n: '2', text: 'Use it whenever you like, across as many stays and homes as you want. Nothing forces you to take it all at once, and it doesn\'t expire.' },
              { n: '3', text: 'Your group size sets your starting price, not a hard limit on which homes you can pick. It\'s membership, not a rental — there\'s nothing to game.' },
            ].map(({ n, text }) => (
              <div key={n} className="flex gap-4 p-5 rounded-card text-left" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-caption font-bold" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>{n}</span>
                <p className="text-body-sm" style={{ color: '#0A0A0A' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center" style={{ background: '#0A0A0A' }}>
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
            Be part of something different.
          </h2>
          <Button
            size="lg"
            onClick={() => navigate('/auth/signup')}
            style={{ background: '#C4882F', color: '#0A0A0A', border: 'none', fontWeight: 700 }}
          >
            Create your account
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
