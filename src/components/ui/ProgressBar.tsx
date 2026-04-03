import { cn } from '@/utils/classNames'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
  size?: 'sm' | 'md'
}

const colorClasses = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

const trackSizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
}

export function ProgressBar({
  value,
  max = 100,
  className,
  color = 'primary',
  showLabel,
  size = 'md',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full rounded-pill bg-okte-slate-100 overflow-hidden', trackSizeClasses[size])}>
        <div
          className={cn('h-full rounded-pill transition-all duration-300', colorClasses[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="mt-1 text-caption text-text-muted">{pct}%</span>
      )}
    </div>
  )
}
