import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

const links = [
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Membership', path: '/pricing' },
  { label: 'Open Your Doors', path: '/open-doors' },
  { label: 'Apply', path: '/waitlist' },
]

interface PublicNavProps {
  transparent?: boolean
}

export function PublicNav({ transparent = false }: PublicNavProps) {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const dashboardPath = currentUser ? `/${currentUser.role}/dashboard` : '/auth/login'

  const headerStyle = transparent
    ? { background: 'transparent', borderBottom: 'none' }
    : { background: 'rgba(255,255,255,0.96)', borderBottom: '1px solid #E5E5E5' }

  const logoColor = transparent ? '#FFFFFF' : '#0A0A0A'
  const linkColor = transparent ? 'rgba(255,255,255,0.75)' : '#6B6B6B'
  const linkHoverColor = transparent ? '#FFFFFF' : '#0A0A0A'

  return (
    <header
      className={transparent ? 'absolute top-0 left-0 right-0 z-30' : 'sticky top-0 z-30 backdrop-blur'}
      style={headerStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: transparent ? 'rgba(196,136,47,0.9)' : '#0A0A0A' }}
            >
              <span className="font-bold text-body-sm" style={{ color: transparent ? '#0A0A0A' : '#C4882F' }}>K</span>
            </div>
            <span
              className="font-bold text-body-sm tracking-wide uppercase"
              style={{ color: logoColor, letterSpacing: '0.08em' }}
            >
              One Key
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className="text-caption font-semibold uppercase tracking-wider transition-colors"
                style={{ color: linkColor, letterSpacing: '0.1em' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = linkHoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <Button
                onClick={() => navigate(dashboardPath)}
                size="sm"
                style={
                  transparent
                    ? { background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)' }
                    : { background: '#0A0A0A', color: '#FFFFFF', border: 'none' }
                }
              >
                Dashboard
              </Button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="text-caption font-semibold uppercase tracking-wider transition-colors"
                  style={{ color: linkColor, letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = linkHoverColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
                >
                  Member Login
                </button>
                <button
                  onClick={() => navigate('/waitlist')}
                  className="text-caption font-semibold uppercase tracking-wider px-4 py-2 rounded transition-colors"
                  style={
                    transparent
                      ? { color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.5)', background: 'transparent', cursor: 'pointer', letterSpacing: '0.1em' }
                      : { color: '#FFFFFF', border: 'none', background: '#0A0A0A', cursor: 'pointer', letterSpacing: '0.1em' }
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = transparent ? 'rgba(255,255,255,0.15)' : '#1A1A1A'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = transparent ? 'transparent' : '#0A0A0A'
                  }}
                >
                  Join Waitlist
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: transparent ? '#FFFFFF' : '#6B6B6B' }}
          >
            {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-4 space-y-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.15)', background: transparent ? 'rgba(10,10,10,0.97)' : '#FFFFFF' }}
        >
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-caption font-semibold uppercase tracking-wider rounded-lg"
              style={{ color: transparent ? '#FFFFFF' : '#0A0A0A', letterSpacing: '0.1em' }}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <Button variant="outline" fullWidth onClick={() => { navigate('/auth/login'); setMobileOpen(false) }}
              style={transparent ? { borderColor: '#FFFFFF', color: '#FFFFFF' } : {}}
            >
              Member Login
            </Button>
            <Button fullWidth onClick={() => { navigate('/waitlist'); setMobileOpen(false) }}
              style={{ background: '#0A0A0A', color: '#FFFFFF', border: 'none' }}
            >
              Join Waitlist
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
