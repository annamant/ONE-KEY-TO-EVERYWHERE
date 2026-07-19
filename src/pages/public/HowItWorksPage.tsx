import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { HomeModernIcon, UserPlusIcon, SparklesIcon, CalendarDaysIcon, HeartIcon } from '@heroicons/react/24/outline'

const MEMBER_STEPS = [
  {
    icon: <UserPlusIcon className="w-6 h-6" />,
    title: 'Apply and be accepted',
    desc: 'The Club is selective. You submit a profile, share your story, and wait for approval. You don\'t join by accident — that\'s the point.',
  },
  {
    icon: <CalendarDaysIcon className="w-6 h-6" />,
    title: 'Choose your length and group size',
    desc: 'Most members choose 1, 2, or 4 weeks, sized for their group. If you already know you\'ll return, reserve a 6- or 12-month season at a private rate — with pause built in, so nothing is wasted. Every path opens the same doors.',
  },
  {
    icon: <SparklesIcon className="w-6 h-6" />,
    title: 'Your membership is yours',
    desc: 'Once you\'re in, the Club is open to you. Use your membership whenever it suits you — one stay now, another later, split across as many homes as you like. It doesn\'t expire.',
  },
  {
    icon: <HomeModernIcon className="w-6 h-6" />,
    title: 'Move between any and all homes',
    desc: 'Being part of the Club means access to every home, anywhere in the collection — not just one. One key to everywhere: that\'s where the name comes from.',
  },
  {
    icon: <HeartIcon className="w-6 h-6" />,
    title: 'Bring those you love',
    desc: 'Add family members or close ones to your household. Each member of your household can access Club homes independently under the same membership.',
  },
]

const FAQS = [
  {
    q: 'Do I only get access to one home, or all of them?',
    a: 'All of them — that\'s the whole point of the Club. Membership isn\'t tied to a single property. Every home in the Club is open to you at once, and you can move between them freely: one home this month, a completely different one next month, or even split a single trip across more than one home.',
  },
  {
    q: 'What are the membership levels?',
    a: 'Everyday memberships are 1, 2, or 4 weeks, sized for your group. Separately, you can reserve a season — 6 or 12 calendar months — at a deeper commitment rate, with the ability to pause anytime so your remaining time freezes until you resume. Every path gives you the same access: all Club homes, with no per-home rate.',
  },
  {
    q: 'Does my membership expire?',
    a: 'Week memberships don\'t expire — use them whenever you like. Season packages (6 or 12 months) run on the calendar, but you can pause anytime: your remaining time freezes until you resume, so nothing is wasted.',
  },
  {
    q: 'Can I pause a season package?',
    a: 'Yes — that\'s the point of reserving a season. Pause whenever life gets in the way; the clock stops, and your remaining months wait for you. Resume when you\'re ready.',
  },
  {
    q: 'Do different homes cost different amounts?',
    a: 'No. Membership covers every home in the Club the same way. There\'s nothing to compare between listings — the only thing that changes trip to trip is when you go and for how long.',
  },
  {
    q: 'Can I use a home built for a bigger group than I paid for?',
    a: 'Yes. Your group size sets your starting price, not a ceiling on what you can access. If the exact size you\'re looking for isn\'t available, we place you in a larger home at no extra cost — the same way an airline upgrades a passenger when economy is overbooked. You\'re never charged more, and you\'re never turned away.',
  },
  {
    q: 'Can I share my membership with family?',
    a: 'Yes. Create a household and invite whoever you wish. Membership is shared, and each household member can access Club homes independently.',
  },
  {
    q: 'How does a cancellation work?',
    a: 'You can cancel with a full return of membership up to 48 hours before access. After 48 hours a partial return applies.',
  },
  {
    q: 'Is the Club only for Ostuni?',
    a: 'For now, yes — and we say that with pride. Before expanding, we want to do one thing as well as it can possibly be done. Ostuni is where the Club begins.',
  },
  {
    q: 'Why doesn\'t the price change between summer and winter?',
    a: 'Because we believe Ostuni is beautiful all year round, and that owners deserve to welcome members in the off-season too. This isn\'t a rental — there\'s no dynamic pricing to game, no high season to exploit. Membership works the same way every month of the year.',
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

      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-caption font-semibold uppercase tracking-widest" style={{ color: '#C4882F' }}>For members</span>
          <h2 className="font-display text-heading-xl font-bold mt-2" style={{ color: '#0A0A0A' }}>Access. Don't book.</h2>
          <p className="text-body-md mt-3 max-w-lg mx-auto" style={{ color: '#6B6B6B' }}>
            Membership gives you access to every home in the Club — not one. Move between them as you please.
          </p>
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

      <section style={{ background: '#F5F5F5', borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5' }} className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-heading-xl font-bold mb-4" style={{ color: '#0A0A0A' }}>
            One key. Every home. Not just one.
          </h2>
          <p className="text-body-md" style={{ color: '#6B6B6B' }}>
            Being part of the Club means access to every home in the collection, anywhere — not one
            assigned property. That's why we call it One Key to Everywhere.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-heading-xl font-bold mb-6" style={{ color: '#0A0A0A' }}>
          Membership, explained in four steps.
        </h2>
        <div className="space-y-4">
          {[
            { n: '1', text: 'Choose 1, 2, or 4 weeks and your group size — that\'s the everyday membership. Or reserve a 6- or 12-month season at a private rate, with pause built in so nothing is wasted when life gets in the way.' },
            { n: '2', text: 'Every home in the Club is open to you the same way — in January as in August. There\'s no per-home rate and no seasonal pricing, because this isn\'t a rental.' },
            { n: '3', text: 'Move freely between homes, staying wherever fits what you need, whenever you need it.' },
            { n: '4', text: 'Use your membership however you like: a short stay now, a longer one later, all in one home or split across several. It doesn\'t expire — nothing forces you to use it all at once.' },
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
