import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { toggleFavorite, getArticleById } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token',
  })

  if (!token?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const isFavorited = toggleFavorite(id)
  const article = getArticleById(id)

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  return NextResponse.json({ id, isFavorited })
}
