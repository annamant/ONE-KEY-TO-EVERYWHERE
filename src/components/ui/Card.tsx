import { cn } from '@/utils/classNames'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, className, padding = 'md', hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface rounded-card shadow-card',
        paddingClasses[padding],
        hover && 'transition-shadow duration-200 hover:shadow-card-hover',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
