import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()

  if (loading) return null

  if (currentUser) {
    const redirectMap = {
      member: '/member/dashboard',
      owner: '/owner/dashboard',
      admin: '/admin/dashboard',
    }
    return <Navigate to={redirectMap[currentUser.role]} replace />
  }

  return <>{children}</>
}
