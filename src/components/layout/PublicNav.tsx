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
    : { background: 'rgba(253,250,245,0.96)', borderBottom: '1px solid #E8DCCF' }

  const logoColor = transparent ? '#FDFAF5' : '#2C1810'
  const linkColor = transparent ? 'rgba(253,250,245,0.75)' : '#8A7560'
  const linkHoverColor = transparent ? '#FDFAF5' : '#2C1810'

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
              style={{ background: transparent ? 'rgba(196,136,47,0.9)' : '#2C1810' }}
            >
              <span className="font-bold text-body-sm" style={{ color: transparent ? '#2C1810' : '#C4882F' }}>K</span>
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
                    ? { background: 'rgba(255,255,255,0.15)', color: '#FDFAF5', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)' }
                    : { background: '#8B3A2A', color: '#FDFAF5', border: 'none' }
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
                      ? { color: '#FDFAF5', border: '1px solid rgba(255,255,255,0.5)', background: 'transparent', cursor: 'pointer', letterSpacing: '0.1em' }
                      : { color: '#FDFAF5', border: 'none', background: '#8B3A2A', cursor: 'pointer', letterSpacing: '0.1em' }
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = transparent ? 'rgba(255,255,255,0.15)' : '#6B2D1A'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = transparent ? 'transparent' : '#8B3A2A'
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
            style={{ color: transparent ? '#FDFAF5' : '#8A7560' }}
          >
            {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-4 space-y-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.15)', background: transparent ? 'rgba(44,24,16,0.95)' : '#FDFAF5' }}
        >
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-caption font-semibold uppercase tracking-wider rounded-lg"
              style={{ color: transparent ? '#FDFAF5' : '#2C1810', letterSpacing: '0.1em' }}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <Button variant="outline" fullWidth onClick={() => { navigate('/auth/login'); setMobileOpen(false) }}
              style={transparent ? { borderColor: '#FDFAF5', color: '#FDFAF5' } : {}}
            >
              Member Login
            </Button>
            <Button fullWidth onClick={() => { navigate('/waitlist'); setMobileOpen(false) }}
              style={{ background: '#8B3A2A', color: '#FDFAF5', border: 'none' }}
            >
              Join Waitlist
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
