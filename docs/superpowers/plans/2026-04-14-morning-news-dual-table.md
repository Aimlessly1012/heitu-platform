# Morning News Dual-Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the single `articles` table into `morning_news` (temporary, daily refresh) and `articles` (permanent featured) tables. Add favorite-to-copy flow with link crawling and AI summarization.

**Architecture:** New `morning_news` table for daily ephemeral data. Favoriting copies a row to `articles` and triggers async crawl + translate pipeline. Existing `articles` table is rebuilt without `is_favorited` field, gaining `source_url` and `full_content` fields.

**Tech Stack:** SQLite (better-sqlite3), Next.js 16 API routes, Python scripts, Hermes CLI, Tavily API

---

### Task 1: Update TypeScript Types

**Files:**
- Modify: `apps/x-blog/src/lib/types.ts`

- [ ] **Step 1: Replace types.ts content**

```typescript
// === Morning News (temporary, daily refresh) ===

export interface MorningNewsItem {
  id: string
  url: string
  title: string | null
  content: string | null
  summary: string | null
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/x-blog/src/lib/types.ts
git commit -m "refactor: add MorningNewsItem type, update Article with sourceUrl/fullContent"
```

---

### Task 2: Rewrite Database Layer

**Files:**
- Modify: `apps/x-blog/src/lib/db.ts`

- [ ] **Step 1: Rewrite initDb to create both tables**

Replace the `initDb` function. Key changes:
- Create `morning_news` table (lightweight, no UNIQUE on url)
- Rebuild `articles` table with `source_url`, `full_content` fields, remove `is_favorited`
- Migration: move any `is_favorited=1` rows from old articles to new articles table
- Keep `users` table unchanged

```typescript
function initDb(database: Database.Database) {
  // Morning news table (temporary, cleared daily)
  database.exec(`
    CREATE TABLE IF NOT EXISTS morning_news (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT,
      content TEXT,
      summary TEXT,
      author TEXT,
      author_username TEXT,
      tags TEXT,
      published_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  // Articles table (permanent, featured)
  database.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL UNIQUE,
      title TEXT,
      content TEXT,
      summary TEXT,
      translated_content TEXT,
      translated_summary TEXT,
      original_language TEXT,
      author TEXT,
      author_username TEXT,
      tags TEXT,
      cover_image TEXT,
      source_url TEXT,
      full_content TEXT,
      status TEXT DEFAULT 'pending_crawl',
      error TEXT,
      published_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  // Migration: add new columns to existing articles table if missing
  const addCol = (table: string, col: string, type: string) => {
    try { database.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`) } catch {}
  }
  addCol('articles', 'source_url', 'TEXT')
  addCol('articles', 'full_content', 'TEXT')

  // Users table (unchanged)
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      github_id TEXT,
      google_id TEXT,
      name TEXT,
      email TEXT,
      image TEXT,
      status TEXT DEFAULT 'approved',
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  database.exec(`UPDATE users SET status = 'approved' WHERE status IN ('pending', 'rejected')`)
}
```

- [ ] **Step 2: Add morning_news CRUD functions**

```typescript
// ==================== MORNING NEWS ====================

export function clearMorningNews(): number {
  const database = getDb()
  const result = database.prepare('DELETE FROM morning_news').run()
  return result.changes
}

export function insertMorningNews(item: {
  id: string, url: string, title?: string | null, content?: string | null,
  summary?: string | null, author?: string | null, authorUsername?: string | null,
  tags?: string[], publishedAt?: string | null
}): void {
  const database = getDb()
  database.prepare(`
    INSERT INTO morning_news (id, url, title, content, summary, author, author_username, tags, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    item.id, item.url, item.title || null, item.content || null,
    item.summary || null, item.author || null, item.authorUsername || null,
    JSON.stringify(item.tags || []), item.publishedAt || null
  )
}

export function getAllMorningNews(limit = 30): MorningNewsItem[] {
  const database = getDb()
  const rows = database.prepare(
    'SELECT * FROM morning_news ORDER BY created_at DESC LIMIT ?'
  ).all(limit) as Record<string, unknown>[]
  return rows.map(mapRowToMorningNews)
}

export function getMorningNewsById(id: string): MorningNewsItem | null {
  const database = getDb()
  const row = database.prepare('SELECT * FROM morning_news WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return row ? mapRowToMorningNews(row) : null
}

function mapRowToMorningNews(row: Record<string, unknown>): MorningNewsItem {
  return {
    id: row.id as string,
    url: row.url as string,
    title: row.title as string | null,
    content: row.content as string | null,
    summary: row.summary as string | null,
    author: row.author as string | null,
    authorUsername: row.author_username as string | null,
    tags: JSON.parse((row.tags as string) || '[]'),
    publishedAt: row.published_at as string | null,
    createdAt: row.created_at as string,
  }
}
```

- [ ] **Step 3: Update articles functions**

Remove `is_favorited` from `createArticle`, `mapRowToArticle`. Add `sourceUrl` and `fullContent` fields.

Update `mapRowToArticle`:
```typescript
function mapRowToArticle(row: Record<string, unknown>): Article {
  return {
    id: row.id as string,
    url: row.url as string,
    author: row.author as string | null,
    authorUsername: row.author_username as string | null,
    title: row.title as string | null,
    content: row.content as string | null,
    summary: row.summary as string | null,
    translatedContent: row.translated_content as string | null,
    translatedSummary: row.translated_summary as string | null,
    originalLanguage: row.original_language as string | null,
    coverImage: row.cover_image as string | null,
    sourceUrl: row.source_url as string | null,
    fullContent: row.full_content as string | null,
    publishedAt: row.published_at as string | null,
    tags: JSON.parse((row.tags as string) || '[]'),
    status: row.status as Article['status'],
    error: row.error as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}
```

Update `createArticle` to include `source_url` and `full_content` in INSERT, remove `is_favorited`.

Update `updateArticle` to support `sourceUrl` and `fullContent` fields.

- [ ] **Step 4: Remove old favorite functions**

Delete these functions from db.ts:
- `toggleFavorite`
- `deleteMorningNewsBeforeDate`
- `getPendingTranslationArticles`

Add new helper:
```typescript
export function getArticlesByStatus(status: Article['status']): Article[] {
  const database = getDb()
  const rows = database.prepare(
    'SELECT * FROM articles WHERE status = ? ORDER BY created_at DESC'
  ).all(status) as Record<string, unknown>[]
  return rows.map(mapRowToArticle)
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/x-blog/src/lib/db.ts
git commit -m "refactor: split into morning_news + articles tables, add CRUD for both"
```

---

### Task 3: Rewrite Morning News API

**Files:**
- Modify: `apps/x-blog/src/app/api/morning-news/route.ts`

- [ ] **Step 1: Rewrite route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { clearMorningNews, insertMorningNews, getAllMorningNews } from '@/lib/db'
import { randomId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, date } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
    }

    // Clear all existing morning news (daily refresh)
    const deleted = clearMorningNews()
    console.log(`[morning-news] cleared ${deleted} old items`)

    const results = []
    for (const item of items) {
      const id = `mn_${date}_${randomId()}`
      try {
        insertMorningNews({
          id,
          url: item.url || '',
          title: item.title,
          content: item.content,
          summary: item.summary,
          author: item.author,
          authorUsername: item.authorUsername,
          tags: item.tags,
          publishedAt: item.publishedAt,
        })
        results.push({ id, status: 'created' })
      } catch {
        results.push({ id, status: 'failed' })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Morning news error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')
    const data = getAllMorningNews(limit)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Morning news fetch error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/x-blog/src/app/api/morning-news/route.ts
git commit -m "refactor: morning-news API reads/writes morning_news table"
```

---

### Task 4: Create Favorite API

**Files:**
- Create: `apps/x-blog/src/app/api/articles/favorite/route.ts`
- Delete: `apps/x-blog/src/app/api/articles/[id]/favorite/route.ts`

- [ ] **Step 1: Create new favorite route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getMorningNewsById, createArticle, getArticleByUrl } from '@/lib/db'

function extractUrls(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s"'<>\])+]+/g)
  if (!match) return null
  // Filter out x.com/twitter URLs (those are the tweet itself)
  const external = match.filter(u => !u.includes('x.com/') && !u.includes('twitter.com/'))
  return external[0] || null
}

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token',
  })

  if (!token?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { morningNewsId } = await request.json()
    if (!morningNewsId) {
      return NextResponse.json({ error: 'Missing morningNewsId' }, { status: 400 })
    }

    const newsItem = getMorningNewsById(morningNewsId)
    if (!newsItem) {
      return NextResponse.json({ error: 'Morning news item not found' }, { status: 404 })
    }

    // Check duplicate
    const existing = getArticleByUrl(newsItem.url)
    if (existing) {
      return NextResponse.json({ error: 'Already in featured', article: existing }, { status: 409 })
    }

    // Extract external URL from content
    const sourceUrl = extractUrls(newsItem.content || '') || extractUrls(newsItem.url || '')

    const article = createArticle({
      url: newsItem.url,
      title: newsItem.title,
      content: newsItem.content,
      summary: newsItem.summary,
      author: newsItem.author,
      authorUsername: newsItem.authorUsername,
      tags: [...(newsItem.tags || []), 'featured'],
      publishedAt: newsItem.publishedAt,
      originalLanguage: 'en',
      sourceUrl,
      status: 'pending_crawl',
    })

    return NextResponse.json({ data: article }, { status: 201 })
  } catch (error) {
    console.error('Favorite error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Delete old favorite route**

```bash
rm -rf apps/x-blog/src/app/api/articles/\[id\]/favorite/
```

- [ ] **Step 3: Commit**

```bash
git add apps/x-blog/src/app/api/articles/favorite/route.ts
git add -u apps/x-blog/src/app/api/articles/\[id\]/favorite/
git commit -m "feat: new POST /api/articles/favorite copies morning_news to articles"
```

---

### Task 5: Simplify Articles API

**Files:**
- Modify: `apps/x-blog/src/app/api/articles/route.ts`

- [ ] **Step 1: Remove isFavorited filter from GET**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createArticle, getAllArticles, getArticleByUrl } from '@/lib/db'

export async function GET() {
  try {
    const articles = getAllArticles()
    return NextResponse.json({ data: articles })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

// POST stays the same
```

- [ ] **Step 2: Commit**

```bash
git add apps/x-blog/src/app/api/articles/route.ts
git commit -m "simplify: articles GET returns all articles (all are featured now)"
```

---

### Task 6: Update Homepage UI

**Files:**
- Modify: `apps/x-blog/src/app/page.tsx`

- [ ] **Step 1: Change import from Article to MorningNewsItem**

Replace:
```typescript
import { Article } from '@/lib/types'
```
With:
```typescript
import { MorningNewsItem } from '@/lib/types'
```

- [ ] **Step 2: Update NewsCard to use MorningNewsItem and new favorite API**

Change the component signature and favorite handler:
```typescript
function NewsCard({ item, isFirst = false, isAdmin = false }: {
  item: MorningNewsItem; isFirst?: boolean; isAdmin?: boolean
}) {
  const tags = item.tags || []
  const [favLoading, setFavLoading] = useState(false)
  const [fav, setFav] = useState(false)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (favLoading || fav) return
    setFavLoading(true)
    try {
      const res = await fetch('/api/articles/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ morningNewsId: item.id }),
      })
      if (res.ok) {
        setFav(true)
      } else if (res.status === 409) {
        setFav(true) // already favorited
      }
    } catch {} finally { setFavLoading(false) }
  }
  // ... rest of component unchanged
```

- [ ] **Step 3: Update HomePage state type**

```typescript
const [articles, setArticles] = useState<MorningNewsItem[]>([])
```

- [ ] **Step 4: Commit**

```bash
git add apps/x-blog/src/app/page.tsx
git commit -m "refactor: homepage uses MorningNewsItem type and new favorite API"
```

---

### Task 7: Update Articles Page

**Files:**
- Modify: `apps/x-blog/src/app/articles/page.tsx`

- [ ] **Step 1: Update STATUS_LABELS and STATUS_COLORS**

Replace status enums to match new Article status type:
```typescript
const STATUS_LABELS: Record<Article['status'], string> = {
  pending_crawl: 'waiting', pending_translation: 'translating',
  completed: 'done', failed: 'failed',
}

const STATUS_COLORS: Record<Article['status'], string> = {
  pending_crawl: 'bg-white/5 text-slate-400',
  pending_translation: 'bg-amber-500/10 text-amber-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
  failed: 'bg-red-500/10 text-red-400',
}
```

- [ ] **Step 2: Update filter types**

```typescript
type FilterType = 'all' | 'completed' | 'pending'
```

Update filter button labels:
```typescript
{f === 'all' ? 'all' : f === 'completed' ? 'done' : 'processing'}
```

Update filter logic:
```typescript
if (filter === 'completed' && article.status !== 'completed') return false
if (filter === 'pending' && article.status === 'completed') return false
```

- [ ] **Step 3: Remove local bookmarked state from ArticleCard**

The bookmark button is no longer needed in ArticleCard since all articles here are already favorited. Remove `bookmarked` state and the bookmark button from the header.

- [ ] **Step 4: Commit**

```bash
git add apps/x-blog/src/app/articles/page.tsx
git commit -m "refactor: articles page uses new Article status types, title 精选文章"
```

---

### Task 8: Create process_favorites.py Script

**Files:**
- Create: `apps/x-blog/skills/morning-news/scripts/process_favorites.py`
- Delete: `apps/x-blog/skills/morning-news/scripts/translate_favorites.py`

- [ ] **Step 1: Write process_favorites.py**

Two-step pipeline: crawl external links with Tavily, then translate with Hermes.

```python
#!/usr/bin/env python3
"""
Process favorited articles: crawl external links + translate/summarize with Hermes.

Step 1: Crawl (status=pending_crawl)
  - Use Tavily extract to fetch source_url content
  - Store in full_content, update status to pending_translation

Step 2: Translate (status=pending_translation)
  - Combine tweet content + full_content
  - Call Hermes for Chinese translation + summary
  - Update translated_content, translated_summary, status to completed

Usage: python3 process_favorites.py [--dry-run]
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.error

BLOG_API = os.environ.get("BLOG_API", "https://heitu.wang")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
HERMES_BIN = os.environ.get("HERMES_BIN", "/root/.local/bin/hermes")


def get_articles_by_status(status):
    """Fetch articles with given status."""
    try:
        url = f"{BLOG_API}/api/articles"
        req = urllib.request.Request(url, headers={"User-Agent": "ProcessBot/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
        return [a for a in data.get("data", []) if a.get("status") == status]
    except Exception as e:
        print(f"[ERROR] fetch articles: {e}")
        return []


def update_article(article_id, updates):
    """PATCH article fields."""
    url = f"{BLOG_API}/api/articles/{article_id}"
    payload = json.dumps(updates).encode("utf-8")
    req = urllib.request.Request(url, data=payload,
        headers={"Content-Type": "application/json"}, method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"  [ERROR] update {article_id}: {e}")
        return None


def tavily_extract(url):
    """Use Tavily extract API to get page content."""
    if not TAVILY_API_KEY:
        print("  [SKIP] no TAVILY_API_KEY")
        return None
    try:
        payload = json.dumps({
            "api_key": TAVILY_API_KEY,
            "urls": [url],
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://api.tavily.com/extract",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        results = data.get("results", [])
        if results:
            return results[0].get("raw_content", "") or results[0].get("text", "")
        return None
    except Exception as e:
        print(f"  [ERROR] tavily extract: {e}")
        return None


def translate_with_hermes(content, title):
    """Call Hermes to translate and summarize."""
    prompt = f"""Translate and summarize this article in Chinese.

Return ONLY valid JSON:
{{"translated_content": "full Chinese translation", "translated_summary": "2-3 sentence Chinese summary"}}

Title: {title}
Content:
{content[:4000]}"""

    try:
        result = subprocess.run(
            [HERMES_BIN, "chat", "-q", prompt],
            capture_output=True, text=True, timeout=120,
            env={**os.environ, "PATH": f"/root/.local/bin:/usr/local/bin:/usr/bin:/bin:{os.environ.get('PATH', '')}"},
        )
        output = result.stdout.strip()
        json_start = output.find("{")
        json_end = output.rfind("}") + 1
        if json_start >= 0 and json_end > json_start:
            return json.loads(output[json_start:json_end])
        return None
    except Exception as e:
        print(f"  [ERROR] hermes: {e}")
        return None


def main():
    dry_run = "--dry-run" in sys.argv
    print(f"=== Process Favorites {'[DRY RUN]' if dry_run else ''} ===\n")

    # Step 1: Crawl pending articles
    print("-- Step 1: Crawl external links --")
    pending_crawl = get_articles_by_status("pending_crawl")
    print(f"Found {len(pending_crawl)} articles to crawl")

    for i, art in enumerate(pending_crawl):
        source_url = art.get("sourceUrl")
        print(f"\n[{i+1}/{len(pending_crawl)}] {art['title'][:60]}")

        if not source_url:
            print("  No source_url, skip to translation")
            if not dry_run:
                update_article(art["id"], {"status": "pending_translation"})
            continue

        if dry_run:
            print(f"  [DRY] Would crawl: {source_url}")
            continue

        print(f"  Crawling: {source_url}")
        full_content = tavily_extract(source_url)
        if full_content:
            update_article(art["id"], {
                "fullContent": full_content[:10000],
                "status": "pending_translation",
            })
            print(f"  OK ({len(full_content)} chars)")
        else:
            update_article(art["id"], {"status": "pending_translation"})
            print("  No content extracted, proceeding to translate tweet only")

    # Step 2: Translate pending articles
    print("\n-- Step 2: Translate & Summarize --")
    pending_translate = get_articles_by_status("pending_translation")
    print(f"Found {len(pending_translate)} articles to translate")

    for i, art in enumerate(pending_translate):
        title = art.get("title", "Untitled")
        content = art.get("fullContent") or art.get("content") or ""
        print(f"\n[{i+1}/{len(pending_translate)}] {title[:60]}")

        if not content:
            print("  [SKIP] no content")
            continue

        if dry_run:
            print("  [DRY] Would translate")
            continue

        result = translate_with_hermes(content, title)
        if result and result.get("translated_content"):
            update_article(art["id"], {
                "translatedContent": result["translated_content"],
                "translatedSummary": result.get("translated_summary", ""),
                "status": "completed",
            })
            print("  OK")
        else:
            update_article(art["id"], {"status": "failed", "error": "translation failed"})
            print("  FAILED")

    print("\n=== Done ===")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Delete old translate_favorites.py**

```bash
rm apps/x-blog/skills/morning-news/scripts/translate_favorites.py
```

- [ ] **Step 3: Make executable and commit**

```bash
chmod +x apps/x-blog/skills/morning-news/scripts/process_favorites.py
git add apps/x-blog/skills/morning-news/scripts/process_favorites.py
git add -u apps/x-blog/skills/morning-news/scripts/translate_favorites.py
git commit -m "feat: process_favorites.py with Tavily crawl + Hermes translate pipeline"
```

---

### Task 9: Update Hermes Cron Scripts on Server

**Files:**
- Server: `/root/.hermes/scripts/`

This task requires SSH access to the server.

- [ ] **Step 1: Copy new script to Hermes scripts directory**

```bash
ssh root@43.167.170.20
cp /root/peko/heitu-platform/apps/x-blog/skills/morning-news/scripts/process_favorites.py /root/.hermes/scripts/
cp /root/peko/heitu-platform/apps/x-blog/skills/morning-news/scripts/generate_morning_news.py /root/.hermes/scripts/
```

- [ ] **Step 2: Update Hermes cron job**

```bash
# Remove old translate-favorites job
/root/.local/bin/hermes cron remove translate-favorites

# Create new process-favorites job
/root/.local/bin/hermes cron create \
  --name "process-favorites" \
  --deliver telegram \
  --script "process_favorites.py" \
  "30 9 * * *" \
  "Favorited articles processed. Summarize results in Chinese."

# Verify
/root/.local/bin/hermes cron list
```

- [ ] **Step 3: Rebuild and deploy x-blog**

```bash
cd /root/peko/heitu-platform
git pull
nohup bash -c 'docker compose build --no-cache x-blog && docker compose up -d x-blog' > /tmp/build.log 2>&1 &
tail -f /tmp/build.log
```

---

### Task 10: Final Verification

- [ ] **Step 1: Verify morning news API**

```bash
curl -s https://heitu.wang/api/morning-news?limit=5 | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Morning news: {len(d.get(\"data\",[]))} items')"
```

- [ ] **Step 2: Verify articles API returns empty (no favorites yet)**

```bash
curl -s https://heitu.wang/api/articles | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Articles: {len(d.get(\"data\",[]))} items')"
```

- [ ] **Step 3: Test favorite flow manually**

Trigger morning news collection, then use browser to favorite an item and verify it appears in /articles.

- [ ] **Step 4: Commit all remaining changes**

```bash
git add -A
git commit -m "chore: finalize dual-table migration"
git push
```
