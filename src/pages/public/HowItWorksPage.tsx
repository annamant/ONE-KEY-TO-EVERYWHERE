import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { KeyIcon, HomeModernIcon, UserPlusIcon, SparklesIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const MEMBER_STEPS = [
  {
    icon: <UserPlusIcon className="w-6 h-6" />,
    title: 'Apply and be accepted',
    desc: 'The Club is selective. You submit a profile, share your story, and wait for approval. You don\'t join by accident — that\'s the point.',
  },
  {
    icon: <KeyIcon className="w-6 h-6" />,
    title: 'Receive your keys',
    desc: 'Your membership comes with a bundle of keys. Keys are your credit inside the Club. They don\'t expire. They don\'t change in value between August and February.',
  },
  {
    icon: <HomeModernIcon className="w-6 h-6" />,
    title: 'Access any home in the Club',
    desc: 'Choose a home. Use your keys to access it. There is no seasonal "price" — each home has a fixed key cost per night. The same in winter as in summer.',
  },
  {
    icon: <SparklesIcon className="w-6 h-6" />,
    title: 'Bring those you love',
    desc: 'Add family members or close ones to your household and share keys. Each member of your household can access Club homes independently.',
  },
]

const OWNER_STEPS = [
  {
    icon: <HomeModernIcon className="w-6 h-6" />,
    title: 'Open your doors to the Club',
    desc: 'You\'re not putting your home "on a platform". You\'re proposing it to the Club. The process is guided and curious — we want to know your home\'s story, not just the photos.',
  },
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: 'Pass the selection',
    desc: 'Our team reviews every proposal. Not all are accepted — and those who are accepted know it: their home is in good company.',
  },
  {
    icon: <KeyIcon className="w-6 h-6" />,
    title: 'Earn keys',
    desc: 'Every time a Club member accesses your home, you earn keys. You use those keys to access other members\' homes. The Club is nourished by this reciprocity.',
  },
  {
    icon: <ArrowPathIcon className="w-6 h-6" />,
    title: 'Manage on your own terms',
    desc: 'Block the dates you want. Update details when something changes. The Club doesn\'t dictate your terms — you are the guardian of your home.',
  },
]

const FAQS = [
  {
    q: 'Do keys expire?',
    a: 'No. The keys you receive with your membership are yours. There is no expiry date, no penalty for not travelling every month. You can wait for the right moment.',
  },
  {
    q: 'How many keys does it cost to access a home?',
    a: 'Each Club home has a fixed key cost per night — set by the owner in agreement with us. There are no seasonal price hikes: the value of a key is the same in high and low season.',
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
    q: 'Is the Club only for Puglia?',
    a: 'For now, yes — and we say that with pride. Before expanding, we want to do one thing as well as it can possibly be done. Puglia is the heart of the Club.',
  },
  {
    q: 'Why don\'t key costs change between summer and winter?',
    a: 'Because we believe Puglia is beautiful all year round, and that owners deserve to welcome guests in the off-season too. The key model removes the opportunistic incentive of dynamic pricing.',
  },
  {
    q: 'I\'m a property owner. Do I have to be a Club member too?',
    a: 'Yes. All owners are Club members. There is no distinction between those who welcome and those who are welcomed — everyone is part of the same circle.',
  },
]

export function HowItWorksPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FDFAF5' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ background: '#F7F0E3', borderBottom: '1px solid #E8DCCF' }} className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-caption font-semibold uppercase tracking-widest mb-4" style={{ color: '#C4882F' }}>How it works</p>
          <h1 className="font-display text-display-lg font-bold mb-4" style={{ color: '#2C1810' }}>
            Not a platform.<br />A Club.
          </h1>
          <p className="text-body-lg" style={{ color: '#8A7560' }}>
            Understand the difference and you won't look back.
          </p>
        </div>
      </section>

      {/* For members */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-caption font-semibold uppercase tracking-widest" style={{ color: '#C4882F' }}>For members</span>
          <h2 className="font-display text-heading-xl font-bold mt-2" style={{ color: '#2C1810' }}>Access. Don't book.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {MEMBER_STEPS.map(({ icon, title, desc }, i) => (
            <div key={title} className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#8B3A2A', color: '#FDFAF5' }}>
                {icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-caption font-bold" style={{ color: '#C4882F' }}>0{i + 1}</span>
                </div>
                <h3 className="text-body-md font-semibold mb-1" style={{ color: '#2C1810' }}>{title}</h3>
                <p className="text-body-sm" style={{ color: '#8A7560' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* For owners */}
      <section style={{ background: '#F5F7F0', borderTop: '1px solid #CDD8B0' }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-caption font-semibold uppercase tracking-widest" style={{ color: '#4A5C28' }}>For property owners</span>
            <h2 className="font-display text-heading-xl font-bold mt-2" style={{ color: '#2C1810' }}>You're a member too.</h2>
            <p className="text-body-md mt-3 max-w-xl mx-auto" style={{ color: '#637A38' }}>
              You're not a "host". You're not "renting". You're part of the Club exactly like every other member — and your home is your contribution.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {OWNER_STEPS.map(({ icon, title, desc }, i) => (
              <div key={title} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#4A5C28', color: '#FDFAF5' }}>
                  {icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-caption font-bold" style={{ color: '#637A38' }}>0{i + 1}</span>
                  </div>
                  <h3 className="text-body-md font-semibold mb-1" style={{ color: '#2C1810' }}>{title}</h3>
                  <p className="text-body-sm" style={{ color: '#8A7560' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key currency explainer */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-heading-xl font-bold mb-6" style={{ color: '#2C1810' }}>
          Keys, explained in three steps.
        </h2>
        <div className="space-y-4">
          {[
            { n: '1', text: 'With your membership you receive a number of keys. They are yours — they never expire.' },
            { n: '2', text: 'Each Club home has a fixed key cost per night. Choose the home, use your keys to access it.' },
            { n: '3', text: 'If you own a home and open it to the Club, you earn keys whenever a member accesses it. Use those keys to access other homes.' },
          ].map(({ n, text }) => (
            <div key={n} className="flex gap-4 p-5 rounded-card text-left" style={{ background: '#F7F0E3', border: '1px solid #E8DCCF' }}>
              <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-caption font-bold" style={{ background: '#8B3A2A', color: '#FDFAF5' }}>{n}</span>
              <p className="text-body-sm" style={{ color: '#2C1810' }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: '#F7F0E3', borderTop: '1px solid #E8DCCF' }} className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold text-center mb-10" style={{ color: '#2C1810' }}>Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-5 rounded-xl" style={{ border: '1px solid #E8DCCF', background: '#FDFAF5' }}>
                <h3 className="text-body-md font-semibold mb-2" style={{ color: '#2C1810' }}>{q}</h3>
                <p className="text-body-sm" style={{ color: '#8A7560' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center" style={{ background: '#2C1810' }}>
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold mb-6" style={{ color: '#FDFAF5' }}>Ready to join the Club?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth/signup')}
              style={{ background: '#C4882F', color: '#2C1810', border: 'none', fontWeight: 700 }}
            >
              Request membership
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/pricing')}
              style={{ borderColor: '#8A7560', color: '#C4A882' }}
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
