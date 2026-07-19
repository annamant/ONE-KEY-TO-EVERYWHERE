export function clampString(value: unknown, max: number, field: string): string {
  if (typeof value !== 'string') {
    throw Object.assign(new Error(`${field} must be a string`), { status: 400 })
  }
  const trimmed = value.trim()
  if (trimmed.length > max) {
    throw Object.assign(new Error(`${field} must be at most ${max} characters`), { status: 400 })
  }
  return trimmed
}

export function optionalClampString(value: unknown, max: number, field: string): string | undefined {
  if (value === undefined || value === null) return undefined
  return clampString(value, max, field)
}
