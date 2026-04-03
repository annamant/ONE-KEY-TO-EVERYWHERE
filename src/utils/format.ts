import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns'

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function formatDateShort(date: string | Date): string {
  return formatDate(date, 'MMM d')
}

export function formatDateRange(checkIn: string, checkOut: string): string {
  const inDate = parseISO(checkIn)
  const outDate = parseISO(checkOut)
  if (inDate.getFullYear() === outDate.getFullYear()) {
    return `${format(inDate, 'MMM d')} – ${format(outDate, 'MMM d, yyyy')}`
  }
  return `${formatDate(checkIn)} – ${formatDate(checkOut)}`
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatKeys(amount: number): string {
  return `${amount} ${amount === 1 ? 'key' : 'keys'}`
}

export function formatKeysCompact(amount: number): string {
  return amount.toString()
}

export function countNights(checkIn: string, checkOut: string): number {
  return differenceInDays(parseISO(checkOut), parseISO(checkIn))
}
