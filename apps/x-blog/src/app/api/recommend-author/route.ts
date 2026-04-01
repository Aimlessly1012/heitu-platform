import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, submittedBy } = body

    // 验证 URL 格式
    const twitterUrlPattern = /^https?:\/\/(x\.com|twitter\.com)\/([a-zA-Z0-9_]+)\/?$/
    const match = url.match(twitterUrlPattern)

    if (!match) {
      return NextResponse.json(
        { error: '无效的 Twitter/X URL 格式' },
        { status: 400 }
      )
    }

    const username = match[2]
    const db = getDb()

    // 检查是否已存在
    const existing = db
      .prepare('SELECT id FROM author_recommendations WHERE username = ? AND status != ?')
      .get(username, 'rejected')

    if (existing) {
      return NextResponse.json(
        { error: '该博主已被推荐，正在审核中' },
        { status: 409 }
      )
    }

    // 生成 ID
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // 尝试获取博主信息（可选，失败也不影响）
    let displayName = username
    let bio = ''
    let avatar = `https://unavatar.io/twitter/${username}`

    try {
      // 这里可以调用 Twitter API 获取真实信息
      // 暂时使用 unavatar 作为头像
    } catch (error) {
      console.error('获取博主信息失败:', error)
    }

    // 插入数据库
    db.prepare(`
      INSERT INTO author_recommendations (
        id, username, url, display_name, bio, avatar, status, submitted_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, username, url, displayName, bio, avatar, 'pending', submittedBy || 'anonymous')

    return NextResponse.json({
      success: true,
      message: `感谢推荐 @${username}！我们会尽快审核`,
      recommendation: { id, username, status: 'pending' }
    })
  } catch (error) {
    console.error('推荐博主失败:', error)
    return NextResponse.json(
      { error: '提交失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 获取推荐列表（管理员用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'

    const db = getDb()
    
    let query = 'SELECT * FROM author_recommendations'
    const params: any[] = []

    if (status !== 'all') {
      query += ' WHERE status = ?'
      params.push(status)
    }

    query += ' ORDER BY submitted_at DESC'

    const recommendations = db.prepare(query).all(...params)

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('获取推荐列表失败:', error)
    return NextResponse.json(
      { error: '获取列表失败' },
      { status: 500 }
    )
  }
}
