# One Key To Everywhere (OKTE)

Property / home-exchange club: Vite + React + TypeScript frontend, Express + SQLite backend.

## Local development

```bash
# Frontend deps
npm install

# Backend deps
npm --prefix backend install

# Copy env files
cp .env.example .env.local
cp backend/.env.example backend/.env

# Run API + Vite together
npm run dev:all
```

- Frontend: http://localhost:5173 (proxies `/api` → backend)
- Backend: http://localhost:3201
- Health: `GET http://localhost:3201/health`

Empty local DB auto-seeds a **dev** admin (`mantova.a@gmail.com` / `Password1234`). Override with `SEED_ADMIN_PASSWORD`. Production never auto-seeds.

## Production deploy (two Railway services)

### Backend service
- Root: `backend/`
- Start: `npm start` (see `backend/railway.toml`)
- Mount a **volume** and set `DB_PATH=/data/okte.db` (SQLite is otherwise ephemeral)
- Required env:
  - `NODE_ENV=production`
  - `JWT_SECRET` (long random)
  - `CORS_ORIGIN=https://<frontend-host>`
  - `APP_URL=https://<frontend-host>`
  - Resend + Cloudinary keys (see `backend/.env.example`)
- One-time seed: set `SEED_ADMIN_PASSWORD`, then run `npm run seed:prod` once (or a one-off shell). Do **not** set `RESET_SEED` in production.

### Frontend service
- Root: repo root
- Build: `npm install && npm run build`
- Start: `npx serve -s dist -l $PORT` (or `npm run start`)
- Build-time env: `VITE_API_URL=https://<backend-host>` (no trailing slash)

## Membership credits (pre-Stripe)

Launch uses a **manual** credit workflow:

1. Member signs up (and is approved if still pending).
2. Member chooses a package at `/member/packages` (also linked from checkout, wallet, dashboard, and pending status).
3. That creates a `package_purchase_requests` row (`POST /api/ledger/package-requests`).
4. After payment (bank transfer / invoice), admin opens **Requests → Package purchases** and clicks **Mark paid & credit**, or:
   - `POST /api/ledger/admin/package-requests/:id/fulfill`
   - `POST /api/ledger/admin/package-credit` `{ userId, units, note }`
   - Optional: pass `units` on approve to credit in the same step.

## Scripts

| Script | Where | Purpose |
|---|---|---|
| `npm run dev` | root | Vite only |
| `npm run dev:all` | root | Vite + backend |
| `npm run build` | root | Typecheck + production bundle |
| `npm run lint` | root | ESLint |
| `npm run seed` | backend | Seed / reset DB (dev) |
