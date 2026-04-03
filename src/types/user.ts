export type UserRole = 'member' | 'owner' | 'admin'
export type UserStatus = 'active' | 'suspended' | 'pending_verification'

export interface User {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  avatarUrl?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface UserSession {
  userId: string
  role: UserRole
  token: string
}
