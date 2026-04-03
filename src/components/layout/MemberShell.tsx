import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  KeyIcon,
  UserGroupIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { Sidebar, type NavItem } from './Sidebar'
import { TopBar } from './TopBar'
import { cn } from '@/utils/classNames'
import { useIsTablet } from '@/hooks/useMediaQuery'

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/member/dashboard', icon: HomeIcon },
  { label: 'Search', path: '/member/search', icon: MagnifyingGlassIcon },
  { label: 'Bookings', path: '/member/bookings', icon: CalendarDaysIcon },
  { label: 'Wallet', path: '/member/wallet', icon: KeyIcon },
  { label: 'Household', path: '/member/household', icon: UserGroupIcon },
  { label: 'Profile', path: '/member/profile', icon: UserCircleIcon },
]

export function MemberShell() {
  const isTablet = useIsTablet()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-alt">
      {/* Desktop sidebar */}
      <div className={cn('hidden lg:flex flex-col')}>
        <Sidebar
          navItems={navItems}
          collapsed={collapsed}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
            <Sidebar navItems={navItems} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Member Portal"
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Tablet collapse toggle */}
      {!isTablet && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex fixed bottom-6 left-0 items-center justify-center w-5 h-10 bg-okte-navy-800 text-white text-caption rounded-r-lg hover:bg-okte-navy-700 transition-colors z-20"
          style={{ left: collapsed ? '3.75rem' : '15.75rem' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      )}
    </div>
  )
}
