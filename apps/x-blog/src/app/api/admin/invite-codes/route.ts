import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { randomBytes } from 'crypto'

// GET - List all invite codes
export async function GET() {
  try {
    const db = getDb()
    
    const codes = db.prepare(`
      SELECT id, code, created_at, expires_at, used_at, used_by
      FROM invite_codes
      ORDER BY created_at DESC
    `).all()

    return NextResponse.json({ data: codes })
  } catch (error) {
    console.error('List invite codes error:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// POST - Generate new invite code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { expiresIn } = body // expiresIn in hours, e.g. 24 for 24 hours, undefined for no expiry

    const code = randomBytes(4).toString('hex').toUpperCase() // 8 character code
    const id = `ic_${Date.now()}_${randomBytes(2).toString('hex')}`
    
    let expiresAt = null
    if (expiresIn) {
      const expires = new Date()
      expires.setHours(expires.getHours() + expiresIn)
      expiresAt = expires.toISOString()
    }

    const db = getDb()
    db.prepare(`
      INSERT INTO invite_codes (id, code, expires_at)
      VALUES (?, ?, ?)
    `).run(id, code, expiresAt)

    return NextResponse.json({
      success: true,
      code: {
        id,
        code,
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
        used_at: null,
        used_by: null
      }
    })

  } catch (error) {
    console.error('Generate invite code error:', error)
    return NextResponse.json({ error: '生成失败' }, { status: 500 })
  }
}

// DELETE - Delete an invite code
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const codeId = searchParams.get('id')

    if (!codeId) {
      return NextResponse.json({ error: '缺少 code ID' }, { status: 400 })
    }

    const db = getDb()
    db.prepare('DELETE FROM invite_codes WHERE id = ?').run(codeId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete invite code error:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
