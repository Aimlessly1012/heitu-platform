'use client'

import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'

export default function BlacklistedPage() {
  const { data: session } = useSession()

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#030712' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-8 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }}
        />
      </div>

      <div
        className="relative w-full max-w-md rounded-2xl border p-8 flex flex-col items-center gap-6 animate-[fadeUp_0.4s_ease-out]"
        style={{
          background: 'rgba(17,24,39,0.8)',
          borderColor: 'rgba(239,68,68,0.2)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <style jsx>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shake {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(-8deg); }
            40% { transform: rotate(8deg); }
            60% { transform: rotate(-5deg); }
            80% { transform: rotate(5deg); }
          }
        `}</style>

        {/* Logo */}
        <div className="relative">
          <Image
            src="/images/logo.jpg"
            alt="HeiTu"
            width={64}
            height={64}
            className="rounded-full ring-2 ring-red-500/30 grayscale opacity-70"
          />
        </div>

        {/* Status Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.1)' }}
        >
          <svg className="w-8 h-8" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-xl font-bold text-center"
          style={{ color: 'var(--t1)' }}
        >
          账号已被限制访问
        </h1>

        {/* Description */}
        <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--t3)' }}>
          您的账号已被管理员限制访问。
          <br />
          如有疑问，请联系管理员解除限制。
        </p>

        {/* User Info Card */}
        {session?.user && (
          <div
            className="w-full rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || ''}
                width={40}
                height={40}
                className="rounded-full grayscale opacity-60"
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
              className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
            >
              已限制
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="w-full">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
            }}
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  )
}
