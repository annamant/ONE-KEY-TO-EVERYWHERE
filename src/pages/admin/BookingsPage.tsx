import { useState } from 'react'
import { useMockApi } from '@/hooks/useMockApi'
import { useToast } from '@/contexts/ToastContext'
import { mockBookings, mockProperties, mockUsers } from '@/services'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/feedback/Modal'
import { Select } from '@/components/ui/Select'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/feedback/EmptyState'
import { CalendarDaysIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { formatDateRange, formatDate } from '@/utils/format'
import type { BadgeColor } from '@/components/ui/Badge'
import type { Booking } from '@/types'

const statusColor: Record<string, BadgeColor> = {
  confirmed: 'blue', active: 'green', pending: 'amber', completed: 'gray', cancelled: 'red',
}

const STATUS_TABS = ['all', 'confirmed', 'active', 'completed', 'cancelled'] as const

export function AdminBookingsPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [overrideTarget, setOverrideTarget] = useState<Booking | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [acting, setActing] = useState(false)

  const { data: bookings, loading, refetch } = useMockApi(() => mockBookings.adminList(), [])
  const { data: properties } = useMockApi(() => mockProperties.adminList(), [])
  const { data: users } = useMockApi(() => mockUsers.list(), [])

  const filtered = (bookings ?? []).filter((b) => {
    if (tab !== 'all' && b.status !== tab) return false
    if (search) {
      const q = search.toLowerCase()
      const prop = (properties ?? []).find((p) => p.id === b.propertyId)
      const guest = (users ?? []).find((u) => u.id === b.memberId)
      return (
        b.id.toLowerCase().includes(q) ||
        (prop?.title ?? '').toLowerCase().includes(q) ||
        (guest?.email ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleOverride = async () => {
    if (!overrideTarget || !newStatus) return
    setActing(true)
    try {
      await mockBookings.override(overrideTarget.id, { status: newStatus as any })
      toast('Booking status updated', 'success')
      refetch()
      setOverrideTarget(null)
    } catch {
      toast('Override failed', 'error')
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Bookings</h1>
          <p className="text-body-sm text-text-muted mt-0.5">{(bookings ?? []).length} total bookings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-body-sm font-medium capitalize border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {t}
            <span className="ml-1.5 text-caption bg-okte-slate-100 text-text-muted px-1.5 py-0.5 rounded-full">
              {t === 'all' ? (bookings ?? []).length : (bookings ?? []).filter((b) => b.status === t).length}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by ID, property, or guest..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
        />
      </div>

      {loading ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<CalendarDaysIcon className="w-7 h-7" />} heading="No bookings found" subtext="Try adjusting your search." />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-okte-slate-50">
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Booking</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Property</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Guest</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Dates</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Keys</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const prop = (properties ?? []).find((p) => p.id === b.propertyId)
                  const guest = (users ?? []).find((u) => u.id === b.memberId)
                  return (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-okte-slate-50 transition-colors">
                      <td className="px-5 py-4 text-body-sm font-mono text-text-muted">{b.id.slice(0, 8)}</td>
                      <td className="px-5 py-4 text-body-sm font-medium text-text-primary">{prop?.title ?? '—'}</td>
                      <td className="px-5 py-4 text-body-sm text-text-muted">{guest?.email ?? b.memberId.slice(0, 8)}</td>
                      <td className="px-5 py-4 text-body-sm text-text-muted whitespace-nowrap">{formatDateRange(b.checkIn, b.checkOut)}</td>
                      <td className="px-5 py-4 text-body-sm font-medium text-okte-gold-600">{b.keysCharged}</td>
                      <td className="px-5 py-4">
                        <Badge color={statusColor[b.status] ?? 'gray'} size="sm">{b.status}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setOverrideTarget(b); setNewStatus(b.status) }}
                        >
                          Override
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

      {/* Override Modal */}
      <Modal
        open={!!overrideTarget}
        onClose={() => setOverrideTarget(null)}
        title="Override Booking Status"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setOverrideTarget(null)}>Cancel</Button>
            <Button onClick={handleOverride} loading={acting}>Apply Override</Button>
          </div>
        }
      >
        {overrideTarget && (
          <div className="space-y-4">
            <p className="text-body-sm text-text-muted">Booking: <span className="font-mono">{overrideTarget.id.slice(0, 12)}</span></p>
            <p className="text-body-sm text-text-muted">Dates: {formatDateRange(overrideTarget.checkIn, overrideTarget.checkOut)}</p>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <p className="text-caption text-warning">Admin overrides bypass normal business rules and are logged.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
