import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getMorningNewsById, createArticle, getArticleByUrl } from '@/lib/db'

function extractUrls(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s"'<>\])+]+/g)
  if (!match) return null
  // Filter out x.com/twitter URLs (those are the tweet itself)
  const external = match.filter(u => !u.includes('x.com/') && !u.includes('twitter.com/'))
  return external[0] || null
}

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token',
  })

  if (!token?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { morningNewsId } = await request.json()
    if (!morningNewsId) {
      return NextResponse.json({ error: 'Missing morningNewsId' }, { status: 400 })
    }

    const newsItem = getMorningNewsById(morningNewsId)
    if (!newsItem) {
      return NextResponse.json({ error: 'Morning news item not found' }, { status: 404 })
    }

    // Check duplicate
    const existing = getArticleByUrl(newsItem.url)
    if (existing) {
      return NextResponse.json({ error: 'Already in featured', article: existing }, { status: 409 })
    }

    // Extract external URL from content
    const sourceUrl = extractUrls(newsItem.content || '') || extractUrls(newsItem.url || '')

    const article = createArticle({
      url: newsItem.url,
      title: newsItem.title,
      content: newsItem.content,
      summary: newsItem.summary,
      author: newsItem.author,
      authorUsername: newsItem.authorUsername,
      tags: [...(newsItem.tags || []), 'featured'],
      publishedAt: newsItem.publishedAt,
      originalLanguage: 'en',
      sourceUrl,
      status: 'pending_crawl',
    })

    return NextResponse.json({ data: article }, { status: 201 })
  } catch (error) {
    console.error('Favorite error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
