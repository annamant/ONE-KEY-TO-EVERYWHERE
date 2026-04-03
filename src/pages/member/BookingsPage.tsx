import { useState } from 'react'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockBookings, mockProperties } from '@/mock'
import { BookingCard } from '@/components/data-display/BookingCard'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import type { Booking } from '@/types'

type Tab = 'upcoming' | 'active' | 'past'

export function BookingsPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('upcoming')

  const { data: bookings, loading } = useMockApi(
    () => mockBookings.listForUser(currentUser!.id),
    [currentUser?.id]
  )
  const { data: properties } = useMockApi(
    () => mockProperties.list(),
    []
  )

  const propMap = Object.fromEntries((properties ?? []).map((p) => [p.id, p]))

  const filterBookings = (bookings: Booking[], tab: Tab) => {
    if (tab === 'active') return bookings.filter((b) => b.status === 'active')
    if (tab === 'upcoming') return bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending')
    return bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'no_show')
  }

  const tabCounts = bookings
    ? {
        upcoming: filterBookings(bookings, 'upcoming').length,
        active: filterBookings(bookings, 'active').length,
        past: filterBookings(bookings, 'past').length,
      }
    : { upcoming: 0, active: 0, past: 0 }

  const filtered = bookings ? filterBookings(bookings, tab) : []

  const tabs: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'active', label: 'Active' },
    { key: 'past', label: 'Past' },
  ]

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">My Bookings</h1>
          <p className="text-body-sm text-text-muted mt-0.5">Your reservation history</p>
        </div>
        <Button onClick={() => navigate('/member/search')}>Find a Stay</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-okte-slate-100 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-body-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              tab === t.key
                ? 'bg-surface text-text-primary shadow-card'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {t.label}
            {tabCounts[t.key] > 0 && (
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                tab === t.key ? 'bg-primary text-white' : 'bg-okte-slate-200 text-text-muted'
              }`}>
                {tabCounts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarDaysIcon className="w-7 h-7" />}
          heading={`No ${tab} bookings`}
          subtext={tab === 'upcoming' ? "You don't have any upcoming reservations yet." : `No ${tab} bookings to show.`}
          action={tab === 'upcoming' ? { label: 'Search Properties', onClick: () => navigate('/member/search') } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              property={propMap[b.propertyId]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
