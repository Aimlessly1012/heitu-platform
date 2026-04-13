import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const db = getDb()
    const users = db.prepare(`
      SELECT id, github_id, google_id, name, email, image, status, is_admin, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `).all()
    
    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, status } = body

    if (!userId || !status) {
      return NextResponse.json({ error: 'Missing userId or status' }, { status: 400 })
    }

    if (!['approved', 'blacklisted'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const db = getDb()
    
    // 检查用户是否存在
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId)
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 更新用户状态
    const now = new Date().toISOString()
    db.prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?')
      .run(status, now, userId)

    return NextResponse.json({ success: true, message: 'User status updated' })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
