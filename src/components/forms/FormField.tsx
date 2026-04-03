import { cn } from '@/utils/classNames'

interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({ label, htmlFor, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-body-sm font-medium text-text-primary"
      >
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-caption text-text-muted">{hint}</p>}
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  )
}
