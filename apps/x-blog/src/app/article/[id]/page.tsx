import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import Navbar from '@/components/Navbar'
import SplitView from '@/components/SplitView'
import { getArticleById } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params
  const article = getArticleById(id)

  if (!article) notFound()

  const hasTranslation =
    article.translatedContent &&
    article.content &&
    article.content !== article.translatedContent

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Navbar />

      <main className="max-w-full mx-auto px-4 py-6">
        {/* Title Card */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}
        >
          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.authorUsername && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'var(--ac-dim)',
                  color: 'var(--ac)',
                  border: '1px solid rgba(240,54,104,0.2)',
                }}
              >
                @{article.authorUsername}
              </span>
            )}
            {article.originalLanguage && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'var(--bg-surface)', color: 'var(--t2)', border: '1px solid var(--bd)' }}
              >
                {article.originalLanguage === 'zh'
                  ? '🇨🇳 中文'
                  : article.originalLanguage === 'en'
                  ? '🇬🇧 English'
                  : article.originalLanguage}
              </span>
            )}
            {article.publishedAt && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs"
                style={{ background: 'var(--bg-surface)', color: 'var(--t3)', border: '1px solid var(--bd)' }}
              >
                🕐{' '}
                {formatDistanceToNow(new Date(article.publishedAt), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            )}
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ml-auto"
                style={{
                  background: 'var(--ac-dim)',
                  color: 'var(--ac)',
                  border: '1px solid rgba(240,54,104,0.2)',
                }}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                原地址
              </a>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold leading-snug" style={{ color: 'var(--t1)' }}>
            {article.title || '无标题'}
          </h1>

          {article.author && article.authorUsername !== article.author && (
            <p className="text-sm mt-2" style={{ color: 'var(--t3)' }}>
              作者：{article.author}
            </p>
          )}
        </div>

        {/* Content */}
        {hasTranslation ? (
          <SplitView
            originalContent={article.content || ''}
            translatedContent={article.translatedContent || ''}
          />
        ) : (
          <div
            className="rounded-2xl p-8"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}
          >
            <div className="prose prose-invert max-w-none text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {article.translatedContent || article.content}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: 'var(--t3)' }}>
            添加于{' '}
            {new Date(article.createdAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </main>
    </div>
  )
}
