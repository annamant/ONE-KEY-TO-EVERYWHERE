import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

interface RequireRoleProps {
  /** Single required role (shorthand). */
  role?: UserRole
  /** Any of these roles may access. */
  roles?: UserRole[]
  children: React.ReactNode
}

export function RequireRole({ role, roles, children }: RequireRoleProps) {
  const { currentUser } = useAuth()
  const allowed = roles ?? (role ? [role] : [])

  if (!currentUser) return <Navigate to="/auth/login" replace />

  if (!allowed.includes(currentUser.role)) {
    const redirectMap: Record<UserRole, string> = {
      member: '/member/dashboard',
      owner: '/owner/dashboard',
      admin: '/admin/dashboard',
    }
    return <Navigate to={redirectMap[currentUser.role]} replace />
  }

  return <>{children}</>
}
