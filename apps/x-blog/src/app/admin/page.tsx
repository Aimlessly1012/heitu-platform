'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'

interface UserItem {
  id: string
  github_id: string
  name: string | null
  email: string | null
  image: string | null
  status: 'pending' | 'approved' | 'rejected'
  is_admin: number
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data || [])
      }
    } catch (e) {
      console.error('Failed to fetch users:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const updateUser = async (userId: string, status: string) => {
    setUpdating(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      })
      if (res.ok) {
        await fetchUsers()
      }
    } catch (e) {
      console.error('Failed to update user:', e)
    } finally {
      setUpdating(null)
    }
  }

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.status === filter)
  const pendingCount = users.filter(u => u.status === 'pending').length

  const statusConfig = {
    pending: { label: '待审批', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
    approved: { label: '已通过', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    rejected: { label: '已拒绝', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--t1)' }}>
              用户管理
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--t3)' }}>
              管理用户访问权限
              {pendingCount > 0 && (
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308' }}
                >
                  {pendingCount} 人待审批
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: filter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: filter === f ? 'var(--t1)' : 'var(--t3)',
                border: `1px solid ${filter === f ? 'var(--ac)' : 'var(--bd)'}`,
              }}
            >
              {f === 'all' ? `全部 (${users.length})` :
               f === 'pending' ? `待审批 (${users.filter(u => u.status === 'pending').length})` :
               f === 'approved' ? `已通过 (${users.filter(u => u.status === 'approved').length})` :
               `已拒绝 (${users.filter(u => u.status === 'rejected').length})`}
            </button>
          ))}
        </div>

        {/* User list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-[var(--ac)] border-t-transparent animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--t3)' }}>
            暂无用户
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map(user => {
              const sc = statusConfig[user.status] || statusConfig.pending
              return (
                <div
                  key={user.id}
                  className="rounded-xl p-4 flex items-center gap-4 transition-all duration-200"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--bd)',
                  }}
                >
                  {/* Avatar */}
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || ''}
                      width={44}
                      height={44}
                      className="rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--t3)' }}
                    >
                      {(user.name || '?')[0].toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate" style={{ color: 'var(--t1)' }}>
                        {user.name || 'Unknown'}
                      </span>
                      {user.is_admin === 1 && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}
                        >
                          ADMIN
                        </span>
                      )}
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--t3)' }}>
                      {user.email || 'No email'} · GitHub #{user.github_id}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
                      注册于 {new Date(user.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>

                  {/* Actions */}
                  {!user.is_admin && (
                    <div className="flex gap-2 flex-shrink-0">
                      {user.status !== 'approved' && (
                        <button
                          onClick={() => updateUser(user.id, 'approved')}
                          disabled={updating === user.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
                          style={{
                            background: 'rgba(34,197,94,0.1)',
                            color: '#22c55e',
                            border: '1px solid rgba(34,197,94,0.2)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(34,197,94,0.2)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(34,197,94,0.1)'
                          }}
                        >
                          ✓ 通过
                        </button>
                      )}
                      {user.status !== 'rejected' && (
                        <button
                          onClick={() => updateUser(user.id, 'rejected')}
                          disabled={updating === user.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.2)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.2)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                          }}
                        >
                          ✕ 拒绝
                        </button>
                      )}
                      {user.status !== 'pending' && (
                        <button
                          onClick={() => updateUser(user.id, 'pending')}
                          disabled={updating === user.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--t3)',
                            border: '1px solid var(--bd)',
                          }}
                        >
                          ↩ 重置
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
