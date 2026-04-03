import { useNavigate } from 'react-router-dom'
import {
  KeyIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { KeyIcon as KeySolid } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockLedger, mockBookings, mockProperties } from '@/mock'
import { formatDateRange } from '@/utils/format'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { MapPinIcon } from '@heroicons/react/20/solid'

export function MemberDashboardPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const { data: wallet, loading: walletLoading } = useMockApi(
    () => mockLedger.getWallet(currentUser!.id),
    [currentUser?.id]
  )
  const { data: bookings } = useMockApi(
    () => mockBookings.listForUser(currentUser!.id),
    [currentUser?.id]
  )
  const { data: properties } = useMockApi(() => mockProperties.list(), [])

  const propMap = Object.fromEntries((properties ?? []).map((p) => [p.id, p]))
  const upcomingBookings = (bookings ?? []).filter((b) => ['confirmed', 'active'].includes(b.status)).slice(0, 3)

  const quickActions = [
    { icon: MagnifyingGlassIcon, label: 'Find a Stay', sub: 'Browse available properties', path: '/member/search', color: 'bg-okte-navy-50 text-primary' },
    { icon: CalendarDaysIcon, label: 'My Bookings', sub: 'View reservations', path: '/member/bookings', color: 'bg-blue-50 text-blue-600' },
    { icon: KeyIcon, label: 'Key Wallet', sub: 'Manage your keys', path: '/member/wallet', color: 'bg-okte-gold-50 text-okte-gold-600' },
    { icon: UserGroupIcon, label: 'Household', sub: 'Family & friends', path: '/member/household', color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="page-content">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-heading-xl text-text-primary font-semibold">
          Welcome back, {currentUser?.firstName} 👋
        </h1>
        <p className="text-body-sm text-text-muted mt-1">Here's your travel overview</p>
      </div>

      {/* Key Balance Hero */}
      <div className="bg-gradient-to-br from-okte-navy-900 via-okte-navy-800 to-okte-navy-700 rounded-xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -right-4 top-12 w-32 h-32 rounded-full bg-white/5" />
        <div className="flex items-start justify-between relative">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <KeySolid className="w-4 h-4 text-accent" />
              <span className="text-body-sm text-okte-navy-200">Key Balance</span>
            </div>
            {walletLoading ? (
              <Skeleton className="h-14 w-32 bg-white/10" />
            ) : (
              <>
                <p className="text-display-lg font-bold text-white">{wallet?.balance ?? 0}</p>
                <p className="text-body-sm text-okte-navy-300 mt-1">keys available</p>
              </>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            onClick={() => navigate('/member/wallet')}
          >
            View Ledger
          </Button>
        </div>
        {wallet && !walletLoading && (
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-6">
            <div>
              <p className="text-caption text-okte-navy-300">Total credited</p>
              <p className="text-body-sm font-semibold text-white">{wallet.totalCredited} keys</p>
            </div>
            <div>
              <p className="text-caption text-okte-navy-300">Total used</p>
              <p className="text-body-sm font-semibold text-white">{wallet.totalDebited} keys</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card
              key={action.path}
              hover
              onClick={() => navigate(action.path)}
              className="flex flex-col gap-3"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-text-primary">{action.label}</p>
                <p className="text-caption text-text-muted">{action.sub}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Upcoming Bookings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading-md text-text-primary font-semibold">Upcoming Stays</h2>
          <button
            onClick={() => navigate('/member/bookings')}
            className="text-body-sm text-primary hover:underline"
          >
            View all
          </button>
        </div>

        {upcomingBookings.length === 0 ? (
          <Card className="text-center py-8">
            <CalendarDaysIcon className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-body-sm font-medium text-text-primary mb-1">No upcoming stays</p>
            <p className="text-caption text-text-muted mb-4">Browse available properties to plan your next trip.</p>
            <Button size="sm" onClick={() => navigate('/member/search')}>Find a Stay</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((b) => {
              const property = propMap[b.propertyId]
              return (
                <Card
                  key={b.id}
                  hover
                  padding="none"
                  onClick={() => navigate(`/member/bookings/${b.id}`)}
                  className="flex overflow-hidden"
                >
                  {property && (
                    <img
                      src={property.coverImage}
                      alt={property.title}
                      className="w-24 h-24 object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-body-sm font-semibold text-text-primary mb-0.5">
                        {property?.title ?? 'Property'}
                      </p>
                      <div className="flex items-center gap-1 text-caption text-text-muted mb-1">
                        <MapPinIcon className="w-3 h-3" />
                        {property?.city}, {property?.country}
                      </div>
                      <p className="text-caption text-text-muted">
                        {formatDateRange(b.checkIn, b.checkOut)}
                      </p>
                    </div>
                    <Badge
                      color={b.status === 'active' ? 'green' : 'blue'}
                      size="sm"
                      dot
                    >
                      {b.status}
                    </Badge>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
