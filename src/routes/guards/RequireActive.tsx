import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/** Blocks property browsing / booking until an admin approves the member. */
export function RequireActive({ children }: { children: React.ReactNode }) {
  const { currentUser, refreshCurrentUser, logout } = useAuth()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const user = await refreshCurrentUser()
      if (cancelled) return
      if (user?.status === 'suspended') logout()
    })()
    return () => { cancelled = true }
  }, [refreshCurrentUser, logout])

  if (!currentUser) return <Navigate to="/auth/login" replace />

  if (currentUser.status === 'pending_verification') {
    return <Navigate to="/member/pending" replace />
  }

  if (currentUser.status === 'suspended') {
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}
