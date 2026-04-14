'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { Article } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  ClockIcon, TrashIcon, BookOpenIcon, ArrowRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'

// Dark-compatible tag colors
const TAG_COLORS: Record<string, string> = {
  'Claude':             'bg-purple-500/10 text-purple-300 border border-purple-500/20',
  'Claude Code':        'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  'OpenClaw':           'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  'Skills':             'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  'MCP':                'bg-teal-500/10 text-teal-300 border border-teal-500/20',
  'Prompt Engineering': 'bg-pink-500/10 text-pink-300 border border-pink-500/20',
  '教程':               'bg-orange-500/10 text-orange-300 border border-orange-500/20',
  '最佳实践':           'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  '快捷键':             'bg-green-500/10 text-green-300 border border-green-500/20',
  '工作流':             'bg-lime-500/10 text-lime-300 border border-lime-500/20',
  '技巧':               'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20',
  '资源合集':           'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  '效率提升':           'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  '自动化':             'bg-sky-500/10 text-sky-300 border border-sky-500/20',
  '安全':               'bg-red-500/10 text-red-300 border border-red-500/20',
  'AI Agent':           'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  '开发者向':           'bg-white/5 text-slate-300 border border-white/10',
  // Tags from mock data
  '新功能':             'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  '实用技巧':           'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  '开发教程':           'bg-orange-500/10 text-orange-300 border border-orange-500/20',
  'AI资讯':             'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  '热门讨论':           'bg-red-500/10 text-red-300 border border-red-500/20',
}

function getTagClass(tag: string) {
  return TAG_COLORS[tag] || 'bg-white/5 text-slate-400 border border-white/10'
}

const STATUS_LABELS: Record<Article['status'], string> = {
  pending: '等待中', pending_translation: '待翻译', crawling: '爬取中', translating: '翻译中',
  summarizing: '总结中', completed: '已完成', failed: '失败',
}

const STATUS_COLORS: Record<Article['status'], string> = {
  pending:    'bg-white/5 text-slate-400',
  pending_translation: 'bg-amber-500/10 text-amber-400',
  crawling:   'bg-blue-500/10 text-blue-400',
  translating: 'bg-yellow-500/10 text-yellow-400',
  summarizing: 'bg-purple-500/10 text-purple-400',
  completed:  'bg-emerald-500/10 text-emerald-400',
  failed:     'bg-red-500/10 text-red-400',
}

type FilterType = 'all' | 'completed' | 'processing'

function Skeleton() {
  return (
    <div
      className="rounded-2xl p-6 animate-pulse"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-20 rounded-full" style={{ background: 'var(--bg-card-h)' }} />
        <div className="h-6 w-14 rounded-full" style={{ background: 'var(--bg-card-h)' }} />
      </div>
      <div className="h-6 rounded mb-3 w-3/4" style={{ background: 'var(--bg-card-h)' }} />
      <div className="h-4 rounded mb-2" style={{ background: 'var(--bg-card-h)' }} />
      <div className="h-4 rounded w-2/3" style={{ background: 'var(--bg-card-h)' }} />
    </div>
  )
}

function ArticleCard({
  article, onDelete, isDeleting,
}: {
  article: Article
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  const [bookmarked, setBookmarked] = useState(false)
  const tags = article.tags || []

  return (
    <article
      className="rounded-2xl transition-all duration-200"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--bd-h)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--bd)'
      }}
    >
      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {article.authorUsername && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'var(--ac-dim)', color: 'var(--ac)', border: '1px solid rgba(240,54,104,0.2)' }}
              >
                @{article.authorUsername}
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[article.status]}`}>
              {STATUS_LABELS[article.status]}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setBookmarked(b => !b)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: bookmarked ? 'var(--ac)' : 'var(--t3)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-card-h)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              {bookmarked ? (
                <BookmarkSolidIcon className="w-4 h-4" />
              ) : (
                <BookOpenIcon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onDelete(article.id)}
              disabled={isDeleting}
              className="p-2 rounded-lg transition-colors disabled:opacity-40"
              style={{ color: 'var(--t3)' }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'
                ;(e.currentTarget as HTMLElement).style.color = '#fca5a5'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--t3)'
              }}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-bold mb-3 line-clamp-2 transition-colors"
          style={{ color: 'var(--t1)' }}
        >
          {article.title || '无标题'}
        </h3>

        {/* Summary */}
        {article.summary && (
          <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--t2)' }}>
            {article.summary}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 4).map(tag => (
              <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagClass(tag)}`}>
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: 'var(--bg-card-h)', color: 'var(--t3)' }}
              >
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid var(--bd)' }}
        >
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--t3)' }}>
            <ClockIcon className="w-3.5 h-3.5" />
            <span>
              {article.publishedAt
                ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: zhCN })
                : ''}
            </span>
          </div>
          {article.url && (
            <a
              href={`/article/${article.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium transition-colors group/link"
              style={{ color: 'var(--ac)' }}
            >
              <span>阅读全文</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}
      >
        <BookOpenIcon className="w-8 h-8" style={{ color: 'var(--t3)' }} />
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--t1)' }}>暂无精选文章</h3>
      <p className="text-sm" style={{ color: 'var(--t2)' }}>
        在{' '}
        <a href="/" className="underline" style={{ color: 'var(--ac)' }}>每日晨报</a>{' '}
        中点击收藏按钮，文章将出现在这里
      </p>
    </div>
  )
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchArticles()
  }, [])

  async function fetchArticles() {
    try {
      const res = await fetch('/api/articles')
      const data = await res.json()
      setArticles(data.data || [])
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      setArticles(prev => prev.filter(a => a.id !== id))
    } catch (error) {
      console.error('Failed to delete article:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredArticles = articles.filter(article => {
    if (filter === 'completed' && article.status !== 'completed') return false
    if (filter === 'processing' && ['pending', 'crawling', 'translating', 'summarizing'].includes(article.status))
      return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !article.title?.toLowerCase().includes(q) &&
        !article.authorUsername?.toLowerCase().includes(q) &&
        !article.summary?.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  if (!mounted) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <Navbar />
        <main className="max-w-full mx-auto px-4 py-8 space-y-4">
          <Skeleton /><Skeleton /><Skeleton />
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
        style={{
          background: 'rgba(7,8,11,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--bd)',
        }}
      >
        <div className="max-w-full mx-auto px-6 py-4">
          <h1 className="text-lg font-bold mb-4" style={{ color: 'var(--t1)' }}>精选文章</h1>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--t3)' }}
              />
              <input
                type="text"
                placeholder="搜索文章、作者…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm transition-colors focus:outline-none"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--bd)',
                  color: 'var(--t1)',
                }}
                onFocus={e => ((e.target as HTMLInputElement).style.borderColor = 'var(--ac)')}
                onBlur={e => ((e.target as HTMLInputElement).style.borderColor = 'var(--bd)')}
              />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'completed', 'processing'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
                  style={
                    filter === f
                      ? { background: 'var(--ac)', color: '#fff', border: '1px solid var(--ac)' }
                      : { background: 'var(--bg-card)', color: 'var(--t2)', border: '1px solid var(--bd)' }
                  }
                >
                  {f === 'all' ? '全部' : f === 'completed' ? '已完成' : '处理中'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-full mx-auto px-6 py-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton /><Skeleton /><Skeleton />
          </div>
        ) : filteredArticles.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: 'var(--t3)' }}>
              共 {filteredArticles.length} 篇文章
            </p>
            <div className="space-y-4">
              {filteredArticles.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onDelete={handleDelete}
                  isDeleting={deletingId === article.id}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
