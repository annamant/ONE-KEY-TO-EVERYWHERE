import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLoadingScreen } from '@/components/feedback/AuthLoadingScreen'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />

  if (!currentUser) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
