'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { Article } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const TAG_COLORS: Record<string, string> = {
  'Claude':       'tag-claude',
  'Claude Code':  'tag-claude-code',
  '晨报':         'tag-morning',
  '新功能':       'tag-feature',
  '实用技巧':     'tag-tip',
  '开发教程':     'tag-tutorial',
  'AI资讯':       'tag-ai-news',
  '热门讨论':     'tag-hot',
}

function getTagClass(tag: string) {
  return TAG_COLORS[tag] || 'tag-default'
}

function NewsCard({ item }: { item: Article }) {
  const tags = item.tags || []

  return (
    <article
      className="rounded-2xl p-6 hover:scale-[1.01] transition-all duration-200"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--bd)',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--bd-h)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(240,54,104,0.05)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--bd)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      {/* Tags + Time */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagClass(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-xs whitespace-nowrap flex-shrink-0 mt-0.5" style={{ color: 'var(--t3)' }}>
          {item.publishedAt
            ? formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true, locale: zhCN })
            : ''}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold mb-2 line-clamp-2" style={{ color: 'var(--t1)' }}>
        {item.title || '无标题'}
      </h3>

      {/* Summary */}
      {item.summary && (
        <p className="text-sm mb-4 line-clamp-3 leading-relaxed" style={{ color: 'var(--t2)' }}>
          {item.summary}
        </p>
      )}

      {/* Content preview */}
      {item.content && (
        <p className="text-sm line-clamp-3 leading-relaxed mb-4" style={{ color: 'var(--t3)' }}>
          {item.content.substring(0, 280)}…
        </p>
      )}

      {/* Read link */}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-1 text-sm font-medium transition-colors"
          style={{ color: 'var(--ac)' }}
        >
          阅读原文 →
        </a>
      )}
    </article>
  )
}

function Skeleton() {
  return (
    <div
      className="rounded-2xl p-6 animate-pulse"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}
    >
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-14 rounded-full" style={{ background: 'var(--bg-card-h)' }} />
        <div className="h-5 w-18 rounded-full" style={{ background: 'var(--bg-card-h)' }} />
      </div>
      <div className="h-5 rounded mb-3 w-3/4" style={{ background: 'var(--bg-card-h)' }} />
      <div className="h-4 rounded mb-2" style={{ background: 'var(--bg-card-h)' }} />
      <div className="h-4 rounded w-5/6" style={{ background: 'var(--bg-card-h)' }} />
    </div>
  )
}

export default function MorningNewsPage() {
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
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <Skeleton /><Skeleton /><Skeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌅</span>
            <h1
              className="text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--ac) 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              每日晨报
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--t2)' }}>
            每天早上 8 点推送 Claude 最新资讯，包括新功能、实用技巧、开发教程等
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton /><Skeleton /><Skeleton />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--t1)' }}>暂无晨报</h2>
            <p className="text-sm" style={{ color: 'var(--t2)' }}>
              明早 8 点会自动推送，别忘了回来看看 🐰
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map(article => (
              <NewsCard key={article.id} item={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
