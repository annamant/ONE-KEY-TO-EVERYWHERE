import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapPinIcon, CalendarDaysIcon, UserGroupIcon, KeyIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockProperties, mockLedger, mockBookings } from '@/services'
import { formatDateRange } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import type { KeyCostBreakdown } from '@/utils/keyCalc'

interface CheckoutState {
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
  cost: KeyCostBreakdown
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

  const insufficientKeys = wallet ? wallet.balance < state.cost.total : false

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

      {/* Property Summary */}
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

      {/* Cost Breakdown */}
      <Card className="mb-5">
        <h3 className="text-body-md font-semibold text-text-primary mb-4">Key Cost Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-body-sm">
            <span className="text-text-muted">{state.cost.baseKeysPerNight} keys × {state.cost.nights} nights</span>
            <span>{state.cost.baseKeysPerNight * state.cost.nights} keys</span>
          </div>
          {state.cost.seasonalMultiplier < 1 && (
            <div className="flex justify-between text-body-sm text-success">
              <span>Off-season discount ({Math.round((1 - state.cost.seasonalMultiplier) * 100)}% off)</span>
              <span>−{Math.round(state.cost.baseKeysPerNight * state.cost.nights * (1 - state.cost.seasonalMultiplier))} keys</span>
            </div>
          )}
          {state.cost.longStayMultiplier < 1 && (
            <div className="flex justify-between text-body-sm text-success">
              <span>Long-stay bonus ({Math.round((1 - state.cost.longStayMultiplier) * 100)}% off)</span>
              <span>−{Math.round(state.cost.baseKeysPerNight * state.cost.nights * (1 - state.cost.longStayMultiplier))} keys</span>
            </div>
          )}
          <div className="border-t border-border pt-3 flex justify-between text-body-md font-semibold">
            <span>Total keys charged</span>
            <span className="text-okte-gold-700 flex items-center gap-1">
              <KeyIcon className="w-4 h-4" />
              {state.cost.total} keys
            </span>
          </div>
        </div>
      </Card>

      {/* Wallet Balance */}
      {wallet && (
        <Card className={`mb-6 ${insufficientKeys ? 'border-2 border-danger' : ''}`}>
          <div className="flex justify-between items-center">
            <span className="text-body-sm text-text-muted">Your key balance</span>
            <span className={`text-body-md font-semibold ${insufficientKeys ? 'text-danger' : 'text-text-primary'}`}>
              {wallet.balance} keys
            </span>
          </div>
          {insufficientKeys ? (
            <p className="text-caption text-danger mt-2">
              Insufficient keys. You need {state.cost.total - wallet.balance} more keys to complete this booking.
            </p>
          ) : (
            <p className="text-caption text-text-muted mt-1">
              After booking: {wallet.balance - state.cost.total} keys remaining
            </p>
          )}
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} fullWidth>
          Go Back
        </Button>
        <Button
          fullWidth
          disabled={insufficientKeys}
          loading={confirming}
          onClick={handleConfirm}
        >
          Confirm Booking
        </Button>
      </div>

      <p className="text-caption text-text-muted text-center mt-3">
        By confirming, {state.cost.total} keys will be debited from your wallet.
      </p>
    </div>
  )
}
