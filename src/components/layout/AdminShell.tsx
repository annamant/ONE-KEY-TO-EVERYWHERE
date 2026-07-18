import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  InboxStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { Sidebar, type NavItem } from './Sidebar'
import { TopBar } from './TopBar'

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
  { label: 'Requests', path: '/admin/requests', icon: InboxStackIcon },
  { label: 'Users', path: '/admin/users', icon: UsersIcon },
  { label: 'Properties', path: '/admin/properties', icon: BuildingOfficeIcon },
  { label: 'My Homes', path: '/owner/properties', icon: HomeIcon },
  { label: 'Bookings', path: '/admin/bookings', icon: CalendarDaysIcon },
  { label: 'Ledger', path: '/admin/ledger', icon: CreditCardIcon },
  { label: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
  { label: 'Profile', path: '/admin/profile', icon: UserCircleIcon },
]

export function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-alt">
      <div className="hidden lg:flex flex-col">
        <Sidebar navItems={navItems} />
      </div>

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
          title="Admin Console"
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
