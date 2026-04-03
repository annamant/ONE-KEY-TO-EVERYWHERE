import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/classNames'

export interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  badge?: number
}

interface SidebarProps {
  navItems: NavItem[]
  collapsed?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Sidebar({ navItems, collapsed, header, footer, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'h-full bg-okte-navy-900 text-white flex flex-col transition-all duration-200',
        collapsed ? 'w-sidebar-sm' : 'w-sidebar',
        className
      )}
    >
      {/* Logo/Brand */}
      <div
        className={cn(
          'h-topbar flex items-center border-b border-okte-navy-800 flex-shrink-0',
          collapsed ? 'justify-center px-2' : 'px-5'
        )}
      >
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-okte-navy-900 font-bold text-body-sm">K</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-okte-navy-900 font-bold text-body-sm">K</span>
            </div>
            <div>
              <p className="text-body-sm font-bold text-white leading-tight">One Key</p>
              <p className="text-[10px] text-okte-navy-300 leading-tight">to Everywhere</p>
            </div>
          </div>
        )}
      </div>

      {header && !collapsed && (
        <div className="px-4 py-3 border-b border-okte-navy-800">{header}</div>
      )}

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg transition-colors duration-150 font-medium text-body-sm',
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
                  isActive
                    ? 'bg-accent text-okte-navy-900'
                    : 'text-okte-navy-200 hover:bg-okte-navy-800 hover:text-white'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-pill bg-danger text-white text-[11px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {footer && !collapsed && (
        <div className="px-4 py-3 border-t border-okte-navy-800">{footer}</div>
      )}
    </aside>
  )
}
