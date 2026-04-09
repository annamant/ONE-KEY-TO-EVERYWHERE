import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { getDb } from './db/connection'
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

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Initialize DB on startup
getDb()

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
