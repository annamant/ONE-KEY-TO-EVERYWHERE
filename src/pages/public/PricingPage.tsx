import { useNavigate } from 'react-router-dom'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { MembershipPricingPicker } from '@/components/membership/MembershipPricingPicker'
import { useAuth } from '@/contexts/AuthContext'
import type { PackageSelection } from '@/types/membership'

export function PricingPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const goChoose = (selection: PackageSelection) => {
    if (currentUser?.role === 'member') {
      navigate('/member/packages', { state: { selection } })
      return
    }
    if (currentUser) {
      navigate(`/${currentUser.role}/dashboard`)
      return
    }
    navigate('/auth/signup', { state: { fromPricing: true, selection } })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <PublicNav />

      <section style={{ background: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }} className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-caption font-semibold uppercase tracking-widest mb-4" style={{ color: '#C4882F' }}>Membership plans</p>
          <h1 className="font-display text-display-lg font-bold mb-4" style={{ color: '#0A0A0A' }}>Build your membership.</h1>
          <p className="text-body-lg" style={{ color: '#6B6B6B' }}>
            Pick how long, pick your group size. Every membership opens every home in the Club.
          </p>
        </div>
      </section>

      <MembershipPricingPicker
        primaryCtaLabel={currentUser?.role === 'member' ? 'Continue to request' : 'Choose this membership'}
        seasonCtaLabel={(label) =>
          currentUser?.role === 'member' ? `Continue to ${label.toLowerCase()}` : `Reserve ${label.toLowerCase()}`
        }
        footerCtaLabel={currentUser ? 'Go to your dashboard' : 'Create your account'}
        onSelectWeek={goChoose}
        onSelectSeason={goChoose}
        onFooterCta={() => {
          if (currentUser) {
            navigate(currentUser.role === 'member' ? '/member/packages' : `/${currentUser.role}/dashboard`)
          } else {
            navigate('/auth/signup')
          }
        }}
      />

      <PublicFooter />
    </div>
  )
}
