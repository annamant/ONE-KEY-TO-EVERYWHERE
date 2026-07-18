/**
 * Seeds the SQLite database with data mirroring the frontend mock data.
 * Run with: npm run seed
 */
import 'dotenv/config'
import { getDb } from './connection'
import bcrypt from 'bcryptjs'
import { addDays, subDays, format } from 'date-fns'

const now = new Date()
const d  = (offset: number) => format(addDays(now, offset), "yyyy-MM-dd'T'HH:mm:ss'Z'")
const ds = (offset: number) => format(addDays(now, offset), 'yyyy-MM-dd')

const DEMO_PASSWORD_HASH = bcrypt.hashSync('demo', 10)
const OWNER_PASSWORD_HASH = bcrypt.hashSync('Password1234', 10)

export function seedDatabase(reset = false): void {
  const db = getDb()

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
  INSERT INTO users (id,email,password_hash,first_name,last_name,role,status,avatar_url,phone,created_at,updated_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?)
`)

const users = [
  { id:'user-alice', email:'alice@demo.com', firstName:'Alice',    lastName:'Moretti',  role:'member', avatarUrl:'https://i.pravatar.cc/150?u=alice', phone:'+39 080 555 0101', createdAt: d(-180), updatedAt: d(-10) },
  { id:'user-bob',   email:'bob@demo.com',   firstName:'Roberto',  lastName:'De Luca',  role:'member', avatarUrl:'https://i.pravatar.cc/150?u=bob',   phone:'+39 080 555 0102', createdAt: d(-160), updatedAt: d(-5) },
  { id:'user-anna',  email:'mantova.a2@gmail.com', firstName:'Anna', lastName:'Mantova', role:'owner', avatarUrl:'https://i.pravatar.cc/150?u=anna',  phone:'+39 080 555 0100', createdAt: d(-365), updatedAt: d(0) },
  { id:'user-eve',   email:'eve@demo.com',   firstName:'Eva',      lastName:'Romano',   role:'admin',  avatarUrl:'https://i.pravatar.cc/150?u=eve',    phone:null,                createdAt: d(-365), updatedAt: d(0) },
]

for (const u of users) {
  const hash = u.id === 'user-anna' ? OWNER_PASSWORD_HASH : DEMO_PASSWORD_HASH
  insertUser.run(u.id, u.email, hash, u.firstName, u.lastName, u.role, 'active', u.avatarUrl ?? null, u.phone ?? null, u.createdAt, u.updatedAt)
}

// ─── Properties ────────────────────────────────────────────────────────────────
const insertProp = db.prepare(`
  INSERT INTO properties (id,owner_id,title,slug,description,region,country,city,address,latitude,longitude,sleeps,bedrooms,bathrooms,keys_per_night,min_stay,max_stay,tier,status,amenities,house_rules,cover_image,images,blackout_dates,listing_quality_score,total_bookings,created_at,updated_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`)

const properties = [
  {
    id:'prop-villa-azzurra', ownerId:'user-anna',
    title:'Villa Azzurra — Ostuni Countryside', slug:'villa-azzurra-ostuni',
    description:"A serene whitewashed villa nestled among ancient olive trees in the Ostuni countryside. The open-plan living area combines a fully equipped kitchen, dining space, and a comfortable sofa that converts to sleep two. One double bedroom and a full bathroom complete the indoor space, while a private terrace invites al fresco dining under the Puglian sun.",
    region:'Puglia', country:'Italy', city:'Ostuni', address:'Contrada Ostuni countryside, 72017 Ostuni BR',
    latitude:40.7315, longitude:17.5720, sleeps:4, bedrooms:1, bathrooms:1, keysPerNight:5,
    minStay:2, maxStay:30, tier:'premium', status:'approved',
    amenities:['wifi','kitchen','terrace','olive_grove','garden','parking','outdoor_dining'],
    houseRules:['No smoking indoors','Quiet hours after 23:00','Max 4 guests'],
    coverImage:'', images:[],
    blackoutDates:[], listingQualityScore:88, totalBookings:0, createdAt:d(-120), updatedAt:d(-2),
  },
  {
    id:'prop-villa-gialla', ownerId:'user-anna',
    title:'Villa Gialla — Ostuni Countryside', slug:'villa-gialla-ostuni',
    description:"Sister to Villa Azzurra, Villa Gialla offers the same thoughtful layout among the olive groves of the Ostuni countryside. An open-plan kitchen, dining and living area with a sofa bed (sleeps two) flows to a private terrace. One double bedroom and one bathroom make this a romantic retreat for couples or a small family.",
    region:'Puglia', country:'Italy', city:'Ostuni', address:'Contrada Ostuni countryside, 72017 Ostuni BR',
    latitude:40.7325, longitude:17.5680, sleeps:4, bedrooms:1, bathrooms:1, keysPerNight:5,
    minStay:2, maxStay:30, tier:'premium', status:'approved',
    amenities:['wifi','kitchen','terrace','olive_grove','garden','parking','outdoor_dining'],
    houseRules:['No smoking indoors','Quiet hours after 23:00','Max 4 guests'],
    coverImage:'', images:[],
    blackoutDates:[], listingQualityScore:88, totalBookings:0, createdAt:d(-118), updatedAt:d(-2),
  },
  {
    id:'prop-trullo-g', ownerId:'user-anna',
    title:'Trullo G — Ostuni Countryside', slug:'trullo-g-ostuni',
    description:"An authentic conical-roofed trullo restored with care, set deep in the Ostuni countryside. The single open-plan space holds a double bed, a small kitchenette, and a cosy seating area with a working fireplace. A bathroom is tucked into a side alcove. Outside, a large outdoor space with shaded seating and dining areas invites long Puglian evenings under the stars.",
    region:'Puglia', country:'Italy', city:'Ostuni', address:'Contrada Ostuni countryside, 72017 Ostuni BR',
    latitude:40.7350, longitude:17.5650, sleeps:2, bedrooms:1, bathrooms:1, keysPerNight:5,
    minStay:2, maxStay:21, tier:'premium', status:'approved',
    amenities:['wifi','kitchen','fireplace','outdoor_dining','garden','olive_grove','parking'],
    houseRules:['No smoking indoors','Respect the historic fabric of the trullo','Max 2 guests'],
    coverImage:'', images:[],
    blackoutDates:[], listingQualityScore:90, totalBookings:0, createdAt:d(-110), updatedAt:d(-3),
  },
  {
    id:'prop-villa-rossa', ownerId:'user-anna',
    title:'Villa Rossa — Trullo e Lamia, Ostuni Countryside', slug:'villa-rossa-ostuni',
    description:"A characterful complex of three cones (trullo) joined to a lamia, set in extensive grounds in the Ostuni countryside. Two bedrooms and two bathrooms accommodate guests, while a dedicated dining room, open-plan kitchen with fireplace, and a sofa area (sofa sleeps two additional guests) provide generous living space. A covered outdoor terrace and large front patio create seamless indoor-outdoor living.",
    region:'Puglia', country:'Italy', city:'Ostuni', address:'Contrada Ostuni countryside, 72017 Ostuni BR',
    latitude:40.7280, longitude:17.5750, sleeps:6, bedrooms:2, bathrooms:2, keysPerNight:7,
    minStay:3, maxStay:30, tier:'luxury', status:'approved',
    amenities:['wifi','kitchen','fireplace','terrace','patio','garden','olive_grove','parking','outdoor_dining'],
    houseRules:['No smoking indoors','Quiet hours after 23:00','Max 6 guests'],
    coverImage:'', images:[],
    blackoutDates:[], listingQualityScore:94, totalBookings:0, createdAt:d(-100), updatedAt:d(-1),
  },
  {
    id:'prop-casa-centro', ownerId:'user-anna',
    title:'Casa Centro — Ostuni Old Town', slug:'casa-centro-ostuni',
    description:"A characterful apartment in the heart of Ostuni's white-walled old town, within walking distance of the panoramic views and the main square. The main floor features two double bedrooms, a bathroom, and an open-plan kitchen, dining and sofa area. A separate lower-floor unit with its own private entrance adds a third bedroom and second bathroom, ideal for extended families or two couples travelling together. A back patio offers a quiet outdoor retreat.",
    region:'Puglia', country:'Italy', city:'Ostuni', address:'Centro Storico, 72017 Ostuni BR',
    latitude:40.7286, longitude:17.5874, sleeps:6, bedrooms:3, bathrooms:2, keysPerNight:6,
    minStay:2, maxStay:21, tier:'premium', status:'approved',
    amenities:['wifi','kitchen','historic_centre','patio','walking_distance_centre','terrace'],
    houseRules:['No smoking','Respect the neighbours','Max 6 guests'],
    coverImage:'', images:[],
    blackoutDates:[], listingQualityScore:92, totalBookings:0, createdAt:d(-90), updatedAt:d(-1),
  },
]

for (const p of properties) {
  insertProp.run(
    p.id, p.ownerId, p.title, p.slug, p.description, p.region, p.country, p.city, p.address,
    p.latitude, p.longitude, p.sleeps, p.bedrooms, p.bathrooms, p.keysPerNight, p.minStay, p.maxStay,
    p.tier, p.status,
    JSON.stringify(p.amenities), JSON.stringify(p.houseRules),
    p.coverImage, JSON.stringify(p.images), JSON.stringify(p.blackoutDates),
    p.listingQualityScore, p.totalBookings, p.createdAt, p.updatedAt
  )
}

// ─── Bookings ──────────────────────────────────────────────────────────────────
const insertBooking = db.prepare(`
  INSERT INTO bookings (id,member_id,property_id,household_id,check_in,check_out,nights,guests,keys_charged,status,cancellation_reason,cancelled_at,confirmed_at,created_at,updated_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`)

const bookings = [
  { id:'booking-1', memberId:'user-alice', propertyId:'prop-villa-azzurra', householdId:'household-puglia', checkIn:ds(14), checkOut:ds(21), nights:7, guests:4, keysCharged:35, status:'confirmed', cancellationReason:null, cancelledAt:null, confirmedAt:d(-2), createdAt:d(-3), updatedAt:d(-2) },
  { id:'booking-2', memberId:'user-alice', propertyId:'prop-trullo-g',       householdId:null,               checkIn:ds(60), checkOut:ds(64), nights:4, guests:2, keysCharged:20, status:'confirmed', cancellationReason:null, cancelledAt:null, confirmedAt:d(-1), createdAt:d(-1), updatedAt:d(-1) },
  { id:'booking-3', memberId:'user-alice', propertyId:'prop-casa-centro',    householdId:null,               checkIn:format(subDays(now,3),'yyyy-MM-dd'), checkOut:format(addDays(now,4),'yyyy-MM-dd'), nights:7, guests:4, keysCharged:42, status:'active', cancellationReason:null, cancelledAt:null, confirmedAt:d(-10), createdAt:d(-10), updatedAt:d(-3) },
  { id:'booking-4', memberId:'user-alice', propertyId:'prop-villa-rossa',   householdId:null,               checkIn:ds(-45), checkOut:ds(-41), nights:4, guests:4, keysCharged:28, status:'cancelled', cancellationReason:'Change of plans', cancelledAt:d(-48), confirmedAt:d(-50), createdAt:d(-50), updatedAt:d(-48) },
  { id:'booking-5', memberId:'user-bob',   propertyId:'prop-villa-gialla',  householdId:null,               checkIn:ds(30),  checkOut:ds(37),  nights:7, guests:3, keysCharged:35, status:'confirmed', cancellationReason:null, cancelledAt:null, confirmedAt:d(-5), createdAt:d(-5), updatedAt:d(-5) },
]

for (const b of bookings) {
  insertBooking.run(b.id, b.memberId, b.propertyId, b.householdId, b.checkIn, b.checkOut, b.nights, b.guests, b.keysCharged, b.status, b.cancellationReason, b.cancelledAt, b.confirmedAt, b.createdAt, b.updatedAt)
}

// ─── Ledger ────────────────────────────────────────────────────────────────────
const insertLedger = db.prepare(`
  INSERT INTO ledger_entries (id,user_id,type,amount,balance_after,description,booking_id,admin_id,admin_note,created_at)
  VALUES (?,?,?,?,?,?,?,?,?,?)
`)

const ledger = [
  { id:'ledger-1',  userId:'user-alice', type:'membership_credit',  amount:100,  balanceAfter:100,  description:'Welcome to the Club — activation credit',    bookingId:null,      adminId:null,       adminNote:null,                                createdAt:d(-180) },
  { id:'ledger-2',  userId:'user-alice', type:'package_credit',     amount:100,  balanceAfter:200,  description:'Key bundle: 100 keys',                        bookingId:null,      adminId:null,       adminNote:null,                                createdAt:d(-170) },
  { id:'ledger-3',  userId:'user-alice', type:'booking_debit',      amount:-28,  balanceAfter:172,  description:'Villa Rossa Ostuni — 4 days',               bookingId:'booking-4', adminId:null,     adminNote:null,                                createdAt:d(-50) },
  { id:'ledger-4',  userId:'user-alice', type:'cancellation_refund', amount:28,  balanceAfter:200,  description:'Refund: cancellation of Villa Rossa',         bookingId:'booking-4', adminId:null,     adminNote:null,                                createdAt:d(-48) },
  { id:'ledger-5',  userId:'user-alice', type:'package_credit',     amount:50,   balanceAfter:250,  description:'Key bundle: 50 keys',                         bookingId:null,      adminId:null,       adminNote:null,                                createdAt:d(-30) },
  { id:'ledger-6',  userId:'user-alice', type:'admin_correction',   amount:20,   balanceAfter:270,  description:'Courtesy credit — technical disruption',      bookingId:null,      adminId:'user-eve', adminNote:'Compensation for system outage on 15 Dec', createdAt:d(-20) },
  { id:'ledger-7',  userId:'user-alice', type:'booking_debit',      amount:-42,  balanceAfter:228,  description:'Casa Centro Ostuni — 7 days',                bookingId:'booking-3', adminId:null,     adminNote:null,                                createdAt:d(-10) },
  { id:'ledger-8',  userId:'user-alice', type:'booking_debit',      amount:-35,  balanceAfter:193,  description:'Villa Azzurra Ostuni — 7 days',              bookingId:'booking-1', adminId:null,     adminNote:null,                                createdAt:d(-3) },
  { id:'ledger-9',  userId:'user-alice', type:'booking_debit',      amount:-20,  balanceAfter:173,  description:'Trullo G Ostuni — 4 days',                   bookingId:'booking-2', adminId:null,     adminNote:null,                                createdAt:d(-1) },
  { id:'ledger-10', userId:'user-bob',   type:'membership_credit',  amount:50,   balanceAfter:50,   description:'Welcome to the Club — activation credit',     bookingId:null,      adminId:null,       adminNote:null,                                createdAt:d(-160) },
  { id:'ledger-11', userId:'user-bob',   type:'package_credit',     amount:50,   balanceAfter:100,  description:'Key bundle: 50 keys',                         bookingId:null,      adminId:null,       adminNote:null,                                createdAt:d(-30) },
  { id:'ledger-12', userId:'user-bob',   type:'booking_debit',      amount:-35,  balanceAfter:65,   description:'Villa Gialla Ostuni — 7 days',               bookingId:'booking-5', adminId:null,     adminNote:null,                                createdAt:d(-5) },
]

for (const e of ledger) {
  insertLedger.run(e.id, e.userId, e.type, e.amount, e.balanceAfter, e.description, e.bookingId, e.adminId, e.adminNote, e.createdAt)
}

// ─── Household ────────────────────────────────────────────────────────────────
db.prepare(`INSERT INTO households (id,name,owner_id,created_at,updated_at) VALUES (?,?,?,?,?)`).run(
  'household-puglia', 'Moretti Household', 'user-alice', d(-180), d(-150)
)
db.prepare(`INSERT INTO household_members (household_id,user_id,role,status,joined_at) VALUES (?,?,?,?,?)`).run(
  'household-puglia','user-alice','Manager','active',d(-180)
)
db.prepare(`INSERT INTO household_members (household_id,user_id,role,status,joined_at) VALUES (?,?,?,?,?)`).run(
  'household-puglia','user-bob','Booker','active',d(-150)
)

const auditRows = [
  { id:'audit-1', householdId:'household-puglia', actorId:'user-alice', targetId:null, action:'household_created', detail:'Alice created the household "Moretti Household"', createdAt:d(-180) },
  { id:'audit-2', householdId:'household-puglia', actorId:'user-alice', targetId:'user-bob', action:'member_invited',  detail:'Alice invited bob@demo.com as Booker', createdAt:d(-155) },
  { id:'audit-3', householdId:'household-puglia', actorId:'user-bob',   targetId:null, action:'member_joined',  detail:'Roberto joined the household', createdAt:d(-150) },
  { id:'audit-4', householdId:'household-puglia', actorId:'user-alice', targetId:null, action:'booking_made',   detail:'Alice accessed Villa Azzurra Ostuni (14–21 Jul)', createdAt:d(-3) },
]
const insertAudit = db.prepare(`INSERT INTO household_audit (id,household_id,actor_id,target_id,action,detail,created_at) VALUES (?,?,?,?,?,?,?)`)
for (const a of auditRows) {
  insertAudit.run(a.id, a.householdId, a.actorId, a.targetId, a.action, a.detail, a.createdAt)
}

// ─── Notifications ────────────────────────────────────────────────────────────
const insertNotif = db.prepare(`INSERT INTO notifications (id,user_id,type,title,body,read,link,created_at) VALUES (?,?,?,?,?,?,?,?)`)

const notifications = [
  { id:'notif-1', userId:'user-alice', type:'booking_confirmed',  title:'Access confirmed',          body:'Your access to Villa Azzurra Ostuni (14–21 Jul) is confirmed.',  read:0, link:'/member/bookings/booking-1', createdAt:d(-2) },
  { id:'notif-2', userId:'user-alice', type:'keys_credited',      title:'20 keys added',             body:'You have received 20 courtesy keys from the Club team.',           read:0, link:'/member/wallet',             createdAt:d(-20) },
  { id:'notif-3', userId:'user-alice', type:'household_invite',   title:'Roberto joined your household', body:'Roberto De Luca accepted your invitation.',                   read:1, link:'/member/household',          createdAt:d(-150) },
  { id:'notif-4', userId:'user-bob',   type:'booking_confirmed',  title:'Access confirmed',          body:'Your access to Villa Gialla Ostuni is confirmed.',                read:0, link:'/member/bookings/booking-5', createdAt:d(-5) },
  { id:'notif-5', userId:'user-anna',  type:'reservation_received', title:'New access confirmed',    body:'Alice Moretti will access Villa Azzurra Ostuni from 14 to 21 July.', read:0, link:'/owner/reservations/booking-1', createdAt:d(-3) },
  { id:'notif-6', userId:'user-anna',  type:'property_approved',  title:'Home approved',             body:'Casa Centro — Ostuni Old Town is now active in the Club.',        read:1, link:'/owner/properties',          createdAt:d(-90) },
  { id:'notif-7', userId:'user-eve',   type:'admin_alert',        title:'New home pending review',   body:'A new property has been submitted for review.',                   read:0, link:'/admin/properties',          createdAt:d(-1) },
]

for (const n of notifications) {
  insertNotif.run(n.id, n.userId, n.type, n.title, n.body, n.read, n.link, n.createdAt)
}

console.log('✓ Database seeded successfully')
console.log(`  → ${users.length} users`)
console.log(`  → ${properties.length} properties`)
console.log(`  → ${bookings.length} bookings`)
console.log(`  → ${ledger.length} ledger entries`)
console.log(`  → 1 household`)
console.log(`  → ${notifications.length} notifications`)
}

if (require.main === module) {
  seedDatabase(true)
}
