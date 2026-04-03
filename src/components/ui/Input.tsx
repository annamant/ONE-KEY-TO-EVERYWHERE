import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/classNames'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 flex items-center">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-10 px-3 text-body-sm rounded-lg border bg-surface text-text-primary',
            'placeholder:text-text-subtle',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-okte-slate-50',
            'transition-colors duration-150',
            error ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-border',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 flex items-center">
            {rightIcon}
          </span>
        )}
        {error && <p className="mt-1 text-caption text-danger">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
