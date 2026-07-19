import { useNavigate } from 'react-router-dom'
import { MapPinIcon } from '@heroicons/react/20/solid'
import { UserGroupIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classNames'
import { getPropertyCoverImage } from '@/utils/property'
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
  const coverImage = getPropertyCoverImage(property)

  return (
    <div
      onClick={() => navigate(`/member/properties/${property.id}`)}
      className={cn(
        'bg-surface rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200 cursor-pointer overflow-hidden group',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-okte-slate-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BuildingOfficeIcon className="w-10 h-10 text-text-muted" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge color={tierColor[property.tier]} size="sm">
            {property.tier}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-body-md font-semibold text-text-primary line-clamp-1 mb-1">
          {property.title}
        </h3>
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
