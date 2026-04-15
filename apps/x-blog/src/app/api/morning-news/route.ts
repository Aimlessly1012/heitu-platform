import { NextRequest, NextResponse } from 'next/server'
import { clearMorningNews, insertMorningNews, getAllMorningNews } from '@/lib/db'
import { randomId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, date } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
    }

    // Clear all existing morning news (daily refresh)
    const deleted = clearMorningNews()
    console.log(`[morning-news] cleared ${deleted} old items`)

    const results = []
    for (const item of items) {
      const id = `mn_${date}_${randomId()}`
      try {
        insertMorningNews({
          id,
          url: item.url || '',
          title: item.title,
          content: item.content,
          summary: item.summary,
          author: item.author,
          authorUsername: item.authorUsername,
          tags: item.tags,
          publishedAt: item.publishedAt,
        })
        results.push({ id, status: 'created' })
      } catch {
        results.push({ id, status: 'failed' })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Morning news error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')
    const data = getAllMorningNews(limit)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Morning news fetch error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
