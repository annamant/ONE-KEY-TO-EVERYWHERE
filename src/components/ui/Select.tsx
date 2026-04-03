import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/classNames'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  placeholder?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, error, className, ...props }, ref) => {
    return (
      <div>
        <select
          ref={ref}
          className={cn(
            'w-full h-10 px-3 pr-8 text-body-sm rounded-lg border bg-surface text-text-primary appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-okte-slate-50',
            'transition-colors duration-150',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748B\' stroke-width=\'2\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.75rem_center]',
            error ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-border',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-caption text-danger">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
