'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { HomeIcon, UserIcon, SparklesIcon, NewspaperIcon, CubeIcon } from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolidIcon,
  UserIcon as UserSolidIcon,
  SparklesIcon as SparklesSolidIcon,
  NewspaperIcon as NewspaperSolidIcon,
  CubeIcon as CubeSolidIcon,
} from '@heroicons/react/24/solid'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname?.startsWith(path)
  }

  const linkBase =
    'group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200'
  const linkActive = 'text-[var(--ac)] bg-[var(--ac-dim)]'
  const linkIdle = 'text-[var(--t3)] hover:text-[var(--t1)] hover:bg-white/5'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const user = session?.user

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(7,8,11,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'var(--bd)',
      }}
    >
      <div className="max-w-full mx-auto px-6">
        <div className="flex items-center gap-6 h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="relative">
              <Image
                src="/images/logo.jpg"
                alt="HeiTu"
                width={32}
                height={32}
                className="rounded-full ring-1 ring-[var(--ac-dim)] group-hover:ring-[var(--ac-glow)] group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <span
              className="text-base font-bold tracking-tight group-hover:opacity-80 transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #f0f2f5 0%, var(--ac) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              HeiTu
            </span>
          </Link>

          {/* Divider */}
          <div className="h-5 w-px" style={{ background: 'var(--bd)' }} />

          {/* Nav Links */}
          <div className="flex items-center gap-0.5">
            <Link href="/" className={`${linkBase} ${isActive('/') ? linkActive : linkIdle}`}>
              {isActive('/') ? (
                <HomeSolidIcon className="w-4 h-4" />
              ) : (
                <HomeIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">首页</span>
              {isActive('/') && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ background: 'var(--ac)' }}
                />
              )}
            </Link>

            <Link
              href="/articles"
              className={`${linkBase} ${isActive('/articles') ? linkActive : linkIdle}`}
            >
              {isActive('/articles') ? (
                <NewspaperSolidIcon className="w-4 h-4" />
              ) : (
                <NewspaperIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">精选</span>
              {isActive('/articles') && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ background: 'var(--ac)' }}
                />
              )}
            </Link>

            <Link
              href="/skills"
              className={`${linkBase} ${isActive('/skills') ? linkActive : linkIdle}`}
            >
              {isActive('/skills') ? (
                <SparklesSolidIcon className="w-4 h-4" />
              ) : (
                <SparklesIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Skills</span>
              {isActive('/skills') && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ background: 'var(--ac)' }}
                />
              )}
            </Link>

            <Link
              href="/authors"
              className={`${linkBase} ${isActive('/authors') ? linkActive : linkIdle}`}
            >
              {isActive('/authors') ? (
                <UserSolidIcon className="w-4 h-4" />
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">X博主</span>
              {isActive('/authors') && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ background: 'var(--ac)' }}
                />
              )}
            </Link>

            <a
              href="/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkBase} ${linkIdle}`}
            >
              <CubeIcon className="w-4 h-4" />
              <span className="hidden sm:inline">组件库</span>
              <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Auth Area */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {status === 'loading' ? (
              <div
                className="w-7 h-7 rounded-full border border-[var(--bd)] animate-pulse"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              />
            ) : !user ? (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border"
                style={{
                  color: 'var(--t2)',
                  borderColor: 'var(--bd)',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  const t = e.currentTarget
                  t.style.color = 'var(--t1)'
                  t.style.borderColor = 'var(--ac)'
                  t.style.background = 'var(--ac-dim)'
                }}
                onMouseLeave={e => {
                  const t = e.currentTarget
                  t.style.color = 'var(--t2)'
                  t.style.borderColor = 'var(--bd)'
                  t.style.background = 'transparent'
                }}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                登录
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200"
                  style={{
                    background: dropdownOpen ? 'rgba(255,255,255,0.07)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!dropdownOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  }}
                  onMouseLeave={e => {
                    if (!dropdownOpen) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? 'User'}
                      width={28}
                      height={28}
                      className="rounded-full ring-1 ring-[var(--ac-dim)]"
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'var(--ac-dim)', color: 'var(--ac)' }}
                    >
                      {user.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs font-medium" style={{ color: 'var(--t2)' }}>
                    {user.name}
                  </span>
                  {(user as any).isAdmin && (
                    <span
                      className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                      style={{ background: 'var(--ac-dim)', color: 'var(--ac)' }}
                    >
                      Admin
                    </span>
                  )}
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--t3)' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-44 rounded-xl border overflow-hidden shadow-xl"
                    style={{
                      background: 'rgba(17,24,39,0.97)',
                      borderColor: 'var(--bd)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {/* User info */}
                    <div className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--bd)' }}>
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--t1)' }}>
                        {user.name}
                      </p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--t3)' }}>
                        {user.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {(user as any).isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs transition-all duration-150"
                          style={{ color: 'var(--t2)' }}
                          onMouseEnter={e => {
                            const t = e.currentTarget
                            t.style.color = 'var(--t1)'
                            t.style.background = 'rgba(255,255,255,0.06)'
                          }}
                          onMouseLeave={e => {
                            const t = e.currentTarget
                            t.style.color = 'var(--t2)'
                            t.style.background = 'transparent'
                          }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          管理后台
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setDropdownOpen(false)
                          signOut({ callbackUrl: '/' })
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all duration-150"
                        style={{ color: 'var(--t2)' }}
                        onMouseEnter={e => {
                          const t = e.currentTarget
                          t.style.color = '#f87171'
                          t.style.background = 'rgba(248,113,113,0.08)'
                        }}
                        onMouseLeave={e => {
                          const t = e.currentTarget
                          t.style.color = 'var(--t2)'
                          t.style.background = 'transparent'
                        }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        登出
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
