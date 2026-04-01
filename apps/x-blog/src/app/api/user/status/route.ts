import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const githubId = searchParams.get('githubId')

  if (!githubId) {
    return NextResponse.json({ error: 'Missing githubId' }, { status: 400 })
  }

  try {
    const db = getDb()
    const user = db.prepare('SELECT status, is_admin FROM users WHERE github_id = ?').get(githubId) as any

    if (!user) {
      return NextResponse.json({ status: 'pending', isAdmin: false })
    }

    return NextResponse.json({
      status: user.status,
      isAdmin: user.is_admin === 1,
    })
  } catch {
    return NextResponse.json({ status: 'pending', isAdmin: false })
  }
}
