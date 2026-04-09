import { useNavigate } from 'react-router-dom'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { KeyIcon, HomeModernIcon, UsersIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

// Verified Unsplash images — Puglia, Italy
const HERO_IMG = '/images/landing/jose-jovena-dgj88Fece5c-unsplash.jpg';
const OSTUNI_IMG = '/images/landing/freysteinn-g-jonsson-DqFMDsdQhXc-unsplash.jpg';
const FINAL_CTA_IMG = '/images/landing/mathilde-ro-CWwYdFYKIw0-unsplash.jpg';

// ... rest of your LandingPage.tsx ...
const HOMES = [
  {
    title: "Trullo — Peppe",
    area: 'Ostuni, Puglia',
    tier: 'Club Premium',
    img: 'https://images.unsplash.com/photo-sc6X5YIuxq8?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Blue House',
    area: 'Ostuni, Puglia',
    tier: 'Club Luxury',
    img: 'https://images.unsplash.com/photo-tplY9UrKtV4?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Yellow House',
    area: 'Ostuni, Puglia',
    tier: 'Club Premium',
    img: 'https://images.unsplash.com/photo-eKl9Ync7t8Y?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Trullo Family House',
    area: 'Ostuni, Puglia',
    tier: 'Club Luxury',
    img: 'https://images.unsplash.com/photo-GWHkstcGkFM?w=800&auto=format&fit=crop&q=80',
  },
]

const PILLARS = [
  {
    icon: <KeyIcon className="w-6 h-6" />,
    title: 'One key. Every home.',
    desc: 'When you join the Club you receive gain access to everyehere. No prices. No bidding. No surge in August. A key in January is worth exactly the same as a key in July.',
  },
  {
    icon: <HomeModernIcon className="w-6 h-6" />,
    title: 'Real homes. Real character.',
    desc: 'You access a home that someone loves. Trulli, masserie, coastal towers, baroque palazzi — every property is selected for its soul, not its star rating.',
  },
  {
    icon: <UsersIcon className="w-6 h-6" />,
    title: 'A carefully curated circle.',
    desc: "You don't join by accident. Every member is vetted.The Club exists because trust is built with care — not with algorithms.",
  },
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: 'The European way.',
    desc: 'No opportunistic dynamic pricing. No penalty for choosing January. Born in Puglia with European values: fairness, continuity, respect for the territory.',
  },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>

      {/* ── FULL-SCREEN HERO ─────────────────────────────────────────────────── */}
      <section className="relative flex flex-col" style={{ height: '100svh', minHeight: 600 }}>
        <img
          src={HERO_IMG}
          alt="Polignano a Mare, Puglia"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
          loading="eager"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.08) 100%), ' +
              'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)',
          }}
        />

        <PublicNav transparent />

        <div className="relative mt-auto w-full">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-10 sm:pb-14 flex flex-col sm:flex-row items-end justify-between gap-8">
            <div className="max-w-lg">
              <p className="text-caption font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Private Members Club · Puglia, Italy
              </p>
              <h1
                className="font-display font-bold leading-none mb-5"
                style={{ color: '#FFFFFF', fontSize: 'clamp(3rem, 7vw, 5.5rem)', lineHeight: 1.02 }}
              >
                Live across<br />
                <em style={{ fontStyle: 'italic' }}>Puglia.</em><br />
                One key.
              </h1>
              <p className="text-body-sm leading-relaxed mb-8 max-w-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                A private Club that gives you access to exceptional homes across Puglia. Stay weeks, not nights. Move between places. Make it yours.
              </p>
              <div className="flex items-center gap-5 flex-wrap">
                <button
                  onClick={() => navigate('/waitlist')}
                  className="text-caption font-bold uppercase tracking-wider px-6 py-3 transition-all"
                  style={{ border: '1.5px solid #FFFFFF', color: '#FFFFFF', background: 'transparent', cursor: 'pointer', letterSpacing: '0.12em' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#0A0A0A' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FFFFFF' }}
                >
                  Join the Waitlist
                </button>
                <button
                  onClick={() => navigate('/how-it-works')}
                  className="text-caption font-semibold uppercase tracking-wider transition-colors"
                  style={{ color: 'rgba(255,255,255,0.65)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.12em' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                >
                  See How It Works →
                </button>
              </div>
            </div>

            <div className="flex gap-10 sm:gap-14 shrink-0">
              {[
                { n: '50+', label: 'Club Residences' },
                { n: '1', label: 'Region, Done Right' },
                { n: '∞', label: 'Ways to Experience' },
              ].map(({ n, label }) => (
                <div key={label} className="text-right">
                  <p className="font-display font-bold leading-none" style={{ color: '#FFFFFF', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
                    {n}
                  </p>
                  <p className="text-caption uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ATMOSPHERE STRIP ─────────────────────────────────────────────────── */}
      <section style={{ background: '#0A0A0A' }} className="py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="font-display font-bold"
            style={{ color: '#FFFFFF', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', lineHeight: 1.35 }}
          >
            "A membership club for experiences — a key to everywhere."
          </p>
          <p className="text-caption uppercase tracking-widest mt-5" style={{ color: '#C4882F', letterSpacing: '0.18em' }}>
            One Key to Everywhere · Est. Puglia
          </p>
        </div>
      </section>

      {/* ── OSTUNI IMAGE BAND ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ height: 420 }}>
        <img
          src={OSTUNI_IMG}
          alt="Ostuni, the white city of Puglia"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 50%' }}
        />
        <div
          className="absolute inset-0 flex items-center"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.10) 0%, transparent 60%)' }}
        >
          <div className="px-10 sm:px-16">
            <p className="text-caption font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#C4882F' }}>
              Ostuni · The White City
            </p>
            <p
              className="font-display font-bold"
              style={{ color: '#FFFFFF', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', maxWidth: 400, lineHeight: 1.25 }}
            >
              Puglia at its most extraordinary.
            </p>
          </div>
        </div>
      </section>

      {/* ── PILLARS ──────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-caption font-semibold uppercase tracking-widest mb-3" style={{ color: '#C4882F', letterSpacing: '0.18em' }}>
            The Club model
          </p>
          <h2 className="font-display text-display-lg font-bold mb-3" style={{ color: '#0A0A0A' }}>
            Not a booking.<br />An access.
          </h2>
          <p className="text-body-lg max-w-xl mx-auto" style={{ color: '#6B6B6B' }}>
            The Club works unlike anything you've seen in travel.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PILLARS.map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-5 p-6 rounded-2xl" style={{ background: '#F5F5F5', border: '1px solid #E5E5E5' }}>
              <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
                {icon}
              </div>
              <div>
                <h3 className="text-body-md font-semibold mb-1" style={{ color: '#0A0A0A' }}>{title}</h3>
                <p className="text-body-sm" style={{ color: '#6B6B6B' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLUB HOMES ───────────────────────────────────────────────────────── */}
      <section style={{ background: '#F5F5F5', borderTop: '1px solid #E5E5E5' }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: '#C4882F' }}>Club homes</p>
              <h2 className="font-display text-heading-xl font-bold" style={{ color: '#0A0A0A' }}>
                Every home has a story.
              </h2>
            </div>
            <button
              onClick={() => navigate('/auth/login')}
              className="text-caption font-semibold uppercase tracking-wider shrink-0 px-5 py-2"
              style={{ border: '1.5px solid #0A0A0A', color: '#0A0A0A', background: 'transparent', cursor: 'pointer', letterSpacing: '0.1em' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#0A0A0A'; e.currentTarget.style.color = '#FFFFFF' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0A0A0A' }}
            >
              Browse all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOMES.map((h) => (
              <div
                key={h.title}
                className="rounded-2xl overflow-hidden cursor-pointer group"
                style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}
                onClick={() => navigate('/auth/signup')}
              >
                <div className="overflow-hidden" style={{ height: 220 }}>
                  <img
                    src={h.img}
                    alt={h.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <span className="text-caption font-semibold uppercase tracking-wide" style={{ color: '#C4882F', letterSpacing: '0.12em' }}>{h.tier}</span>
                  <h3 className="text-body-md font-semibold mt-1" style={{ color: '#0A0A0A' }}>{h.title}</h3>
                  <p className="text-caption mt-0.5" style={{ color: '#6B6B6B' }}>{h.area}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OWNER CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: '#FFFFFF', borderTop: '1px solid #E5E5E5' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-caption font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#6B6B6B' }}>For property owners</p>
          <h2 className="font-display text-display-lg font-bold mb-4" style={{ color: '#0A0A0A' }}>
            Your home has a place<br />in this Club.
          </h2>
          <p className="text-body-lg mb-8 max-w-xl mx-auto" style={{ color: '#6B6B6B' }}>
            If you own an exceptional home in Puglia — a trullo, a masseria, a palazzo — we'd like to hear its story.
          </p>
          <button
            onClick={() => navigate('/open-doors')}
            className="text-caption font-bold uppercase tracking-wider px-8 py-4 transition-all"
            style={{ background: '#0A0A0A', color: '#FFFFFF', border: 'none', cursor: 'pointer', letterSpacing: '0.12em' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1A1A1A')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0A0A0A')}
          >
            Open your doors
          </button>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 text-center relative overflow-hidden" style={{ background: '#0A0A0A' }}>
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: `url(${FINAL_CTA_IMG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative max-w-xl mx-auto px-6">
          <p className="text-caption font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: 'rgba(196,136,47,0.95)', textShadow: '0 2px 10px rgba(0,0,0,0.55)' }}
            Membership is limited
          </p>
          <h2 className="font-display font-bold mb-4" style={{ color: '#FFFFFF', fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}>
            Puglia.<br />Done right.
          </h2>
          <p className="text-body-md mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
            One region. One Club. The way it should be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/waitlist')}
              className="text-caption font-bold uppercase tracking-wider px-8 py-4 transition-all"
              style={{ background: '#C4882F', color: '#0A0A0A', border: 'none', cursor: 'pointer', letterSpacing: '0.12em' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#D4983F')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#C4882F')}
            >
              Join the Waitlist
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="text-caption font-semibold uppercase tracking-wider px-8 py-4 transition-all"
              style={{ color: '#FFFFFF', border: '1.5px solid rgba(255,255,255,0.4)', background: 'transparent', cursor: 'pointer', letterSpacing: '0.12em' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
            >
              View Membership Plans
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
