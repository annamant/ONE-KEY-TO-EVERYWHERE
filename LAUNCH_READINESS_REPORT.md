# OKTE Launch Readiness Report

**Project:** One Key To Everywhere (OKTE)  
**Date:** 19 July 2026  
**Review scope:** Full-stack Vite + React + TypeScript frontend, Express + SQLite backend, deployment config, security, and operational readiness.  

## Executive Summary

The codebase is a functional property/home-exchange platform with a clear three-role architecture (member, owner, admin). The frontend builds successfully and the backend compiles and runs. However, **it is not ready for production launch** without addressing several critical security, authorisation, deployment, and business-logic issues.

The most serious blockers are: a SQL-injection vulnerability in the property search route; missing access controls on household and booking data; a deployment configuration that will fail in production unless API URLs are explicitly wired; no payment or membership-credit flow; a seeded admin backdoor; and the absence of any automated tests or linting. Several owner/member UI flows are also broken because they call admin-only endpoints or rely on backend routes that do not exist.

**Launch readiness score: 3 / 10** — functional in local development, but multiple P0 items must be resolved before public deployment.

---

## P0 — Critical Blockers (must fix before launch)

| # | Issue | Location | Why it matters | Suggested fix |
|---|---|---|---|---|
| 1 | **SQL injection in property search** | `backend/src/routes/properties.ts:51-54` (GET `/api/properties/admin`) and `:86-91` (GET `/api/properties`) | `status` and `region` query params are concatenated directly into the SQL string before `db.prepare()`. An attacker can read, modify, or delete any database table. | Use parameterised placeholders (`?`) for all query values; validate `status`/`region` against allowlists before binding. |
| 2 | **No access control on household details** | `backend/src/routes/households.ts:172-178` (GET `/:id`) and `:273-289` (GET `/:id/audit`) | Any authenticated user can fetch any household, its members, invites, and full audit log. This is a major privacy breach. | Enforce that the caller is a member of the household, an owner of the household, or an admin. |
| 3 | **Household invite acceptance does not verify email** | `backend/src/routes/households.ts:119-169` (POST `/accept-invite`) | Anyone with a valid member account can accept any other household’s invite token. | Verify `req.user` email matches `invite.invitee_email` (case-insensitive) before accepting. |
| 4 | **Weak, guessable invite tokens** | `backend/src/utils/generateId.ts:3-6` | Invite tokens are `prefix-${timestamp}-${4 random bytes hex}`. The timestamp is predictable and the random suffix is only 2^32 possibilities, making token enumeration feasible. | Generate invite tokens with `crypto.randomUUID()` or `crypto.randomBytes(32).toString('hex')`. |
| 5 | **Booking creation has no availability/business rules** | `backend/src/routes/bookings.ts:68-128` | Members can double-book properties, book blackout dates, book below `minStay` / above `maxStay`, or book more guests than the property sleeps. | Add validation against blackout dates, existing bookings, `minStay`, `maxStay`, and `sleeps` capacity. Use a transaction that re-checks availability. |
| 6 | **Owner can silently edit an approved property** | `backend/src/routes/properties.ts:181-220` (PATCH `/:id`) | An owner can change details of an already-approved listing without re-triggering review. | Reset `status` to `pending_approval` when a published listing is materially edited, or implement a draft/republish workflow. |
| 7 | **No rate limiting on public or authenticated endpoints** | All `backend/src/routes/*.ts` | Brute-force login, signup abuse, waitlist spam, and costly Cloudinary uploads are all possible. | Add `express-rate-limit` (and a stricter limit for auth) plus Cloudinary upload limits per user. |
| 8 | **No ESLint configuration; lint script fails** | Root `package.json:11` | `npm run lint` errors out because there is no `.eslintrc` / `eslint.config` file. This blocks CI and makes code quality hard to enforce. | Add an ESLint config (e.g. `eslint.config.mjs`) extending the already-installed TypeScript + React hooks + refresh plugins. |
| 9 | **Auto-seed creates a known admin backdoor** | `backend/src/index.ts:41-48`, `backend/src/db/seed.ts:13, 42-67` | On first startup, the backend automatically seeds an admin with a hardcoded password (`Password1234`) and email. Fresh production deploys expose this account. | Disable auto-seed in production; require explicit `npm run seed:prod` once. Never ship default credentials. Guard `RESET_SEED` so it cannot run in production. |
| 10 | **Error handler leaks internal error messages** | `backend/src/middleware/errorHandler.ts:10-20` | In production, `err.message` is sent to the client, which can expose implementation details. | Return a generic message in production and log the full stack server-side. |
| 11 | **Production deployment will not work without explicit API wiring** | `railway.toml:1-8`, `backend/railway.toml:1-8`, `src/services/apiClient.ts:1`, `.env.example:4-6` | Root Railway config only serves static `dist` via `npx serve`. The backend is a separate service. In production, `apiClient` uses `VITE_API_URL` (baked in at build time) or falls back to same-origin `/api`, which the static server cannot proxy. | Document two-service deploy; set `VITE_API_URL=https://<backend-host>` in frontend Railway build env; set `CORS_ORIGIN=https://<frontend-host>` on backend. Add a `/health` route and pin `serve` as a dependency. |
| 12 | **SQLite data is ephemeral on Railway without a volume** | `backend/src/db/connection.ts:5-7`, `backend/.env.example:3` | DB defaults to `./okte.db` on the local filesystem. Railway containers are ephemeral. | Mount a Railway volume and set `DB_PATH` to a persistent path; or migrate to Postgres before launch. |
| 13 | **Owner dashboards call admin-only booking APIs** | `src/pages/owner/DashboardPage.tsx:29-31`, `src/pages/owner/ReservationsPage.tsx:33-35`, `src/pages/owner/AnalyticsPage.tsx:28`, `backend/src/routes/bookings.ts:30-44` | Owner pages call `mockBookings.adminList()` → `GET /api/bookings/admin`, which requires `admin`. | Use `listForProperty` per property or add `GET /api/bookings/owner` that returns bookings for the authenticated owner’s properties. |
| 14 | **Booking modification UI calls a missing backend endpoint** | `src/services/bookings.ts:29-30`, `src/pages/member/BookingDetailPage.tsx:82-97`, `backend/src/routes/bookings.ts` | Frontend calls `PATCH /bookings/:id` with new dates; no such route exists. | Implement the modify endpoint with ledger adjustment, availability check, and cancellation-window rules — or remove the UI until ready. |
| 15 | **No payment / membership purchase flow** | `src/pages/public/PricingPage.tsx:221-228`, `src/types/membership.ts`, `backend/src/routes/admin.ts:117-145` | Pricing is a frontend calculator only. Admin approval does not credit the ledger. New approved members start with balance 0 and cannot book. | Integrate Stripe (or a documented manual admin workflow). On purchase/approval, create a `package_credit` ledger entry matching purchased units. |
| 16 | **Owner booking endpoints do not verify property ownership** | `backend/src/routes/bookings.ts:46-55` (GET `/property/:propertyId`) and `:132-143` (GET `/:id`) | `GET /api/bookings/property/:propertyId` requires owner role but does not verify the caller owns the property. `GET /api/bookings/:id` only restricts members, so any owner can read any booking. | Join `properties` and enforce `owner_id === req.user.userId` (unless admin). Apply the same check on booking detail. |
| 17 | **Suspended users retain API access via existing JWT** | `backend/src/middleware/auth.ts:17-30`, `backend/src/utils/jwt.ts:5` | Suspension is only checked at login. JWT is valid for 30 days and most routes never re-check `users.status`. | In `authenticate`, load the user from DB and reject `suspended` / `pending_verification` where appropriate; or maintain a token revocation list. |

---

## P1 — High Priority (should fix before launch)

| # | Issue | Location | Why it matters | Suggested fix |
|---|---|---|---|---|
| 18 | **Owner can view any property (including other owners’ pending listings)** | `backend/src/routes/properties.ts:155-179` | `GET /api/properties/:id` only restricts members to approved listings; owners and admins can see any property, including unapproved competitors. | Restrict owners to their own properties unless the listing is approved. |
| 19 | **No security headers / helmet** | `backend/src/index.ts:18-38` | Missing HSTS, CSP, X-Frame-Options, etc. | Add `helmet` and a sensible Content-Security-Policy. |
| 20 | **No CORS origin enforcement in production by default** | `backend/src/index.ts:22-37` | `CORS_ORIGIN` is optional; if omitted, the only allowed origins are local ones. | Document required env vars and add a startup check that warns/fails if `NODE_ENV=production` and `CORS_ORIGIN` is empty. |
| 21 | **JWT stored in localStorage (XSS token theft risk)** | `src/contexts/AuthContext.tsx:12, 72`, `src/services/apiClient.ts:10-17` | Bearer token persisted in `localStorage`. Any XSS vulnerability grants full account takeover. | Prefer HttpOnly secure cookies + CSRF protection, or shorten JWT TTL with refresh tokens. |
| 22 | **JWT payload is trusted for role; no invalidation on role change** | `backend/src/middleware/auth.ts:29`, `backend/src/routes/users.ts:86-112` | Role comes from JWT, not DB. Admin role changes do not affect existing sessions. | Load role/status from DB in `authenticate`, or include a `tokenVersion` in JWT. |
| 23 | **No automated tests** | Entire repo | No unit, integration, or E2E tests. | Add a test framework (e.g. Vitest for frontend + Supertest for backend) and cover auth, booking, and property CRUD flows. |
| 24 | **Critical dependency vulnerabilities** | `npm audit` | `shell-quote` (critical), `react-router` (open redirect), `esbuild` (dev-server proxy), `postcss` (XSS), `js-yaml` (DoS). | Run `npm audit fix` and upgrade packages that cannot be auto-fixed; verify after fixing. |
| 25 | **Cloudinary upload endpoint has no user-level quota** | `backend/src/routes/uploads.ts:14-37` | Authenticated owners can upload unlimited images, driving Cloudinary costs. | Add a per-property/per-user upload limit and rate limit. |
| 26 | **Owner waitlist does not prevent duplicate spam** | `backend/src/routes/waitlist.ts:39-69` | The same email can submit multiple owner enquiries, causing noise and admin overhead. | Add a unique constraint or recent-submission check on email. |
| 27 | **User role promotion can lock out the last admin** | `backend/src/routes/users.ts:87-113` | An admin can change another admin to `member` or `owner`; no protection for the final admin account. | Block demotion of the last admin, or require a confirmation flow. |
| 28 | **GET `/api/bookings/:id` does not verify property ownership** | `backend/src/routes/bookings.ts:132-143` | Only member ownership is checked; an owner cannot see their own property’s booking details. | Allow owners of the booked property and admins to read the booking. |
| 29 | **Member waitlist duplicates cause 500 errors** | `backend/src/routes/waitlist.ts:72-102` | `member_waitlist` has a unique email constraint but the route does not handle the conflict, returning a raw SQLite error. | Catch the unique constraint violation and return a 409 with a friendly message. |
| 30 | **No database indexes** | `backend/src/db/schema.sql` | As the user, property, and booking tables grow, unindexed foreign-key lookups will slow down. | Add indexes on `users(email)`, `properties(owner_id, status)`, `bookings(member_id, property_id)`, `notifications(user_id, read)`, `ledger_entries(user_id)`, etc. |
| 31 | **No input length limits on free-text fields** | `backend/src/routes/properties.ts`, `users.ts`, `waitlist.ts` | Large payloads can cause storage bloat or denial of service. | Add maximum length validation for title, description, message, notes, etc. |
| 32 | **Member household page calls admin-only user list** | `src/pages/member/HouseholdPage.tsx:56`, `backend/src/routes/users.ts:26-44` | Household page calls `mockUsers.list()` → `GET /api/users` (admin only). | Return member display info embedded in the household API, or add a scoped `GET /api/households/:id/members` with public-safe fields. |
| 33 | **Owner reservation detail cannot load guest info** | `src/pages/owner/ReservationDetailPage.tsx:26-28`, `backend/src/routes/users.ts:46-59` | Owner page fetches member profile via `GET /api/users/:id`; non-admin users may only access their own profile. | Add owner-scoped booking detail endpoint returning limited guest fields. |
| 34 | **Household invite role not validated on create** | `backend/src/routes/households.ts:181-198` | `POST /:id/invite` inserts `role` from body without validating against `Manager|Booker|Viewer`. | Validate role before insert. |
| 35 | **Platform settings are stored but never enforced** | `backend/src/routes/admin.ts:158-178`, `src/pages/admin/SettingsPage.tsx:35, 71` | `maintenanceMode`, `maxKeys`, `minKeys`, `cancellationWindow`, `reviewDays` are stored but never read by booking/auth middleware. | Enforce settings in relevant routes; block non-admin traffic when maintenance mode is on. |
| 36 | **Ledger race conditions on concurrent operations** | `backend/src/routes/ledger.ts:76-107`, `backend/src/routes/bookings.ts:94-124` | Admin corrections are not transactional with row locking. Concurrent bookings/corrections can produce incorrect `balance_after`. | Wrap all balance mutations in `db.transaction()` with serialized access per `user_id`. |
| 37 | **Booking creation lacks server-side date validation** | `backend/src/routes/bookings.ts:71-89` | No validation for `checkOut > checkIn`, future dates, zero/negative nights, or `guests <= sleeps`. | Centralise validation; reject invalid date ranges before debiting the ledger. |
| 38 | **Cancellation always refunds full keys with no policy** | `backend/src/routes/bookings.ts:182-219` | Cancel refunds 100% of `keys_charged` regardless of timing, status, or `cancellationWindow`. | Enforce cancellation window; partial/no refund based on policy and booking status. |
| 39 | **Email verification not required for API access** | `backend/src/routes/auth.ts:85-87, 150` | Users get JWT immediately on signup; only `status === active` gates booking, not `email_verified_at`. | Block sensitive actions until email is verified, or auto-verify only after link click. |
| 40 | **Property images can be set to arbitrary URLs via PATCH** | `backend/src/routes/properties.ts:202-214` | `images` and `coverImage` accept any string in the JSON body, bypassing Cloudinary upload controls. | Only allow URLs from your Cloudinary account. |
| 41 | **Frontend build emits a single 991 KB JS chunk** | `npm run build` | Large initial bundle hurts mobile performance and Lighthouse scores. | Add route-based code splitting with `React.lazy()` and `Suspense`. |

---

## P2 — Medium Priority (fix shortly after launch)

| # | Issue | Location | Why it matters | Suggested fix |
|---|---|---|---|---|
| 42 | **No re-check of member status on every booking route** | `backend/src/routes/bookings.ts:57-66` (list) and others | Suspended members can still list their own bookings and potentially read booking data. | Apply the active-membership check consistently across member-only endpoints. |
| 43 | **Orphaned Cloudinary uploads from temp upload endpoint** | `backend/src/routes/uploads.ts:14-36`, `src/pages/owner/PropertyOnboardPage.tsx:82-84` | Onboarding uploads to `/api/uploads/images` before property exists; abandoned flows leave orphan assets. | Upload only after property creation, or run periodic cleanup. |
| 44 | **Frontend silently swallows API errors** | `src/services/properties.ts:18`, `src/services/bookings.ts:6`, `src/hooks/useMockApi.ts:26-28` | `getById` catches errors and returns `null`; many pages show "not found" instead of permission/network errors. | Propagate `ApiError` status; distinguish 403/404/500 in the UI. |
| 45 | **Admin can “approve” a suspended member without verification** | `backend/src/routes/admin.ts:118-145` | Only checks `role === 'member'` and `status !== 'active'`, so a suspended account can be reactivated without review. | Explicitly require `status === 'pending_verification'` for approval. |
| 46 | **Household manager can remove the creator / last manager** | `backend/src/routes/households.ts:221-241` | Any manager can remove another manager, including the household creator. | Protect the last manager and optionally the creator. |
| 47 | **Settings values are stored as opaque strings** | `backend/src/routes/admin.ts:147-179` | No type validation; `maxKeys`, `cancellationWindow`, etc. can be invalid. | Add a schema validator (e.g. Zod) and parse values to the correct types. |
| 48 | **Email validation regex is permissive** | `backend/src/routes/auth.ts:12` | `^[^\s@]+@[^\s@]+\.[^\s@]+$` accepts many invalid addresses. | Use a stricter validator or verify deliverability via confirmation email. |
| 49 | **No pagination on notifications** | `backend/src/routes/notifications.ts:20-29` | Always returns the latest 50. | Add limit/offset parameters and an unread count endpoint. |
| 50 | **Frontend uses confusing `mock*` aliases for real services** | `src/services/index.ts` | `mockBookings`, `mockProperties`, etc. are actually the real API clients. | Rename exports to real service names and update imports. |
| 51 | **No backend `.env` validation at startup** | `backend/src/index.ts` | Missing required env vars are only discovered when a feature fails. | Add a startup schema check for `JWT_SECRET`, `APP_URL`, Cloudinary keys, etc. in production. |
| 52 | **`RequireActive` only checks cached user status** | `src/routes/guards/RequireActive.tsx` | Frontend guards rely on `currentUser` from context; if an admin suspends the account, the client may not know until refresh. | Add a short-lived session check or refresh on navigation. |
| 53 | **Tracked `.railway-config-pull-*` directories** | `.railway-config-pull-*/` | These look like transient Railway artifacts and should not be in source control. | Remove them and add the pattern to `.gitignore`. |
| 54 | **No health check endpoint** | `backend/src/index.ts` | Deployments and load balancers cannot verify backend health. | Add `GET /health` that checks DB connectivity. |
| 55 | **Image upload trusts client MIME type only** | `backend/src/middleware/upload.ts:10-15` | `fileFilter` checks `mimetype`, not magic bytes. Multer stores up to 10 × 10 MB in memory. | Validate file signatures; consider disk storage or streaming; lower concurrent upload limits. |
| 56 | **`avatarUrl` accepts arbitrary URLs** | `backend/src/routes/users.ts:70-78` | Users can set any `avatarUrl` without an allowlist. | Restrict to Cloudinary URLs or the same upload pipeline. |
| 57 | **Email is critical path but can fail silently** | `backend/src/utils/email.ts:58-97` | Without Resend API key, production throws on email failure; dev logs to console. Signup still succeeds if verification email fails. | Surface email delivery status to admins; queue retries; monitor Resend. |
| 58 | **RoleSelectPage exposes owner portal link to members** | `src/pages/auth/RoleSelectPage.tsx:30-36`, `src/routes/index.tsx:196-201` | UI suggests members can access owner dashboard; route guard redirects, but UX is confusing. | Hide owner card unless `role === 'owner' \| 'admin'`. |
| 59 | **Hardcoded mock analytics delta** | `src/pages/owner/DashboardPage.tsx:75-76` | `delta={12}` on StatCard is static, not computed. | Remove or compute from real data. |

---

## P3 — Low Priority / Polish

| # | Issue | Location | Suggested fix |
|---|---|---|---|
| 60 | **Frontend `useMockApi` hook name is misleading** | `src/hooks/useMockApi.ts` | Rename to `useApi` or `useFetch`. |
| 61 | **No README or runbook** | Root | Add a README with setup, env vars, and deployment instructions. |
| 62 | **Root `railway.toml` uses `npx serve`** | `railway.toml:6` | Pin `serve` as a dev dependency or use a more robust static server. |
| 63 | **`date-fns` version mismatch between frontend and backend** | `package.json:23` vs `backend/package.json:18` | Align versions to reduce confusion. |
| 64 | **No `onDelete` / `onUpdate` foreign-key policies** | `backend/src/db/schema.sql` | Decide on cascade vs. restrict behaviour and document it. |
| 65 | **Frontend images lack `alt` text fallbacks in some cards** | `src/pages/member/BookingCheckoutPage.tsx:88` and others | Add meaningful alt text or fallback placeholders. |
| 66 | **Pricing page requires login** | `src/routes/index.tsx:69-75` | Public pricing is usually better for conversion; consider making it public. |
| 67 | **JWT 30-day expiry** | `backend/src/utils/jwt.ts:5` | Long-lived for a sensitive app; consider shorter TTL + refresh. |
| 68 | **Password reset tokens accumulate** | `backend/src/routes/auth.ts:188-191` | Add periodic cleanup job for used/expired tokens. |
| 69 | **Empty property images in seed** | `backend/src/db/seed.ts` | Seed listings have no photos out of the box. |

---

## Missing Features / Unknowns Needing Clarification

1. **Payment provider & flow** — Is launch manual (admin credits ledger after bank transfer) or Stripe-required? The pricing page implies purchase but has no checkout.
2. **Membership units model** — Are ledger “units” nights, days, or abstract keys? Frontend `keyCalc` and backend `calculateKeyCost` use day diff; UI sometimes says “days” for nights.
3. **Season packages / pause** — Described on pricing/how-it-works pages but no backend model for 6/12-month seasons or pause/freeze.
4. **Owner onboarding** — Owners cannot self-signup (`auth.ts:103-107`). Is admin-created owner account the intended flow after waitlist approval? No API converts waitlist → owner user.
5. **Household booking permissions** — `Booker` vs `Viewer` roles exist but booking always uses individual member wallet; `householdId` is optional and unused in the UI checkout.
6. **Notifications** — No email/push for booking confirmed, property approved, etc. (in-app only).
7. **Admin property review notifications to owners** — Status change does not notify the owner.
8. **GDPR / data export / account deletion** — Not implemented.
9. **Multi-environment strategy** — Staging DB, seed policy, and secret rotation undefined.
10. **Single vs monorepo Railway service** — Unclear if frontend and backend are deployed as two Railway services or one; configs suggest two.

---

## Recommended Next Steps (Roadmap)

### Phase 1 — Security & Stability (1–2 weeks, blocks launch)
1. Fix the SQL-injection vulnerability in `backend/src/routes/properties.ts`.
2. Add authorisation checks to all household routes and secure invite tokens.
3. Implement booking availability validation (blackouts, existing bookings, min/max stay, guests).
4. Add rate limiting to auth, waitlist, and upload endpoints.
5. Disable production auto-seed; remove default admin credentials.
6. Fix the error handler to avoid leaking internal messages.
7. Add an ESLint config and make `npm run lint` pass in CI.
8. Resolve critical/high `npm audit` findings and update dependencies.
9. Add `helmet` and security headers to the backend.
10. Wire production deployment (persistent DB, `VITE_API_URL`, `CORS_ORIGIN`, health checks).
11. Fix owner dashboard API calls and the missing booking-modify endpoint (or remove the UI).
12. Implement the membership-credit/payment flow so approved members can actually book.
13. Re-check user status/role from the DB on every authenticated request.

### Phase 2 — Quality & Launch Prep (1 week)
14. Add backend tests (Supertest + a test SQLite DB) covering auth, bookings, properties, and authorization boundaries.
15. Add frontend tests (Vitest + React Testing Library) for guards, forms, and checkout.
16. Add a `/health` endpoint and env-var validation at startup.
17. Add database indexes for the most-queried columns.
18. Set up CI (GitHub Actions) to run lint, build, tests, and audit on every PR.
19. Remove the `.railway-config-pull-*` directories and add a `.gitignore` rule.
20. Implement cancellation policy, property re-approval workflow, and admin settings validation.

### Phase 3 — Launch & Iterate (ongoing)
21. Deploy to production with correct env vars, monitoring, and uptime alerts.
22. Add email notifications for key events (booking confirmed, property approved, etc.).
23. Conduct a lightweight pentest or security review before the public launch.
24. Write user-facing documentation and an admin runbook.

---

## Appendix — Files Reviewed

**Configuration:** `package.json`, `backend/package.json`, `vite.config.ts`, `railway.toml`, `backend/railway.toml`, `.env.example`, `backend/.env.example`, `.gitignore`, `tsconfig.json`, `backend/tsconfig.json`.  
**Backend:** `backend/src/index.ts`, `backend/src/db/connection.ts`, `backend/src/db/schema.sql`, `backend/src/db/seed.ts`, `backend/src/middleware/auth.ts`, `backend/src/middleware/requireRole.ts`, `backend/src/middleware/errorHandler.ts`, `backend/src/middleware/upload.ts`, `backend/src/routes/auth.ts`, `backend/src/routes/users.ts`, `backend/src/routes/properties.ts`, `backend/src/routes/bookings.ts`, `backend/src/routes/households.ts`, `backend/src/routes/ledger.ts`, `backend/src/routes/admin.ts`, `backend/src/routes/waitlist.ts`, `backend/src/routes/notifications.ts`, `backend/src/routes/uploads.ts`, `backend/src/utils/jwt.ts`, `backend/src/utils/email.ts`, `backend/src/utils/cloudinary.ts`, `backend/src/utils/generateId.ts`, `backend/src/utils/keyCalc.ts`, `backend/src/utils/notifyAdmins.ts`.  
**Frontend:** `src/App.tsx`, `src/main.tsx`, `src/routes/index.tsx`, `src/routes/guards/*.tsx`, `src/contexts/AuthContext.tsx`, `src/services/*.ts`, `src/hooks/useMockApi.ts`, `src/pages/member/BookingCheckoutPage.tsx`, `src/pages/member/BookingDetailPage.tsx`, `src/pages/member/HouseholdPage.tsx`, `src/pages/owner/DashboardPage.tsx`, `src/pages/owner/ReservationsPage.tsx`, `src/pages/owner/ReservationDetailPage.tsx`, `src/pages/owner/AnalyticsPage.tsx`, `src/pages/auth/RoleSelectPage.tsx`, `src/pages/admin/SettingsPage.tsx`, plus a sampling of other pages and components.
