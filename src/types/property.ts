export type PropertyStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'suspended'
export type PropertyTier = 'standard' | 'premium' | 'luxury'

export interface PropertyAmenity {
  id: string
  label: string
  icon: string
}

export interface Property {
  id: string
  ownerId: string
  title: string
  slug: string
  description: string
  region: string
  country: string
  city: string
  address: string
  latitude: number
  longitude: number
  sleeps: number
  bedrooms: number
  bathrooms: number
  tier: PropertyTier
  keysPerNight: number
  amenities: string[]
  houseRules: string[]
  coverImage: string
  images: string[]
  status: PropertyStatus
  minStay: number
  maxStay: number
  blackoutDates: string[]
  listingQualityScore: number
  totalBookings: number
  createdAt: string
  updatedAt: string
}

export interface SearchFilters {
  region?: string
  checkIn?: string
  checkOut?: string
  sleeps?: number
  amenities?: string[]
  minKeys?: number
  maxKeys?: number
  query?: string
}
