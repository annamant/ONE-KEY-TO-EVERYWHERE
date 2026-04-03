import { useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { cn } from '@/utils/classNames'
import 'react-day-picker/dist/style.css'

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  disabledDates?: Date[]
  minDate?: Date
  className?: string
  placeholder?: string
}

export function DateRangePicker({
  value,
  onChange,
  disabledDates = [],
  minDate,
  className,
  placeholder = 'Select dates',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const displayValue =
    value?.from && value?.to
      ? `${format(value.from, 'MMM d')} – ${format(value.to, 'MMM d, yyyy')}`
      : value?.from
      ? `${format(value.from, 'MMM d, yyyy')} – ...`
      : null

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full h-10 px-3 text-body-sm rounded-lg border border-border bg-surface text-left',
          'flex items-center gap-2 hover:border-okte-slate-400 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          !displayValue && 'text-text-subtle'
        )}
      >
        <CalendarDaysIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
        <span className="flex-1 truncate">{displayValue ?? placeholder}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-surface rounded-xl shadow-modal border border-border p-2">
            <DayPicker
              mode="range"
              selected={value}
              onSelect={(range) => {
                onChange(range)
                if (range?.from && range?.to) setOpen(false)
              }}
              disabled={[
                ...disabledDates,
                ...(minDate ? [{ before: minDate }] : [{ before: new Date() }]),
              ]}
              numberOfMonths={2}
              className="rdp-okte"
            />
          </div>
        </>
      )}
    </div>
  )
}
