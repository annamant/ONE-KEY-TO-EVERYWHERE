import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import {
  KeyIcon, BuildingOfficeIcon, UsersIcon, CreditCardIcon,
  CalendarDaysIcon, ShieldCheckIcon, GlobeAltIcon, SparklesIcon,
} from '@heroicons/react/24/outline'

const MEMBER_STEPS = [
  { icon: <CreditCardIcon className="w-6 h-6" />, title: 'Join & buy keys', desc: 'Sign up and purchase a key bundle. Keys never expire and carry over year to year.' },
  { icon: <GlobeAltIcon className="w-6 h-6" />, title: 'Browse properties', desc: 'Filter by region, tier, sleeps, and amenities. Every listing shows its exact key cost upfront.' },
  { icon: <CalendarDaysIcon className="w-6 h-6" />, title: 'Book instantly', desc: 'Select your dates, see the key cost, and confirm. No approval delays, no back-and-forth.' },
  { icon: <UsersIcon className="w-6 h-6" />, title: 'Bring your household', desc: 'Invite family or close friends to share your key balance. Each person can book independently.' },
]

const OWNER_STEPS = [
  { icon: <BuildingOfficeIcon className="w-6 h-6" />, title: 'List your property', desc: 'Complete the 5-step onboarding wizard. Submit photos, amenities, and house rules for review.' },
  { icon: <ShieldCheckIcon className="w-6 h-6" />, title: 'Get approved', desc: 'Our team reviews each listing within 1–2 business days to maintain quality standards.' },
  { icon: <KeyIcon className="w-6 h-6" />, title: 'Earn keys', desc: 'Every completed stay credits your key balance. Use them to book other properties on the network.' },
  { icon: <SparklesIcon className="w-6 h-6" />, title: 'Manage availability', desc: 'Block out personal use dates with the calendar tool. Update listing details anytime.' },
]

const FAQS = [
  { q: 'Do keys expire?', a: 'No. Keys are yours to keep until you use them. There are no expiry dates or rollover restrictions.' },
  { q: 'Can I share keys with family?', a: 'Yes. Create a household and invite up to 5 members. The shared balance is drawn from as members book.' },
  { q: 'What if I need to cancel?', a: 'You can cancel for a full key refund up to 48 hours before check-in. After that, a partial refund applies.' },
  { q: 'How are owners vetted?', a: 'Every owner completes identity verification and every property is reviewed by our team before going live.' },
  { q: 'Is there an annual fee?', a: 'There\'s no recurring subscription. Pay once for keys and use them as you travel.' },
  { q: 'How is key pricing calculated?', a: 'Key cost = property\'s base keys/night × nights × seasonal multiplier. Off-peak months (Nov–Feb) are 20% cheaper. Stays ≥7 nights get up to 15% off.' },
]

export function HowItWorksPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="bg-okte-navy-50 py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="font-display text-display-lg font-bold text-okte-navy-900 mb-4">How It Works</h1>
          <p className="text-body-lg text-text-muted">One currency. Two sides. Endless possibilities.</p>
        </div>
      </section>

      {/* For members */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-caption font-semibold uppercase tracking-widest text-okte-gold-600">For Members</span>
          <h2 className="text-heading-xl font-bold text-text-primary mt-2">Travel on your terms</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {MEMBER_STEPS.map(({ icon, title, desc }, i) => (
            <div key={title} className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-okte-navy-900 text-white flex items-center justify-center">
                {icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-caption font-bold text-okte-gold-500">Step {i + 1}</span>
                </div>
                <h3 className="text-body-md font-semibold text-text-primary mb-1">{title}</h3>
                <p className="text-body-sm text-text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* For owners */}
      <section className="bg-okte-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-caption font-semibold uppercase tracking-widest text-okte-gold-600">For Owners</span>
            <h2 className="text-heading-xl font-bold text-text-primary mt-2">List once. Travel anywhere.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {OWNER_STEPS.map(({ icon, title, desc }, i) => (
              <div key={title} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-okte-gold-500 text-white flex items-center justify-center">
                  {icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-caption font-bold text-okte-navy-600">Step {i + 1}</span>
                  </div>
                  <h3 className="text-body-md font-semibold text-text-primary mb-1">{title}</h3>
                  <p className="text-body-sm text-text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-heading-xl font-bold text-text-primary text-center mb-10">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="border border-border rounded-xl p-5">
              <h3 className="text-body-md font-semibold text-text-primary mb-2">{q}</h3>
              <p className="text-body-sm text-text-muted">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-okte-navy-900 text-white py-16 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold mb-4">Ready to start?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth/signup')}
              className="bg-okte-gold-500 hover:bg-okte-gold-400 text-okte-navy-900 font-bold"
            >
              Join as a Member
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/pricing')}
              className="border-white text-white hover:bg-white/10"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
