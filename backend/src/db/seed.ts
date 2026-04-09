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

const db = getDb()

// Wipe existing data
db.exec(`
  DELETE FROM invite_tokens;
  DELETE FROM notifications;
  DELETE FROM household_audit;
  DELETE FROM household_members;
  DELETE FROM households;
  DELETE FROM ledger_entries;
  DELETE FROM bookings;
  DELETE FROM properties;
  DELETE FROM users;
`)

// ─── Users ────────────────────────────────────────────────────────────────────
const insertUser = db.prepare(`
  INSERT INTO users (id,email,password_hash,first_name,last_name,role,status,avatar_url,phone,created_at,updated_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?)
`)

const users = [
  { id:'user-alice', email:'alice@demo.com', firstName:'Alice',    lastName:'Moretti',  role:'member', avatarUrl:'https://i.pravatar.cc/150?u=alice', phone:'+39 080 555 0101', createdAt: d(-180), updatedAt: d(-10) },
  { id:'user-bob',   email:'bob@demo.com',   firstName:'Roberto',  lastName:'De Luca',  role:'member', avatarUrl:'https://i.pravatar.cc/150?u=bob',   phone:'+39 080 555 0102', createdAt: d(-160), updatedAt: d(-5) },
  { id:'user-carol', email:'carol@demo.com', firstName:'Carolina', lastName:'Venezia',  role:'owner',  avatarUrl:'https://i.pravatar.cc/150?u=carol',  phone:'+39 080 555 0103', createdAt: d(-200), updatedAt: d(-2) },
  { id:'user-dave',  email:'dave@demo.com',  firstName:'Davide',   lastName:'Santoro',  role:'owner',  avatarUrl:'https://i.pravatar.cc/150?u=dave',   phone:'+39 080 555 0104', createdAt: d(-150), updatedAt: d(-1) },
  { id:'user-eve',   email:'eve@demo.com',   firstName:'Eva',      lastName:'Romano',   role:'admin',  avatarUrl:'https://i.pravatar.cc/150?u=eve',    phone:null,                createdAt: d(-365), updatedAt: d(0) },
]

for (const u of users) {
  insertUser.run(u.id, u.email, DEMO_PASSWORD_HASH, u.firstName, u.lastName, u.role, 'active', u.avatarUrl ?? null, u.phone ?? null, u.createdAt, u.updatedAt)
}

// ─── Properties ────────────────────────────────────────────────────────────────
const insertProp = db.prepare(`
  INSERT INTO properties (id,owner_id,title,slug,description,region,country,city,address,latitude,longitude,sleeps,bedrooms,bathrooms,keys_per_night,min_stay,max_stay,tier,status,amenities,house_rules,cover_image,images,blackout_dates,listing_quality_score,total_bookings,created_at,updated_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`)

const properties = [
  {
    id:'prop-trullo-itria', ownerId:'user-carol',
    title:"Trullo in the Heart of Valle d'Itria", slug:'trullo-valle-itria',
    description:"An authentic 1800s trullo fully restored and set among centuries-old olive trees in the Valle d'Itria.",
    region:'Puglia', country:'Italy', city:'Alberobello', address:'Contrada Popoleto, 70011 Alberobello BA',
    latitude:40.7851, longitude:17.2350, sleeps:4, bedrooms:2, bathrooms:1, keysPerNight:4,
    minStay:3, maxStay:30, tier:'premium', status:'approved',
    amenities:['pool','wifi','parking','kitchen','garden','olive_grove','fireplace'],
    houseRules:['Quiet hours after 22:00','No smoking','No pets'],
    coverImage:'https://picsum.photos/seed/trullo-itria/800/600',
    images:['https://picsum.photos/seed/trullo-itria/800/600','https://picsum.photos/seed/trullo-itria-2/800/600','https://picsum.photos/seed/trullo-itria-3/800/600'],
    blackoutDates:[ds(10),ds(11),ds(12)], listingQualityScore:97, totalBookings:18, createdAt:d(-200), updatedAt:d(-5),
  },
  {
    id:'prop-masseria-ostuni', ownerId:'user-carol',
    title:'Masseria Bianca — Ostuni', slug:'masseria-ostuni',
    description:"A tastefully restored 18th-century masseria 5 km from the White City.",
    region:'Puglia', country:'Italy', city:'Ostuni', address:'Contrada Monticello, 72017 Ostuni BR',
    latitude:40.7280, longitude:17.5750, sleeps:8, bedrooms:4, bathrooms:3, keysPerNight:7,
    minStay:4, maxStay:30, tier:'luxury', status:'approved',
    amenities:['pool','wifi','parking','kitchen','olive_grove','cooking_class','garden','fireplace'],
    houseRules:['No smoking indoors','Quiet hours 23:00–08:00','Max 8 guests'],
    coverImage:'https://picsum.photos/seed/masseria-ostuni/800/600',
    images:['https://picsum.photos/seed/masseria-ostuni/800/600','https://picsum.photos/seed/masseria-ostuni-2/800/600','https://picsum.photos/seed/masseria-ostuni-3/800/600','https://picsum.photos/seed/masseria-ostuni-4/800/600'],
    blackoutDates:[ds(20),ds(21),ds(22),ds(30),ds(31)], listingQualityScore:99, totalBookings:24, createdAt:d(-190), updatedAt:d(-3),
  },
  {
    id:'prop-polignano', ownerId:'user-dave',
    title:'Casa sul Mare — Polignano a Mare', slug:'casa-polignano',
    description:'An apartment carved from a 19th-century palazzo perched on the headland of Polignano a Mare.',
    region:'Puglia', country:'Italy', city:'Polignano a Mare', address:'Via Porto, 70044 Polignano a Mare BA',
    latitude:40.9988, longitude:17.2183, sleeps:4, bedrooms:2, bathrooms:1, keysPerNight:5,
    minStay:2, maxStay:14, tier:'premium', status:'approved',
    amenities:['sea_view','wifi','kitchen','terrace','beach_access'],
    houseRules:['No smoking','No parties','Shoes off at entrance'],
    coverImage:'https://picsum.photos/seed/polignano-mare/800/600',
    images:['https://picsum.photos/seed/polignano-mare/800/600','https://picsum.photos/seed/polignano-mare-2/800/600','https://picsum.photos/seed/polignano-mare-3/800/600'],
    blackoutDates:[ds(5),ds(6)], listingQualityScore:94, totalBookings:31, createdAt:d(-150), updatedAt:d(-7),
  },
  {
    id:'prop-palazzo-lecce', ownerId:'user-dave',
    title:'Palazzo Barocco — Centro Storico di Lecce', slug:'palazzo-lecce',
    description:"A 17th-century baroque palazzo in the heart of Lecce, the 'Florence of the South'.",
    region:'Puglia', country:'Italy', city:'Lecce', address:'Via degli Ammirati 14, 73100 Lecce LE',
    latitude:40.3519, longitude:18.1750, sleeps:6, bedrooms:3, bathrooms:2, keysPerNight:6,
    minStay:2, maxStay:21, tier:'luxury', status:'approved',
    amenities:['wifi','kitchen','courtyard','fireplace','historic_centre','rooftop'],
    houseRules:['No smoking','Respect the neighbours','Max 6 guests'],
    coverImage:'https://picsum.photos/seed/palazzo-lecce/800/600',
    images:['https://picsum.photos/seed/palazzo-lecce/800/600','https://picsum.photos/seed/palazzo-lecce-2/800/600'],
    blackoutDates:[], listingQualityScore:96, totalBookings:22, createdAt:d(-120), updatedAt:d(-1),
  },
  {
    id:'prop-torre-otranto', ownerId:'user-carol',
    title:'Torre Costiera — Otranto', slug:'torre-otranto',
    description:'A 15th-century Aragonese watchtower converted into a characterful residence.',
    region:'Puglia', country:'Italy', city:'Otranto', address:'Litoranea per Santa Cesarea, 73028 Otranto LE',
    latitude:40.1467, longitude:18.4928, sleeps:4, bedrooms:2, bathrooms:2, keysPerNight:8,
    minStay:3, maxStay:21, tier:'luxury', status:'approved',
    amenities:['sea_view','wifi','kitchen','private_cove','terrace','historic'],
    houseRules:['No smoking','No parties','Sea access at own risk'],
    coverImage:'https://picsum.photos/seed/torre-otranto/800/600',
    images:['https://picsum.photos/seed/torre-otranto/800/600','https://picsum.photos/seed/torre-otranto-2/800/600','https://picsum.photos/seed/torre-otranto-3/800/600'],
    blackoutDates:[ds(25),ds(26),ds(27)], listingQualityScore:98, totalBookings:11, createdAt:d(-100), updatedAt:d(-2),
  },
  {
    id:'prop-masseria-fasano', ownerId:'user-dave',
    title:'Dammuso — Campagna di Fasano', slug:'dammuso-fasano',
    description:'A local-stone farmhouse nestled among vineyards and olive groves a few kilometres from Fasano.',
    region:'Puglia', country:'Italy', city:'Fasano', address:'Contrada Lamacavallo, 72015 Fasano BR',
    latitude:40.8334, longitude:17.3598, sleeps:6, bedrooms:3, bathrooms:2, keysPerNight:4,
    minStay:3, maxStay:30, tier:'premium', status:'approved',
    amenities:['pool','wifi','parking','kitchen','vineyard','olive_grove','garden'],
    houseRules:['No smoking indoors','Pets welcome in the garden','Quiet after 22:00'],
    coverImage:'https://picsum.photos/seed/dammuso-fasano/800/600',
    images:['https://picsum.photos/seed/dammuso-fasano/800/600','https://picsum.photos/seed/dammuso-fasano-2/800/600','https://picsum.photos/seed/dammuso-fasano-3/800/600'],
    blackoutDates:[ds(8),ds(9)], listingQualityScore:91, totalBookings:14, createdAt:d(-140), updatedAt:d(-6),
  },
  {
    id:'prop-farmhouse-martina', ownerId:'user-carol',
    title:'Hypogean Oil Mill — Martina Franca', slug:'frantoio-martina-franca',
    description:'An ancient hypogean oil mill transformed into a one-of-a-kind residence on the outskirts of Martina Franca.',
    region:'Puglia', country:'Italy', city:'Martina Franca', address:'Contrada Carmine, 74015 Martina Franca TA',
    latitude:40.7012, longitude:17.3355, sleeps:6, bedrooms:3, bathrooms:2, keysPerNight:5,
    minStay:3, maxStay:21, tier:'premium', status:'approved',
    amenities:['pool','wifi','parking','kitchen','olive_grove','wine_cellar','garden'],
    houseRules:['No smoking','Respect the historic fabric of the building','Max 6 guests'],
    coverImage:'https://picsum.photos/seed/frantoio-martina/800/600',
    images:['https://picsum.photos/seed/frantoio-martina/800/600','https://picsum.photos/seed/frantoio-martina-2/800/600'],
    blackoutDates:[ds(15),ds(16)], listingQualityScore:93, totalBookings:9, createdAt:d(-80), updatedAt:d(-4),
  },
  {
    id:'prop-gargano-villa', ownerId:'user-dave',
    title:'Villa on the Gargano — Vieste', slug:'villa-gargano-vieste',
    description:'A private villa on the Gargano headland with direct access to a white-sand beach.',
    region:'Puglia', country:'Italy', city:'Vieste', address:'Litoranea Vieste–Peschici Km 12, 71019 Vieste FG',
    latitude:41.8820, longitude:16.1760, sleeps:8, bedrooms:4, bathrooms:3, keysPerNight:7,
    minStay:5, maxStay:30, tier:'luxury', status:'pending_approval',
    amenities:['beach_access','pool','wifi','parking','kitchen','garden','sea_view'],
    houseRules:['No smoking','No parties','Respect the national park environment'],
    coverImage:'https://picsum.photos/seed/villa-gargano/800/600',
    images:['https://picsum.photos/seed/villa-gargano/800/600','https://picsum.photos/seed/villa-gargano-2/800/600','https://picsum.photos/seed/villa-gargano-3/800/600'],
    blackoutDates:[], listingQualityScore:88, totalBookings:0, createdAt:d(-10), updatedAt:d(-1),
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
  { id:'booking-1', memberId:'user-alice', propertyId:'prop-masseria-ostuni', householdId:'household-puglia', checkIn:ds(14), checkOut:ds(21), nights:7, guests:4, keysCharged:49, status:'confirmed', cancellationReason:null, cancelledAt:null, confirmedAt:d(-2), createdAt:d(-3), updatedAt:d(-2) },
  { id:'booking-2', memberId:'user-alice', propertyId:'prop-trullo-itria',    householdId:null,               checkIn:ds(60), checkOut:ds(64), nights:4, guests:2, keysCharged:16, status:'confirmed', cancellationReason:null, cancelledAt:null, confirmedAt:d(-1), createdAt:d(-1), updatedAt:d(-1) },
  { id:'booking-3', memberId:'user-alice', propertyId:'prop-polignano',        householdId:null,               checkIn:format(subDays(now,3),'yyyy-MM-dd'), checkOut:format(addDays(now,4),'yyyy-MM-dd'), nights:7, guests:2, keysCharged:35, status:'active', cancellationReason:null, cancelledAt:null, confirmedAt:d(-10), createdAt:d(-10), updatedAt:d(-3) },
  { id:'booking-4', memberId:'user-alice', propertyId:'prop-palazzo-lecce',    householdId:null,               checkIn:ds(-45), checkOut:ds(-41), nights:4, guests:4, keysCharged:24, status:'cancelled', cancellationReason:'Change of plans', cancelledAt:d(-48), confirmedAt:d(-50), createdAt:d(-50), updatedAt:d(-48) },
  { id:'booking-5', memberId:'user-bob',   propertyId:'prop-masseria-fasano',  householdId:null,               checkIn:ds(30),  checkOut:ds(37),  nights:7, guests:3, keysCharged:28, status:'confirmed', cancellationReason:null, cancelledAt:null, confirmedAt:d(-5), createdAt:d(-5), updatedAt:d(-5) },
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
  { id:'ledger-3',  userId:'user-alice', type:'booking_debit',      amount:-24,  balanceAfter:176,  description:'Baroque Palazzo Lecce — 4 nights',            bookingId:'booking-4', adminId:null,     adminNote:null,                                createdAt:d(-50) },
  { id:'ledger-4',  userId:'user-alice', type:'cancellation_refund', amount:24,  balanceAfter:200,  description:'Refund: cancellation of Palazzo Lecce',       bookingId:'booking-4', adminId:null,     adminNote:null,                                createdAt:d(-48) },
  { id:'ledger-5',  userId:'user-alice', type:'package_credit',     amount:50,   balanceAfter:250,  description:'Key bundle: 50 keys',                         bookingId:null,      adminId:null,       adminNote:null,                                createdAt:d(-30) },
  { id:'ledger-6',  userId:'user-alice', type:'admin_correction',   amount:20,   balanceAfter:270,  description:'Courtesy credit — technical disruption',      bookingId:null,      adminId:'user-eve', adminNote:'Compensation for system outage on 15 Dec', createdAt:d(-20) },
  { id:'ledger-7',  userId:'user-alice', type:'booking_debit',      amount:-35,  balanceAfter:235,  description:'House on the Sea Polignano — 7 nights',       bookingId:'booking-3', adminId:null,     adminNote:null,                                createdAt:d(-10) },
  { id:'ledger-8',  userId:'user-alice', type:'booking_debit',      amount:-49,  balanceAfter:186,  description:'Masseria Bianca Ostuni — 7 nights',           bookingId:'booking-1', adminId:null,     adminNote:null,                                createdAt:d(-3) },
  { id:'ledger-9',  userId:'user-alice', type:'booking_debit',      amount:-16,  balanceAfter:170,  description:"Trullo Valle d'Itria — 4 nights",             bookingId:'booking-2', adminId:null,     adminNote:null,                                createdAt:d(-1) },
  { id:'ledger-10', userId:'user-bob',   type:'membership_credit',  amount:50,   balanceAfter:50,   description:'Welcome to the Club — activation credit',     bookingId:null,      adminId:null,       adminNote:null,                                createdAt:d(-160) },
  { id:'ledger-11', userId:'user-bob',   type:'package_credit',     amount:50,   balanceAfter:100,  description:'Key bundle: 50 keys',                         bookingId:null,      adminId:null,       adminNote:null,                                createdAt:d(-30) },
  { id:'ledger-12', userId:'user-bob',   type:'booking_debit',      amount:-28,  balanceAfter:72,   description:'Dammuso Fasano — 7 nights',                   bookingId:'booking-5', adminId:null,     adminNote:null,                                createdAt:d(-5) },
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
  { id:'audit-4', householdId:'household-puglia', actorId:'user-alice', targetId:null, action:'booking_made',   detail:'Alice accessed Masseria Bianca Ostuni (14–21 Jul)', createdAt:d(-3) },
]
const insertAudit = db.prepare(`INSERT INTO household_audit (id,household_id,actor_id,target_id,action,detail,created_at) VALUES (?,?,?,?,?,?,?)`)
for (const a of auditRows) {
  insertAudit.run(a.id, a.householdId, a.actorId, a.targetId, a.action, a.detail, a.createdAt)
}

// ─── Notifications ────────────────────────────────────────────────────────────
const insertNotif = db.prepare(`INSERT INTO notifications (id,user_id,type,title,body,read,link,created_at) VALUES (?,?,?,?,?,?,?,?)`)

const notifications = [
  { id:'notif-1', userId:'user-alice', type:'booking_confirmed',  title:'Access confirmed',          body:'Your access to Masseria Bianca Ostuni (14–21 Jul) is confirmed.',  read:0, link:'/member/bookings/booking-1', createdAt:d(-2) },
  { id:'notif-2', userId:'user-alice', type:'keys_credited',      title:'20 keys added',             body:'You have received 20 courtesy keys from the Club team.',           read:0, link:'/member/wallet',             createdAt:d(-20) },
  { id:'notif-3', userId:'user-alice', type:'household_invite',   title:'Roberto joined your household', body:'Roberto De Luca accepted your invitation.',                   read:1, link:'/member/household',          createdAt:d(-150) },
  { id:'notif-4', userId:'user-bob',   type:'booking_confirmed',  title:'Access confirmed',          body:'Your access to Dammuso Fasano is confirmed.',                     read:0, link:'/member/bookings/booking-5', createdAt:d(-5) },
  { id:'notif-5', userId:'user-carol', type:'reservation_received', title:'New access confirmed',    body:'Alice Moretti will access Masseria Bianca Ostuni from 14 to 21 July.', read:0, link:'/owner/reservations/booking-1', createdAt:d(-3) },
  { id:'notif-6', userId:'user-dave',  type:'property_approved',  title:'Home approved',             body:'Baroque Palazzo Lecce is now active in the Club.',                read:1, link:'/owner/properties',          createdAt:d(-90) },
  { id:'notif-7', userId:'user-eve',   type:'admin_alert',        title:'New home pending review',   body:'Villa on the Gargano — Vieste is awaiting approval.',             read:0, link:'/admin/properties/prop-gargano-villa/review', createdAt:d(-1) },
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
