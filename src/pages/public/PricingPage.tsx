import { useNavigate } from 'react-router-dom'
import { CheckIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/Button'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { cn } from '@/utils/classNames'

const BUNDLES = [
  {
    name: 'Explorer',
    keys: 50,
    price: 499,
    perKey: 9.98,
    color: 'border-border',
    highlight: false,
    perks: ['50 keys to spend', 'Access all tiers', 'Household sharing', 'Free cancellation window', 'Email support'],
  },
  {
    name: 'Voyager',
    keys: 150,
    price: 1299,
    perKey: 8.66,
    color: 'border-primary',
    highlight: true,
    perks: ['150 keys to spend', 'Access all tiers', 'Household sharing (up to 5)', 'Free cancellation window', 'Priority support', '15% long-stay bonus'],
  },
  {
    name: 'Globetrotter',
    keys: 500,
    price: 3999,
    perKey: 7.99,
    color: 'border-okte-gold-400',
    highlight: false,
    perks: ['500 keys to spend', 'Access all tiers', 'Household sharing (up to 5)', 'Free cancellation window', 'Concierge support', '15% long-stay bonus', 'Early access to new listings'],
  },
]

const TIER_TABLE = [
  { tier: 'Standard', keys: '2–4', examples: 'Cosy apartments, countryside cottages' },
  { tier: 'Premium', keys: '4–8', examples: 'Beach houses, city penthouses, mountain cabins' },
  { tier: 'Luxury', keys: '8–16', examples: 'Private villas, safari lodges, ski chalets' },
]

export function PricingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="bg-okte-navy-50 py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="font-display text-display-lg font-bold text-okte-navy-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-body-lg text-text-muted">Buy keys once. No subscriptions. No hidden fees.</p>
        </div>
      </section>

      {/* Bundles */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BUNDLES.map((b) => (
            <div
              key={b.name}
              className={cn(
                'rounded-2xl border-2 p-8 flex flex-col',
                b.color,
                b.highlight ? 'bg-okte-navy-900 text-white shadow-modal' : 'bg-white'
              )}
            >
              {b.highlight && (
                <div className="inline-block bg-okte-gold-500 text-okte-navy-900 text-caption font-bold px-3 py-1 rounded-full mb-4 self-start">
                  Most popular
                </div>
              )}
              <h3 className={cn('text-heading-md font-bold mb-1', b.highlight ? 'text-white' : 'text-text-primary')}>{b.name}</h3>
              <p className={cn('text-body-sm mb-6', b.highlight ? 'text-okte-navy-300' : 'text-text-muted')}>
                {b.keys} keys · ${b.perKey.toFixed(2)}/key
              </p>
              <p className={cn('text-display-lg font-display font-bold mb-2', b.highlight ? 'text-white' : 'text-text-primary')}>
                ${b.price.toLocaleString()}
              </p>
              <p className={cn('text-caption mb-8', b.highlight ? 'text-okte-navy-300' : 'text-text-muted')}>one-time purchase</p>
              <ul className="space-y-3 mb-8 flex-1">
                {b.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <CheckIcon className={cn('w-4 h-4 flex-shrink-0', b.highlight ? 'text-okte-gold-400' : 'text-success')} />
                    <span className={cn('text-body-sm', b.highlight ? 'text-okte-navy-200' : 'text-text-muted')}>{perk}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="md"
                onClick={() => navigate('/auth/signup')}
                className={b.highlight ? 'bg-okte-gold-500 hover:bg-okte-gold-400 text-okte-navy-900 font-bold' : ''}
                variant={b.highlight ? 'primary' : 'outline'}
                fullWidth
              >
                Get started
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Key cost table */}
      <section className="bg-okte-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-heading-xl font-bold text-text-primary text-center mb-8">What do stays cost?</h2>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-okte-navy-50 border-b border-border">
                  <th className="text-left px-6 py-4 text-body-sm font-semibold text-text-primary">Tier</th>
                  <th className="text-left px-6 py-4 text-body-sm font-semibold text-text-primary">Keys / night</th>
                  <th className="text-left px-6 py-4 text-body-sm font-semibold text-text-primary">Examples</th>
                </tr>
              </thead>
              <tbody>
                {TIER_TABLE.map(({ tier, keys, examples }) => (
                  <tr key={tier} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 text-body-sm font-semibold text-text-primary">{tier}</td>
                    <td className="px-6 py-4 text-body-sm text-okte-gold-600 font-medium">{keys}</td>
                    <td className="px-6 py-4 text-body-sm text-text-muted">{examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-okte-gold-50 rounded-xl">
            <p className="text-body-sm text-okte-gold-800">
              <strong>Seasonal discounts:</strong> Off-peak months (Nov–Feb) are automatically 20% cheaper. Stays of 7+ nights receive an additional 10–15% discount.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-okte-navy-900 text-white py-16 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold mb-6">Start your journey</h2>
          <Button
            size="lg"
            onClick={() => navigate('/auth/signup')}
            className="bg-okte-gold-500 hover:bg-okte-gold-400 text-okte-navy-900 font-bold"
          >
            Create free account
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
