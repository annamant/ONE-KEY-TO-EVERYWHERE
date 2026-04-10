PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK(role IN ('member','owner','admin')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended','pending_verification')),
  avatar_url  TEXT,
  phone       TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS properties (
  id                    TEXT PRIMARY KEY,
  owner_id              TEXT NOT NULL REFERENCES users(id),
  title                 TEXT NOT NULL,
  slug                  TEXT NOT NULL,
  description           TEXT NOT NULL,
  region                TEXT NOT NULL,
  country               TEXT NOT NULL,
  city                  TEXT NOT NULL,
  address               TEXT NOT NULL,
  latitude              REAL NOT NULL,
  longitude             REAL NOT NULL,
  sleeps                INTEGER NOT NULL,
  bedrooms              INTEGER NOT NULL,
  bathrooms             INTEGER NOT NULL,
  keys_per_night        INTEGER NOT NULL,
  min_stay              INTEGER NOT NULL DEFAULT 1,
  max_stay              INTEGER NOT NULL DEFAULT 30,
  tier                  TEXT NOT NULL CHECK(tier IN ('standard','premium','luxury')),
  status                TEXT NOT NULL DEFAULT 'pending_approval' CHECK(status IN ('draft','pending_approval','approved','rejected','suspended')),
  amenities             TEXT NOT NULL DEFAULT '[]',
  house_rules           TEXT NOT NULL DEFAULT '[]',
  cover_image           TEXT NOT NULL DEFAULT '',
  images                TEXT NOT NULL DEFAULT '[]',
  blackout_dates        TEXT NOT NULL DEFAULT '[]',
  listing_quality_score INTEGER NOT NULL DEFAULT 70,
  total_bookings        INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id                  TEXT PRIMARY KEY,
  member_id           TEXT NOT NULL REFERENCES users(id),
  property_id         TEXT NOT NULL REFERENCES properties(id),
  household_id        TEXT,
  check_in            TEXT NOT NULL,
  check_out           TEXT NOT NULL,
  nights              INTEGER NOT NULL,
  guests              INTEGER NOT NULL,
  keys_charged        INTEGER NOT NULL,
  status              TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('pending','confirmed','active','completed','cancelled','no_show')),
  cancellation_reason TEXT,
  cancelled_at        TEXT,
  confirmed_at        TEXT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  type          TEXT NOT NULL,
  amount        INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description   TEXT NOT NULL,
  booking_id    TEXT,
  admin_id      TEXT,
  admin_note    TEXT,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS households (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  owner_id   TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS household_members (
  household_id TEXT NOT NULL REFERENCES households(id),
  user_id      TEXT NOT NULL REFERENCES users(id),
  role         TEXT NOT NULL CHECK(role IN ('Manager','Booker','Viewer')),
  status       TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','pending','removed')),
  joined_at    TEXT NOT NULL,
  PRIMARY KEY(household_id, user_id)
);

CREATE TABLE IF NOT EXISTS household_audit (
  id           TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id),
  actor_id     TEXT NOT NULL,
  target_id    TEXT,
  action       TEXT NOT NULL,
  detail       TEXT NOT NULL,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  read       INTEGER NOT NULL DEFAULT 0,
  link       TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invite_tokens (
  token        TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id),
  role         TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  expires_at   TEXT NOT NULL,
  used_at      TEXT,
  created_at   TEXT NOT NULL
);
