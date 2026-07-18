import type { Property } from '@/types'

/** Resolve the best cover URL for a property listing card or gallery. */
export function getPropertyCoverImage(property: Pick<Property, 'coverImage' | 'images'>): string {
  return property.coverImage || property.images[0] || ''
}
