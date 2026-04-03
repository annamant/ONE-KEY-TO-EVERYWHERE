import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { cn } from '@/utils/classNames'
import { Card } from '@/components/ui/Card'

interface StatCardProps {
  label: string
  value: string | number
  delta?: number
  deltaLabel?: string
  icon?: React.ReactNode
  iconBg?: string
  className?: string
}

export function StatCard({ label, value, delta, deltaLabel, icon, iconBg, className }: StatCardProps) {
  const isPositive = delta !== undefined && delta >= 0

  return (
    <Card className={cn('flex items-start gap-4', className)}>
      {icon && (
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            iconBg ?? 'bg-okte-navy-50 text-primary'
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-body-sm text-text-muted mb-1">{label}</p>
        <p className="text-heading-lg text-text-primary font-semibold">{value}</p>
        {delta !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {isPositive ? (
              <ArrowUpIcon className="w-3 h-3 text-success" />
            ) : (
              <ArrowDownIcon className="w-3 h-3 text-danger" />
            )}
            <span className={cn('text-caption font-medium', isPositive ? 'text-success' : 'text-danger')}>
              {Math.abs(delta)}%
            </span>
            {deltaLabel && <span className="text-caption text-text-muted">{deltaLabel}</span>}
          </div>
        )}
      </div>
    </Card>
  )
}
