import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { RequireAuth } from './guards/RequireAuth'
import { RequireRole } from './guards/RequireRole'
import { RequireActive } from './guards/RequireActive'
import { RedirectIfAuthed } from './guards/RedirectIfAuthed'

// Layouts
import { MemberShell } from '@/components/layout/MemberShell'
import { OwnerShell } from '@/components/layout/OwnerShell'
import { AdminShell } from '@/components/layout/AdminShell'

// Public pages
import { LandingPage } from '@/pages/public/LandingPage'
import { HowItWorksPage } from '@/pages/public/HowItWorksPage'
import { PricingPage } from '@/pages/public/PricingPage'
import { WaitlistPage } from '@/pages/public/WaitlistPage'
import { OpenDoorsPage } from '@/pages/public/OpenDoorsPage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { RoleSelectPage } from '@/pages/auth/RoleSelectPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'

// Member pages
import { MemberDashboardPage } from '@/pages/member/DashboardPage'
import { SearchPage } from '@/pages/member/SearchPage'
import { PropertyDetailPage } from '@/pages/member/PropertyDetailPage'
import { BookingCheckoutPage } from '@/pages/member/BookingCheckoutPage'
import { BookingConfirmPage } from '@/pages/member/BookingConfirmPage'
import { BookingsPage } from '@/pages/member/BookingsPage'
import { BookingDetailPage } from '@/pages/member/BookingDetailPage'
import { WalletPage } from '@/pages/member/WalletPage'
import { HouseholdPage } from '@/pages/member/HouseholdPage'
import { HouseholdInvitePage } from '@/pages/member/HouseholdInvitePage'
import { MemberProfilePage } from '@/pages/member/ProfilePage'
import { PendingApprovalPage } from '@/pages/member/PendingApprovalPage'

// Owner pages
import { OwnerDashboardPage } from '@/pages/owner/DashboardPage'
import { OwnerPropertiesPage } from '@/pages/owner/PropertiesPage'
import { PropertyOnboardPage } from '@/pages/owner/PropertyOnboardPage'
import { PropertyEditPage } from '@/pages/owner/PropertyEditPage'
import { PropertyCalendarPage } from '@/pages/owner/PropertyCalendarPage'
import { OwnerReservationsPage } from '@/pages/owner/ReservationsPage'
import { OwnerReservationDetailPage } from '@/pages/owner/ReservationDetailPage'
import { OwnerAnalyticsPage } from '@/pages/owner/AnalyticsPage'
import { OwnerProfilePage } from '@/pages/owner/ProfilePage'

// Admin pages
import { AdminDashboardPage } from '@/pages/admin/DashboardPage'
import { AdminUsersPage } from '@/pages/admin/UsersPage'
import { AdminUserDetailPage } from '@/pages/admin/UserDetailPage'
import { AdminPropertiesPage } from '@/pages/admin/PropertiesPage'
import { AdminPropertyReviewPage } from '@/pages/admin/PropertyReviewPage'
import { AdminBookingsPage } from '@/pages/admin/BookingsPage'
import { AdminLedgerPage } from '@/pages/admin/LedgerPage'
import { AdminSettingsPage } from '@/pages/admin/SettingsPage'
import { AdminProfilePage } from '@/pages/admin/ProfilePage'
import { AdminRequestsPage } from '@/pages/admin/RequestsPage'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/how-it-works', element: <HowItWorksPage /> },
  { path: '/pricing', element: <PricingPage /> },
  { path: '/waitlist', element: <WaitlistPage /> },
  { path: '/open-doors', element: <OpenDoorsPage /> },
  {
    path: '/auth',
    element: <Outlet />,
    children: [
      {
        path: 'login',
        element: (
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        ),
      },
      {
        path: 'signup',
        element: (
          <RedirectIfAuthed>
            <SignupPage />
          </RedirectIfAuthed>
        ),
      },
      {
        path: 'role-select',
        element: (
          <RequireAuth>
            <RoleSelectPage />
          </RequireAuth>
        ),
      },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
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
      { path: 'dashboard', element: <MemberDashboardPage /> },
      { path: 'pending', element: <PendingApprovalPage /> },
      {
        path: 'search',
        element: (
          <RequireActive>
            <SearchPage />
          </RequireActive>
        ),
      },
      {
        path: 'properties/:id',
        element: (
          <RequireActive>
            <PropertyDetailPage />
          </RequireActive>
        ),
      },
      {
        path: 'booking/checkout',
        element: (
          <RequireActive>
            <BookingCheckoutPage />
          </RequireActive>
        ),
      },
      {
        path: 'booking/confirmation/:id',
        element: (
          <RequireActive>
            <BookingConfirmPage />
          </RequireActive>
        ),
      },
      {
        path: 'bookings',
        element: (
          <RequireActive>
            <BookingsPage />
          </RequireActive>
        ),
      },
      {
        path: 'bookings/:id',
        element: (
          <RequireActive>
            <BookingDetailPage />
          </RequireActive>
        ),
      },
      {
        path: 'wallet',
        element: (
          <RequireActive>
            <WalletPage />
          </RequireActive>
        ),
      },
      {
        path: 'household',
        element: (
          <RequireActive>
            <HouseholdPage />
          </RequireActive>
        ),
      },
      {
        path: 'household/invite/:token',
        element: <HouseholdInvitePage />,
      },
      { path: 'profile', element: <MemberProfilePage /> },
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
      { path: 'dashboard', element: <OwnerDashboardPage /> },
      { path: 'properties', element: <OwnerPropertiesPage /> },
      { path: 'properties/new', element: <PropertyOnboardPage /> },
      { path: 'properties/:id/edit', element: <PropertyEditPage /> },
      { path: 'properties/:id/calendar', element: <PropertyCalendarPage /> },
      { path: 'reservations', element: <OwnerReservationsPage /> },
      { path: 'reservations/:id', element: <OwnerReservationDetailPage /> },
      { path: 'analytics', element: <OwnerAnalyticsPage /> },
      { path: 'profile', element: <OwnerProfilePage /> },
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
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'requests', element: <AdminRequestsPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'users/:id', element: <AdminUserDetailPage /> },
      { path: 'properties', element: <AdminPropertiesPage /> },
      { path: 'properties/:id/review', element: <AdminPropertyReviewPage /> },
      { path: 'bookings', element: <AdminBookingsPage /> },
      { path: 'ledger', element: <AdminLedgerPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: 'profile', element: <AdminProfilePage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
