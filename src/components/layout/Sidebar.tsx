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
        'h-full flex flex-col transition-all duration-200',
        collapsed ? 'w-sidebar-sm' : 'w-sidebar',
        className
      )}
      style={{ background: '#2C1810', color: '#FDFAF5' }}
    >
      {/* Logo/Brand */}
      <div
        className={cn(
          'h-topbar flex items-center flex-shrink-0',
          collapsed ? 'justify-center px-2' : 'px-5'
        )}
        style={{ borderBottom: '1px solid rgba(196,136,47,0.2)' }}
      >
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#C4882F' }}>
            <span className="font-bold text-body-sm" style={{ color: '#2C1810' }}>K</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#C4882F' }}>
              <span className="font-bold text-body-sm" style={{ color: '#2C1810' }}>K</span>
            </div>
            <div>
              <p className="text-body-sm font-bold leading-tight" style={{ color: '#FDFAF5' }}>One Key</p>
              <p className="text-[10px] leading-tight" style={{ color: '#C4A882' }}>to Everywhere · Club</p>
            </div>
          </div>
        )}
      </div>

      {header && !collapsed && (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(196,136,47,0.15)' }}>{header}</div>
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
                    ? 'text-[#2C1810]'
                    : 'hover:text-white'
                )
              }
              style={({ isActive }) => isActive
                ? { background: '#C4882F', color: '#2C1810' }
                : { color: '#C4A882' }
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-pill text-white text-[11px] font-bold flex items-center justify-center" style={{ background: '#C0392B' }}>
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
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(196,136,47,0.15)' }}>{footer}</div>
      )}
    </aside>
  )
}
