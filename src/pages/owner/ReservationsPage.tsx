import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockProperties, mockBookings } from '@/services'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/feedback/EmptyState'
import { CalendarDaysIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { formatDateRange } from '@/utils/format'
import type { BadgeColor } from '@/components/ui/Badge'

const statusColor: Record<string, BadgeColor> = {
  confirmed: 'blue', active: 'green', pending: 'amber', completed: 'gray', cancelled: 'red',
}

const TABS = ['all', 'confirmed', 'active', 'completed', 'cancelled'] as const
type Tab = typeof TABS[number]

export function OwnerReservationsPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')

  const { data: properties, loading: propsLoading } = useMockApi(
    () => mockProperties.listByOwner(currentUser!.id),
    [currentUser?.id]
  )
  const { data: allBookings, loading: bookingsLoading } = useMockApi(
    () => mockBookings.adminList(),
    []
  )

  const myPropertyIds = new Set((properties ?? []).map((p) => p.id))
  const myBookings = (allBookings ?? []).filter((b) => myPropertyIds.has(b.propertyId))

  const filtered = myBookings.filter((b) => {
    if (tab !== 'all' && b.status !== tab) return false
    if (search) {
      const prop = (properties ?? []).find((p) => p.id === b.propertyId)
      const q = search.toLowerCase()
      return (
        b.id.toLowerCase().includes(q) ||
        (prop?.title ?? '').toLowerCase().includes(q) ||
        b.memberId.toLowerCase().includes(q)
      )
    }
    return true
  })

  const loading = propsLoading || bookingsLoading

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Reservations</h1>
          <p className="text-body-sm text-text-muted mt-0.5">All bookings across your properties</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-body-sm font-medium capitalize border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {t}
            {t !== 'all' && (
              <span className="ml-1.5 text-caption bg-okte-slate-100 text-text-muted px-1.5 py-0.5 rounded-full">
                {myBookings.filter((b) => b.status === t).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by property or booking ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
        />
      </div>

      {loading ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarDaysIcon className="w-7 h-7" />}
          heading="No reservations found"
          subtext={tab === 'all' ? 'Reservations will appear here once guests book your properties.' : `No ${tab} reservations.`}
        />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-okte-slate-50">
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase tracking-wide">Booking ID</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase tracking-wide">Property</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase tracking-wide">Dates</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase tracking-wide">Guests</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase tracking-wide">Keys</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const prop = (properties ?? []).find((p) => p.id === b.propertyId)
                  return (
                    <tr
                      key={b.id}
                      className="border-b border-border last:border-0 hover:bg-okte-slate-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/owner/reservations/${b.id}`)}
                    >
                      <td className="px-5 py-4 text-body-sm font-mono text-text-muted">{b.id.slice(0, 8)}</td>
                      <td className="px-5 py-4 text-body-sm font-medium text-text-primary">{prop?.title ?? '—'}</td>
                      <td className="px-5 py-4 text-body-sm text-text-muted whitespace-nowrap">{formatDateRange(b.checkIn, b.checkOut)}</td>
                      <td className="px-5 py-4 text-body-sm text-text-muted">{b.guests}</td>
                      <td className="px-5 py-4 text-body-sm font-medium text-okte-gold-600">{b.keysCharged}</td>
                      <td className="px-5 py-4">
                        <Badge color={statusColor[b.status] ?? 'gray'} size="sm">{b.status}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/owner/reservations/${b.id}`) }}>
                          View
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
