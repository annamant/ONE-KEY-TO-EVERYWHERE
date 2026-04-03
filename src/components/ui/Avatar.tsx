import { cn } from '@/utils/classNames'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string
  name?: string
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-caption',
  md: 'w-10 h-10 text-body-sm',
  lg: 'w-12 h-12 text-body-md',
  xl: 'w-16 h-16 text-heading-md',
}

function getInitials(name?: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Avatar'}
        className={cn('rounded-full object-cover bg-okte-slate-100', sizeClasses[size], className)}
      />
    )
  }
  return (
    <div
      className={cn(
        'rounded-full bg-okte-navy-600 text-white font-semibold flex items-center justify-center select-none',
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
