'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { Article } from '@/lib/types'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ClockIcon, ArrowLeftIcon, ArrowRightIcon, BookOpenIcon } from '@heroicons/react/24/outline'

// Reading-first color palette
const TAG_STYLES: Record<string, string> = {
  'Claude': 'bg-purple-100 text-purple-700',
  'Claude Code': 'bg-indigo-100 text-indigo-700',
  '晨报': 'bg-pink-100 text-pink-700',
  '新功能': 'bg-emerald-100 text-emerald-700',
  '实用技巧': 'bg-blue-100 text-blue-700',
  '开发教程': 'bg-orange-100 text-orange-700',
  'AI资讯': 'bg-cyan-100 text-cyan-700',
  '热门讨论': 'bg-red-100 text-red-700',
}

function getTagStyle(tag: string) {
  return TAG_STYLES[tag] || 'bg-gray-800 text-gray-400'
}

function ReadingNewsCard({ item, isFirst = false }: { item: Article; isFirst?: boolean }) {
  const tags = item.tags || []
  
  return (
    <article className={`group ${isFirst ? 'pb-16 mb-12 border-b border-gray-700' : 'py-12'}`}>
      {/* Date */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-400">
          {item.publishedAt ? format(new Date(item.publishedAt), 'MM月dd日', { locale: zhCN }) : ''}
        </span>
        <span className="text-gray-300">·</span>
        <span className="text-sm text-gray-400">
          {item.publishedAt ? format(new Date(item.publishedAt), 'HH:mm', { locale: zhCN }) : ''}
        </span>
      </div>
      
      {/* Title */}
      <h2 className={`font-bold text-gray-100 mb-4 group-hover:text-pink-600 transition-colors ${isFirst ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}>
        {item.title || '无标题'}
      </h2>
      
      {/* Author */}
      {item.authorUsername && (
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-xs font-medium">@{item.authorUsername[0].toUpperCase()}</span>
          </div>
          <span className="text-sm text-gray-500">@{item.authorUsername}</span>
        </div>
      )}
      
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.slice(0, 4).map(tag => (
            <span 
              key={tag} 
              className={`px-3 py-1 rounded-full text-xs font-medium ${getTagStyle(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Summary */}
      {item.summary && (
        <p className="text-lg text-gray-400 mb-6 leading-relaxed font-medium">
          {item.summary}
        </p>
      )}
      
      {/* Content preview */}
      {item.content && (
        <div className="text-gray-500 leading-relaxed mb-6 prose prose-gray max-w-none">
          <p className="text-base line-clamp-3">{item.content.substring(0, 300)}...</p>
        </div>
      )}
      
      {/* Read more */}
      {item.url && (
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors group/link"
        >
          <BookOpenIcon className="w-4 h-4" />
          <span>阅读原文</span>
          <ArrowRightIcon className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </a>
      )}
    </article>
  )
}

function LoadingItem() {
  return (
    <div className="py-12 border-b border-gray-800 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-20 bg-gray-700 rounded"></div>
        <div className="h-4 w-4 bg-gray-700 rounded"></div>
        <div className="h-4 w-16 bg-gray-700 rounded"></div>
      </div>
      <div className="h-10 bg-gray-700 rounded mb-4 w-3/4"></div>
      <div className="h-4 w-16 bg-gray-700 rounded mb-6"></div>
      <div className="h-4 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 bg-gray-700 rounded mb-2 w-11/12"></div>
      <div className="h-4 bg-gray-700 rounded w-10/12"></div>
    </div>
  )
}

function EmptyReading() {
  return (
    <div className="py-24 text-center">
      {/* Reading icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-50 mb-8">
        <BookOpenIcon className="w-10 h-10 text-pink-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-100 mb-4">
        晨报即将到来
      </h2>
      
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        明早 <span className="text-pink-600 font-semibold">8:00</span> 准时推送<br />
        专注阅读，告别信息过载
      </p>
      
      {/* Features */}
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        {['Claude 新功能', '实用技巧', '开发教程'].map((f, i) => (
          <span key={i} className="px-4 py-2 bg-gray-800 rounded-full text-gray-400">
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
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
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <LoadingItem />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">每日晨报</h1>
              <p className="text-sm text-gray-400 mt-1">每个工作日 8:00 更新</p>
            </div>
            {!loading && articles.length > 0 && (
              <div className="text-sm text-gray-400">
                共 {articles.length} 篇
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4">
        {loading ? (
          <>
            <LoadingItem />
            <LoadingItem />
            <LoadingItem />
          </>
        ) : articles.length === 0 ? (
          <EmptyReading />
        ) : (
          <div className="divide-y divide-gray-100">
            {articles.map((article, index) => (
              <ReadingNewsCard 
                key={article.id} 
                item={article} 
                isFirst={index === 0}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-8">
        <div className="max-w-2xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>信息茧房 · 专注 AI 资讯阅读</p>
        </div>
      </footer>
    </div>
  )
}
