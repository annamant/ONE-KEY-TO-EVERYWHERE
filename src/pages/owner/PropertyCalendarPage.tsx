import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DayPicker } from 'react-day-picker'
import { useToast } from '@/contexts/ToastContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockProperties, mockBookings } from '@/mock'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { format, parseISO, isSameDay } from 'date-fns'
import 'react-day-picker/dist/style.css'

export function PropertyCalendarPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const { data: property, loading: propLoading, refetch } = useMockApi(
    () => mockProperties.getById(id!),
    [id]
  )
  const { data: bookings } = useMockApi(
    () => mockBookings.listForProperty(id!),
    [id]
  )

  const [blackouts, setBlackouts] = useState<Date[]>(() =>
    (property?.blackoutDates ?? []).map((d) => parseISO(d))
  )

  // When property loads, sync blackouts
  const syncedBlackouts = property
    ? property.blackoutDates.map((d) => parseISO(d))
    : []

  // Build booked date ranges for display
  const bookedDates = (bookings ?? []).flatMap((b) => {
    const dates: Date[] = []
    let cur = parseISO(b.checkIn)
    const end = parseISO(b.checkOut)
    while (cur < end) {
      dates.push(new Date(cur))
      cur = new Date(cur.getTime() + 86400000)
    }
    return dates
  })

  const isBlackout = (day: Date) =>
    syncedBlackouts.some((d) => isSameDay(d, day))

  const toggleBlackout = async (day: Date) => {
    if (!property) return
    const already = syncedBlackouts.some((d) => isSameDay(d, day))
    const updated = already
      ? syncedBlackouts.filter((d) => !isSameDay(d, day))
      : [...syncedBlackouts, day]

    setSaving(true)
    try {
      await mockProperties.setBlackouts(id!, updated.map((d) => format(d, 'yyyy-MM-dd')))
      toast(already ? 'Blackout removed' : 'Blackout added', 'success')
      refetch()
    } catch {
      toast('Failed to update blackout', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (propLoading) return <PageSpinner />
  if (!property) return (
    <div className="page-content text-center py-16">
      <p className="text-text-muted">Property not found.</p>
    </div>
  )

  return (
    <div className="page-content max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Availability Calendar</h1>
          <p className="text-body-sm text-text-muted">{property.title}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/owner/properties')}>Back to Properties</Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="text-body-sm text-text-muted">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-danger" />
          <span className="text-body-sm text-text-muted">Blacked out</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-okte-slate-100 border border-border" />
          <span className="text-body-sm text-text-muted">Available</span>
        </div>
      </div>

      <Card className="inline-block mb-6">
        <DayPicker
          mode="multiple"
          selected={syncedBlackouts}
          onDayClick={(day) => {
            const isBooked = bookedDates.some((d) => isSameDay(d, day))
            if (!isBooked) toggleBlackout(day)
          }}
          modifiers={{
            booked: bookedDates,
            blackout: syncedBlackouts,
          }}
          modifiersClassNames={{
            booked: 'rdp-day_booked',
            blackout: 'rdp-day_blackout',
          }}
          disabled={[{ before: new Date() }]}
          numberOfMonths={2}
          className="rdp-okte"
        />
        <style>{`
          .rdp-day_booked { background: #DBEAFE !important; color: #1D4ED8 !important; }
          .rdp-day_blackout { background: #FEE2E2 !important; color: #EF4444 !important; }
        `}</style>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-body-sm text-text-muted mb-2">Blackout dates</p>
          <p className="text-heading-md font-bold text-text-primary">{syncedBlackouts.length}</p>
          <p className="text-caption text-text-muted">Click calendar days to toggle</p>
        </Card>
        <Card>
          <p className="text-body-sm text-text-muted mb-2">Active bookings</p>
          <p className="text-heading-md font-bold text-text-primary">{bookings?.length ?? 0}</p>
          <p className="text-caption text-text-muted">Booked dates are shown in blue</p>
        </Card>
      </div>
    </div>
  )
}
