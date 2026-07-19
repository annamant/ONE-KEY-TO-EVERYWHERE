import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useMockApi } from '@/hooks/useMockApi'
import { mockProperties } from '@/services'
import { PropertyCard } from '@/components/data-display/PropertyCard'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { SearchFilters } from '@/types'

const REGIONS = ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania']
const AMENITY_OPTIONS = [
  { value: 'pool', label: 'Pool' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'beach_access', label: 'Beach Access' },
  { value: 'ski_access', label: 'Ski Access' },
  { value: 'hot_tub', label: 'Hot Tub' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'fireplace', label: 'Fireplace' },
  { value: 'garden', label: 'Garden' },
  { value: 'gym', label: 'Gym' },
]

export function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('')
  const [sleeps, setSleeps] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const filters: SearchFilters = {
    query: query || undefined,
    region: region || undefined,
    sleeps: sleeps ? parseInt(sleeps) : undefined,
    amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
  }

  const { data: properties, loading } = useMockApi(
    () => mockProperties.list(filters),
    [query, region, sleeps, JSON.stringify(selectedAmenities)]
  )

  const toggleAmenity = (value: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    )
  }

  const clearFilters = () => {
    setQuery('')
    setRegion('')
    setSleeps('')
    setSelectedAmenities([])
  }

  const hasFilters = query || region || sleeps || selectedAmenities.length > 0
  const activeFilterCount = [region, sleeps].filter(Boolean).length + selectedAmenities.length

  return (
    <div className="page-content">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-heading-xl text-text-primary font-semibold mb-1">Find Your Stay</h1>
        <p className="text-body-sm text-text-muted">Browse available properties and reserve with keys</p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by destination, property name..."
            className="w-full h-10 pl-9 pr-3 text-body-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <Button
          variant={showFilters ? 'primary' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1.5 w-5 h-5 rounded-full bg-white/20 text-[11px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} leftIcon={<XMarkIcon className="w-4 h-4" />}>
            Clear
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-surface rounded-card shadow-card p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Region</label>
            <Select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              options={REGIONS.map((r) => ({ value: r, label: r }))}
              placeholder="All regions"
            />
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Group size</label>
            <Select
              value={sleeps}
              onChange={(e) => setSleeps(e.target.value)}
              options={[
                { value: '2', label: 'Up to 2' },
                { value: '4', label: '3–4' },
                { value: '6', label: '5–6' },
                { value: '7', label: '7+' },
              ]}
              placeholder="Any group size"
            />
          </div>
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1.5">Amenities</label>
            <div className="flex flex-wrap gap-1.5">
              {AMENITY_OPTIONS.slice(0, 5).map((a) => (
                <button
                  key={a.value}
                  onClick={() => toggleAmenity(a.value)}
                  className={`px-2.5 py-1 text-caption rounded-pill border transition-colors ${
                    selectedAmenities.includes(a.value)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-text-muted border-border hover:border-primary'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter badges */}
      {(region || selectedAmenities.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {region && (
            <Badge color="navy" size="sm" dot>
              {region}
            </Badge>
          )}
          {selectedAmenities.map((a) => (
            <Badge key={a} color="blue" size="sm">
              {AMENITY_OPTIONS.find((o) => o.value === a)?.label ?? a}
            </Badge>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <PageSpinner />
      ) : !properties || properties.length === 0 ? (
        <EmptyState
          icon={<MagnifyingGlassIcon className="w-7 h-7" />}
          heading="No properties found"
          subtext="Try adjusting your filters or search in a different region."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      ) : (
        <>
          <p className="text-body-sm text-text-muted mb-4">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} available
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
