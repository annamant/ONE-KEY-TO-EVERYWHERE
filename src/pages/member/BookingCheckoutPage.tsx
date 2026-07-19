import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapPinIcon, CalendarDaysIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockProperties, mockLedger, mockBookings } from '@/services'
import { formatDateRange } from '@/utils/format'
import { formatMembershipRemaining, canCoverWithMembership } from '@/utils/membershipRemaining'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import type { MembershipUse } from '@/utils/keyCalc'

interface CheckoutState {
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
  cost: MembershipUse | { nights: number; total: number }
}

function unitsFromCost(cost: CheckoutState['cost']): number {
  if ('units' in cost) return cost.units
  return cost.total
}

export function BookingCheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const state = location.state as CheckoutState | null
  const [confirming, setConfirming] = useState(false)

  const { data: property, loading: propLoading } = useMockApi(
    () => mockProperties.getById(state?.propertyId ?? ''),
    [state?.propertyId]
  )
  const { data: wallet, loading: walletLoading } = useMockApi(
    () => mockLedger.getWallet(currentUser!.id),
    [currentUser?.id]
  )

  if (!state) {
    return (
      <div className="page-content text-center py-16">
        <p className="text-text-muted mb-4">No booking in progress.</p>
        <Button onClick={() => navigate('/member/search')}>Search Properties</Button>
      </div>
    )
  }

  if (propLoading || walletLoading) return <PageSpinner />

  const units = unitsFromCost(state.cost)
  const covered = wallet ? canCoverWithMembership(wallet.balance, units) : false
  const afterBalance = wallet ? wallet.balance - units : 0

  const handleConfirm = async () => {
    if (!currentUser || !property) return
    setConfirming(true)
    try {
      const booking = await mockBookings.create({
        memberId: currentUser.id,
        propertyId: property.id,
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        guests: state.guests,
      })
      toast('Booking confirmed!', 'success')
      navigate(`/member/booking/confirmation/${booking.id}`, { replace: true })
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Booking failed', 'error')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="page-content max-w-2xl">
      <h1 className="text-heading-xl text-text-primary font-semibold mb-6">Confirm Your Booking</h1>

      {property && (
        <Card padding="none" className="mb-5 overflow-hidden">
          <div className="flex gap-0">
            <div className="w-32 h-32 flex-shrink-0">
              <img src={property.coverImage} alt={property.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex-1">
              <h2 className="text-body-md font-semibold text-text-primary mb-1">{property.title}</h2>
              <div className="flex items-center gap-1 text-caption text-text-muted mb-2">
                <MapPinIcon className="w-3.5 h-3.5" />
                {property.city}, {property.country}
              </div>
              <div className="flex flex-wrap gap-3 text-caption text-text-muted">
                <span className="flex items-center gap-1">
                  <CalendarDaysIcon className="w-3.5 h-3.5" />
                  {formatDateRange(state.checkIn, state.checkOut)}
                </span>
                <span className="flex items-center gap-1">
                  <UserGroupIcon className="w-3.5 h-3.5" />
                  {state.guests} guests
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-5">
        <h3 className="text-body-md font-semibold text-text-primary mb-2">Covered by membership</h3>
        <p className="text-body-sm text-text-muted">
          This stay is included in your Club membership. No separate charge.
        </p>
      </Card>

      {wallet && (
        <Card className={`mb-6 ${!covered ? 'border-2 border-danger' : ''}`}>
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-body-sm text-text-muted mb-1">Your membership</p>
              <p className={`text-body-md font-semibold ${!covered ? 'text-danger' : 'text-text-primary'}`}>
                {formatMembershipRemaining(wallet.balance)}
              </p>
            </div>
          </div>
          {!covered ? (
            <div className="mt-3 space-y-3">
              <p className="text-caption text-danger">
                Your membership doesn&apos;t cover this stay. Choose shorter dates or buy / extend a membership package.
              </p>
              <Button size="sm" onClick={() => navigate('/member/packages')}>
                View membership packages
              </Button>
            </div>
          ) : (
            <p className="text-caption text-text-muted mt-2">
              After this stay: {formatMembershipRemaining(afterBalance).replace(/^A/, 'a').replace('Your m', 'your m')}
            </p>
          )}
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} fullWidth>
          Go Back
        </Button>
        {!covered ? (
          <Button fullWidth onClick={() => navigate('/member/packages')}>
            Get a membership
          </Button>
        ) : (
          <Button
            fullWidth
            loading={confirming}
            onClick={handleConfirm}
          >
            Confirm Booking
          </Button>
        )}
      </div>

      <p className="text-caption text-text-muted text-center mt-3">
        By confirming, this stay will use part of your membership.
      </p>
    </div>
  )
}
