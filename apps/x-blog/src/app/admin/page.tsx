'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'

interface UserItem {
  id: string
  github_id: string
  name: string | null
  email: string | null
  image: string | null
  status: 'approved' | 'blacklisted'
  is_admin: number
  created_at: string
  updated_at: string
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed top-6 right-6 z-[100] px-4 py-3 rounded-xl text-sm font-medium shadow-2xl flex items-center gap-2 animate-[slideIn_0.3s_ease-out]"
      style={{
        background: type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        color: type === 'success' ? '#4ade80' : '#f87171',
        border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  )
}

function ConfirmModal({
  user,
  action,
  onConfirm,
  onCancel,
}: {
  user: UserItem
  action: 'blacklisted' | 'approved'
  onConfirm: () => void
  onCancel: () => void
}) {
  const isBlacklist = action === 'blacklisted'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-6 flex flex-col items-center gap-4 animate-[scaleIn_0.2s_ease-out]"
        style={{
          background: 'rgba(17,24,39,0.95)',
          borderColor: isBlacklist ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
          style={{
            background: isBlacklist ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
          }}
        >
          {isBlacklist ? '🚫' : '✓'}
        </div>

        <div className="text-center">
          <h3 className="text-base font-bold" style={{ color: 'var(--t1)' }}>
            {isBlacklist ? '确认拉黑用户？' : '确认解除拉黑？'}
          </h3>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--t3)' }}>
            {isBlacklist
              ? <>将 <strong style={{ color: 'var(--t1)' }}>{user.name}</strong> 加入黑名单后，该用户将无法访问任何内容。</>
              : <>将 <strong style={{ color: 'var(--t1)' }}>{user.name}</strong> 移出黑名单后，该用户将恢复正常访问。</>
            }
          </p>
        </div>

        <div className="w-full flex gap-3 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--t2)',
              border: '1px solid var(--bd)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: isBlacklist ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
              color: isBlacklist ? '#f87171' : '#4ade80',
              border: `1px solid ${isBlacklist ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = isBlacklist ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = isBlacklist ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'
            }}
          >
            {isBlacklist ? '确认拉黑' : '确认解除'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'approved' | 'blacklisted'>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ user: UserItem; action: 'blacklisted' | 'approved' } | null>(null)

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
    setConfirmAction(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      })
      if (res.ok) {
        await fetchUsers()
        setToast({
          message: status === 'blacklisted' ? '已将用户加入黑名单' : '已解除用户黑名单',
          type: 'success',
        })
      } else {
        setToast({ message: '操作失败，请重试', type: 'error' })
      }
    } catch (e) {
      console.error('Failed to update user:', e)
      setToast({ message: '网络错误，请重试', type: 'error' })
    } finally {
      setUpdating(null)
    }
  }

  const handleAction = (user: UserItem, action: 'blacklisted' | 'approved') => {
    setConfirmAction({ user, action })
  }

  const filteredUsers = (filter === 'all' ? users : users.filter(u => u.status === filter))
    .filter(u => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.github_id.includes(q)
      )
    })

  const blacklistedCount = users.filter(u => u.status === 'blacklisted').length
  const approvedCount = users.filter(u => u.status === 'approved').length

  const statusConfig = {
    approved: { label: '正常', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    blacklisted: { label: '已拉黑', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  }

  return (
    <>
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <Navbar />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {confirmAction && (
        <ConfirmModal
          user={confirmAction.user}
          action={confirmAction.action}
          onConfirm={() => updateUser(confirmAction.user.id, confirmAction.action)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <main className="w-full px-6 py-8">
        {/* Header + Stats */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--t1)' }}>
              用户管理
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--t3)' }}>
              共 {users.length} 位注册用户
            </p>
          </div>
          <div className="flex gap-3">
            <div
              className="px-4 py-2 rounded-xl text-center"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}
            >
              <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{approvedCount}</p>
              <p className="text-[11px]" style={{ color: 'var(--t3)' }}>正常</p>
            </div>
            <div
              className="px-4 py-2 rounded-xl text-center"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <p className="text-lg font-bold" style={{ color: '#ef4444' }}>{blacklistedCount}</p>
              <p className="text-[11px]" style={{ color: 'var(--t3)' }}>已拉黑</p>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--t3)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索用户名、邮箱..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--t1)',
                border: '1px solid var(--bd)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--ac)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--bd)' }}
            />
          </div>

          <div className="flex gap-1.5">
            {(['all', 'approved', 'blacklisted'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: filter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: filter === f ? 'var(--t1)' : 'var(--t3)',
                  border: `1px solid ${filter === f ? 'var(--ac)' : 'var(--bd)'}`,
                }}
              >
                {f === 'all' ? `全部` :
                 f === 'approved' ? `正常` :
                 `已拉黑`}
              </button>
            ))}
          </div>
        </div>

        {/* User list */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--ac)] border-t-transparent animate-spin" />
            <p className="text-sm" style={{ color: 'var(--t3)' }}>加载中...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="text-4xl opacity-40">
              {search ? '🔍' : '👥'}
            </div>
            <p className="text-sm" style={{ color: 'var(--t3)' }}>
              {search ? `未找到匹配「${search}」的用户` : '暂无用户'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
                style={{ color: 'var(--ac)', background: 'var(--ac-dim)' }}
              >
                清除搜索
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map(user => {
              const sc = statusConfig[user.status] || statusConfig.approved
              const isBlacklisted = user.status === 'blacklisted'
              return (
                <div
                  key={user.id}
                  className="group rounded-xl p-4 flex items-center gap-4 transition-all duration-200"
                  style={{
                    background: isBlacklisted ? 'rgba(239,68,68,0.03)' : 'var(--bg-card)',
                    border: `1px solid ${isBlacklisted ? 'rgba(239,68,68,0.15)' : 'var(--bd)'}`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = isBlacklisted ? 'rgba(239,68,68,0.3)' : 'var(--ac)'
                    e.currentTarget.style.background = isBlacklisted ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = isBlacklisted ? 'rgba(239,68,68,0.15)' : 'var(--bd)'
                    e.currentTarget.style.background = isBlacklisted ? 'rgba(239,68,68,0.03)' : 'var(--bg-card)'
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
                      style={{ opacity: isBlacklisted ? 0.5 : 1 }}
                    />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--t3)',
                        opacity: isBlacklisted ? 0.5 : 1,
                      }}
                    >
                      {(user.name || '?')[0].toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-medium text-sm truncate"
                        style={{
                          color: isBlacklisted ? 'var(--t3)' : 'var(--t1)',
                          textDecoration: isBlacklisted ? 'line-through' : 'none',
                        }}
                      >
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
                      {user.status === 'approved' ? (
                        <button
                          onClick={() => handleAction(user, 'blacklisted')}
                          disabled={updating === user.id}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 opacity-0 group-hover:opacity-100"
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
                          {updating === user.id ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                              处理中
                            </span>
                          ) : '拉黑'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(user, 'approved')}
                          disabled={updating === user.id}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
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
                          {updating === user.id ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                              处理中
                            </span>
                          ) : '解除拉黑'}
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
