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
  email_verified_at TEXT,
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

-- Property owner waitlist (Open Your Doors enquiries)
CREATE TABLE IF NOT EXISTS owner_waitlist (
  id            TEXT PRIMARY KEY,
  first_name    TEXT NOT NULL,
  last_name     TEXT,
  email         TEXT NOT NULL,
  phone         TEXT,
  city          TEXT NOT NULL,
  property_type TEXT,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','contacted','approved','rejected')),
  admin_notes   TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- Member interest waitlist (pre-signup expression of interest)
CREATE TABLE IF NOT EXISTS member_waitlist (
  id          TEXT PRIMARY KEY,
  first_name  TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','contacted','invited','rejected')),
  admin_notes TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- Password reset tokens (single-use, expiring)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token       TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  expires_at  TEXT NOT NULL,
  used_at     TEXT,
  created_at  TEXT NOT NULL
);

-- Email verification tokens (single-use, expiring)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  token       TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  expires_at  TEXT NOT NULL,
  used_at     TEXT,
  created_at  TEXT NOT NULL
);

-- Admin booking overrides (audit trail for status overrides)
CREATE TABLE IF NOT EXISTS booking_overrides (
  id              TEXT PRIMARY KEY,
  booking_id      TEXT NOT NULL REFERENCES bookings(id),
  admin_id        TEXT NOT NULL REFERENCES users(id),
  previous_status TEXT NOT NULL,
  new_status      TEXT NOT NULL,
  note            TEXT,
  created_at      TEXT NOT NULL
);

-- Property review decisions (audit trail + rejection reasons)
CREATE TABLE IF NOT EXISTS property_review_notes (
  id           TEXT PRIMARY KEY,
  property_id  TEXT NOT NULL REFERENCES properties(id),
  admin_id     TEXT NOT NULL REFERENCES users(id),
  decision     TEXT NOT NULL CHECK(decision IN ('approved','rejected','suspended')),
  reason       TEXT,
  created_at   TEXT NOT NULL
);

-- Platform settings (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  updated_by  TEXT REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_properties_owner_status ON properties(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_bookings_member ON bookings(member_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_household_members_user ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_household ON invite_tokens(household_id);
CREATE INDEX IF NOT EXISTS idx_owner_waitlist_email ON owner_waitlist(email);
