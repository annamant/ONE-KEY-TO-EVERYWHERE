import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMockApi } from '@/hooks/useMockApi'
import { mockProperties } from '@/services'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/feedback/EmptyState'
import { BuildingOfficeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import type { BadgeColor } from '@/components/ui/Badge'

const statusConfig: Record<string, { label: string; color: BadgeColor }> = {
  draft: { label: 'Draft', color: 'gray' },
  pending_approval: { label: 'Pending', color: 'amber' },
  approved: { label: 'Live', color: 'green' },
  rejected: { label: 'Rejected', color: 'red' },
  suspended: { label: 'Suspended', color: 'red' },
}

const STATUS_TABS = ['all', 'pending_approval', 'approved', 'rejected', 'suspended'] as const

export function AdminPropertiesPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const { data: properties, loading } = useMockApi(() => mockProperties.adminList(), [])

  const filtered = (properties ?? []).filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.country.toLowerCase().includes(q)
    }
    return true
  })

  const pendingCount = (properties ?? []).filter((p) => p.status === 'pending_approval').length

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Properties</h1>
          <p className="text-body-sm text-text-muted mt-0.5">
            {(properties ?? []).length} total · {pendingCount} pending approval
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 border-b border-border overflow-x-auto">
        {STATUS_TABS.map((s) => {
          const label = s === 'all' ? 'All' : statusConfig[s]?.label ?? s
          const count = s === 'all' ? (properties ?? []).length : (properties ?? []).filter((p) => p.status === s).length
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 text-body-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {label}
              <span className="ml-1.5 text-caption bg-okte-slate-100 text-text-muted px-1.5 py-0.5 rounded-full">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
        />
      </div>

      {loading ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<BuildingOfficeIcon className="w-7 h-7" />} heading="No properties found" subtext="Try adjusting your filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const sc = statusConfig[p.status] ?? { label: p.status, color: 'gray' as BadgeColor }
            return (
              <Card key={p.id} padding="none" className="overflow-hidden">
                <div className="relative">
                  <img src={p.coverImage} alt={p.title} className="w-full h-40 object-cover" />
                  <div className="absolute top-3 left-3">
                    <Badge color={sc.color} size="sm" dot>{sc.label}</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-body-md font-semibold text-text-primary mb-1 truncate">{p.title}</h3>
                  <p className="text-caption text-text-muted mb-3">{p.city}, {p.country}</p>
                  <div className="flex gap-2 text-caption text-text-muted mb-3">
                    <span className="capitalize">{p.tier}</span>
                    <span>·</span>
                    <span>{p.keysPerNight} keys/night</span>
                    <span>·</span>
                    <span>Sleeps {p.sleeps}</span>
                  </div>
                  {p.status === 'pending_approval' ? (
                    <Button size="sm" fullWidth onClick={() => navigate(`/admin/properties/${p.id}/review`)}>
                      Review
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" fullWidth onClick={() => navigate(`/admin/properties/${p.id}/review`)}>
                      View
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
