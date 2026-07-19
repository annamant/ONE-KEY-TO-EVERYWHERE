import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLoadingScreen } from '@/components/feedback/AuthLoadingScreen'

interface RequireAuthProps {
  children: React.ReactNode
  /** Where unauthenticated users are sent. Defaults to login. */
  redirectTo?: string
}

export function RequireAuth({ children, redirectTo = '/auth/login' }: RequireAuthProps) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />

  if (!currentUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}
