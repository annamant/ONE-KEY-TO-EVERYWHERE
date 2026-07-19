/**
 * Production seed: admin owner + Ostuni properties.
 * Run with: npm run seed
 */
import 'dotenv/config'
import { getDb } from './connection'
import bcrypt from 'bcryptjs'
import { addDays, format } from 'date-fns'

const now = new Date()
const d = (offset: number) => format(addDays(now, offset), "yyyy-MM-dd'T'HH:mm:ss'Z'")

function adminPassword(): string {
  const fromEnv = process.env.SEED_ADMIN_PASSWORD?.trim()
  if (fromEnv) return fromEnv
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SEED_ADMIN_PASSWORD must be set when seeding in production')
  }
  // Dev-only default — never used when NODE_ENV=production
  return 'Password1234'
}

export function seedDatabase(reset = false): void {
  const db = getDb()
  const ADMIN_PASSWORD_HASH = bcrypt.hashSync(adminPassword(), 10)

  if (reset) {
    db.exec(`
      DELETE FROM invite_tokens;
      DELETE FROM password_reset_tokens;
      DELETE FROM booking_overrides;
      DELETE FROM property_review_notes;
      DELETE FROM notifications;
      DELETE FROM household_audit;
      DELETE FROM household_members;
      DELETE FROM households;
      DELETE FROM ledger_entries;
      DELETE FROM bookings;
      DELETE FROM properties;
      DELETE FROM settings;
      DELETE FROM users;
    `)
  }

  // ─── Users ────────────────────────────────────────────────────────────────────
  const insertUser = db.prepare(`
    INSERT INTO users (id,email,password_hash,first_name,last_name,role,status,email_verified_at,avatar_url,phone,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `)

  const admin = {
    id: 'user-anna',
    email: 'mantova.a@gmail.com',
    firstName: 'Anna',
    lastName: 'Mantova',
    role: 'admin',
    avatarUrl: 'https://i.pravatar.cc/150?u=anna',
    phone: '+39 080 555 0100',
    createdAt: d(-365),
    updatedAt: d(0),
  }

  insertUser.run(
    admin.id,
    admin.email,
    ADMIN_PASSWORD_HASH,
    admin.firstName,
    admin.lastName,
    admin.role,
    'active',
    d(0),
    admin.avatarUrl,
    admin.phone,
    admin.createdAt,
    admin.updatedAt,
  )

  // ─── Properties ────────────────────────────────────────────────────────────────
  const insertProp = db.prepare(`
    INSERT INTO properties (id,owner_id,title,slug,description,region,country,city,address,latitude,longitude,sleeps,bedrooms,bathrooms,min_stay,max_stay,tier,status,amenities,house_rules,cover_image,images,blackout_dates,listing_quality_score,total_bookings,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `)

  const properties = [
    {
      id: 'prop-villa-azzurra', ownerId: 'user-anna',
      title: 'Villa Azzurra — Ostuni Countryside', slug: 'villa-azzurra-ostuni',
      description: "A serene whitewashed villa nestled among ancient olive trees in the Ostuni countryside. The open-plan living area combines a fully equipped kitchen, dining space, and a comfortable sofa that converts to sleep two. One double bedroom and a full bathroom complete the indoor space, while a private terrace invites al fresco dining under the Puglian sun.",
      region: 'Puglia', country: 'Italy', city: 'Ostuni', address: 'Contrada Ostuni countryside, 72017 Ostuni BR',
      latitude: 40.7315, longitude: 17.5720, sleeps: 4, bedrooms: 1, bathrooms: 1,
      minStay: 2, maxStay: 30, tier: 'premium', status: 'approved',
      amenities: ['wifi', 'kitchen', 'terrace', 'olive_grove', 'garden', 'parking', 'outdoor_dining'],
      houseRules: ['No smoking indoors', 'Quiet hours after 23:00', 'Max 4 guests'],
      coverImage: '', images: [] as string[],
      blackoutDates: [] as string[], listingQualityScore: 88, totalBookings: 0, createdAt: d(-120), updatedAt: d(-2),
    },
    {
      id: 'prop-villa-gialla', ownerId: 'user-anna',
      title: 'Villa Gialla — Ostuni Countryside', slug: 'villa-gialla-ostuni',
      description: "Sister to Villa Azzurra, Villa Gialla offers the same thoughtful layout among the olive groves of the Ostuni countryside. An open-plan kitchen, dining and living area with a sofa bed (sleeps two) flows to a private terrace. One double bedroom and one bathroom make this a romantic retreat for couples or a small family.",
      region: 'Puglia', country: 'Italy', city: 'Ostuni', address: 'Contrada Ostuni countryside, 72017 Ostuni BR',
      latitude: 40.7325, longitude: 17.5680, sleeps: 4, bedrooms: 1, bathrooms: 1,
      minStay: 2, maxStay: 30, tier: 'premium', status: 'approved',
      amenities: ['wifi', 'kitchen', 'terrace', 'olive_grove', 'garden', 'parking', 'outdoor_dining'],
      houseRules: ['No smoking indoors', 'Quiet hours after 23:00', 'Max 4 guests'],
      coverImage: '', images: [] as string[],
      blackoutDates: [] as string[], listingQualityScore: 88, totalBookings: 0, createdAt: d(-118), updatedAt: d(-2),
    },
    {
      id: 'prop-trullo-g', ownerId: 'user-anna',
      title: 'Trullo G — Ostuni Countryside', slug: 'trullo-g-ostuni',
      description: "An authentic conical-roofed trullo restored with care, set deep in the Ostuni countryside. The single open-plan space holds a double bed, a small kitchenette, and a cosy seating area with a working fireplace. A bathroom is tucked into a side alcove. Outside, a large outdoor space with shaded seating and dining areas invites long Puglian evenings under the stars.",
      region: 'Puglia', country: 'Italy', city: 'Ostuni', address: 'Contrada Ostuni countryside, 72017 Ostuni BR',
      latitude: 40.7350, longitude: 17.5650, sleeps: 2, bedrooms: 1, bathrooms: 1,
      minStay: 2, maxStay: 21, tier: 'premium', status: 'approved',
      amenities: ['wifi', 'kitchen', 'fireplace', 'outdoor_dining', 'garden', 'olive_grove', 'parking'],
      houseRules: ['No smoking indoors', 'Respect the historic fabric of the trullo', 'Max 2 guests'],
      coverImage: '', images: [] as string[],
      blackoutDates: [] as string[], listingQualityScore: 90, totalBookings: 0, createdAt: d(-110), updatedAt: d(-3),
    },
    {
      id: 'prop-villa-rossa', ownerId: 'user-anna',
      title: 'Villa Rossa — Trullo e Lamia, Ostuni Countryside', slug: 'villa-rossa-ostuni',
      description: "A characterful complex of three cones (trullo) joined to a lamia, set in extensive grounds in the Ostuni countryside. Two bedrooms and two bathrooms accommodate guests, while a dedicated dining room, open-plan kitchen with fireplace, and a sofa area (sofa sleeps two additional guests) provide generous living space. A covered outdoor terrace and large front patio create seamless indoor-outdoor living.",
      region: 'Puglia', country: 'Italy', city: 'Ostuni', address: 'Contrada Ostuni countryside, 72017 Ostuni BR',
      latitude: 40.7280, longitude: 17.5750, sleeps: 6, bedrooms: 2, bathrooms: 2,
      minStay: 3, maxStay: 30, tier: 'luxury', status: 'approved',
      amenities: ['wifi', 'kitchen', 'fireplace', 'terrace', 'patio', 'garden', 'olive_grove', 'parking', 'outdoor_dining'],
      houseRules: ['No smoking indoors', 'Quiet hours after 23:00', 'Max 6 guests'],
      coverImage: '', images: [] as string[],
      blackoutDates: [] as string[], listingQualityScore: 94, totalBookings: 0, createdAt: d(-100), updatedAt: d(-1),
    },
    {
      id: 'prop-casa-centro', ownerId: 'user-anna',
      title: 'Casa Centro — Ostuni Old Town', slug: 'casa-centro-ostuni',
      description: "A characterful apartment in the heart of Ostuni's white-walled old town, within walking distance of the panoramic views and the main square. The main floor features two double bedrooms, a bathroom, and an open-plan kitchen, dining and sofa area. A separate lower-floor unit with its own private entrance adds a third bedroom and second bathroom, ideal for extended families or two couples travelling together. A back patio offers a quiet outdoor retreat.",
      region: 'Puglia', country: 'Italy', city: 'Ostuni', address: 'Centro Storico, 72017 Ostuni BR',
      latitude: 40.7286, longitude: 17.5874, sleeps: 6, bedrooms: 3, bathrooms: 2,
      minStay: 2, maxStay: 21, tier: 'premium', status: 'approved',
      amenities: ['wifi', 'kitchen', 'historic_centre', 'patio', 'walking_distance_centre', 'terrace'],
      houseRules: ['No smoking', 'Respect the neighbours', 'Max 6 guests'],
      coverImage: '', images: [] as string[],
      blackoutDates: [] as string[], listingQualityScore: 92, totalBookings: 0, createdAt: d(-90), updatedAt: d(-1),
    },
  ]

  for (const p of properties) {
    insertProp.run(
      p.id, p.ownerId, p.title, p.slug, p.description, p.region, p.country, p.city, p.address,
      p.latitude, p.longitude, p.sleeps, p.bedrooms, p.bathrooms, p.minStay, p.maxStay,
      p.tier, p.status,
      JSON.stringify(p.amenities), JSON.stringify(p.houseRules),
      p.coverImage, JSON.stringify(p.images), JSON.stringify(p.blackoutDates),
      p.listingQualityScore, p.totalBookings, p.createdAt, p.updatedAt,
    )
  }

  console.log('✓ Database seeded successfully')
  console.log(`  → 1 admin user (${admin.email})`)
  console.log(`  → ${properties.length} properties`)
  if (process.env.NODE_ENV !== 'production' && !process.env.SEED_ADMIN_PASSWORD) {
    console.log('  → Dev admin password: Password1234 (set SEED_ADMIN_PASSWORD to override)')
  }
}

if (require.main === module) {
  seedDatabase(true)
}
