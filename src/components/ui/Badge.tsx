import { cn } from '@/utils/classNames'

export type BadgeColor = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'purple' | 'navy'
export type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  color?: BadgeColor
  size?: BadgeSize
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const colorClasses: Record<BadgeColor, string> = {
  green: 'bg-success-light text-emerald-700',
  amber: 'bg-warning-light text-amber-700',
  red: 'bg-danger-light text-red-700',
  blue: 'bg-blue-50 text-blue-700',
  gray: 'bg-okte-slate-100 text-okte-slate-600',
  purple: 'bg-purple-50 text-purple-700',
  navy: 'bg-okte-navy-50 text-okte-navy-700',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px] font-medium',
  md: 'px-2.5 py-1 text-caption font-medium',
}

export function Badge({ color = 'gray', size = 'md', children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full bg-current')} />
      )}
      {children}
    </span>
  )
}
