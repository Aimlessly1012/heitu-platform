import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getServerSession } from 'next-auth'

// 审核推荐（批准/拒绝）
export async function PATCH(request: NextRequest) {
  try {
    // 检查管理员权限
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const body = await request.json()
    const { id, action, reviewNote } = body // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: '无效的操作' }, { status: 400 })
    }

    const db = getDb()
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const reviewedBy = session?.user ? (session.user as any)?.email || 'admin' : 'admin'

    // 更新状态
    db.prepare(`
      UPDATE author_recommendations
      SET status = ?, reviewed_at = ?, reviewed_by = ?, updated_at = ?
      WHERE id = ?
    `).run(newStatus, Math.floor(Date.now() / 1000), reviewedBy, Math.floor(Date.now() / 1000), id)

    // 如果批准，可以选择自动添加到 AUTHORS 列表（这里暂时手动）
    return NextResponse.json({
      success: true,
      message: action === 'approve' ? '已批准推荐' : '已拒绝推荐',
      status: newStatus
    })
  } catch (error) {
    console.error('审核失败:', error)
    return NextResponse.json({ error: '审核失败' }, { status: 500 })
  }
}

// 删除推荐
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
    }

    const db = getDb()
    db.prepare('DELETE FROM author_recommendations WHERE id = ?').run(id)

    return NextResponse.json({ success: true, message: '已删除推荐' })
  } catch (error) {
    console.error('删除失败:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
