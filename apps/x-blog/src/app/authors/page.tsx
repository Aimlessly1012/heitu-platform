'use client'

import { ArrowTopRightOnSquareIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import Navbar from '@/components/Navbar'
import { useState } from 'react'

interface Author {
  username: string
  displayName: string
  bio: string
  avatar: string
  specialties: string[]
}

const AUTHORS: Author[] = [
  {
    username: 'nash_su', displayName: 'Nash Su',
    bio: 'AI 研究者与实践者，专注于大模型应用与 Prompt Engineering',
    avatar: 'https://unavatar.io/twitter/nash_su',
    specialties: ['AI Research', 'Prompt Engineering', 'LLM Applications'],
  },
  {
    username: 'affaanmustafa', displayName: 'Affaan Mustafa',
    bio: 'Product Manager，AI 工具爱好者，分享实用的 AI 工作流',
    avatar: 'https://unavatar.io/twitter/affaanmustafa',
    specialties: ['Product Management', 'AI Workflows', 'Productivity'],
  },
  {
    username: 'Voxyz_ai', displayName: 'Voxyz AI',
    bio: 'AI 技术解析与教程，帮助开发者快速上手 Claude 和 OpenAI',
    avatar: 'https://unavatar.io/twitter/Voxyz_ai',
    specialties: ['AI Tutorials', 'Claude', 'OpenAI'],
  },
  {
    username: 'zodchiii', displayName: 'Dark Zodchi',
    bio: 'Prompt 技巧大师，分享 Claude 高级用法与最佳实践',
    avatar: 'https://unavatar.io/twitter/zodchiii',
    specialties: ['Prompt Techniques', 'Claude Tips', 'Best Practices'],
  },
  {
    username: 'heynavtoor', displayName: 'Nav Toor',
    bio: 'Context Engineering 先驱，探索 AI Agent 的新边界',
    avatar: 'https://unavatar.io/twitter/heynavtoor',
    specialties: ['Context Engineering', 'AI Agent', 'Innovation'],
  },
  {
    username: 'PandaTalk8', displayName: 'Mr Panda',
    bio: 'Skill 开发与商业化专家，分享 AI 变现经验',
    avatar: 'https://unavatar.io/twitter/PandaTalk8',
    specialties: ['Skill Development', 'Monetization', 'Business'],
  },
  {
    username: 'LawrenceW_Zen', displayName: '劳伦斯',
    bio: '从零构建 Agent Team，分享实战经验与技术细节',
    avatar: 'https://unavatar.io/twitter/LawrenceW_Zen',
    specialties: ['Agent Team', 'Tutorials', 'Tech Deep Dive'],
  },
  {
    username: 'Khazix0918', displayName: 'Khazix',
    bio: '开发者工具推荐与效率提升，分享前沿插件与脚本',
    avatar: 'https://unavatar.io/twitter/Khazix0918',
    specialties: ['Dev Tools', 'Plugins', 'Efficiency'],
  },
  {
    username: 'bindureddy', displayName: 'Bindu Reddy',
    bio: 'AI 创业者与产品专家，关注 AI 产品化与商业落地',
    avatar: 'https://unavatar.io/twitter/bindureddy',
    specialties: ['AI Startup', 'Product', 'Business'],
  },
  {
    username: 'rowancheung', displayName: 'Rowan Cheung',
    bio: 'AI 资讯达人，每日分享最新 AI 动态与工具推荐',
    avatar: 'https://unavatar.io/twitter/rowancheung',
    specialties: ['AI News', 'Tool Reviews', 'Daily Updates'],
  },
  {
    username: 'jackclarkSF', displayName: 'Jack Clark',
    bio: 'Anthropic 联合创始人，分享 AI 安全与技术趋势',
    avatar: 'https://unavatar.io/twitter/jackclarkSF',
    specialties: ['AI Safety', 'Anthropic', 'Tech Trends'],
  },
  {
    username: 'alexalbert__', displayName: 'Alex Albert',
    bio: 'Anthropic 产品经理，深度解析 Claude 功能与应用场景',
    avatar: 'https://unavatar.io/twitter/alexalbert__',
    specialties: ['Claude Product', 'Use Cases', 'Anthropic'],
  },
]

// Dark-compatible specialty colors
const SPECIALTY_COLORS: Record<string, string> = {
  'AI Research':        'bg-purple-500/10 text-purple-300 border border-purple-500/20',
  'Prompt Engineering': 'bg-pink-500/10 text-pink-300 border border-pink-500/20',
  'LLM Applications':   'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  'Product Management': 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  'AI Workflows':       'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  'Productivity':       'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  'AI Tutorials':       'bg-orange-500/10 text-orange-300 border border-orange-500/20',
  'Claude':             'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  'OpenAI':             'bg-white/5 text-slate-300 border border-white/10',
  'Prompt Techniques':  'bg-pink-500/10 text-pink-300 border border-pink-500/20',
  'Claude Tips':        'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  'Best Practices':     'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  'Context Engineering':'bg-teal-500/10 text-teal-300 border border-teal-500/20',
  'AI Agent':           'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  'Innovation':         'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20',
  'Skill Development':  'bg-lime-500/10 text-lime-300 border border-lime-500/20',
  'Monetization':       'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  'Business':           'bg-orange-500/10 text-orange-300 border border-orange-500/20',
  'Agent Team':         'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  'Tutorials':          'bg-orange-500/10 text-orange-300 border border-orange-500/20',
  'Tech Deep Dive':     'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  'Dev Tools':          'bg-sky-500/10 text-sky-300 border border-sky-500/20',
  'Plugins':            'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  'Efficiency':         'bg-green-500/10 text-green-300 border border-green-500/20',
  'AI Startup':         'bg-pink-500/10 text-pink-300 border border-pink-500/20',
  'Product':            'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  'AI News':            'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  'Tool Reviews':       'bg-white/5 text-slate-300 border border-white/10',
  'Daily Updates':      'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20',
  'AI Safety':          'bg-red-500/10 text-red-300 border border-red-500/20',
  'Anthropic':          'bg-orange-500/10 text-orange-300 border border-orange-500/20',
  'Tech Trends':        'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  'Claude Product':     'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  'Use Cases':          'bg-teal-500/10 text-teal-300 border border-teal-500/20',
}

function getSpecialtyClass(s: string) {
  return SPECIALTY_COLORS[s] || 'bg-white/5 text-slate-400 border border-white/10'
}

function AuthorCard({ author }: { author: Author }) {
  return (
    <a
      href={`https://x.com/${author.username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl p-5 transition-all duration-200"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--bd-h)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--bd)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      {/* Avatar + Name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full p-0.5"
            style={{ background: 'linear-gradient(135deg, var(--ac) 0%, #7c3aed 100%)' }}
          >
            <img
              src={author.avatar}
              alt={author.displayName}
              className="w-full h-full rounded-full object-cover"
              style={{ background: 'var(--bg-card)' }}
              loading="lazy"
              onError={e => {
                e.currentTarget.style.display = 'none'
                const fb = e.currentTarget.nextElementSibling as HTMLElement
                if (fb) fb.style.display = 'flex'
              }}
            />
            <div
              className="hidden w-full h-full rounded-full items-center justify-center text-lg font-bold"
              style={{ color: 'var(--ac)' }}
            >
              {author.displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-bold truncate transition-colors"
            style={{ color: 'var(--t1)' }}
          >
            {author.displayName}
          </h3>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--t3)' }}>
            <span>@{author.username}</span>
            <ArrowTopRightOnSquareIcon
              className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--t2)' }}>
        {author.bio}
      </p>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1.5">
        {author.specialties.slice(0, 3).map(s => (
          <span key={s} className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSpecialtyClass(s)}`}>
            {s}
          </span>
        ))}
      </div>
    </a>
  )
}

function RecommendForm() {
  const [authorUrl, setAuthorUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pattern = /^https?:\/\/(x\.com|twitter\.com)\/([a-zA-Z0-9_]+)\/?$/
    const match = authorUrl.match(pattern)
    if (!match) {
      setMessage({ type: 'error', text: '请输入有效的 X/Twitter 用户链接（例如：https://x.com/username）' })
      return
    }
    const username = match[2]
    setIsSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch('/api/recommend-author', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: authorUrl, submittedBy: 'web' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '提交失败')
      setMessage({ type: 'success', text: `感谢推荐 @${username}！我们会尽快审核 🎉` })
      setAuthorUrl('')
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '提交失败，请稍后重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-8"
      style={{
        background: 'linear-gradient(135deg, rgba(240,54,104,0.08) 0%, rgba(124,58,237,0.08) 100%)',
        border: '1px solid rgba(240,54,104,0.15)',
      }}
    >
      <div className="max-w-full mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--t1)' }}>推荐优质博主</h2>
          <p className="text-sm" style={{ color: 'var(--t2)' }}>
            发现值得关注的 AI 领域创作者？提交他们的链接吧
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={authorUrl}
              onChange={e => setAuthorUrl(e.target.value)}
              placeholder="https://x.com/username"
              className="input"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !authorUrl}
              className="btn btn-primary px-5 flex-shrink-0"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <UserPlusIcon className="w-4 h-4" />
                  <span>推荐</span>
                </>
              )}
            </button>
          </div>

          {message && (
            <div
              className="p-3 rounded-xl text-sm"
              style={
                message.type === 'success'
                  ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7' }
                  : { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }
              }
            >
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default function AuthorsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Navbar />

      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--bd)' }}>
        <div className="max-w-full mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--t1)' }}>X 热门博主</h1>
          <p className="text-sm" style={{ color: 'var(--t2)' }}>
            {AUTHORS.length} 位优质创作者 · 持续更新
          </p>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-full mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AUTHORS.map(author => (
            <AuthorCard key={author.username} author={author} />
          ))}
        </div>
      </main>

      {/* Recommend Form */}
      <div className="max-w-full mx-auto px-4 pb-12">
        <RecommendForm />
      </div>
    </div>
  )
}
