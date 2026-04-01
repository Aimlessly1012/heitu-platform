import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = path.join(__dirname, '..', 'data', 'articles.db')

const db = new Database(DB_PATH)

console.log('Adding tags column to articles table...')

try {
  // 添加 tags 字段 (JSON 格式存储)
  db.exec(`
    ALTER TABLE articles ADD COLUMN tags TEXT DEFAULT '[]';
  `)
  
  console.log('✅ Tags column added successfully!')
  
  // 验证
  const columns = db.prepare("PRAGMA table_info(articles)").all()
  console.log('\n📋 Current columns:')
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`)
  })
  
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('⚠️  Tags column already exists, skipping...')
  } else {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

db.close()
