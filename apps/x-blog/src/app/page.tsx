'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import { Article } from '@/lib/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ArrowRightIcon, BookOpenIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'

const TAG_CLASSES: Record<string, string> = {
  'Claude': 'tag-claude',
  'Claude Code': 'tag-claude-code',
  '晨报': 'tag-morning',
  '新功能': 'tag-feature',
  '实用技巧': 'tag-tip',
  '开发教程': 'tag-tutorial',
  'AI资讯': 'tag-ai-news',
  '热门讨论': 'tag-hot',
}

function getTagStyle(tag: string) {
  return TAG_CLASSES[tag] || 'tag-default'
}

function NewsCard({ item, isFirst = false, isAdmin = false, onFavorite }: { item: Article; isFirst?: boolean; isAdmin?: boolean; onFavorite?: (id: string) => void }) {
  const tags = item.tags || []
  const [favLoading, setFavLoading] = useState(false)
  const [fav, setFav] = useState(item.isFavorited)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (favLoading) return
    setFavLoading(true)
    try {
      const res = await fetch(`/api/articles/${item.id}/favorite`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setFav(data.isFavorited)
        onFavorite?.(item.id)
      }
    } catch {} finally { setFavLoading(false) }
  }

  return (
    <article
      className={`group ${isFirst ? 'pb-14 mb-12' : 'py-10'}`}
      style={{ borderBottom: '1px solid var(--bd)' }}
    >
      {/* Date + Favorite */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--t3)' }}>
            {item.publishedAt ? format(new Date(item.publishedAt), 'MM月dd日', { locale: zhCN }) : ''}
          </span>
          <span style={{ color: 'var(--bd-h)' }}>.</span>
          <span className="text-sm" style={{ color: 'var(--t3)' }}>
            {item.publishedAt ? format(new Date(item.publishedAt), 'HH:mm') : ''}
          </span>
        </div>
        {isAdmin && (
          <button
            onClick={handleFavorite}
            disabled={favLoading}
            className="p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
            style={{
              color: fav ? '#f59e0b' : 'var(--t3)',
              opacity: fav ? 1 : undefined,
            }}
            title={fav ? 'cancel favorite' : 'add to featured'}
          >
            {fav ? <BookmarkSolidIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Title */}
      <h2
        className={`font-bold mb-4 transition-colors duration-200 ${isFirst ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}
        style={{ color: 'var(--t1)' }}
      >
        <span className="group-hover:text-[var(--ac)] transition-colors duration-200">
          {item.title || '无标题'}
        </span>
      </h2>

      {/* Author */}
      {item.authorUsername && (
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--ac) 0%, #7c3aed 100%)' }}
          >
            <span className="text-white text-[9px] font-bold">
              {item.authorUsername[0].toUpperCase()}
            </span>
          </div>
          <span className="text-sm" style={{ color: 'var(--t3)' }}>
            @{item.authorUsername}
          </span>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTagStyle(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Summary */}
      {item.summary && (
        <p className="text-base mb-5 leading-relaxed" style={{ color: 'var(--t2)' }}>
          {item.summary}
        </p>
      )}

      {/* Content preview */}
      {item.content && (
        <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--t3)' }}>
          {item.content.substring(0, 280)}…
        </p>
      )}

      {/* Read more */}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors group/link"
          style={{ color: 'var(--ac)' }}
        >
          <BookOpenIcon className="w-4 h-4" />
          <span>阅读原文</span>
          <ArrowRightIcon className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </a>
      )}
    </article>
  )
}

function LoadingItem() {
  return (
    <div className="py-10 animate-pulse" style={{ borderBottom: '1px solid var(--bd)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-16 rounded" style={{ background: 'var(--bg-card)' }} />
        <div className="h-4 w-12 rounded" style={{ background: 'var(--bg-card)' }} />
      </div>
      <div className="h-9 rounded mb-4 w-3/4" style={{ background: 'var(--bg-card)' }} />
      <div className="h-4 rounded mb-2" style={{ background: 'var(--bg-card)' }} />
      <div className="h-4 rounded w-5/6" style={{ background: 'var(--bg-card)' }} />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-24 text-center">
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8"
        style={{ background: 'var(--ac-dim)', border: '1px solid rgba(240,54,104,0.2)' }}
      >
        <BookOpenIcon className="w-8 h-8" style={{ color: 'var(--ac)' }} />
      </div>
      <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--t1)' }}>
        晨报即将到来
      </h2>
      <p className="mb-8 text-sm leading-relaxed" style={{ color: 'var(--t2)' }}>
        明早 <span style={{ color: 'var(--ac)' }} className="font-semibold">8:00</span> 准时推送
        <br />
        专注阅读，告别信息过载
      </p>
      <div className="flex flex-wrap justify-center gap-2 text-sm">
        {['Claude 新功能', '实用技巧', '开发教程'].map((f, i) => (
          <span
            key={i}
            className="px-3 py-1.5 rounded-full text-xs"
            style={{ background: 'var(--bg-card)', color: 'var(--t3)', border: '1px solid var(--bd)' }}
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.isAdmin === true
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchArticles()
  }, [])

  async function fetchArticles() {
    try {
      const res = await fetch('/api/morning-news?limit=30')
      const data = await res.json()
      setArticles(data.data || [])
    } catch (error) {
      console.error('Failed to fetch morning news:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <Navbar />
        <main className="max-w-full mx-auto px-4 py-8">
          <LoadingItem />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Navbar />

      {/* Sticky Header */}
      <header
        className="sticky top-14 z-10"
        style={{ background: 'rgba(7,8,11,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--bd)' }}
      >
        <div className="max-w-full mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--t1)' }}>每日晨报</h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>每个工作日 8:00 更新</p>
            </div>
            {!loading && articles.length > 0 && (
              <span className="text-xs" style={{ color: 'var(--t3)' }}>
                共 {articles.length} 篇
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-full mx-auto px-4">
        {loading ? (
          <>
            <LoadingItem />
            <LoadingItem />
            <LoadingItem />
          </>
        ) : articles.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {articles.map((article, index) => (
              <NewsCard key={article.id} item={article} isFirst={index === 0} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8" style={{ borderTop: '1px solid var(--bd)' }}>
        <div className="max-w-full mx-auto px-4 text-center">
          <p className="text-xs" style={{ color: 'var(--t3)' }}>
            信息茧房 · 专注 AI 资讯阅读
          </p>
        </div>
      </footer>
    </div>
  )
}
