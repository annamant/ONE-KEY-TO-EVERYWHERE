import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!currentUser) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
