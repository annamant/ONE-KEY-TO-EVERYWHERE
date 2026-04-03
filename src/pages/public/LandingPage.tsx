import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { KeyIcon, BuildingOfficeIcon, UsersIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

const PROPERTIES = [
  { title: 'Tuscan Hilltop Villa', location: 'Florence, Italy', tier: 'Luxury', img: 'https://picsum.photos/seed/tuscan-hilltop-villa/800/600' },
  { title: 'Malibu Beach House', location: 'Malibu, USA', tier: 'Premium', img: 'https://picsum.photos/seed/malibu-beach-house/800/600' },
  { title: 'Kyoto Townhouse', location: 'Kyoto, Japan', tier: 'Premium', img: 'https://picsum.photos/seed/kyoto-townhouse/800/600' },
  { title: 'NYC Penthouse', location: 'New York, USA', tier: 'Luxury', img: 'https://picsum.photos/seed/nyc-penthouse/800/600' },
]

const HOW_IT_WORKS = [
  { icon: <KeyIcon className="w-6 h-6" />, title: 'Buy Keys', desc: 'Purchase key bundles once. No recurring subscription required to explore.' },
  { icon: <BuildingOfficeIcon className="w-6 h-6" />, title: 'Browse Properties', desc: 'Access a curated global portfolio of homes, villas, and unique stays.' },
  { icon: <UsersIcon className="w-6 h-6" />, title: 'Share with Household', desc: 'Invite family or a trusted circle to share your key balance.' },
  { icon: <GlobeAltIcon className="w-6 h-6" />, title: 'Book Anywhere', desc: 'Redeem keys at any property, anytime. No blackout fees, no surprises.' },
]

const STATS = [
  { value: '500+', label: 'Properties' },
  { value: '40+', label: 'Countries' },
  { value: '12,000+', label: 'Members' },
  { value: '4.9', label: 'Avg rating' },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-okte-navy-900 via-okte-navy-800 to-okte-navy-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <img src="https://picsum.photos/seed/hero-bg/1600/900" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-okte-gold-500/20 text-okte-gold-300 text-body-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <KeyIcon className="w-4 h-4" />
            The key to extraordinary stays
          </div>
          <h1 className="font-display text-display-xl font-bold mb-6 leading-tight">
            One Key.<br />
            <span className="text-okte-gold-400">Everywhere.</span>
          </h1>
          <p className="text-body-lg text-okte-navy-200 max-w-2xl mx-auto mb-10">
            A membership travel network where a single key currency unlocks a hand-picked portfolio of private homes around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth/signup')}
              className="bg-okte-gold-500 hover:bg-okte-gold-400 text-okte-navy-900 font-bold"
            >
              Start your membership
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/how-it-works')}
              className="border-white text-white hover:bg-white/10"
            >
              How it works
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-okte-gold-50 border-y border-okte-gold-100">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-display-lg font-bold text-okte-navy-800 font-display">{value}</p>
              <p className="text-body-sm text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-heading-xl font-bold text-text-primary mb-3">The simplest way to travel luxuriously</h2>
          <p className="text-body-lg text-text-muted max-w-xl mx-auto">No points systems. No complicated tiers. Just keys and beautiful places.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {HOW_IT_WORKS.map(({ icon, title, desc }, i) => (
            <div key={title} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-okte-navy-50 text-primary flex items-center justify-center mx-auto mb-4">
                {icon}
              </div>
              <div className="w-6 h-6 rounded-full bg-okte-gold-400 text-white text-caption font-bold flex items-center justify-center mx-auto mb-3">
                {i + 1}
              </div>
              <h3 className="text-body-md font-semibold text-text-primary mb-2">{title}</h3>
              <p className="text-body-sm text-text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured properties */}
      <section className="bg-okte-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-heading-xl font-bold text-text-primary mb-1">Featured Properties</h2>
              <p className="text-body-sm text-text-muted">A taste of what awaits</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/auth/login')}>Browse all</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROPERTIES.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-modal transition-shadow cursor-pointer" onClick={() => navigate('/auth/signup')}>
                <img src={p.img} alt={p.title} className="w-full h-44 object-cover" />
                <div className="p-4">
                  <span className="text-caption font-semibold uppercase tracking-wide text-okte-gold-600">{p.tier}</span>
                  <h3 className="text-body-md font-semibold text-text-primary mt-1">{p.title}</h3>
                  <p className="text-caption text-text-muted">{p.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-okte-navy-900 text-white py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-display-lg font-bold mb-4">Ready to unlock the world?</h2>
          <p className="text-body-lg text-okte-navy-300 mb-8">Join thousands of members traveling smarter with One Key to Everywhere.</p>
          <Button
            size="lg"
            onClick={() => navigate('/auth/signup')}
            className="bg-okte-gold-500 hover:bg-okte-gold-400 text-okte-navy-900 font-bold"
          >
            Create your account
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
