import { Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { RequireAuth } from './guards/RequireAuth'
import { RequireRole } from './guards/RequireRole'
import { RequireActive } from './guards/RequireActive'
import { RedirectIfAuthed } from './guards/RedirectIfAuthed'
import { PageSpinner } from '@/components/ui/Spinner'
import { RouteErrorPage } from '@/components/feedback/RouteErrorPage'
import { lazyWithRetry } from '@/utils/lazyWithRetry'

// Layouts (kept eager — shells wrap most navigations)
import { MemberShell } from '@/components/layout/MemberShell'
import { OwnerShell } from '@/components/layout/OwnerShell'
import { AdminShell } from '@/components/layout/AdminShell'

const LandingPage = lazyWithRetry(() => import('@/pages/public/LandingPage').then((m) => ({ default: m.LandingPage })))
const HowItWorksPage = lazyWithRetry(() => import('@/pages/public/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })))
const PricingPage = lazyWithRetry(() => import('@/pages/public/PricingPage').then((m) => ({ default: m.PricingPage })))
const WaitlistPage = lazyWithRetry(() => import('@/pages/public/WaitlistPage').then((m) => ({ default: m.WaitlistPage })))
const OpenDoorsPage = lazyWithRetry(() => import('@/pages/public/OpenDoorsPage').then((m) => ({ default: m.OpenDoorsPage })))
const NotFoundPage = lazyWithRetry(() => import('@/pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

const LoginPage = lazyWithRetry(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazyWithRetry(() => import('@/pages/auth/SignupPage').then((m) => ({ default: m.SignupPage })))
const RoleSelectPage = lazyWithRetry(() => import('@/pages/auth/RoleSelectPage').then((m) => ({ default: m.RoleSelectPage })))
const ForgotPasswordPage = lazyWithRetry(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazyWithRetry(() => import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))
const VerifyEmailPage = lazyWithRetry(() => import('@/pages/auth/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })))

const MemberDashboardPage = lazyWithRetry(() => import('@/pages/member/DashboardPage').then((m) => ({ default: m.MemberDashboardPage })))
const SearchPage = lazyWithRetry(() => import('@/pages/member/SearchPage').then((m) => ({ default: m.SearchPage })))
const PropertyDetailPage = lazyWithRetry(() => import('@/pages/member/PropertyDetailPage').then((m) => ({ default: m.PropertyDetailPage })))
const BookingCheckoutPage = lazyWithRetry(() => import('@/pages/member/BookingCheckoutPage').then((m) => ({ default: m.BookingCheckoutPage })))
const BookingConfirmPage = lazyWithRetry(() => import('@/pages/member/BookingConfirmPage').then((m) => ({ default: m.BookingConfirmPage })))
const BookingsPage = lazyWithRetry(() => import('@/pages/member/BookingsPage').then((m) => ({ default: m.BookingsPage })))
const BookingDetailPage = lazyWithRetry(() => import('@/pages/member/BookingDetailPage').then((m) => ({ default: m.BookingDetailPage })))
const WalletPage = lazyWithRetry(() => import('@/pages/member/WalletPage').then((m) => ({ default: m.WalletPage })))
const PackagesPage = lazyWithRetry(() => import('@/pages/member/PackagesPage').then((m) => ({ default: m.PackagesPage })))
const HouseholdPage = lazyWithRetry(() => import('@/pages/member/HouseholdPage').then((m) => ({ default: m.HouseholdPage })))
const HouseholdInvitePage = lazyWithRetry(() => import('@/pages/member/HouseholdInvitePage').then((m) => ({ default: m.HouseholdInvitePage })))
const MemberProfilePage = lazyWithRetry(() => import('@/pages/member/ProfilePage').then((m) => ({ default: m.MemberProfilePage })))
const PendingApprovalPage = lazyWithRetry(() => import('@/pages/member/PendingApprovalPage').then((m) => ({ default: m.PendingApprovalPage })))

const OwnerDashboardPage = lazyWithRetry(() => import('@/pages/owner/DashboardPage').then((m) => ({ default: m.OwnerDashboardPage })))
const OwnerPropertiesPage = lazyWithRetry(() => import('@/pages/owner/PropertiesPage').then((m) => ({ default: m.OwnerPropertiesPage })))
const PropertyOnboardPage = lazyWithRetry(() => import('@/pages/owner/PropertyOnboardPage').then((m) => ({ default: m.PropertyOnboardPage })))
const PropertyEditPage = lazyWithRetry(() => import('@/pages/owner/PropertyEditPage').then((m) => ({ default: m.PropertyEditPage })))
const PropertyCalendarPage = lazyWithRetry(() => import('@/pages/owner/PropertyCalendarPage').then((m) => ({ default: m.PropertyCalendarPage })))
const OwnerReservationsPage = lazyWithRetry(() => import('@/pages/owner/ReservationsPage').then((m) => ({ default: m.OwnerReservationsPage })))
const OwnerReservationDetailPage = lazyWithRetry(() => import('@/pages/owner/ReservationDetailPage').then((m) => ({ default: m.OwnerReservationDetailPage })))
const OwnerAnalyticsPage = lazyWithRetry(() => import('@/pages/owner/AnalyticsPage').then((m) => ({ default: m.OwnerAnalyticsPage })))
const OwnerProfilePage = lazyWithRetry(() => import('@/pages/owner/ProfilePage').then((m) => ({ default: m.OwnerProfilePage })))

const AdminDashboardPage = lazyWithRetry(() => import('@/pages/admin/DashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const AdminUsersPage = lazyWithRetry(() => import('@/pages/admin/UsersPage').then((m) => ({ default: m.AdminUsersPage })))
const AdminUserDetailPage = lazyWithRetry(() => import('@/pages/admin/UserDetailPage').then((m) => ({ default: m.AdminUserDetailPage })))
const AdminPropertiesPage = lazyWithRetry(() => import('@/pages/admin/PropertiesPage').then((m) => ({ default: m.AdminPropertiesPage })))
const AdminPropertyReviewPage = lazyWithRetry(() => import('@/pages/admin/PropertyReviewPage').then((m) => ({ default: m.AdminPropertyReviewPage })))
const AdminBookingsPage = lazyWithRetry(() => import('@/pages/admin/BookingsPage').then((m) => ({ default: m.AdminBookingsPage })))
const AdminLedgerPage = lazyWithRetry(() => import('@/pages/admin/LedgerPage').then((m) => ({ default: m.AdminLedgerPage })))
const AdminSettingsPage = lazyWithRetry(() => import('@/pages/admin/SettingsPage').then((m) => ({ default: m.AdminSettingsPage })))
const AdminProfilePage = lazyWithRetry(() => import('@/pages/admin/ProfilePage').then((m) => ({ default: m.AdminProfilePage })))
const AdminRequestsPage = lazyWithRetry(() => import('@/pages/admin/RequestsPage').then((m) => ({ default: m.AdminRequestsPage })))

const L = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageSpinner />}>{children}</Suspense>
)

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
  { path: '/', element: <L><LandingPage /></L> },
  { path: '/how-it-works', element: <L><HowItWorksPage /></L> },
  { path: '/pricing', element: <L><PricingPage /></L> },
  { path: '/waitlist', element: <L><WaitlistPage /></L> },
  { path: '/open-doors', element: <L><OpenDoorsPage /></L> },
  {
    path: '/auth',
    element: <Outlet />,
    children: [
      {
        path: 'login',
        element: (
          <RedirectIfAuthed>
            <L><LoginPage /></L>
          </RedirectIfAuthed>
        ),
      },
      {
        path: 'signup',
        element: (
          <RedirectIfAuthed>
            <L><SignupPage /></L>
          </RedirectIfAuthed>
        ),
      },
      {
        path: 'role-select',
        element: (
          <RequireAuth>
            <L><RoleSelectPage /></L>
          </RequireAuth>
        ),
      },
      { path: 'forgot-password', element: <L><ForgotPasswordPage /></L> },
      { path: 'reset-password', element: <L><ResetPasswordPage /></L> },
      { path: 'verify-email', element: <L><VerifyEmailPage /></L> },
    ],
  },
  {
    path: '/member',
    element: (
      <RequireAuth>
        <RequireRole role="member">
          <MemberShell />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/member/dashboard" replace /> },
      { path: 'dashboard', element: <L><MemberDashboardPage /></L> },
      { path: 'pending', element: <L><PendingApprovalPage /></L> },
      { path: 'packages', element: <L><PackagesPage /></L> },
      { path: 'search', element: <RequireActive><L><SearchPage /></L></RequireActive> },
      { path: 'properties/:id', element: <RequireActive><L><PropertyDetailPage /></L></RequireActive> },
      { path: 'booking/checkout', element: <RequireActive><L><BookingCheckoutPage /></L></RequireActive> },
      { path: 'booking/confirmation/:id', element: <RequireActive><L><BookingConfirmPage /></L></RequireActive> },
      { path: 'bookings', element: <RequireActive><L><BookingsPage /></L></RequireActive> },
      { path: 'bookings/:id', element: <RequireActive><L><BookingDetailPage /></L></RequireActive> },
      { path: 'wallet', element: <RequireActive><L><WalletPage /></L></RequireActive> },
      { path: 'household', element: <RequireActive><L><HouseholdPage /></L></RequireActive> },
      { path: 'household/invite/:token', element: <L><HouseholdInvitePage /></L> },
      { path: 'profile', element: <L><MemberProfilePage /></L> },
    ],
  },
  {
    path: '/owner',
    element: (
      <RequireAuth>
        <RequireRole roles={['owner', 'admin']}>
          <OwnerShell />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/owner/dashboard" replace /> },
      { path: 'dashboard', element: <L><OwnerDashboardPage /></L> },
      { path: 'properties', element: <L><OwnerPropertiesPage /></L> },
      { path: 'properties/new', element: <L><PropertyOnboardPage /></L> },
      { path: 'properties/:id/edit', element: <L><PropertyEditPage /></L> },
      { path: 'properties/:id/calendar', element: <L><PropertyCalendarPage /></L> },
      { path: 'reservations', element: <L><OwnerReservationsPage /></L> },
      { path: 'reservations/:id', element: <L><OwnerReservationDetailPage /></L> },
      { path: 'analytics', element: <L><OwnerAnalyticsPage /></L> },
      { path: 'profile', element: <L><OwnerProfilePage /></L> },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <RequireRole role="admin">
          <AdminShell />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <L><AdminDashboardPage /></L> },
      { path: 'requests', element: <L><AdminRequestsPage /></L> },
      { path: 'users', element: <L><AdminUsersPage /></L> },
      { path: 'users/:id', element: <L><AdminUserDetailPage /></L> },
      { path: 'properties', element: <L><AdminPropertiesPage /></L> },
      { path: 'properties/:id/review', element: <L><AdminPropertyReviewPage /></L> },
      { path: 'bookings', element: <L><AdminBookingsPage /></L> },
      { path: 'ledger', element: <L><AdminLedgerPage /></L> },
      { path: 'settings', element: <L><AdminSettingsPage /></L> },
      { path: 'profile', element: <L><AdminProfilePage /></L> },
    ],
  },
  { path: '*', element: <L><NotFoundPage /></L> },
    ],
  },
])
