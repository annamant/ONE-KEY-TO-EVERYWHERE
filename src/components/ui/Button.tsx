import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/classNames'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-okte-navy-700 active:bg-okte-navy-800 focus-visible:ring-primary/50',
  secondary:
    'bg-okte-slate-100 text-text-primary hover:bg-okte-slate-200 active:bg-okte-slate-300 focus-visible:ring-okte-slate-400/50',
  ghost:
    'bg-transparent text-text-primary hover:bg-okte-slate-100 active:bg-okte-slate-200 focus-visible:ring-okte-slate-400/50',
  danger:
    'bg-danger text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-danger/50',
  outline:
    'bg-transparent border border-border text-text-primary hover:bg-okte-slate-50 active:bg-okte-slate-100 focus-visible:ring-okte-slate-400/50',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-body-sm gap-1.5',
  md: 'h-10 px-4 text-body-sm gap-2',
  lg: 'h-12 px-6 text-body-md gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
