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
    accent: '#8B3A2A',
    bg: '#FDFAF5',
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
    bg: '#2C1810',
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
    accent: '#4A5C28',
    bg: '#FDFAF5',
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
  { tier: 'Club Premium', keys: '4–6', examples: 'Trulli, mid-size masserie, sea-view homes' },
  { tier: 'Club Luxury', keys: '6–10', examples: 'Grand masserie, coastal towers, baroque palazzos' },
]

export function PricingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FDFAF5' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ background: '#F7F0E3', borderBottom: '1px solid #E8DCCF' }} className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-caption font-semibold uppercase tracking-widest mb-4" style={{ color: '#C4882F' }}>Membership plans</p>
          <h1 className="font-display text-display-lg font-bold mb-4" style={{ color: '#2C1810' }}>Simple. Transparent. Fair.</h1>
          <p className="text-body-lg" style={{ color: '#8A7560' }}>
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
              className={cn(
                'rounded-2xl p-8 flex flex-col',
                p.highlight ? 'shadow-modal' : ''
              )}
              style={{
                background: p.bg,
                border: p.highlight ? `2px solid ${p.accent}` : '2px solid #E8DCCF',
              }}
            >
              {p.highlight && (
                <div className="self-start text-caption font-bold px-3 py-1 rounded-full mb-4" style={{ background: '#C4882F', color: '#2C1810' }}>
                  Most popular
                </div>
              )}
              <h3 className="font-display text-heading-md font-bold mb-1" style={{ color: p.highlight ? '#FDFAF5' : '#2C1810' }}>
                {p.name}
              </h3>
              <p className="text-body-sm mb-6" style={{ color: p.highlight ? '#C4A882' : '#8A7560' }}>
                {p.keys} keys · €{p.perKey.toFixed(2)} / key
              </p>
              <p className="font-display text-display-lg font-bold mb-1" style={{ color: p.highlight ? '#C4882F' : p.accent }}>
                €{p.price.toLocaleString('en-EU')}
              </p>
              <p className="text-caption mb-8" style={{ color: p.highlight ? '#C4A882' : '#8A7560' }}>
                one-time payment
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: p.highlight ? '#C4882F' : p.accent }} />
                    <span className="text-body-sm" style={{ color: p.highlight ? '#F7F0E3' : '#8A7560' }}>{perk}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="md"
                fullWidth
                onClick={() => navigate('/auth/signup')}
                style={
                  p.highlight
                    ? { background: '#C4882F', color: '#2C1810', border: 'none', fontWeight: 700 }
                    : { background: 'transparent', color: p.accent, border: `1.5px solid ${p.accent}` }
                }
              >
                Choose this plan
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Homes cost table */}
      <section style={{ background: '#F7F0E3', borderTop: '1px solid #E8DCCF' }} className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold text-center mb-3" style={{ color: '#2C1810' }}>
            How many keys per home?
          </h2>
          <p className="text-body-sm text-center mb-8" style={{ color: '#8A7560' }}>
            Each home has a fixed key cost per night — the same all year round.
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8DCCF' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: '#FAE6DA', borderBottom: '1px solid #E8DCCF' }}>
                  <th className="text-left px-6 py-4 text-body-sm font-semibold" style={{ color: '#2C1810' }}>Tier</th>
                  <th className="text-left px-6 py-4 text-body-sm font-semibold" style={{ color: '#2C1810' }}>Keys / night</th>
                  <th className="text-left px-6 py-4 text-body-sm font-semibold" style={{ color: '#2C1810' }}>Examples</th>
                </tr>
              </thead>
              <tbody>
                {HOMES_TABLE.map(({ tier, keys, examples }) => (
                  <tr key={tier} style={{ borderBottom: '1px solid #E8DCCF', background: '#FDFAF5' }}>
                    <td className="px-6 py-4 text-body-sm font-semibold" style={{ color: '#2C1810' }}>{tier}</td>
                    <td className="px-6 py-4 text-body-sm font-bold" style={{ color: '#C4882F' }}>{keys}</td>
                    <td className="px-6 py-4 text-body-sm" style={{ color: '#8A7560' }}>{examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 rounded-xl" style={{ background: '#F5F7F0', border: '1px solid #CDD8B0' }}>
            <p className="text-body-sm" style={{ color: '#4A5C28' }}>
              <strong>Seasonality:</strong> Visits from November through February cost 20% fewer keys. Stays of 7+ nights receive an additional 10–15% discount. Never opportunistic dynamic pricing.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center" style={{ background: '#2C1810' }}>
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold mb-6" style={{ color: '#FDFAF5' }}>
            Be part of something different.
          </h2>
          <Button
            size="lg"
            onClick={() => navigate('/auth/signup')}
            style={{ background: '#C4882F', color: '#2C1810', border: 'none', fontWeight: 700 }}
          >
            Create your account
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
