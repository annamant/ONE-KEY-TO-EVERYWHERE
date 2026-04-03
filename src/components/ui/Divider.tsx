import { cn } from '@/utils/classNames'

interface DividerProps {
  className?: string
  label?: string
  orientation?: 'horizontal' | 'vertical'
}

export function Divider({ className, label, orientation = 'horizontal' }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={cn('w-px bg-border self-stretch', className)} />
  }

  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-1 h-px bg-border" />
        <span className="text-caption text-text-muted whitespace-nowrap">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    )
  }

  return <div className={cn('h-px bg-border', className)} />
}
