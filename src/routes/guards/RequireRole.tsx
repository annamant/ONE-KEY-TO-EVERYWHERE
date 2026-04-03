import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

interface RequireRoleProps {
  role: UserRole
  children: React.ReactNode
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { currentUser } = useAuth()

  if (!currentUser) return <Navigate to="/auth/login" replace />

  if (currentUser.role !== role) {
    const redirectMap: Record<UserRole, string> = {
      member: '/member/dashboard',
      owner: '/owner/dashboard',
      admin: '/admin/dashboard',
    }
    return <Navigate to={redirectMap[currentUser.role]} replace />
  }

  return <>{children}</>
}
