import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

const links = [
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Membership', path: '/pricing' },
  { label: 'Apply', path: '/waitlist' },
]

export function PublicNav() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const dashboardPath = currentUser
    ? `/${currentUser.role}/dashboard`
    : '/auth/login'

  return (
    <header className="sticky top-0 z-30 backdrop-blur" style={{ background: 'rgba(253,250,245,0.96)', borderBottom: '1px solid #E8DCCF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#2C1810' }}>
              <span className="font-bold text-body-sm" style={{ color: '#C4882F' }}>K</span>
            </div>
            <span className="font-bold text-body-sm" style={{ color: '#2C1810' }}>One Key to Everywhere</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className="text-body-sm font-medium transition-colors"
                style={{ color: '#8A7560' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#2C1810')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8A7560')}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <Button onClick={() => navigate(dashboardPath)} size="sm" style={{ background: '#8B3A2A', color: '#FDFAF5', border: 'none' }}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')} style={{ color: '#8A7560' }}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/auth/signup')} style={{ background: '#8B3A2A', color: '#FDFAF5', border: 'none' }}>
                  Join the Club
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg" style={{ color: '#8A7560' }}>
            {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-1" style={{ borderTop: '1px solid #E8DCCF', background: '#FDFAF5' }}>
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-body-sm font-medium rounded-lg"
              style={{ color: '#2C1810' }}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 space-y-2" style={{ borderTop: '1px solid #E8DCCF' }}>
            <Button variant="outline" fullWidth onClick={() => { navigate('/auth/login'); setMobileOpen(false) }}>Sign In</Button>
            <Button fullWidth onClick={() => { navigate('/auth/signup'); setMobileOpen(false) }} style={{ background: '#8B3A2A', color: '#FDFAF5', border: 'none' }}>
              Join the Club
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
