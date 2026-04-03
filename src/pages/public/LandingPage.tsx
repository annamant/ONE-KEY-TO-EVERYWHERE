import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { KeyIcon, HomeModernIcon, UsersIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

const HOMES = [
  { title: "Trullo — Valle d'Itria", area: 'Alberobello, Puglia', tier: 'Club Premium', img: 'https://picsum.photos/seed/trullo-itria/800/600' },
  { title: 'Masseria Bianca', area: 'Ostuni, Puglia', tier: 'Club Luxury', img: 'https://picsum.photos/seed/masseria-ostuni/800/600' },
  { title: 'House on the Sea', area: 'Polignano a Mare, Puglia', tier: 'Club Premium', img: 'https://picsum.photos/seed/polignano-mare/800/600' },
  { title: 'Coastal Tower', area: 'Otranto, Puglia', tier: 'Club Luxury', img: 'https://picsum.photos/seed/torre-otranto/800/600' },
]

const PILLARS = [
  {
    icon: <KeyIcon className="w-6 h-6" />,
    title: 'One key. Every home.',
    desc: 'When you join the Club you receive your keys. No prices. No bidding. No surge in August. A key in January is worth exactly the same as a key in July.',
  },
  {
    icon: <HomeModernIcon className="w-6 h-6" />,
    title: 'Real homes. Real owners.',
    desc: "You don't rent a room. You access a home that someone loves. Every owner is also a Club Member — they opened their doors because they believe in this way of travelling.",
  },
  {
    icon: <UsersIcon className="w-6 h-6" />,
    title: 'A carefully curated circle.',
    desc: "You don't join by accident. Every member is vetted. Every home is approved. The Club exists because trust is built with care — not with algorithms.",
  },
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: 'The European way.',
    desc: "No opportunistic dynamic pricing. No penalty for choosing January or March. OKTE was born in Europe with European values: fairness, continuity, respect for the territory.",
  },
]

const STATS = [
  { value: '50+', label: 'Homes in Puglia' },
  { value: '1', label: 'Region, done right' },
  { value: 'Zero', label: 'Dynamic pricing' },
  { value: 'Vetted', label: 'Members only' },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FDFAF5' }}>
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2C1810 0%, #6B2D1A 50%, #8B3A2A 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <img src="https://picsum.photos/seed/puglia-ulivi/1600/900" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-28 lg:py-40 text-center">
          <p className="text-caption font-semibold uppercase tracking-[0.25em] mb-6" style={{ color: '#C4882F' }}>
            Puglia, Italy · Private Club
          </p>
          <h1 className="font-display text-display-xl font-bold mb-6 leading-tight" style={{ color: '#FDFAF5' }}>
            One Key.<br />
            <span style={{ color: '#C4882F' }}>Every Home.</span>
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto mb-3" style={{ color: '#EDC59A' }}>
            One Key to Everywhere is a private Club for those who own — or wish to experience — the finest homes in Puglia.
          </p>
          <p className="text-body-md max-w-xl mx-auto mb-12" style={{ color: '#C4A882' }}>
            Not a platform. Not an aggregator. A circle of people who trust one another and open their own doors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth/signup')}
              className="font-bold"
              style={{ background: '#C4882F', color: '#2C1810', border: 'none' }}
            >
              Request your membership
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/how-it-works')}
              style={{ borderColor: '#C4A882', color: '#FDFAF5' }}
            >
              How the Club works
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#FAE6DA', borderTop: '1px solid #EDC59A', borderBottom: '1px solid #EDC59A' }}>
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="font-display text-display-lg font-bold" style={{ color: '#6B2D1A' }}>{value}</p>
              <p className="text-body-sm mt-1" style={{ color: '#8A7560' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-display-lg font-bold mb-3" style={{ color: '#2C1810' }}>
            Not a booking.<br />An access.
          </h2>
          <p className="text-body-lg max-w-xl mx-auto" style={{ color: '#8A7560' }}>
            The Club works unlike anything you've seen in travel.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {PILLARS.map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-5 p-6 rounded-card" style={{ background: '#F7F0E3', border: '1px solid #E8DCCF' }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#8B3A2A', color: '#FDFAF5' }}>
                {icon}
              </div>
              <div>
                <h3 className="text-body-md font-semibold mb-2" style={{ color: '#2C1810' }}>{title}</h3>
                <p className="text-body-sm" style={{ color: '#8A7560' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured homes */}
      <section style={{ background: '#F7F0E3', borderTop: '1px solid #E8DCCF' }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-caption font-semibold uppercase tracking-widest mb-2" style={{ color: '#C4882F' }}>Club homes</p>
              <h2 className="font-display text-heading-xl font-bold" style={{ color: '#2C1810' }}>
                Built on trust.<br />Open to members.
              </h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/auth/login')} style={{ borderColor: '#8B3A2A', color: '#8B3A2A' }}>
              Browse all
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOMES.map((h) => (
              <div
                key={h.title}
                className="rounded-2xl overflow-hidden cursor-pointer transition-shadow hover:shadow-card-hover"
                style={{ background: '#FDFAF5', boxShadow: '0 1px 3px rgba(44,24,16,.08)' }}
                onClick={() => navigate('/auth/signup')}
              >
                <img src={h.img} alt={h.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <span className="text-caption font-semibold uppercase tracking-wide" style={{ color: '#C4882F' }}>{h.tier}</span>
                  <h3 className="text-body-md font-semibold mt-1" style={{ color: '#2C1810' }}>{h.title}</h3>
                  <p className="text-caption mt-0.5" style={{ color: '#8A7560' }}>{h.area}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Owner CTA */}
      <section className="py-20 px-6" style={{ background: '#F5F7F0', borderTop: '1px solid #CDD8B0' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-caption font-semibold uppercase tracking-widest mb-3" style={{ color: '#4A5C28' }}>For property owners</p>
          <h2 className="font-display text-display-lg font-bold mb-4" style={{ color: '#2C1810' }}>
            You're a member too.
          </h2>
          <p className="text-body-lg mb-3" style={{ color: '#637A38' }}>
            You're not putting your home "on a platform". You're opening it to your peers. In return, you earn keys to access other members' homes — in Puglia and wherever the Club grows next.
          </p>
          <p className="text-body-md mb-10" style={{ color: '#8A7560' }}>
            No dynamic pricing that punishes guests for choosing low season. No inflated commissions. A model built to last.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth/signup')}
            style={{ background: '#4A5C28', color: '#FDFAF5', border: 'none' }}
          >
            Open your doors to the Club
          </Button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center" style={{ background: '#2C1810' }}>
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display text-display-lg font-bold mb-4" style={{ color: '#FDFAF5' }}>
            Ready to join?
          </h2>
          <p className="text-body-lg mb-8" style={{ color: '#C4A882' }}>
            Memberships are limited. Puglia, done the right way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth/signup')} style={{ background: '#C4882F', color: '#2C1810', border: 'none', fontWeight: 700 }}>
              Request membership
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/waitlist')} style={{ borderColor: '#8A7560', color: '#C4A882' }}>
              Join the waitlist
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
