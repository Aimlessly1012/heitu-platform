import { NextRequest, NextResponse } from 'next/server'
import { createArticle, getAllArticles, getArticleByUrl } from '@/lib/db'

export async function GET() {
  try {
    const articles = getAllArticles()
    return NextResponse.json({ data: articles })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, title, author, authorUsername, publishedAt, content, summary, coverImage, translatedContent, translatedSummary, originalLanguage, status, tags } = body
    
    // If URL provided, check for duplicates
    if (url) {
      const existing = getArticleByUrl(url)
      if (existing) {
        return NextResponse.json(
          { error: 'Article already exists', article: existing },
          { status: 409 }
        )
      }
    }
    
    // Create article with full data
    // Accept status from request, or default to 'pending_translation' if content exists but no translation
    const article = createArticle({
      url: url || null,
      title: title || null,
      author: author || null,
      authorUsername: authorUsername || null,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      content: content || null,
      summary: summary || null,
      coverImage: coverImage || null,
      translatedContent: translatedContent || null,
      translatedSummary: translatedSummary || null,
      originalLanguage: originalLanguage || 'en',
      status: status || (content ? (translatedContent ? 'completed' : 'pending_translation') : 'pending'),
      tags: tags || null,
    })
    
    return NextResponse.json(
      { data: article },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}
