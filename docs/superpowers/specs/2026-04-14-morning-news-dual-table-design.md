# Morning News Dual-Table Architecture Design

## Overview

Separate morning news (temporary) from featured articles (permanent) into two independent tables. Users can favorite morning news items, which copies them to the articles table and triggers content crawling + AI summarization via Hermes.

## Database Schema

### `morning_news` table (temporary, daily refresh)

```sql
CREATE TABLE IF NOT EXISTS morning_news (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  content TEXT,          -- tweet text or snippet
  summary TEXT,
  author TEXT,
  author_username TEXT,
  tags TEXT,              -- JSON array
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)
```

- No UNIQUE constraint on url (daily refresh clears all)
- No translation fields (lightweight)
- No status field (all items are display-ready)
- Script clears entire table before inserting new batch each day

### `articles` table (permanent, featured articles)

```sql
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,              -- original tweet text
  summary TEXT,
  translated_content TEXT,   -- AI translated full text
  translated_summary TEXT,   -- AI generated summary
  original_language TEXT,
  author TEXT,
  author_username TEXT,
  tags TEXT,                  -- JSON array
  cover_image TEXT,
  source_url TEXT,            -- URL extracted from tweet (external article link)
  full_content TEXT,          -- crawled content from source_url
  status TEXT DEFAULT 'pending_crawl',
  error TEXT,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
)
```

Status flow: `pending_crawl` -> `pending_translation` -> `completed` | `failed`

### Migration from current single-table

- Rename current `articles` table to `articles_backup`
- Create new `morning_news` and `articles` tables
- Migrate any existing `is_favorited=1` rows from backup to new articles table
- Drop backup table after verification

## API Endpoints

### Morning News

**`GET /api/morning-news?limit=30`**
- Query: `SELECT * FROM morning_news ORDER BY created_at DESC LIMIT ?`
- Returns: `{ data: MorningNewsItem[] }`

**`POST /api/morning-news`**
- Body: `{ date: string, items: MorningNewsItem[] }`
- Logic: `DELETE FROM morning_news` then batch INSERT
- Called by: `generate_morning_news.py` cron script

### Favorite (new)

**`POST /api/articles/favorite`**
- Body: `{ morningNewsId: string }`
- Auth: admin only
- Logic:
  1. Read item from `morning_news` by id
  2. Check duplicate in `articles` by url
  3. Extract URLs from content (regex for https?:// links)
  4. INSERT into `articles` with `source_url` and `status='pending_crawl'`
  5. Return created article

### Articles (featured)

**`GET /api/articles`**
- Query: `SELECT * FROM articles ORDER BY created_at DESC`
- Returns: `{ data: Article[] }`

**`GET /api/articles/[id]`**
- Returns single article with full content

**`DELETE /api/articles/[id]`**
- Admin only, removes from featured

## Data Types

### MorningNewsItem (TypeScript)

```typescript
interface MorningNewsItem {
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
```

### Article (TypeScript)

```typescript
interface Article {
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
```

## Scripts

### `generate_morning_news.py` changes

- POST target unchanged (`/api/morning-news`)
- API now clears `morning_news` table instead of deleting old `morning_*` rows from articles

### `translate_favorites.py` changes

Rename to `process_favorites.py` with two-step pipeline:

**Step 1: Crawl** (`status=pending_crawl`)
- Extract `source_url` from article
- Use Tavily extract API to fetch full page content
- Store in `full_content` field
- Update status to `pending_translation`

**Step 2: Translate & Summarize** (`status=pending_translation`)
- Input: `content` (tweet) + `full_content` (crawled article)
- Call Hermes chat: "Translate and summarize this article in Chinese"
- Store results in `translated_content` and `translated_summary`
- Update status to `completed`

### Hermes cron schedule

| Job | Schedule | Script |
|-----|----------|--------|
| morning-news | 0 9 * * * | generate_morning_news.py |
| process-favorites | 30 9 * * * | process_favorites.py |

## Frontend Changes

### Homepage (`/`)
- Fetch from `GET /api/morning-news` (new table)
- NewsCard: bookmark button calls `POST /api/articles/favorite` with `morningNewsId`
- Admin only sees bookmark button

### Featured page (`/articles`)
- Title: "精选文章"
- Fetch from `GET /api/articles` (only permanent featured items)
- Shows translation status badge
- Links to `/article/[id]` for full content view

### Article detail page (`/article/[id]`)
- Shows original tweet + crawled full content + AI summary
- Side-by-side or tabbed view for original/translated content

## File Changes Summary

| File | Action |
|------|--------|
| `src/lib/types.ts` | Add MorningNewsItem interface, update Article interface |
| `src/lib/db.ts` | New morning_news table + CRUD, update articles table schema, remove is_favorited |
| `src/app/api/morning-news/route.ts` | Query morning_news table instead of articles |
| `src/app/api/articles/favorite/route.ts` | New: copy from morning_news to articles |
| `src/app/api/articles/route.ts` | Simplify: just query articles table |
| `src/app/api/articles/[id]/favorite/route.ts` | Remove (replaced by /api/articles/favorite) |
| `src/app/page.tsx` | Use MorningNewsItem type, favorite calls new API |
| `src/app/articles/page.tsx` | Title "精选文章", remove is_favorited filter |
| `scripts/generate_morning_news.py` | No changes needed (API handles table switch) |
| `scripts/translate_favorites.py` | Rename to process_favorites.py, add crawl step |
