// === Morning News (temporary, daily refresh) ===

export interface MorningNewsItem {
  id: string
  url: string
  title: string | null
  content: string | null
  summary: string | null
  translatedTitle: string | null
  translatedSummary: string | null
  author: string | null
  authorUsername: string | null
  tags: string[]
  publishedAt: string | null
  createdAt: string
}

// === Articles (permanent, featured) ===

export interface Article {
  id: string
  url: string
  title: string | null
  content: string | null
  summary: string | null
  translatedContent: string | null
  translatedSummary: string | null
  originalLanguage: string | null
  author: string | null
  authorUsername: string | null
  tags: string[]
  coverImage: string | null
  sourceUrl: string | null
  fullContent: string | null
  status: 'pending_crawl' | 'pending_translation' | 'completed' | 'failed'
  error: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateArticleInput {
  url?: string | null
  title?: string | null
  author?: string | null
  authorUsername?: string | null
  publishedAt?: string | null
  content?: string | null
  summary?: string | null
  coverImage?: string | null
  translatedContent?: string | null
  translatedSummary?: string | null
  originalLanguage?: string | null
  sourceUrl?: string | null
  fullContent?: string | null
  tags?: string[]
  status?: Article['status']
  error?: string | null
}

export interface UpdateArticleInput {
  author?: string | null
  authorUsername?: string | null
  title?: string | null
  content?: string | null
  summary?: string | null
  translatedContent?: string | null
  translatedSummary?: string | null
  originalLanguage?: string | null
  coverImage?: string | null
  publishedAt?: string | null
  sourceUrl?: string | null
  fullContent?: string | null
  tags?: string[]
  status?: Article['status']
  error?: string | null
}

export interface User {
  id: string
  githubId: string
  name: string | null
  email: string | null
  image: string | null
  status: 'approved' | 'blacklisted'
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}
