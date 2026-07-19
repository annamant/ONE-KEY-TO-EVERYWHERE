import { useEffect, useId, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/classNames'

const links = [
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Open Your Doors', path: '/open-doors' },
  { label: 'Pricing', path: '/pricing' },
]

interface PublicNavProps {
  transparent?: boolean
}

export function PublicNav({ transparent = false }: PublicNavProps) {
  const { currentUser } = useAuth()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuId = useId()

  const dashboardPath = currentUser ? `/${currentUser.role}/dashboard` : '/auth/login'
  // When the mobile sheet is open, always use a solid surface for contrast.
  const overlayMode = transparent && !mobileOpen

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const navLinkClass = (path: string) =>
    cn(
      'text-caption font-semibold uppercase tracking-[0.1em] transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm',
      overlayMode
        ? cn(
            'focus-visible:ring-white/50',
            pathname === path ? 'text-white' : 'text-white/75 hover:text-white',
          )
        : cn(
            'focus-visible:ring-primary/40',
            pathname === path ? 'text-primary' : 'text-text-muted hover:text-primary',
          ),
    )

  const signInClass = cn(
    'text-caption font-semibold uppercase tracking-[0.1em] transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm',
    overlayMode
      ? 'text-white/75 hover:text-white focus-visible:ring-white/50'
      : 'text-text-muted hover:text-primary focus-visible:ring-primary/40',
  )

  const applyClass = cn(
    'inline-flex items-center justify-center text-caption font-semibold uppercase tracking-[0.1em]',
    'px-4 py-2 rounded transition-opacity hover:opacity-90',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    overlayMode
      ? 'bg-white text-primary focus-visible:ring-white/50'
      : 'bg-primary text-white focus-visible:ring-primary/40',
  )

  const dashboardClass = cn(
    'inline-flex items-center justify-center text-caption font-semibold uppercase tracking-[0.1em]',
    'px-4 py-2 rounded transition-opacity hover:opacity-90',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    overlayMode
      ? 'bg-white/15 text-white border border-white/40 backdrop-blur-sm focus-visible:ring-white/50'
      : 'bg-primary text-white focus-visible:ring-primary/40',
  )

  const headerSurface = overlayMode
    ? 'absolute top-0 left-0 right-0 bg-transparent'
    : transparent && mobileOpen
      ? 'absolute top-0 left-0 right-0 border-b border-white/15 bg-okte-gray-900'
      : 'sticky top-0 border-b border-border bg-white/96 backdrop-blur-sm'

  return (
    <header className={cn('z-30', headerSurface)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/40"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                overlayMode || (transparent && mobileOpen) ? 'bg-accent' : 'bg-primary',
              )}
            >
              <span
                className={cn(
                  'font-bold text-body-sm',
                  overlayMode || (transparent && mobileOpen) ? 'text-primary' : 'text-accent',
                )}
              >
                K
              </span>
            </div>
            <span
              className={cn(
                'font-bold text-body-sm tracking-[0.08em] uppercase',
                overlayMode || (transparent && mobileOpen) ? 'text-white' : 'text-primary',
              )}
            >
              One Key
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
            {links.map((l) => (
              <Link key={l.path} to={l.path} className={navLinkClass(l.path)} aria-current={pathname === l.path ? 'page' : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <Link to={dashboardPath} className={dashboardClass}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth/login" className={signInClass}>
                  Sign In
                </Link>
                <Link to="/waitlist" className={applyClass}>
                  Apply
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className={cn(
              'md:hidden p-2 rounded-lg transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              overlayMode || (transparent && mobileOpen)
                ? 'text-white focus-visible:ring-white/50'
                : 'text-text-muted focus-visible:ring-primary/40',
            )}
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id={menuId}
          className={cn(
            'md:hidden px-4 pb-4 space-y-1 border-t',
            transparent ? 'border-white/15 bg-okte-gray-900' : 'border-border bg-white',
          )}
        >
          <nav aria-label="Mobile primary" className="space-y-1">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={cn(
                  'block px-3 py-2 text-caption font-semibold uppercase tracking-[0.1em] rounded-lg transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  transparent
                    ? cn(
                        'focus-visible:ring-white/50',
                        pathname === l.path ? 'text-white bg-white/10' : 'text-white/85 hover:bg-white/5',
                      )
                    : cn(
                        'focus-visible:ring-primary/40',
                        pathname === l.path ? 'text-primary bg-okte-gray-50' : 'text-primary hover:bg-okte-gray-50',
                      ),
                )}
                aria-current={pathname === l.path ? 'page' : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className={cn('pt-2 space-y-2 border-t', transparent ? 'border-white/15' : 'border-border')}>
            {currentUser ? (
              <Link
                to={dashboardPath}
                className={cn(
                  'flex w-full items-center justify-center text-caption font-semibold uppercase tracking-[0.1em] px-4 py-2.5 rounded',
                  transparent ? 'bg-white text-primary' : 'bg-primary text-white',
                )}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className={cn(
                    'flex w-full items-center justify-center text-caption font-semibold uppercase tracking-[0.1em] px-4 py-2.5 rounded border transition-colors',
                    transparent
                      ? 'border-white text-white hover:bg-white/5'
                      : 'border-border text-primary hover:bg-okte-gray-50',
                  )}
                >
                  Sign In
                </Link>
                <Link
                  to="/waitlist"
                  className={cn(
                    'flex w-full items-center justify-center text-caption font-semibold uppercase tracking-[0.1em] px-4 py-2.5 rounded',
                    transparent ? 'bg-white text-primary' : 'bg-primary text-white',
                  )}
                >
                  Apply
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
