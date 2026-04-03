import { useNavigate } from 'react-router-dom'
import { MapPinIcon } from '@heroicons/react/20/solid'
import { UserGroupIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classNames'
import { Badge } from '@/components/ui/Badge'
import type { Property } from '@/types'

interface PropertyCardProps {
  property: Property
  className?: string
}

const tierColor = {
  standard: 'gray' as const,
  premium: 'blue' as const,
  luxury: 'amber' as const,
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/member/properties/${property.id}`)}
      className={cn(
        'bg-surface rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200 cursor-pointer overflow-hidden group',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.coverImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge color={tierColor[property.tier]} size="sm">
            {property.tier}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-body-md font-semibold text-text-primary line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0 bg-okte-gold-50 px-2 py-0.5 rounded-pill">
            <span className="text-caption font-bold text-okte-gold-700">{property.keysPerNight}</span>
            <span className="text-caption text-okte-gold-600">keys/night</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-text-muted mb-3">
          <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-caption">{property.city}, {property.country}</span>
        </div>
        <div className="flex items-center gap-3 text-body-sm text-text-muted">
          <span className="flex items-center gap-1">
            <UserGroupIcon className="w-4 h-4" />
            Sleeps {property.sleeps}
          </span>
          <span>·</span>
          <span>{property.bedrooms} bed</span>
          <span>·</span>
          <span>{property.bathrooms} bath</span>
        </div>
      </div>
    </div>
  )
}
