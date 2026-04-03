import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  HomeIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { Sidebar, type NavItem } from './Sidebar'
import { TopBar } from './TopBar'

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/owner/dashboard', icon: HomeIcon },
  { label: 'Properties', path: '/owner/properties', icon: BuildingOfficeIcon },
  { label: 'Reservations', path: '/owner/reservations', icon: CalendarDaysIcon },
  { label: 'Analytics', path: '/owner/analytics', icon: ChartBarIcon },
]

export function OwnerShell() {
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
          title="Owner Portal"
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
