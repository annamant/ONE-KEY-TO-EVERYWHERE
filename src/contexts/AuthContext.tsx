import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { User, UserRole } from '@/types'
import { mockUsers } from '@/mock'

const SESSION_KEY = 'okte_session'

interface SessionData {
  userId: string
  role: UserRole
  token: string
}

interface AuthContextValue {
  currentUser: User | null
  session: SessionData | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  signup: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'member' | 'owner'
  }) => Promise<User>
  logout: () => void
  updateCurrentUser: (patch: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) {
      setLoading(false)
      return
    }
    try {
      const s: SessionData = JSON.parse(raw)
      mockUsers.getById(s.userId).then((user) => {
        if (user) {
          setCurrentUser(user)
          setSession(s)
        } else {
          localStorage.removeItem(SESSION_KEY)
        }
        setLoading(false)
      })
    } catch {
      localStorage.removeItem(SESSION_KEY)
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const user = await mockUsers.verifyPassword(email, password)
    if (!user) throw new Error('Invalid email or password')
    if (user.status === 'suspended') throw new Error('Your account has been suspended')

    const s: SessionData = {
      userId: user.id,
      role: user.role,
      token: `token-${user.id}-${Date.now()}`,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    setSession(s)
    setCurrentUser(user)
    return user
  }, [])

  const signup = useCallback(
    async (data: {
      email: string
      password: string
      firstName: string
      lastName: string
      role: 'member' | 'owner'
    }): Promise<User> => {
      const user = await mockUsers.create({
        email: data.email,
        passwordHash: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      })
      const s: SessionData = {
        userId: user.id,
        role: user.role,
        token: `token-${user.id}-${Date.now()}`,
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(s))
      setSession(s)
      setCurrentUser(user)
      return user
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setCurrentUser(null)
    setSession(null)
  }, [])

  const updateCurrentUser = useCallback((patch: Partial<User>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...patch } : null))
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, session, loading, login, signup, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
