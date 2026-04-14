import { NextRequest, NextResponse } from 'next/server'
import { getDb, deleteMorningNewsBeforeDate } from '@/lib/db'
import { randomId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, date } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
    }

    const db = getDb()

    // clean up old unfavorited morning news before today
    const deleted = deleteMorningNewsBeforeDate(date)
    if (deleted > 0) {
      console.log(`[morning-news] cleaned ${deleted} old articles before ${date}`)
    }

    const results = []

    for (const item of items) {
      const id = `morning_${date}_${randomId()}`
      
      // Check for duplicate
      const existing = db.prepare(
        'SELECT id FROM articles WHERE url = ? AND title = ?'
      ).get(item.url, item.title) as { id: string } | undefined

      if (existing) {
        results.push({ id: existing.id, status: 'duplicate' })
        continue
      }

      const now = new Date().toISOString()
      
      db.prepare(`
        INSERT INTO articles (id, url, title, author, author_username, content, summary, translated_content, translated_summary, original_language, cover_image, published_at, status, error, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        item.url || null,
        item.title || null,
        item.author || null,
        item.authorUsername || null,
        item.content || null,
        item.summary || null,
        item.translatedContent || null,
        item.translatedSummary || null,
        item.originalLanguage || null,
        item.coverImage || null,
        item.publishedAt || now,
        'completed',
        null,
        JSON.stringify(item.tags || ['晨报', 'Claude']),
        now,
        now
      )

      results.push({ id, status: 'created' })
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Morning news error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get morning news articles (id starts with 'morning_') or with '晨报' tag
    const articles = db.prepare(`
      SELECT * FROM articles 
      WHERE id LIKE 'morning_%' OR tags LIKE '%晨报%'
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit) as any[]

    const parsed = articles.map(a => ({
      id: a.id,
      url: a.url,
      title: a.title,
      author: a.author,
      authorUsername: a.author_username,
      content: a.content,
      summary: a.summary,
      translatedContent: a.translated_content,
      translatedSummary: a.translated_summary,
      originalLanguage: a.original_language,
      coverImage: a.cover_image,
      publishedAt: a.published_at,
      status: a.status,
      error: a.error,
      tags: a.tags ? JSON.parse(a.tags) : [],
      isFavorited: a.is_favorited === 1,
      createdAt: a.created_at,
      updatedAt: a.updated_at
    }))

    return NextResponse.json({ data: parsed })
  } catch (error) {
    console.error('Morning news fetch error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
