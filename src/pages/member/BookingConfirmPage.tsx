import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircleIcon, CalendarDaysIcon, KeyIcon } from '@heroicons/react/24/solid'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { useMockApi } from '@/hooks/useMockApi'
import { mockBookings, mockProperties } from '@/services'
import { formatDateRange, formatKeys } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'

export function BookingConfirmPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: booking, loading: bookingLoading } = useMockApi(
    () => mockBookings.getById(id!),
    [id]
  )
  const { data: property, loading: propLoading } = useMockApi(
    () => mockProperties.getById(booking?.propertyId ?? ''),
    [booking?.propertyId]
  )

  if (bookingLoading || propLoading) return <PageSpinner />
  if (!booking) return (
    <div className="page-content text-center py-16">
      <p className="text-text-muted">Booking not found.</p>
      <Button className="mt-4" onClick={() => navigate('/member/bookings')}>My Bookings</Button>
    </div>
  )

  return (
    <div className="page-content max-w-lg">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-heading-xl text-text-primary font-semibold mb-1">You're booked!</h1>
        <p className="text-body-sm text-text-muted">
          Your reservation is confirmed. Details are below.
        </p>
      </div>

      {/* Booking card */}
      <Card className="mb-6">
        {property && (
          <div className="flex gap-4 pb-4 mb-4 border-b border-border">
            <img
              src={property.coverImage}
              alt={property.title}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
            <div>
              <h2 className="text-body-md font-semibold text-text-primary mb-1">{property.title}</h2>
              <div className="flex items-center gap-1 text-caption text-text-muted">
                <MapPinIcon className="w-3.5 h-3.5" />
                {property.city}, {property.country}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-okte-navy-50 flex items-center justify-center">
              <CalendarDaysIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-caption text-text-muted">Dates</p>
              <p className="text-body-sm font-medium">
                {formatDateRange(booking.checkIn, booking.checkOut)}
                <span className="text-text-muted ml-1">· {booking.nights} nights</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-okte-gold-50 flex items-center justify-center">
              <KeyIcon className="w-4 h-4 text-okte-gold-600" />
            </div>
            <div>
              <p className="text-caption text-text-muted">Keys charged</p>
              <p className="text-body-sm font-medium text-okte-gold-700">{formatKeys(booking.keysCharged)}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-caption text-text-muted">Booking reference</p>
            <p className="text-body-sm font-mono font-medium text-text-primary">{booking.id}</p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button fullWidth onClick={() => navigate('/member/bookings')}>
          View All Bookings
        </Button>
        <Button variant="outline" fullWidth onClick={() => navigate('/member/wallet')}>
          View Key Ledger
        </Button>
        <Button variant="ghost" fullWidth onClick={() => navigate('/member/search')}>
          Search More Properties
        </Button>
      </div>
    </div>
  )
}
