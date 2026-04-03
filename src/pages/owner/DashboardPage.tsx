import { useNavigate } from 'react-router-dom'
import { BuildingOfficeIcon, CalendarDaysIcon, KeyIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockProperties, mockBookings } from '@/mock'
import { formatDateRange } from '@/utils/format'
import { StatCard } from '@/components/data-display/StatCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { tokens } from '@/design-system/tokens'
import { format, parseISO } from 'date-fns'
import type { BadgeColor } from '@/components/ui/Badge'

const statusColor: Record<string, BadgeColor> = {
  confirmed: 'blue', active: 'green', pending: 'amber', completed: 'gray', cancelled: 'red',
}

export function OwnerDashboardPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const { data: properties, loading: propsLoading } = useMockApi(
    () => mockProperties.listByOwner(currentUser!.id),
    [currentUser?.id]
  )
  const { data: allBookings } = useMockApi(
    () => mockBookings.adminList(),
    []
  )

  const myPropertyIds = new Set((properties ?? []).map((p) => p.id))
  const myBookings = (allBookings ?? []).filter((b) => myPropertyIds.has(b.propertyId))
  const activeBookings = myBookings.filter((b) => ['confirmed', 'active'].includes(b.status))
  const totalKeys = myBookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.keysCharged, 0)
  const approvedProps = (properties ?? []).filter((p) => p.status === 'approved').length

  // Monthly chart data
  const monthlyData: Record<string, number> = {}
  myBookings.forEach((b) => {
    const m = format(parseISO(b.createdAt), 'MMM')
    monthlyData[m] = (monthlyData[m] ?? 0) + 1
  })
  const chartData = Object.entries(monthlyData).map(([month, count]) => ({ month, count }))

  const upcomingReservations = activeBookings.slice(0, 5)

  if (propsLoading) return <PageSpinner />

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Owner Dashboard</h1>
          <p className="text-body-sm text-text-muted">Welcome back, {currentUser?.firstName}</p>
        </div>
        <Button onClick={() => navigate('/owner/properties/new')}>+ Add Property</Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Properties"
          value={approvedProps}
          icon={<BuildingOfficeIcon className="w-5 h-5" />}
          iconBg="bg-okte-navy-50 text-primary"
        />
        <StatCard
          label="Total Bookings"
          value={myBookings.filter((b) => b.status !== 'cancelled').length}
          icon={<CalendarDaysIcon className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
          delta={12}
          deltaLabel="vs last month"
        />
        <StatCard
          label="Keys Earned"
          value={totalKeys}
          icon={<KeyIcon className="w-5 h-5" />}
          iconBg="bg-okte-gold-50 text-okte-gold-600"
        />
        <StatCard
          label="Active Stays"
          value={activeBookings.length}
          icon={<ChartBarIcon className="w-5 h-5" />}
          iconBg="bg-success-light text-success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
            <div className="h-48 flex items-center justify-center text-text-muted text-body-sm">
              No booking data yet
            </div>
          )}
        </Card>

        {/* Upcoming reservations */}
        <Card padding="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-heading-md text-text-primary font-semibold">Upcoming Reservations</h2>
            <button
              onClick={() => navigate('/owner/reservations')}
              className="text-body-sm text-primary hover:underline"
            >
              View all
            </button>
          </div>
          {upcomingReservations.length === 0 ? (
            <div className="py-10 text-center text-body-sm text-text-muted">No upcoming reservations</div>
          ) : (
            <ul>
              {upcomingReservations.map((b) => {
                const prop = (properties ?? []).find((p) => p.id === b.propertyId)
                return (
                  <li
                    key={b.id}
                    onClick={() => navigate(`/owner/reservations/${b.id}`)}
                    className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0 hover:bg-okte-slate-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-body-sm font-medium text-text-primary">{prop?.title ?? 'Property'}</p>
                      <p className="text-caption text-text-muted">{formatDateRange(b.checkIn, b.checkOut)}</p>
                    </div>
                    <div className="text-right">
                      <Badge color={statusColor[b.status] ?? 'gray'} size="sm">{b.status}</Badge>
                      <p className="text-caption text-okte-gold-600 font-medium mt-1">{b.keysCharged} keys</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Properties quick view */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading-md text-text-primary font-semibold">My Properties</h2>
          <button onClick={() => navigate('/owner/properties')} className="text-body-sm text-primary hover:underline">
            Manage
          </button>
        </div>
        {(properties ?? []).length === 0 ? (
          <Card className="text-center py-8">
            <BuildingOfficeIcon className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-body-sm text-text-muted mb-4">You haven't listed any properties yet.</p>
            <Button onClick={() => navigate('/owner/properties/new')}>List Your First Property</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(properties ?? []).slice(0, 3).map((p) => (
              <Card
                key={p.id}
                hover
                padding="none"
                onClick={() => navigate(`/owner/properties/${p.id}/edit`)}
                className="overflow-hidden"
              >
                <img src={p.coverImage} alt={p.title} className="w-full h-36 object-cover" />
                <div className="p-4">
                  <p className="text-body-sm font-semibold text-text-primary mb-1">{p.title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-caption text-text-muted">{p.city}, {p.country}</p>
                    <Badge
                      color={p.status === 'approved' ? 'green' : p.status === 'pending_approval' ? 'amber' : 'red'}
                      size="sm"
                    >
                      {p.status === 'pending_approval' ? 'Pending' : p.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
