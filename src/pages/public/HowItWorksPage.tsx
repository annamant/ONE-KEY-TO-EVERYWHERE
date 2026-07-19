import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { KeyIcon, HomeModernIcon, UserPlusIcon, SparklesIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

const MEMBER_STEPS = [
  {
    icon: <UserPlusIcon className="w-6 h-6" />,
    title: 'Apply and be accepted',
    desc: 'The Club is selective. You submit a profile, share your story, and wait for approval. You don\'t join by accident — that\'s the point.',
  },
  {
    icon: <CalendarDaysIcon className="w-6 h-6" />,
    title: 'Choose your membership level',
    desc: 'From a short-term membership to try the Club, to a long-term membership for those who travel often — pick the level that matches your life. Every level opens the same doors.',
  },
  {
    icon: <KeyIcon className="w-6 h-6" />,
    title: 'Receive your keys',
    desc: 'Your membership comes with a bundle of keys. Keys are your credit inside the Club. They don\'t expire. They don\'t change in value between August and February.',
  },
  {
    icon: <HomeModernIcon className="w-6 h-6" />,
    title: 'Access any home in the Club',
    desc: 'Your keys aren\'t tied to one property — they open every home in the Club. Pick a trullo this weekend, a masseria for a family reunion, a coastal villa in August: whatever fits what you need, each time. Every home has a fixed key rate, the same in winter as in summer.',
  },
  {
    icon: <SparklesIcon className="w-6 h-6" />,
    title: 'Bring those you love',
    desc: 'Add family members or close ones to your household and share keys. Each member of your household can access Club homes independently.',
  },
]

const FAQS = [
  {
    q: 'Do I only get access to one home?',
    a: 'No. Membership isn\'t tied to a single property. Every home in the Club is available to you, and you choose whichever one fits your plans each time you use your keys — a different home for a weekend away, a family gathering, or a longer stay.',
  },
  {
    q: 'What are the membership levels?',
    a: 'Membership levels range from short-term — a lighter commitment with a smaller key bundle, ideal for trying the Club — to long-term memberships built for those who travel often and want a larger bundle of keys. Every level gives you the exact same access: all Club homes, at the same fixed key rate.',
  },
  {
    q: 'Do keys expire?',
    a: 'No. The keys you receive with your membership are yours. There is no expiry date, no penalty for not travelling every month. You can wait for the right moment.',
  },
  {
    q: 'How many keys does it cost to access a home?',
    a: 'Each Club home has a fixed key rate — set by the owner in agreement with us. There are no seasonal price hikes: the value of a key is the same in high and low season.',
  },
  {
    q: 'Can I share my keys with family?',
    a: 'Yes. Create a household and invite whoever you wish. The key balance is shared and each household member can access Club homes independently.',
  },
  {
    q: 'How does a cancellation work?',
    a: 'You can cancel with a full key refund up to 48 hours before access. After 48 hours a partial refund applies.',
  },
  {
    q: 'Is the Club only for Ostuni?',
    a: 'For now, yes — and we say that with pride. Before expanding, we want to do one thing as well as it can possibly be done. Ostuni is where the Club begins.',
  },
  {
    q: 'Why don\'t key costs change between summer and winter?',
    a: 'Because we believe Ostuni is beautiful all year round, and that owners deserve to welcome members in the off-season too. The key model removes the opportunistic incentive of dynamic pricing.',
  },
  {
    q: 'I\'m a property owner. Do I have to be a Club member too?',
    a: 'Yes. All owners are Club members. There is no distinction between those who welcome and those who are welcomed — everyone is part of the same circle.',
  },
]

export function HowItWorksPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ background: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }} className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-caption font-semibold uppercase tracking-widest mb-4" style={{ color: '#C4882F' }}>How it works</p>
          <h1 className="font-display text-display-lg font-bold mb-4" style={{ color: '#0A0A0A' }}>
            Not a platform.<br />A Club.
          </h1>
          <p className="text-body-lg" style={{ color: '#6B6B6B' }}>
            Understand the difference and you won't look back.
          </p>
        </div>
      </section>

      {/* For members */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-caption font-semibold uppercase tracking-widest" style={{ color: '#C4882F' }}>For members</span>
          <h2 className="font-display text-heading-xl font-bold mt-2" style={{ color: '#0A0A0A' }}>Access. Don't book.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {MEMBER_STEPS.map(({ icon, title, desc }, i) => (
            <div key={title} className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
                {icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-caption font-bold" style={{ color: '#C4882F' }}>0{i + 1}</span>
                </div>
                <h3 className="text-body-md font-semibold mb-1" style={{ color: '#0A0A0A' }}>{title}</h3>
                <p className="text-body-sm" style={{ color: '#6B6B6B' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* One key, every home */}
      <section style={{ background: '#F5F5F5', borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5' }} className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-heading-xl font-bold mb-4" style={{ color: '#0A0A0A' }}>
            All the homes. Not just one.
          </h2>
          <p className="text-body-md" style={{ color: '#6B6B6B' }}>
            A Club membership doesn't lock you into a single property. Your keys work across the entire Club collection —
            every trullo, masseria, and coastal home is yours to choose from, every time. Book a different home for every
            trip, depending on what the moment calls for: a quiet weekend, a family celebration, a long summer stay.
          </p>
        </div>
      </section>

      {/* Key currency explainer */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-heading-xl font-bold mb-6" style={{ color: '#0A0A0A' }}>
          Keys, explained in four steps.
        </h2>
        <div className="space-y-4">
          {[
            { n: '1', text: 'Choose a membership level — from short-term to long-term — and receive a bundle of keys with it. They are yours: they never expire.' },
            { n: '2', text: 'Each Club home has a fixed key rate. The same in January as in August. No dynamic pricing, ever.' },
            { n: '3', text: 'Every home in the Club is open to you, not just one. Choose whichever home fits what you need each time you use your keys.' },
            { n: '4', text: 'The longer your visit, the more you save. The Club rewards those who take their time, not those who rush.' },
          ].map(({ n, text }) => (
            <div key={n} className="flex gap-4 p-5 rounded-card text-left" style={{ background: '#F5F5F5', border: '1px solid #E5E5E5' }}>
              <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-caption font-bold" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>{n}</span>
              <p className="text-body-sm" style={{ color: '#0A0A0A' }}>{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/pricing')}
            style={{ borderColor: '#0A0A0A', color: '#0A0A0A' }}
          >
            Compare membership levels
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: '#F5F5F5', borderTop: '1px solid #E5E5E5' }} className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold text-center mb-10" style={{ color: '#0A0A0A' }}>Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-5 rounded-xl" style={{ border: '1px solid #E5E5E5', background: '#FFFFFF' }}>
                <h3 className="text-body-md font-semibold mb-2" style={{ color: '#0A0A0A' }}>{q}</h3>
                <p className="text-body-sm" style={{ color: '#6B6B6B' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center" style={{ background: '#0A0A0A' }}>
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold mb-6" style={{ color: '#FFFFFF' }}>Ready to join the Club?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth/signup')}
              style={{ background: '#C4882F', color: '#0A0A0A', border: 'none', fontWeight: 700 }}
            >
              Request membership
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/pricing')}
              style={{ borderColor: '#6B6B6B', color: '#FFFFFF' }}
            >
              View membership plans
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
