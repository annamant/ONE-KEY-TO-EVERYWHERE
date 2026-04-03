import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  KeyIcon,
  PencilIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import type { DateRange } from 'react-day-picker'
import { useMockApi } from '@/hooks/useMockApi'
import { mockBookings, mockProperties } from '@/mock'
import { useToast } from '@/contexts/ToastContext'
import { formatDateRange, formatDate, formatKeys } from '@/utils/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/feedback/Modal'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { DateRangePicker } from '@/components/forms/DateRangePicker'
import { parseISO } from 'date-fns'
import type { BadgeColor } from '@/components/ui/Badge'

const statusConfig: Record<string, { label: string; color: BadgeColor }> = {
  pending: { label: 'Pending', color: 'amber' },
  confirmed: { label: 'Confirmed', color: 'blue' },
  active: { label: 'Active', color: 'green' },
  completed: { label: 'Completed', color: 'gray' },
  cancelled: { label: 'Cancelled', color: 'red' },
  no_show: { label: 'No Show', color: 'red' },
}

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [cancelOpen, setCancelOpen] = useState(false)
  const [modifyOpen, setModifyOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [modifying, setModifying] = useState(false)
  const [newDates, setNewDates] = useState<DateRange | undefined>()

  const { data: booking, loading: bookingLoading, refetch } = useMockApi(
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
      <Button className="mt-4" onClick={() => navigate('/member/bookings')}>Back to Bookings</Button>
    </div>
  )

  const status = statusConfig[booking.status] ?? { label: booking.status, color: 'gray' as BadgeColor }
  const canCancel = ['confirmed', 'pending'].includes(booking.status)
  const canModify = ['confirmed', 'pending'].includes(booking.status)
  const blackoutDates = property?.blackoutDates.map((d) => parseISO(d)) ?? []

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await mockBookings.cancel(id!)
      toast('Booking cancelled. Keys refunded.', 'success')
      setCancelOpen(false)
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Cancellation failed', 'error')
    } finally {
      setCancelling(false)
    }
  }

  const handleModify = async () => {
    if (!newDates?.from || !newDates?.to) return
    setModifying(true)
    try {
      await mockBookings.modify(id!, {
        checkIn: formatDate(newDates.from, 'yyyy-MM-dd'),
        checkOut: formatDate(newDates.to, 'yyyy-MM-dd'),
      })
      toast('Booking modified successfully.', 'success')
      setModifyOpen(false)
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Modification failed', 'error')
    } finally {
      setModifying(false)
    }
  }

  return (
    <div className="page-content max-w-2xl">
      <button
        onClick={() => navigate('/member/bookings')}
        className="text-body-sm text-text-muted hover:text-text-primary mb-5 flex items-center gap-1"
      >
        ← Back to bookings
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Booking Details</h1>
          <p className="text-caption text-text-muted font-mono mt-1">{booking.id}</p>
        </div>
        <Badge color={status.color} size="md" dot>{status.label}</Badge>
      </div>

      {/* Property */}
      {property && (
        <Card padding="none" className="mb-5 overflow-hidden">
          <div className="flex">
            <img src={property.coverImage} alt={property.title} className="w-28 h-28 object-cover flex-shrink-0" />
            <div className="p-4 flex-1">
              <h2 className="text-body-md font-semibold text-text-primary">{property.title}</h2>
              <div className="flex items-center gap-1 text-caption text-text-muted mt-1">
                <MapPinIcon className="w-3.5 h-3.5" />
                {property.city}, {property.country}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Details */}
      <Card className="mb-5">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-okte-navy-50 flex items-center justify-center">
              <CalendarDaysIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-caption text-text-muted">Dates</p>
              <p className="text-body-sm font-medium">{formatDateRange(booking.checkIn, booking.checkOut)}</p>
              <p className="text-caption text-text-muted">{booking.nights} nights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-okte-slate-50 flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <p className="text-caption text-text-muted">Guests</p>
              <p className="text-body-sm font-medium">{booking.guests}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-okte-gold-50 flex items-center justify-center">
              <KeyIcon className="w-5 h-5 text-okte-gold-600" />
            </div>
            <div>
              <p className="text-caption text-text-muted">Keys charged</p>
              <p className="text-body-sm font-medium text-okte-gold-700">{formatKeys(booking.keysCharged)}</p>
            </div>
          </div>
          {booking.cancellationReason && (
            <div className="pt-3 border-t border-border">
              <p className="text-caption text-text-muted">Cancellation reason</p>
              <p className="text-body-sm">{booking.cancellationReason}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      {(canCancel || canModify) && (
        <div className="flex gap-3">
          {canModify && (
            <Button
              variant="outline"
              leftIcon={<PencilIcon className="w-4 h-4" />}
              onClick={() => setModifyOpen(true)}
              fullWidth
            >
              Modify Dates
            </Button>
          )}
          {canCancel && (
            <Button
              variant="danger"
              leftIcon={<XCircleIcon className="w-4 h-4" />}
              onClick={() => setCancelOpen(true)}
              fullWidth
            >
              Cancel Booking
            </Button>
          )}
        </div>
      )}

      {/* Cancel Dialog */}
      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel Booking"
        message={`Are you sure you want to cancel this booking? ${formatKeys(booking.keysCharged)} will be refunded to your wallet.`}
        confirmLabel="Yes, cancel booking"
      />

      {/* Modify Modal */}
      <Modal
        open={modifyOpen}
        onClose={() => setModifyOpen(false)}
        title="Modify Booking Dates"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModifyOpen(false)}>Cancel</Button>
            <Button
              onClick={handleModify}
              loading={modifying}
              disabled={!newDates?.from || !newDates?.to}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <p className="text-body-sm text-text-muted mb-4">
          Select new dates. Your key balance will be adjusted accordingly.
        </p>
        <DateRangePicker
          value={newDates}
          onChange={setNewDates}
          disabledDates={blackoutDates}
        />
      </Modal>
    </div>
  )
}
