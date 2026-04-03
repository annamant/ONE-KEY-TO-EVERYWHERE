import type { User, UserStatus } from '@/types'
import { db, delay, generateId } from './db'

const mockUsers = {
  async getById(id: string): Promise<User | null> {
    await delay()
    return db.users.find((u) => u.id === id) ?? null
  },

  async getByEmail(email: string): Promise<User | null> {
    await delay()
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
  },

  async list(filters?: { role?: string; status?: string; query?: string }): Promise<User[]> {
    await delay()
    let results = [...db.users]
    if (filters?.role) results = results.filter((u) => u.role === filters.role)
    if (filters?.status) results = results.filter((u) => u.status === filters.status)
    if (filters?.query) {
      const q = filters.query.toLowerCase()
      results = results.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    }
    return results
  },

  async create(data: {
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    role: 'member' | 'owner'
  }): Promise<User> {
    await delay()
    const existing = db.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())
    if (existing) throw new Error('Email already in use')
    const now = new Date().toISOString()
    const user: User = {
      id: generateId('user'),
      ...data,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
    db.users.push(user)
    return user
  },

  async update(id: string, patch: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'avatarUrl'>>): Promise<User> {
    await delay()
    const user = db.users.find((u) => u.id === id)
    if (!user) throw new Error('User not found')
    Object.assign(user, patch, { updatedAt: new Date().toISOString() })
    return user
  },

  async moderate(id: string, action: 'suspend' | 'restore' | 'verify'): Promise<User> {
    await delay()
    const user = db.users.find((u) => u.id === id)
    if (!user) throw new Error('User not found')
    const statusMap: Record<string, UserStatus> = {
      suspend: 'suspended',
      restore: 'active',
      verify: 'active',
    }
    user.status = statusMap[action]
    user.updatedAt = new Date().toISOString()
    return user
  },

  async verifyPassword(email: string, password: string): Promise<User | null> {
    await delay(100, 200)
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user || user.passwordHash !== password) return null
    return user
  },
}

export default mockUsers

// Named export for convenience
export { mockUsers }
