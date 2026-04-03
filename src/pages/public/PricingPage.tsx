import { useNavigate } from 'react-router-dom'
import { CheckIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/Button'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { cn } from '@/utils/classNames'

const PLANS = [
  {
    name: 'Explorer Member',
    keys: 50,
    price: 499,
    perKey: 9.98,
    highlight: false,
    accent: '#0A0A0A',
    bg: '#FFFFFF',
    textColor: '#0A0A0A',
    mutedColor: '#6B6B6B',
    perkColor: '#6B6B6B',
    perks: [
      '50 keys included',
      'Access to all Club homes',
      'Household (up to 3 people)',
      'Keys never expire',
      'Free cancellation up to 48h before',
      'Club support via email',
    ],
  },
  {
    name: 'Puglia Member',
    keys: 150,
    price: 1299,
    perKey: 8.66,
    highlight: true,
    accent: '#C4882F',
    bg: '#0A0A0A',
    textColor: '#FFFFFF',
    mutedColor: '#CCCCCC',
    perkColor: '#EFEFEF',
    perks: [
      '150 keys included',
      'Access to all Club homes',
      'Household (up to 5 people)',
      'Keys never expire',
      'Free cancellation up to 48h before',
      'Priority Club support',
      'Long-stay discount (7+ nights)',
      'Early access to new homes',
    ],
  },
  {
    name: 'Founding Member',
    keys: 500,
    price: 3999,
    perKey: 7.99,
    highlight: false,
    accent: '#0A0A0A',
    bg: '#FFFFFF',
    textColor: '#0A0A0A',
    mutedColor: '#6B6B6B',
    perkColor: '#6B6B6B',
    perks: [
      '500 keys included',
      'Access to all Club homes',
      'Unlimited household members',
      'Keys never expire',
      'Free cancellation up to 48h before',
      'Dedicated Club concierge',
      'Long-stay discount (7+ nights)',
      'Early access to new homes',
      'Permanent "Founder" badge',
      'A voice in how the Club grows',
    ],
  },
]

const HOMES_TABLE = [
  { tier: 'Club Standard', keys: '2–4', examples: 'Dammusi, farmhouses, historic centre apartments' },
  { tier: 'Club Premium',  keys: '4–6', examples: 'Trulli, mid-size masserie, sea-view homes' },
  { tier: 'Club Luxury',   keys: '6–10', examples: 'Grand masserie, coastal towers, baroque palazzos' },
]

export function PricingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ background: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }} className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-caption font-semibold uppercase tracking-widest mb-4" style={{ color: '#C4882F' }}>Membership plans</p>
          <h1 className="font-display text-display-lg font-bold mb-4" style={{ color: '#0A0A0A' }}>Simple. Transparent. Fair.</h1>
          <p className="text-body-lg" style={{ color: '#6B6B6B' }}>
            Pay once. Your keys are yours forever. No annual subscription, no surprises.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={cn('rounded-2xl p-8 flex flex-col', p.highlight ? 'shadow-modal' : '')}
              style={{
                background: p.bg,
                border: p.highlight ? `2px solid ${p.accent}` : '2px solid #E5E5E5',
              }}
            >
              {p.highlight && (
                <div className="self-start text-caption font-bold px-3 py-1 rounded-full mb-4" style={{ background: '#C4882F', color: '#0A0A0A' }}>
                  Most popular
                </div>
              )}
              <h3 className="font-display text-heading-md font-bold mb-1" style={{ color: p.textColor }}>
                {p.name}
              </h3>
              <p className="text-body-sm mb-6" style={{ color: p.mutedColor }}>
                {p.keys} keys · €{p.perKey.toFixed(2)} / key
              </p>
              <p className="font-display text-display-lg font-bold mb-1" style={{ color: p.highlight ? '#C4882F' : p.accent }}>
                €{p.price.toLocaleString('en-EU')}
              </p>
              <p className="text-caption mb-8" style={{ color: p.mutedColor }}>
                one-time payment
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: p.highlight ? '#C4882F' : '#0A0A0A' }} />
                    <span className="text-body-sm" style={{ color: p.perkColor }}>{perk}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="md"
                fullWidth
                onClick={() => navigate('/auth/signup')}
                style={
                  p.highlight
                    ? { background: '#C4882F', color: '#0A0A0A', border: 'none', fontWeight: 700 }
                    : { background: 'transparent', color: '#0A0A0A', border: '1.5px solid #0A0A0A' }
                }
              >
                Choose this plan
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Homes cost table */}
      <section style={{ background: '#F5F5F5', borderTop: '1px solid #E5E5E5' }} className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold text-center mb-3" style={{ color: '#0A0A0A' }}>
            How many keys per home?
          </h2>
          <p className="text-body-sm text-center mb-8" style={{ color: '#6B6B6B' }}>
            Each home has a fixed key cost per night — the same all year round.
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: '#EFEFEF', borderBottom: '1px solid #E5E5E5' }}>
                  <th className="text-left px-6 py-4 text-body-sm font-semibold" style={{ color: '#0A0A0A' }}>Tier</th>
                  <th className="text-left px-6 py-4 text-body-sm font-semibold" style={{ color: '#0A0A0A' }}>Keys / night</th>
                  <th className="text-left px-6 py-4 text-body-sm font-semibold" style={{ color: '#0A0A0A' }}>Examples</th>
                </tr>
              </thead>
              <tbody>
                {HOMES_TABLE.map(({ tier, keys, examples }) => (
                  <tr key={tier} style={{ borderBottom: '1px solid #E5E5E5', background: '#FFFFFF' }}>
                    <td className="px-6 py-4 text-body-sm font-semibold" style={{ color: '#0A0A0A' }}>{tier}</td>
                    <td className="px-6 py-4 text-body-sm font-bold" style={{ color: '#C4882F' }}>{keys}</td>
                    <td className="px-6 py-4 text-body-sm" style={{ color: '#6B6B6B' }}>{examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 rounded-xl" style={{ background: '#EFEFEF', border: '1px solid #E5E5E5' }}>
            <p className="text-body-sm" style={{ color: '#1A1A1A' }}>
              <strong>Seasonality:</strong> Visits from November through February cost 20% fewer keys. Stays of 7+ nights receive an additional 10–15% discount. Never opportunistic dynamic pricing.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
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
