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
  return _db
}
