'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/')
    }
  }, [status, router])

  const handleGitHubLogin = async () => {
    setLoading(true)
    await signIn('github', { callbackUrl: '/' })
  }

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#030712' }}
      >
        <div className="w-6 h-6 rounded-full border-2 border-[var(--ac)] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#030712' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--ac) 0%, transparent 70%)' }}
        />
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl border p-8 flex flex-col items-center gap-8"
        style={{
          background: 'rgba(17,24,39,0.8)',
          borderColor: 'var(--bd)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Image
              src="/images/logo.jpg"
              alt="HeiTu"
              width={64}
              height={64}
              className="rounded-full ring-2 ring-[var(--ac-dim)]"
            />
            <div
              className="absolute inset-0 rounded-full opacity-30 blur-md"
              style={{ background: 'var(--ac)' }}
            />
          </div>
          <div className="text-center">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #f0f2f5 0%, var(--ac) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              HeiTu 🐰
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--t3)' }}>
              登录后探索更多内容
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: 'var(--bd)' }} />

        {/* Login Button */}
        <button
          onClick={handleGitHubLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: loading ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
            color: 'var(--t1)',
            border: '1px solid var(--bd)',
          }}
          onMouseEnter={e => {
            if (!loading) {
              const target = e.currentTarget
              target.style.background = 'rgba(255,255,255,0.12)'
              target.style.borderColor = 'var(--ac)'
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              const target = e.currentTarget
              target.style.background = 'rgba(255,255,255,0.08)'
              target.style.borderColor = 'var(--bd)'
            }
          }}
        >
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span>{loading ? '登录中...' : '使用 GitHub 登录'}</span>
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--t3)' }}>
          登录即表示你同意我们的使用条款
        </p>
      </div>
    </div>
  )
}
