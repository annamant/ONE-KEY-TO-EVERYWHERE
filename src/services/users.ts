import { api } from './apiClient'
import type { User } from '@/types'

export const userService = {
  getById: (_id: string) =>
    api.get<User>(`/users/${_id}`),

  getByEmail: (_email: string): Promise<User | null> => {
    // Not used directly outside AuthContext — handled by auth endpoints
    return Promise.resolve(null)
  },

  list: (filters?: { role?: string; status?: string; query?: string }) => {
    const params = new URLSearchParams()
    if (filters?.role)   params.set('role', filters.role)
    if (filters?.status) params.set('status', filters.status)
    if (filters?.query)  params.set('query', filters.query)
    const qs = params.toString()
    return api.get<User[]>(`/users${qs ? `?${qs}` : ''}`)
  },

  create: (_data: unknown): Promise<User> => {
    throw new Error('Use auth service signup')
  },

  update: (id: string, patch: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'avatarUrl'>>) =>
    api.patch<User>(`/users/${id}`, patch),

  moderate: (id: string, action: 'suspend' | 'restore' | 'verify') =>
    api.post<User>(`/users/${id}/moderate`, { action }),

  verifyPassword: (_email: string, _password: string): Promise<User | null> => {
    throw new Error('Use auth service login')
  },
}
