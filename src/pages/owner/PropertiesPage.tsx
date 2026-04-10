import { useNavigate } from 'react-router-dom'
import { PlusIcon, PencilIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockProperties } from '@/services'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/feedback/EmptyState'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'
import type { BadgeColor } from '@/components/ui/Badge'

const statusConfig: Record<string, { label: string; color: BadgeColor }> = {
  draft: { label: 'Draft', color: 'gray' },
  pending_approval: { label: 'Pending Review', color: 'amber' },
  approved: { label: 'Live', color: 'green' },
  rejected: { label: 'Rejected', color: 'red' },
  suspended: { label: 'Suspended', color: 'red' },
}

export function OwnerPropertiesPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const { data: properties, loading } = useMockApi(
    () => mockProperties.listByOwner(currentUser!.id),
    [currentUser?.id]
  )

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">My Properties</h1>
          <p className="text-body-sm text-text-muted mt-0.5">Manage your listed properties</p>
        </div>
        <Button
          leftIcon={<PlusIcon className="w-4 h-4" />}
          onClick={() => navigate('/owner/properties/new')}
        >
          Add Property
        </Button>
      </div>

      {loading ? (
        <PageSpinner />
      ) : !properties || properties.length === 0 ? (
        <EmptyState
          icon={<BuildingOfficeIcon className="w-7 h-7" />}
          heading="No properties yet"
          subtext="List your first property to start accepting bookings."
          action={{ label: 'Add a Property', onClick: () => navigate('/owner/properties/new') }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => {
            const sc = statusConfig[p.status] ?? { label: p.status, color: 'gray' as BadgeColor }
            return (
              <Card key={p.id} padding="none" className="overflow-hidden">
                <div className="relative">
                  <img src={p.coverImage} alt={p.title} className="w-full h-44 object-cover" />
                  <div className="absolute top-3 left-3">
                    <Badge color={sc.color} size="sm" dot>{sc.label}</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-body-md font-semibold text-text-primary mb-1">{p.title}</h3>
                  <p className="text-caption text-text-muted mb-3">{p.city}, {p.country}</p>
                  <div className="flex gap-2 text-caption text-text-muted mb-4">
                    <span>Sleeps {p.sleeps}</span>
                    <span>·</span>
                    <span>{p.keysPerNight} keys/night</span>
                    <span>·</span>
                    <span>{p.totalBookings} bookings</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<PencilIcon className="w-3.5 h-3.5" />}
                      onClick={() => navigate(`/owner/properties/${p.id}/edit`)}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<CalendarDaysIcon className="w-3.5 h-3.5" />}
                      onClick={() => navigate(`/owner/properties/${p.id}/calendar`)}
                      fullWidth
                    >
                      Calendar
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
