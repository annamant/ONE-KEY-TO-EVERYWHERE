import { getDb } from '../db/connection'
import { generateId } from './generateId'

export function notifyAdmins(opts: {
  title: string
  body: string
  link: string
  type?: string
}): void {
  const db = getDb()
  const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all() as { id: string }[]
  const now = new Date().toISOString()
  const insert = db.prepare(
    'INSERT INTO notifications (id, user_id, type, title, body, read, link, created_at) VALUES (?,?,?,?,?,0,?,?)'
  )

  for (const admin of admins) {
    insert.run(
      generateId('notif'),
      admin.id,
      opts.type ?? 'admin_alert',
      opts.title,
      opts.body,
      opts.link,
      now
    )
  }
}

export function notifyUser(userId: string, opts: {
  title: string
  body: string
  link: string
  type?: string
}): void {
  const db = getDb()
  const now = new Date().toISOString()
  db.prepare(
    'INSERT INTO notifications (id, user_id, type, title, body, read, link, created_at) VALUES (?,?,?,?,?,0,?,?)'
  ).run(
    generateId('notif'),
    userId,
    opts.type ?? 'system',
    opts.title,
    opts.body,
    opts.link,
    now
  )
}
