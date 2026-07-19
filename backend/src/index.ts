import 'dotenv/config'
import express from 'express'
import cors from 'cors'
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

const app = express()
const PORT = Number(process.env.PORT ?? 3201)
const isProd = process.env.NODE_ENV === 'production'

const corsOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const localOriginRe = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    if (!isProd && localOriginRe.test(origin)) return callback(null, true)
    if (corsOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())

// Initialize DB on startup
const db = getDb()
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
if (process.env.RESET_SEED === 'true') {
  console.log('⚠ RESET_SEED=true — wiping and re-seeding the database')
  seedDatabase(true)
} else if (userCount.count === 0) {
  seedDatabase()
}

app.use('/api/auth',          authRouter)
app.use('/api/users',         usersRouter)
app.use('/api/properties',    propertiesRouter)
app.use('/api/bookings',      bookingsRouter)
app.use('/api/ledger',        ledgerRouter)
app.use('/api/households',    householdsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/waitlist',       waitlistRouter)
app.use('/api/admin',          adminRouter)
app.use('/api/uploads',        uploadsRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`✓ OKTE backend listening on http://localhost:${PORT}`)
})
