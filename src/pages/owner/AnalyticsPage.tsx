import { useAuth } from '@/contexts/AuthContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockProperties, mockBookings } from '@/mock'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/data-display/StatCard'
import { PageSpinner } from '@/components/ui/Spinner'
import { tokens } from '@/design-system/tokens'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { KeyIcon, CalendarDaysIcon, BuildingOfficeIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { format, parseISO } from 'date-fns'

const TIER_COLORS: Record<string, string> = {
  standard: tokens.colors.textMuted,
  premium: tokens.colors.primary,
  luxury: tokens.colors.accent,
}

export function OwnerAnalyticsPage() {
  const { currentUser } = useAuth()

  const { data: properties, loading: propsLoading } = useMockApi(
    () => mockProperties.listByOwner(currentUser!.id),
    [currentUser?.id]
  )
  const { data: allBookings } = useMockApi(() => mockBookings.adminList(), [])

  const myPropertyIds = new Set((properties ?? []).map((p) => p.id))
  const myBookings = (allBookings ?? []).filter((b) => myPropertyIds.has(b.propertyId))
  const activeBookings = myBookings.filter((b) => ['confirmed', 'active'].includes(b.status))
  const totalKeys = myBookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.keysCharged, 0)

  // Monthly bookings
  const monthlyMap: Record<string, number> = {}
  myBookings.forEach((b) => {
    const m = format(parseISO(b.createdAt), 'MMM yy')
    monthlyMap[m] = (monthlyMap[m] ?? 0) + 1
  })
  const monthlyData = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }))

  // Monthly keys earned
  const keysMap: Record<string, number> = {}
  myBookings.filter((b) => b.status !== 'cancelled').forEach((b) => {
    const m = format(parseISO(b.createdAt), 'MMM yy')
    keysMap[m] = (keysMap[m] ?? 0) + b.keysCharged
  })
  const keysData = Object.entries(keysMap).map(([month, keys]) => ({ month, keys }))

  // Bookings per property
  const propBookingMap: Record<string, number> = {}
  myBookings.filter((b) => b.status !== 'cancelled').forEach((b) => {
    propBookingMap[b.propertyId] = (propBookingMap[b.propertyId] ?? 0) + 1
  })
  const propData = (properties ?? []).map((p) => ({
    name: p.title.length > 20 ? p.title.slice(0, 20) + '…' : p.title,
    bookings: propBookingMap[p.id] ?? 0,
  })).sort((a, b) => b.bookings - a.bookings)

  // Tier distribution
  const tierMap: Record<string, number> = {}
  myBookings.filter((b) => b.status !== 'cancelled').forEach((b) => {
    const prop = (properties ?? []).find((p) => p.id === b.propertyId)
    if (prop) tierMap[prop.tier] = (tierMap[prop.tier] ?? 0) + 1
  })
  const tierData = Object.entries(tierMap).map(([tier, value]) => ({ tier, value }))

  if (propsLoading) return <PageSpinner />

  return (
    <div className="page-content">
      <div className="mb-6">
        <h1 className="text-heading-xl text-text-primary font-semibold">Analytics</h1>
        <p className="text-body-sm text-text-muted mt-0.5">Performance overview for your properties</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Properties"
          value={(properties ?? []).length}
          icon={<BuildingOfficeIcon className="w-5 h-5" />}
          iconBg="bg-okte-navy-50 text-primary"
        />
        <StatCard
          label="Total Bookings"
          value={myBookings.filter((b) => b.status !== 'cancelled').length}
          icon={<CalendarDaysIcon className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Bookings */}
        <Card>
          <h2 className="text-heading-md text-text-primary font-semibold mb-4">Bookings Over Time</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={tokens.colors.border} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: tokens.colors.textMuted }} />
                <YAxis tick={{ fontSize: 11, fill: tokens.colors.textMuted }} />
                <Tooltip />
                <Bar dataKey="count" fill={tokens.colors.primary} radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted text-body-sm">No data yet</div>
          )}
        </Card>

        {/* Keys Earned */}
        <Card>
          <h2 className="text-heading-md text-text-primary font-semibold mb-4">Keys Earned Over Time</h2>
          {keysData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={keysData}>
                <CartesianGrid strokeDasharray="3 3" stroke={tokens.colors.border} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: tokens.colors.textMuted }} />
                <YAxis tick={{ fontSize: 11, fill: tokens.colors.textMuted }} />
                <Tooltip />
                <Line type="monotone" dataKey="keys" stroke={tokens.colors.accent} strokeWidth={2} dot={{ r: 3 }} name="Keys" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted text-body-sm">No data yet</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings per property */}
        <Card>
          <h2 className="text-heading-md text-text-primary font-semibold mb-4">Bookings by Property</h2>
          {propData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={propData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={tokens.colors.border} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: tokens.colors.textMuted }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: tokens.colors.textMuted }} width={120} />
                <Tooltip />
                <Bar dataKey="bookings" fill={tokens.colors.primary} radius={[0, 4, 4, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted text-body-sm">No data yet</div>
          )}
        </Card>

        {/* Tier distribution */}
        <Card>
          <h2 className="text-heading-md text-text-primary font-semibold mb-4">Bookings by Tier</h2>
          {tierData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={tierData} dataKey="value" nameKey="tier" cx="50%" cy="50%" outerRadius={80} label={({ tier, percent }) => `${tier} ${(percent * 100).toFixed(0)}%`}>
                  {tierData.map((entry) => (
                    <Cell key={entry.tier} fill={TIER_COLORS[entry.tier] ?? tokens.colors.textMuted} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted text-body-sm">No data yet</div>
          )}
        </Card>
      </div>
    </div>
  )
}
