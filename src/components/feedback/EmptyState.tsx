import { cn } from '@/utils/classNames'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  heading: string
  subtext?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, heading, subtext, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {icon && (
        <div className="w-14 h-14 rounded-full bg-okte-slate-100 flex items-center justify-center mb-4 text-text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-heading-md text-text-primary mb-1">{heading}</h3>
      {subtext && <p className="text-body-sm text-text-muted max-w-xs mb-6">{subtext}</p>}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
