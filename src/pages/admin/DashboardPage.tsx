import { useNavigate } from 'react-router-dom'
import { UsersIcon, BuildingOfficeIcon, CalendarDaysIcon, KeyIcon } from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useMockApi } from '@/hooks/useMockApi'
import { mockUsers, mockProperties, mockBookings, mockLedger } from '@/services'
import { StatCard } from '@/components/data-display/StatCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { tokens } from '@/design-system/tokens'
import { format, parseISO } from 'date-fns'
import { formatDateRange } from '@/utils/format'
import type { BadgeColor } from '@/components/ui/Badge'

const statusColor: Record<string, BadgeColor> = {
  confirmed: 'blue', active: 'green', pending: 'amber', completed: 'gray', cancelled: 'red',
}

export function AdminDashboardPage() {
  const navigate = useNavigate()

  const { data: users, loading } = useMockApi(() => mockUsers.list(), [])
  const { data: properties } = useMockApi(() => mockProperties.adminList(), [])
  const { data: bookings } = useMockApi(() => mockBookings.adminList(), [])
  const { data: ledgerEntries } = useMockApi(() => mockLedger.adminList(), [])

  const pendingProperties = (properties ?? []).filter((p) => p.status === 'pending_approval')
  const activeBookings = (bookings ?? []).filter((b) => ['confirmed', 'active'].includes(b.status))
  const totalKeys = (ledgerEntries ?? []).filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0)

  // Monthly bookings chart
  const monthlyMap: Record<string, number> = {}
  ;(bookings ?? []).forEach((b) => {
    const m = format(parseISO(b.createdAt), 'MMM')
    monthlyMap[m] = (monthlyMap[m] ?? 0) + 1
  })
  const chartData = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }))

  if (loading) return <PageSpinner />

  return (
    <div className="page-content">
      <div className="mb-6">
        <h1 className="text-heading-xl text-text-primary font-semibold">Admin Dashboard</h1>
        <p className="text-body-sm text-text-muted">Platform overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={(users ?? []).length}
          icon={<UsersIcon className="w-5 h-5" />}
          iconBg="bg-okte-navy-50 text-primary"
          delta={8}
          deltaLabel="this week"
        />
        <StatCard
          label="Properties"
          value={(properties ?? []).filter((p) => p.status === 'approved').length}
          icon={<BuildingOfficeIcon className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Active Bookings"
          value={activeBookings.length}
          icon={<CalendarDaysIcon className="w-5 h-5" />}
          iconBg="bg-success-light text-success"
        />
        <StatCard
          label="Keys in Circulation"
          value={totalKeys}
          icon={<KeyIcon className="w-5 h-5" />}
          iconBg="bg-okte-gold-50 text-okte-gold-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Chart */}
        <Card>
          <h2 className="text-heading-md text-text-primary font-semibold mb-4">Monthly Bookings</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={tokens.colors.border} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: tokens.colors.textMuted }} />
                <YAxis tick={{ fontSize: 12, fill: tokens.colors.textMuted }} />
                <Tooltip />
                <Bar dataKey="count" fill={tokens.colors.primary} radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted text-body-sm">No data</div>
          )}
        </Card>

        {/* Pending approval */}
        <Card padding="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-heading-md text-text-primary font-semibold">Pending Approvals</h2>
            <button onClick={() => navigate('/admin/properties')} className="text-body-sm text-primary hover:underline">View all</button>
          </div>
          {pendingProperties.length === 0 ? (
            <div className="py-10 text-center text-body-sm text-text-muted">No pending approvals</div>
          ) : (
            <ul>
              {pendingProperties.slice(0, 4).map((p) => (
                <li
                  key={p.id}
                  onClick={() => navigate(`/admin/properties/${p.id}/review`)}
                  className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0 hover:bg-okte-slate-50 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-body-sm font-medium text-text-primary">{p.title}</p>
                    <p className="text-caption text-text-muted">{p.city}, {p.country}</p>
                  </div>
                  <Badge color="amber" size="sm">Pending</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recent bookings */}
      <Card padding="none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-heading-md text-text-primary font-semibold">Recent Bookings</h2>
          <button onClick={() => navigate('/admin/bookings')} className="text-body-sm text-primary hover:underline">View all</button>
        </div>
        {(bookings ?? []).length === 0 ? (
          <div className="py-10 text-center text-body-sm text-text-muted">No bookings yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-okte-slate-50">
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">ID</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Dates</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Keys</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {(bookings ?? []).slice(0, 5).map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-okte-slate-50 cursor-pointer" onClick={() => navigate(`/admin/bookings`)}>
                    <td className="px-5 py-3 text-body-sm font-mono text-text-muted">{b.id.slice(0, 8)}</td>
                    <td className="px-5 py-3 text-body-sm text-text-muted whitespace-nowrap">{formatDateRange(b.checkIn, b.checkOut)}</td>
                    <td className="px-5 py-3 text-body-sm font-medium text-okte-gold-600">{b.keysCharged}</td>
                    <td className="px-5 py-3"><Badge color={statusColor[b.status] ?? 'gray'} size="sm">{b.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
