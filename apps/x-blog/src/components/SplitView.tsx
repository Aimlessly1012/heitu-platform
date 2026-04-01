'use client'

import { useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface SplitViewProps {
  originalContent: string
  translatedContent: string
}

export default function SplitView({ originalContent, translatedContent }: SplitViewProps) {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const isScrolling = useRef(false)

  useEffect(() => {
    const left = leftRef.current
    const right = rightRef.current
    if (!left || !right) return

    const handleLeftScroll = () => {
      if (isScrolling.current) return
      isScrolling.current = true
      const { scrollTop, scrollHeight, clientHeight } = left
      const pct = scrollTop / (scrollHeight - clientHeight)
      right.scrollTop = pct * (right.scrollHeight - right.clientHeight)
      requestAnimationFrame(() => { isScrolling.current = false })
    }

    const handleRightScroll = () => {
      if (isScrolling.current) return
      isScrolling.current = true
      const { scrollTop, scrollHeight, clientHeight } = right
      const pct = scrollTop / (scrollHeight - clientHeight)
      left.scrollTop = pct * (left.scrollHeight - left.clientHeight)
      requestAnimationFrame(() => { isScrolling.current = false })
    }

    left.addEventListener('scroll', handleLeftScroll)
    right.addEventListener('scroll', handleRightScroll)
    return () => {
      left.removeEventListener('scroll', handleLeftScroll)
      right.removeEventListener('scroll', handleRightScroll)
    }
  }, [])

  return (
    <div className="grid md:grid-cols-2 gap-4 min-h-[500px]">
      {/* Left: Original */}
      <div
        className="rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}
      >
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--bd)', background: 'var(--bg-surface)' }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--t3)' }}>
            English
          </span>
          <span style={{ color: 'var(--bd-h)' }}>·</span>
          <span className="text-xs" style={{ color: 'var(--t3)' }}>原文</span>
        </div>
        <div ref={leftRef} className="flex-1 overflow-y-auto p-5">
          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {originalContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Right: Translation */}
      <div
        className="rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}
      >
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{
            borderBottom: '1px solid var(--bd)',
            background: 'rgba(240, 54, 104, 0.06)',
            borderTop: '2px solid var(--ac)',
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ac)' }}>
            中文
          </span>
          <span style={{ color: 'var(--ac-dim)' }}>·</span>
          <span className="text-xs" style={{ color: 'var(--t2)' }}>译文 / 总结</span>
        </div>
        <div ref={rightRef} className="flex-1 overflow-y-auto p-5">
          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {translatedContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
