import { useNavigate } from 'react-router-dom'
import { CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classNames'
import { Badge } from '@/components/ui/Badge'
import { formatDateRange, formatKeys } from '@/utils/format'
import type { Booking, Property } from '@/types'
import type { BadgeColor } from '@/components/ui/Badge'

interface BookingCardProps {
  booking: Booking
  property?: Property | null
  className?: string
  basePath?: string
}

const statusConfig: Record<string, { label: string; color: BadgeColor }> = {
  pending: { label: 'Pending', color: 'amber' },
  confirmed: { label: 'Confirmed', color: 'blue' },
  active: { label: 'Active', color: 'green' },
  completed: { label: 'Completed', color: 'gray' },
  cancelled: { label: 'Cancelled', color: 'red' },
  no_show: { label: 'No Show', color: 'red' },
}

export function BookingCard({ booking, property, className, basePath = '/member/bookings' }: BookingCardProps) {
  const navigate = useNavigate()
  const status = statusConfig[booking.status] ?? { label: booking.status, color: 'gray' as BadgeColor }

  return (
    <div
      onClick={() => navigate(`${basePath}/${booking.id}`)}
      className={cn(
        'bg-surface rounded-card shadow-card hover:shadow-card-hover transition-shadow cursor-pointer flex gap-4 overflow-hidden',
        className
      )}
    >
      {property && (
        <div className="w-24 h-24 flex-shrink-0 sm:w-32 sm:h-32">
          <img
            src={property.coverImage}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0 p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-body-md font-semibold text-text-primary line-clamp-1">
            {property?.title ?? 'Property'}
          </h3>
          <Badge color={status.color} size="sm">{status.label}</Badge>
        </div>
        <div className="flex items-center gap-1 text-text-muted mb-2">
          <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-caption">{property?.city}, {property?.country}</span>
        </div>
        <div className="flex items-center gap-1 text-body-sm text-text-muted">
          <CalendarDaysIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-body-sm">{formatDateRange(booking.checkIn, booking.checkOut)}</span>
          <span className="text-text-subtle ml-1">· {booking.nights} nights</span>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <span className="text-caption font-semibold text-okte-gold-700">{formatKeys(booking.keysCharged)}</span>
          <span className="text-caption text-text-muted">charged</span>
        </div>
      </div>
    </div>
  )
}
