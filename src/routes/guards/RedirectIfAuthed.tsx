import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLoadingScreen } from '@/components/feedback/AuthLoadingScreen'

function authedRedirect(role: string, status: string) {
  if (role === 'member' && status === 'pending_verification') {
    return '/member/pending'
  }
  return `/${role}/dashboard`
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()

  if (loading) return <AuthLoadingScreen />

  if (currentUser) {
    return <Navigate to={authedRedirect(currentUser.role, currentUser.status)} replace />
  }

  return <>{children}</>
}
