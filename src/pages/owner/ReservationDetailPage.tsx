import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockBookings, mockProperties, mockUsers } from '@/mock'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDateRange, formatDate, countNights } from '@/utils/format'
import type { BadgeColor } from '@/components/ui/Badge'

const statusColor: Record<string, BadgeColor> = {
  confirmed: 'blue', active: 'green', pending: 'amber', completed: 'gray', cancelled: 'red',
}

export function OwnerReservationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: booking, loading: bLoading, refetch } = useMockApi(() => mockBookings.getById(id!), [id])
  const { data: property } = useMockApi(
    () => booking ? mockProperties.getById(booking.propertyId) : Promise.resolve(null),
    [booking?.propertyId]
  )
  const { data: guest } = useMockApi(
    () => booking ? mockUsers.getById(booking.memberId) : Promise.resolve(null),
    [booking?.memberId]
  )

  if (bLoading) return <PageSpinner />
  if (!booking) return (
    <div className="page-content text-center py-16">
      <p className="text-text-muted">Reservation not found.</p>
    </div>
  )

  const nights = countNights(booking.checkIn, booking.checkOut)
  const sc = statusColor[booking.status] ?? 'gray'

  return (
    <div className="page-content max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Reservation Detail</h1>
          <p className="text-caption font-mono text-text-muted mt-0.5">{booking.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={sc} size="md">{booking.status}</Badge>
          <Button variant="outline" onClick={() => navigate('/owner/reservations')}>Back</Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Property */}
        <Card>
          <h2 className="text-body-md font-semibold text-text-primary mb-3">Property</h2>
          {property ? (
            <div className="flex gap-4 items-center">
              <img src={property.coverImage} alt={property.title} className="w-20 h-14 rounded-lg object-cover" />
              <div>
                <p className="text-body-sm font-semibold text-text-primary">{property.title}</p>
                <p className="text-caption text-text-muted">{property.city}, {property.country}</p>
                <p className="text-caption text-text-muted capitalize">{property.tier} tier</p>
              </div>
            </div>
          ) : (
            <p className="text-body-sm text-text-muted">Loading property…</p>
          )}
        </Card>

        {/* Guest */}
        <Card>
          <h2 className="text-body-md font-semibold text-text-primary mb-3">Guest</h2>
          {guest ? (
            <div className="space-y-1">
              <p className="text-body-sm font-medium text-text-primary">{guest.firstName} {guest.lastName}</p>
              <p className="text-body-sm text-text-muted">{guest.email}</p>
              {guest.phone && <p className="text-body-sm text-text-muted">{guest.phone}</p>}
            </div>
          ) : (
            <p className="text-body-sm text-text-muted">Guest ID: {booking.memberId}</p>
          )}
        </Card>

        {/* Booking Details */}
        <Card>
          <h2 className="text-body-md font-semibold text-text-primary mb-3">Booking Details</h2>
          <dl className="space-y-2">
            {[
              { label: 'Check-in', value: formatDate(booking.checkIn) },
              { label: 'Check-out', value: formatDate(booking.checkOut) },
              { label: 'Duration', value: `${nights} night${nights !== 1 ? 's' : ''}` },
              { label: 'Guests', value: String(booking.guests) },
              { label: 'Keys charged', value: `${booking.keysCharged} keys` },
              { label: 'Booked on', value: formatDate(booking.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-body-sm">
                <dt className="text-text-muted">{label}</dt>
                <dd className="font-medium text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* Status Timeline */}
        <Card>
          <h2 className="text-body-md font-semibold text-text-primary mb-3">Status</h2>
          <div className="flex items-center gap-3">
            <Badge color={sc} size="md">{booking.status}</Badge>
            {booking.cancelledAt && (
              <p className="text-caption text-text-muted">Cancelled on {formatDate(booking.cancelledAt)}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
