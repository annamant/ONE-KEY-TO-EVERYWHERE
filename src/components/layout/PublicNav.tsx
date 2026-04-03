import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/classNames'

const links = [
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Waitlist', path: '/waitlist' },
]

export function PublicNav() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const dashboardPath = currentUser
    ? `/${currentUser.role}/dashboard`
    : '/auth/login'

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-okte-navy-900 flex items-center justify-center">
              <span className="text-accent font-bold text-body-sm">K</span>
            </div>
            <span className="font-bold text-okte-navy-900">One Key to Everywhere</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className="text-body-sm font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <Button onClick={() => navigate(dashboardPath)} size="sm">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/auth/signup')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text-primary rounded-lg"
          >
            {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 pb-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-body-sm font-medium text-text-primary rounded-lg hover:bg-okte-slate-100"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border space-y-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => { navigate('/auth/login'); setMobileOpen(false) }}
            >
              Sign In
            </Button>
            <Button
              fullWidth
              onClick={() => { navigate('/auth/signup'); setMobileOpen(false) }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
