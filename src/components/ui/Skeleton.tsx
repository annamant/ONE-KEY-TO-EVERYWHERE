import { cn } from '@/utils/classNames'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: boolean
  circle?: boolean
}

export function Skeleton({ className, width, height, rounded, circle }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-okte-slate-200',
        circle ? 'rounded-full' : rounded ? 'rounded-pill' : 'rounded-md',
        className
      )}
      style={{ width, height }}
    />
  )
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  )
}
