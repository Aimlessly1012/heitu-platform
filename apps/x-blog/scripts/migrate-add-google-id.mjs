import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'data', 'articles.db')

const db = new Database(DB_PATH)

console.log('Adding google_id column to users table...')

try {
  // Add google_id column
  db.exec(`ALTER TABLE users ADD COLUMN google_id TEXT`)
  console.log('✓ Added google_id column')
  
  // Make github_id nullable by recreating the table
  console.log('Making github_id nullable...')
  
  db.exec(`
    CREATE TABLE users_new (
      id TEXT PRIMARY KEY,
      github_id TEXT,
      google_id TEXT,
      name TEXT,
      email TEXT,
      image TEXT,
      status TEXT DEFAULT 'pending',
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)
  
  db.exec(`INSERT INTO users_new SELECT id, github_id, NULL, name, email, image, status, is_admin, created_at, updated_at FROM users`)
  db.exec(`DROP TABLE users`)
  db.exec(`ALTER TABLE users_new RENAME TO users`)
  
  console.log('✓ Migration complete')
  
  // Show current users
  const users = db.prepare('SELECT * FROM users').all()
  console.log('\nCurrent users:', users)
} catch (error) {
  console.error('Migration failed:', error)
  process.exit(1)
}

db.close()
