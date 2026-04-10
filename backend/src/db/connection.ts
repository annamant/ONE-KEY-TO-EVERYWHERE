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
  return _db
}
