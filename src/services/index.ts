// Re-export services with the same names as the mock modules.
// This means changing `from '@/mock'` to `from '@/services'` is the only
// change needed at all call sites.
export { userService as mockUsers } from './users'
export { propertyService as mockProperties } from './properties'
export { bookingService as mockBookings } from './bookings'
export { ledgerService as mockLedger } from './ledger'
export { householdService as mockHouseholds } from './households'
export { notificationService as mockNotifications } from './notifications'
