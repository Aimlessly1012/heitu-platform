import Database from 'better-sqlite3'
import path from 'path'
import { Article, CreateArticleInput, UpdateArticleInput } from './types'

const DB_PATH = path.join(process.cwd(), 'data', 'articles.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs')
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initDb(db)
  }
  return db
}

function initDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL UNIQUE,
      author TEXT,
      author_username TEXT,
      title TEXT,
      content TEXT,
      summary TEXT,
      translated_content TEXT,
      translated_summary TEXT,
      original_language TEXT,
      cover_image TEXT,
      published_at TEXT,
      status TEXT DEFAULT 'pending',
      error TEXT,
      is_favorited INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  // 迁移：为旧表添加 is_favorited 字段
  try {
    database.exec(`ALTER TABLE articles ADD COLUMN is_favorited INTEGER DEFAULT 0`)
  } catch {
    // 字段已存在，忽略
  }

  // 迁移：为旧表添加 tags 字段
  try {
    database.exec(`ALTER TABLE articles ADD COLUMN tags TEXT`)
  } catch {
    // 字段已存在，忽略
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      github_id TEXT,
      google_id TEXT,
      name TEXT,
      email TEXT,
      image TEXT,
      status TEXT DEFAULT 'approved',
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  // 迁移旧数据：将 pending/rejected 状态统一改为 approved
  database.exec(`UPDATE users SET status = 'approved' WHERE status IN ('pending', 'rejected')`)
}

function generateId(): string {
  return `art_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function createArticle(input: CreateArticleInput): Article {
  const database = getDb()
  const id = generateId()
  const now = new Date().toISOString()
  
  const stmt = database.prepare(`
    INSERT INTO articles (id, url, author, author_username, title, content, summary, translated_content, translated_summary, original_language, cover_image, published_at, tags, is_favorited, status, error, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id,
    input.url || null,
    input.author || null,
    input.authorUsername || null,
    input.title || null,
    input.content || null,
    input.summary || null,
    input.translatedContent || null,
    input.translatedSummary || null,
    input.originalLanguage || null,
    input.coverImage || null,
    input.publishedAt || null,
    JSON.stringify(input.tags || []),
    0,
    input.status || 'pending',
    input.error || null,
    now,
    now
  )
  
  return getArticleById(id)!
}

export function getArticleById(id: string): Article | null {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM articles WHERE id = ?')
  const row = stmt.get(id) as Record<string, unknown> | undefined
  
  if (!row) return null
  
  return mapRowToArticle(row)
}

export function getArticleByUrl(url: string): Article | null {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM articles WHERE url = ?')
  const row = stmt.get(url) as Record<string, unknown> | undefined
  
  if (!row) return null
  
  return mapRowToArticle(row)
}

export function getAllArticles(): Article[] {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM articles ORDER BY created_at DESC')
  const rows = stmt.all() as Record<string, unknown>[]
  
  return rows.map(mapRowToArticle)
}

export function updateArticle(id: string, input: UpdateArticleInput): Article | null {
  const database = getDb()
  const article = getArticleById(id)
  if (!article) return null
  
  const now = new Date().toISOString()
  
  const updates: string[] = ['updated_at = ?']
  const values: unknown[] = [now]
  
  if (input.title !== undefined) {
    updates.push('title = ?')
    values.push(input.title)
  }
  if (input.content !== undefined) {
    updates.push('content = ?')
    values.push(input.content)
  }
  if (input.summary !== undefined) {
    updates.push('summary = ?')
    values.push(input.summary)
  }
  if (input.translatedContent !== undefined) {
    updates.push('translated_content = ?')
    values.push(input.translatedContent)
  }
  if (input.translatedSummary !== undefined) {
    updates.push('translated_summary = ?')
    values.push(input.translatedSummary)
  }
  if (input.originalLanguage !== undefined) {
    updates.push('original_language = ?')
    values.push(input.originalLanguage)
  }
  if (input.coverImage !== undefined) {
    updates.push('cover_image = ?')
    values.push(input.coverImage)
  }
  if (input.author !== undefined) {
    updates.push('author = ?')
    values.push(input.author)
  }
  if (input.authorUsername !== undefined) {
    updates.push('author_username = ?')
    values.push(input.authorUsername)
  }
  if (input.publishedAt !== undefined) {
    updates.push('published_at = ?')
    values.push(input.publishedAt)
  }
  if (input.tags !== undefined) {
    updates.push('tags = ?')
    values.push(JSON.stringify(input.tags))
  }
  if (input.status !== undefined) {
    updates.push('status = ?')
    values.push(input.status)
  }
  if (input.error !== undefined) {
    updates.push('error = ?')
    values.push(input.error)
  }
  
  values.push(id)
  
  const stmt = database.prepare(`
    UPDATE articles SET ${updates.join(', ')} WHERE id = ?
  `)
  
  stmt.run(...values)
  
  return getArticleById(id)
}

export function deleteArticle(id: string): boolean {
  const database = getDb()
  const stmt = database.prepare('DELETE FROM articles WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

function mapRowToArticle(row: Record<string, unknown>): Article {
  return {
    id: row.id as string,
    url: row.url as string,
    author: row.author as string | null,
    authorUsername: row.author_username as string | null,
    title: row.title as string | null,
    content: row.content as string | null,
    summary: row.summary as string | null,
    translatedContent: row.translated_content as string | null,
    translatedSummary: row.translated_summary as string | null,
    originalLanguage: row.original_language as string | null,
    coverImage: row.cover_image as string | null,
    publishedAt: row.published_at as string | null,
    tags: JSON.parse((row.tags as string) || '[]'),
    status: row.status as Article['status'],
    error: row.error as string | null,
    isFavorited: row.is_favorited === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

// ==================== ARTICLE FAVORITES ====================

export function toggleFavorite(id: string): boolean {
  const database = getDb()
  const article = database.prepare('SELECT is_favorited, tags FROM articles WHERE id = ?').get(id) as { is_favorited: number, tags: string } | undefined
  if (!article) return false

  const newFav = article.is_favorited === 1 ? 0 : 1
  const now = new Date().toISOString()

  // 收藏时添加 'X精选' 标签，取消收藏时移除
  let tags: string[] = []
  try { tags = JSON.parse(article.tags || '[]') } catch { tags = [] }

  if (newFav === 1) {
    if (!tags.includes('X精选')) tags.push('X精选')
    // 未翻译的标记为待翻译
    database.prepare(`
      UPDATE articles SET is_favorited = 1, tags = ?, status = CASE WHEN translated_content IS NULL OR translated_content = '' THEN 'pending_translation' ELSE status END, updated_at = ? WHERE id = ?
    `).run(JSON.stringify(tags), now, id)
  } else {
    tags = tags.filter(t => t !== 'X精选')
    database.prepare(`UPDATE articles SET is_favorited = 0, tags = ?, updated_at = ? WHERE id = ?`).run(JSON.stringify(tags), now, id)
  }

  return newFav === 1
}

export function deleteMorningNewsBeforeDate(date: string): number {
  const database = getDb()
  const result = database.prepare(`
    DELETE FROM articles WHERE id LIKE 'morning_%' AND is_favorited = 0 AND created_at < ?
  `).run(date)
  return result.changes
}

export function getPendingTranslationArticles(): Article[] {
  const database = getDb()
  const rows = database.prepare(`
    SELECT * FROM articles WHERE status = 'pending_translation' AND is_favorited = 1 ORDER BY created_at DESC
  `).all() as Record<string, unknown>[]
  return rows.map(mapRowToArticle)
}

// ==================== USER MANAGEMENT ====================

export interface UserSession {
  googleId: string
  name: string | null
  email: string | null
  image: string | null
  status: 'approved' | 'blacklisted'
  isAdmin: boolean
}

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function findOrCreateUser(googleId: string, name: string | null, email: string | null, image: string | null, adminGoogleId: string): UserSession {
  const database = getDb()
  
  // Check if user exists
  const existing = database.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId) as Record<string, unknown> | undefined
  
  if (existing) {
    return mapRowToUser(existing)
  }
  
  // Create new user - default to pending unless they're the admin
  const id = generateUserId()
  const now = new Date().toISOString()
  const isAdmin = googleId === adminGoogleId ? 1 : 0
  const status = 'approved'
  
  database.prepare(`
    INSERT INTO users (id, google_id, name, email, image, status, is_admin, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, googleId, name, email, image, status, isAdmin, now, now)
  
  return {
    googleId,
    name,
    email,
    image,
    status: status as 'approved' | 'blacklisted',
    isAdmin: isAdmin === 1
  }
}

export function getUserByGoogleId(googleId: string): UserSession | null {
  const database = getDb()
  const row = database.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId) as Record<string, unknown> | undefined
  
  if (!row) return null
  
  return mapRowToUser(row)
}

export function getAllUsers(): UserSession[] {
  const database = getDb()
  const rows = database.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as Record<string, unknown>[]
  return rows.map(mapRowToUser)
}

export function updateUserStatus(googleId: string, status: 'approved' | 'blacklisted'): UserSession | null {
  const database = getDb()
  const now = new Date().toISOString()
  
  database.prepare(`
    UPDATE users SET status = ?, updated_at = ? WHERE google_id = ?
  `).run(status, now, googleId)
  
  return getUserByGoogleId(googleId)
}

function mapRowToUser(row: Record<string, unknown>): UserSession {
  return {
    googleId: row.google_id as string,
    name: row.name as string | null,
    email: row.email as string | null,
    image: row.image as string | null,
    status: row.status as 'approved' | 'blacklisted',
    isAdmin: row.is_admin === 1
  }
}
