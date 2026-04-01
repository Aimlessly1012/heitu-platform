'use client'

import { signOut, useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Suspense, useEffect, useState } from 'react'

function PendingContent() {
  const { data: session, update: updateSession } = useSession()
  const searchParams = useSearchParams()
  const [currentStatus, setCurrentStatus] = useState(searchParams.get('status') || 'pending')

  const isRejected = currentStatus === 'rejected'

  // 轮询数据库中的最新状态
  useEffect(() => {
    if (!session?.user) return

    const checkStatus = async () => {
      try {
        const user = session.user as any
        const githubId = user.githubId
        if (!githubId) return

        const res = await fetch(`/api/user/status?githubId=${githubId}`)
        if (res.ok) {
          const data = await res.json()
          setCurrentStatus(data.status)
          if (data.status === 'approved') {
            // 强制刷新 session 然后跳转
            await updateSession()
            window.location.href = '/'
          }
        }
      } catch {}
    }

    // 每 3 秒轮询一次
    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [session, updateSession])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#030712' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
          style={{ background: isRejected
            ? 'radial-gradient(circle, #ef4444 0%, transparent 70%)'
            : 'radial-gradient(circle, var(--ac) 0%, transparent 70%)'
          }}
        />
      </div>

      <div
        className="relative w-full max-w-md rounded-2xl border p-8 flex flex-col items-center gap-6"
        style={{
          background: 'rgba(17,24,39,0.8)',
          borderColor: 'var(--bd)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <div className="relative">
          <Image
            src="/images/logo.jpg"
            alt="HeiTu"
            width={64}
            height={64}
            className="rounded-full ring-2 ring-[var(--ac-dim)]"
          />
        </div>

        {/* Status Icon */}
        <div className="text-5xl">
          {isRejected ? '🚫' : '⏳'}
        </div>

        {/* Title */}
        <h1
          className="text-xl font-bold text-center"
          style={{ color: 'var(--t1)' }}
        >
          {isRejected ? '访问申请被拒绝' : '等待管理员审批'}
        </h1>

        {/* Description */}
        <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--t3)' }}>
          {isRejected ? (
            '抱歉，您的访问申请未通过审批。如有疑问请联系管理员。'
          ) : (
            <>
              您好{session?.user?.name ? `，${session.user.name}` : ''}！
              <br />
              您的账号已成功注册，正在等待管理员审批。
              <br />
              审批通过后即可访问全部内容。
            </>
          )}
        </p>

        {/* User Info Card */}
        {session?.user && (
          <div
            className="w-full rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bd)' }}
          >
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || ''}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--t1)' }}>
                {session.user.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--t3)' }}>
                {session.user.email}
              </p>
            </div>
            <span
              className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
              style={{
                background: isRejected ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                color: isRejected ? '#ef4444' : '#eab308',
              }}
            >
              {isRejected ? '已拒绝' : '审批中'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          {!isRejected && (
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'var(--t1)',
                border: '1px solid var(--bd)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.borderColor = 'var(--ac)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'var(--bd)'
              }}
            >
              🔄 刷新状态
            </button>
          )}

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: 'transparent',
              color: 'var(--t3)',
              border: '1px solid var(--bd)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ef4444'
              e.currentTarget.style.borderColor = '#ef4444'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--t3)'
              e.currentTarget.style.borderColor = 'var(--bd)'
            }}
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030712' }}>
        <div className="w-6 h-6 rounded-full border-2 border-[var(--ac)] border-t-transparent animate-spin" />
      </div>
    }>
      <PendingContent />
    </Suspense>
  )
}
