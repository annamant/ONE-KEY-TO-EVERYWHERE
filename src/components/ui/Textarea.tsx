import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/classNames'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <div>
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5 text-body-sm rounded-lg border bg-surface text-text-primary',
            'placeholder:text-text-subtle resize-y min-h-[80px]',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-okte-slate-50',
            'transition-colors duration-150',
            error ? 'border-danger focus:ring-danger/30' : 'border-border',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-caption text-danger">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
