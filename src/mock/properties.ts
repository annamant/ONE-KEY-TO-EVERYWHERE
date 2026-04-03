import type { Property, PropertyStatus, SearchFilters } from '@/types'
import { db, delay, generateId } from './db'

const mockProperties = {
  async list(filters?: SearchFilters): Promise<Property[]> {
    await delay()
    let results = db.properties.filter((p) => p.status === 'approved')

    if (filters?.region) {
      results = results.filter((p) => p.region === filters.region)
    }
    if (filters?.sleeps) {
      results = results.filter((p) => p.sleeps >= (filters.sleeps ?? 1))
    }
    if (filters?.maxKeys) {
      results = results.filter((p) => p.keysPerNight <= (filters.maxKeys ?? 999))
    }
    if (filters?.minKeys) {
      results = results.filter((p) => p.keysPerNight >= (filters.minKeys ?? 0))
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase()
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }
    if (filters?.amenities && filters.amenities.length > 0) {
      results = results.filter((p) =>
        filters.amenities!.every((a) => p.amenities.includes(a))
      )
    }
    if (filters?.checkIn && filters?.checkOut) {
      results = results.filter((p) => {
        const checkIn = filters.checkIn!
        const checkOut = filters.checkOut!
        return !p.blackoutDates.some((bd) => bd >= checkIn && bd < checkOut)
      })
    }
    return results
  },

  async getById(id: string): Promise<Property | null> {
    await delay()
    return db.properties.find((p) => p.id === id) ?? null
  },

  async listByOwner(ownerId: string): Promise<Property[]> {
    await delay()
    return db.properties.filter((p) => p.ownerId === ownerId)
  },

  async adminList(filters?: { status?: PropertyStatus }): Promise<Property[]> {
    await delay()
    let results = [...db.properties]
    if (filters?.status) results = results.filter((p) => p.status === filters.status)
    return results
  },

  async create(
    ownerId: string,
    data: Omit<Property, 'id' | 'ownerId' | 'status' | 'listingQualityScore' | 'totalBookings' | 'createdAt' | 'updatedAt'>
  ): Promise<Property> {
    await delay()
    const now = new Date().toISOString()
    const property: Property = {
      id: generateId('prop'),
      ownerId,
      ...data,
      status: 'pending_approval',
      listingQualityScore: 70,
      totalBookings: 0,
      createdAt: now,
      updatedAt: now,
    }
    db.properties.push(property)
    return property
  },

  async update(id: string, patch: Partial<Property>): Promise<Property> {
    await delay()
    const prop = db.properties.find((p) => p.id === id)
    if (!prop) throw new Error('Property not found')
    Object.assign(prop, patch, { updatedAt: new Date().toISOString() })
    return prop
  },

  async setStatus(id: string, status: PropertyStatus, adminNote?: string): Promise<Property> {
    await delay()
    const prop = db.properties.find((p) => p.id === id)
    if (!prop) throw new Error('Property not found')
    prop.status = status
    prop.updatedAt = new Date().toISOString()
    void adminNote
    return prop
  },

  async setBlackouts(id: string, dates: string[]): Promise<Property> {
    await delay()
    const prop = db.properties.find((p) => p.id === id)
    if (!prop) throw new Error('Property not found')
    prop.blackoutDates = dates
    prop.updatedAt = new Date().toISOString()
    return prop
  },
}

export default mockProperties
export { mockProperties }
