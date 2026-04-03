import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPinIcon,
  UserGroupIcon,
  HomeIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { KeyIcon } from '@heroicons/react/24/solid'
import type { DateRange } from 'react-day-picker'
import { useMockApi } from '@/hooks/useMockApi'
import { mockProperties } from '@/mock'
import { useAuth } from '@/contexts/AuthContext'
import { calculateKeyCost } from '@/utils/keyCalc'
import { formatDate } from '@/utils/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { DateRangePicker } from '@/components/forms/DateRangePicker'
import { parseISO } from 'date-fns'

const AMENITY_ICONS: Record<string, string> = {
  pool: '🏊', wifi: '📶', beach_access: '🏖️', ski_access: '⛷️', hot_tub: '♨️',
  kitchen: '🍳', fireplace: '🔥', garden: '🌿', gym: '🏋️', onsen: '♨️',
  tatami: '🏯', bicycle: '🚲', safari: '🦁', chef: '👨‍🍳', spa: '💆',
  yoga: '🧘', breakfast: '☕', jungle_view: '🌴', glacier_view: '🏔️',
  hiking: '🥾', kayak: '🚣', concierge: '🛎️', rooftop: '🌇', doorman: '🚪',
  parking: '🅿️', vineyard: '🍇', game_drives: '🚙', staff: '👥',
}

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(2)
  const [imageIndex, setImageIndex] = useState(0)

  const { data: property, loading } = useMockApi(
    () => mockProperties.getById(id!),
    [id]
  )

  if (loading) return <PageSpinner />
  if (!property) return (
    <div className="page-content text-center py-16">
      <p className="text-text-muted">Property not found.</p>
      <Button className="mt-4" onClick={() => navigate('/member/search')}>Back to Search</Button>
    </div>
  )

  const blackoutDates = property.blackoutDates.map((d) => parseISO(d))
  const cost = dateRange?.from && dateRange?.to
    ? calculateKeyCost(property, formatDate(dateRange.from, 'yyyy-MM-dd'), formatDate(dateRange.to, 'yyyy-MM-dd'))
    : null

  const handleBook = () => {
    if (!dateRange?.from || !dateRange?.to || !currentUser) return
    navigate('/member/booking/checkout', {
      state: {
        propertyId: property.id,
        checkIn: formatDate(dateRange.from, 'yyyy-MM-dd'),
        checkOut: formatDate(dateRange.to, 'yyyy-MM-dd'),
        guests,
        cost,
      },
    })
  }

  const tierColors = { standard: 'gray' as const, premium: 'blue' as const, luxury: 'amber' as const }

  return (
    <div className="page-content max-w-6xl">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-body-sm text-text-muted hover:text-text-primary mb-4 transition-colors"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to search
      </button>

      {/* Image Gallery */}
      <div className="relative rounded-xl overflow-hidden mb-6 aspect-[16/7] bg-okte-slate-100">
        <img
          src={property.images[imageIndex] ?? property.coverImage}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        {property.images.length > 1 && (
          <>
            <button
              onClick={() => setImageIndex((i) => (i - 1 + property.images.length) % property.images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setImageIndex((i) => (i + 1) % property.images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {property.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === imageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-4 left-4">
          <Badge color={tierColors[property.tier]}>{property.tier}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-heading-xl text-text-primary font-semibold mb-2">{property.title}</h1>
            <div className="flex items-center gap-1.5 text-text-muted mb-3">
              <MapPinIcon className="w-4 h-4" />
              <span className="text-body-sm">{property.city}, {property.country}</span>
              <span className="text-text-subtle">·</span>
              <span className="text-body-sm">{property.region}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-body-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <UserGroupIcon className="w-4 h-4" />
                Sleeps {property.sleeps}
              </span>
              <span className="flex items-center gap-1.5">
                <HomeIcon className="w-4 h-4" />
                {property.bedrooms} bedrooms · {property.bathrooms} bathrooms
              </span>
              <span className="flex items-center gap-1.5">
                <StarIcon className="w-4 h-4" />
                {property.totalBookings} stays
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-heading-md text-text-primary font-semibold mb-2">About this property</h2>
            <p className="text-body-md text-text-primary leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-heading-md text-text-primary font-semibold mb-3">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {property.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 text-body-sm text-text-primary">
                  <span className="text-lg">{AMENITY_ICONS[a] ?? '✓'}</span>
                  <span className="capitalize">{a.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Rules */}
          <div>
            <h2 className="text-heading-md text-text-primary font-semibold mb-3">House Rules</h2>
            <ul className="space-y-2">
              {property.houseRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-body-sm text-text-primary">
                  <CheckIcon className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Stay rules */}
          <div className="bg-okte-slate-50 rounded-lg p-4">
            <p className="text-body-sm text-text-muted">
              <strong className="text-text-primary">Min stay:</strong> {property.minStay} nights
              {' · '}
              <strong className="text-text-primary">Max stay:</strong> {property.maxStay} nights
            </p>
          </div>
        </div>

        {/* Right: Booking Widget */}
        <div>
          <div className="bg-surface rounded-card shadow-card p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-heading-lg font-bold text-text-primary">{property.keysPerNight}</span>
                <span className="text-body-sm text-text-muted ml-1">keys / night</span>
              </div>
              <div className="flex items-center gap-1 bg-okte-gold-50 px-3 py-1 rounded-pill">
                <KeyIcon className="w-4 h-4 text-okte-gold-600" />
                <span className="text-body-sm font-semibold text-okte-gold-700">Keys Required</span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-1.5">Select dates</label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  disabledDates={blackoutDates}
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-text-primary mb-1.5">Guests</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-okte-slate-50 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-body-md font-medium w-8 text-center">{guests}</span>
                  <button
                    onClick={() => setGuests((g) => Math.min(property.sleeps, g + 1))}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-okte-slate-50 transition-colors"
                  >
                    +
                  </button>
                  <span className="text-caption text-text-muted">max {property.sleeps}</span>
                </div>
              </div>
            </div>

            {cost && (
              <div className="border-t border-border pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-body-sm">
                  <span className="text-text-muted">{property.keysPerNight} keys × {cost.nights} nights</span>
                  <span>{property.keysPerNight * cost.nights} keys</span>
                </div>
                {cost.seasonalMultiplier < 1 && (
                  <div className="flex justify-between text-body-sm text-success">
                    <span>Off-season discount</span>
                    <span>−{Math.round((1 - cost.seasonalMultiplier) * 100)}%</span>
                  </div>
                )}
                {cost.longStayMultiplier < 1 && (
                  <div className="flex justify-between text-body-sm text-success">
                    <span>Long-stay bonus</span>
                    <span>−{Math.round((1 - cost.longStayMultiplier) * 100)}%</span>
                  </div>
                )}
                <div className="flex justify-between text-body-md font-semibold border-t border-border pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-okte-gold-700">{cost.total} keys</span>
                </div>
              </div>
            )}

            <Button
              fullWidth
              disabled={!dateRange?.from || !dateRange?.to}
              onClick={handleBook}
            >
              {dateRange?.from && dateRange?.to ? 'Reserve Now' : 'Select dates to continue'}
            </Button>

            {!dateRange?.from && (
              <p className="text-caption text-text-muted text-center mt-2">No charge until you confirm</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
