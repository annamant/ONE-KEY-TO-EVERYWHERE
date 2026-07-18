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
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = Number(process.env.PORT ?? 3001)

const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: corsOrigins, credentials: true }))
app.use(express.json())

// Initialize DB on startup
const db = getDb()
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
if (userCount.count === 0) {
  seedDatabase()
}

app.use('/api/auth',          authRouter)
app.use('/api/users',         usersRouter)
app.use('/api/properties',    propertiesRouter)
app.use('/api/bookings',      bookingsRouter)
app.use('/api/ledger',        ledgerRouter)
app.use('/api/households',    householdsRouter)
app.use('/api/notifications', notificationsRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`✓ OKTE backend listening on http://localhost:${PORT}`)
})
