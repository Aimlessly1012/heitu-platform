import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '..', 'data', 'articles.db')

const db = new Database(dbPath)

// 创建推荐表
db.exec(`
  CREATE TABLE IF NOT EXISTS author_recommendations (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    url TEXT NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar TEXT,
    specialties TEXT,
    status TEXT DEFAULT 'pending',
    submitted_by TEXT,
    submitted_at INTEGER DEFAULT (strftime('%s', 'now')),
    reviewed_at INTEGER,
    reviewed_by TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`)

console.log('✅ author_recommendations 表创建成功！')

db.close()
