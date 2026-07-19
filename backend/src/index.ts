import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { getDb } from './db/connection'
import { seedDatabase } from './db/seed'
import authRouter from './routes/auth'
import usersRouter from './routes/users'
import propertiesRouter from './routes/properties'
import bookingsRouter from './routes/bookings'
import ledgerRouter from './routes/ledger'
import householdsRouter from './routes/households'
import notificationsRouter from './routes/notifications'
import waitlistRouter from './routes/waitlist'
import adminRouter from './routes/admin'
import uploadsRouter from './routes/uploads'
import { errorHandler } from './middleware/errorHandler'
import { authLimiter, globalLimiter, uploadLimiter, waitlistLimiter } from './middleware/rateLimit'
import { getSettings } from './utils/settings'
import { verifyToken } from './utils/jwt'

const app = express()
const PORT = Number(process.env.PORT ?? 3201)
const isProd = process.env.NODE_ENV === 'production'

function validateEnv(): void {
  if (!isProd) return
  const required = ['JWT_SECRET', 'APP_URL', 'CORS_ORIGIN']
  const missing = required.filter((k) => !process.env[k]?.trim())
  if (missing.length) {
    throw new Error(`Missing required production env vars: ${missing.join(', ')}`)
  }
  if (process.env.RESET_SEED === 'true') {
    throw new Error('RESET_SEED cannot be used in production')
  }
}

validateEnv()

const corsOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

if (isProd && corsOrigins.length === 0) {
  throw new Error('CORS_ORIGIN must be set in production')
}

const localOriginRe = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(globalLimiter)
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    if (!isProd && localOriginRe.test(origin)) return callback(null, true)
    if (corsOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '256kb' }))

// Initialize DB on startup
const db = getDb()
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }

if (process.env.RESET_SEED === 'true') {
  if (isProd) {
    throw new Error('RESET_SEED cannot be used in production')
  }
  console.log('⚠ RESET_SEED=true — wiping and re-seeding the database')
  seedDatabase(true)
} else if (userCount.count === 0) {
  if (isProd) {
    console.warn('⚠ Empty production database — refusing auto-seed. Run `npm run seed:prod` once with SEED_ADMIN_PASSWORD set.')
  } else {
    seedDatabase()
  }
}

app.get('/health', (_req, res) => {
  try {
    getDb().prepare('SELECT 1').get()
    res.json({ ok: true })
  } catch {
    res.status(503).json({ ok: false })
  }
})

// Maintenance mode blocks non-admin API traffic (login/reset still allowed)
app.use('/api', (req, res, next) => {
  const path = req.path
  if (
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/forgot-password') ||
    path.startsWith('/auth/reset-password')
  ) {
    return next()
  }
  try {
    const settings = getSettings()
    if (!settings.maintenanceMode) return next()

    const header = req.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null
    const payload = token ? verifyToken(token) : null
    if (payload) {
      const user = getDb().prepare('SELECT role, status FROM users WHERE id = ?').get(payload.userId) as
        | { role: string; status: string }
        | undefined
      if (user?.role === 'admin' && user.status !== 'suspended') return next()
    }
    res.status(503).json({ error: 'Platform is under maintenance', code: 'maintenance' })
  } catch (e) {
    next(e)
  }
})

app.use('/api/auth', authLimiter, authRouter)
app.use('/api/users', usersRouter)
app.use('/api/properties', propertiesRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/ledger', ledgerRouter)
app.use('/api/households', householdsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/waitlist', waitlistLimiter, waitlistRouter)
app.use('/api/admin', adminRouter)
app.use('/api/uploads', uploadLimiter, uploadsRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`✓ OKTE backend listening on http://localhost:${PORT}`)
})
