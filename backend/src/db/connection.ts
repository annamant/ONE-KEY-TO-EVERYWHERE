import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : path.resolve(__dirname, '../../okte.db')

const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  _db = new Database(DB_PATH)
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8')
  _db.exec(schema)
  // Lightweight migrations for columns added after the initial schema.
  // CREATE TABLE IF NOT EXISTS handles new tables, but ALTER TABLE is needed
  // to add columns to an existing users table without wiping data.
  const cols = _db.prepare('PRAGMA table_info(users)').all() as { name: string }[]
  const hasEmailVerified = cols.some((c) => c.name === 'email_verified_at')
  if (!hasEmailVerified) {
    _db.exec('ALTER TABLE users ADD COLUMN email_verified_at TEXT')
  }
  migrateMemberWaitlistNewsletter(_db)
  return _db
}

function migrateMemberWaitlistNewsletter(db: Database.Database) {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='member_waitlist'").get()
  if (!table) return

  try {
    db.prepare(`
      INSERT INTO member_waitlist (id, first_name, email, status, created_at, updated_at)
      VALUES ('__newsletter_migration_test__', 'Test', '__newsletter_migration_test__@example.com', 'subscribed', datetime('now'), datetime('now'))
    `).run()
    db.prepare("DELETE FROM member_waitlist WHERE id = '__newsletter_migration_test__'").run()
  } catch {
    db.exec(`
      CREATE TABLE member_waitlist_new (
        id          TEXT PRIMARY KEY,
        first_name  TEXT NOT NULL,
        email       TEXT NOT NULL UNIQUE,
        status      TEXT NOT NULL DEFAULT 'subscribed' CHECK(status IN ('pending','contacted','invited','rejected','subscribed')),
        admin_notes TEXT,
        created_at  TEXT NOT NULL,
        updated_at  TEXT NOT NULL
      );
      INSERT INTO member_waitlist_new (id, first_name, email, status, admin_notes, created_at, updated_at)
      SELECT id, first_name, email,
        CASE WHEN status IN ('pending', 'contacted', 'invited') THEN 'subscribed' ELSE status END,
        admin_notes, created_at, updated_at
      FROM member_waitlist;
      DROP TABLE member_waitlist;
      ALTER TABLE member_waitlist_new RENAME TO member_waitlist;
    `)
  }
}
