---
name: x-article-to-blog
description: Fetch X.com (Twitter) article links and add them to the blog. Use when user sends an X.com URL and asks to parse, summarize, or add it to the blog. Supports both regular tweets and long-form X Articles. Extracts title, author, content (with images as HTML img tags), cover image. After fetching, tells the user to ask AI to translate the pending article.
---

# X Article to Blog Skill

## Workflow

This skill has two steps:

**Step 1: Fetch and Post**
```bash
python3 /opt/openclaw/tester/workspace/skills/x-article-to-blog/scripts/fetch_and_post.py <x_url>
```

The script will:
1. Fetch article data from fxtwitter API
2. Extract title, author, full content (with images as HTML img tags)
3. Detect language (Chinese vs English)
4. Auto-detect tags based on title and content
5. Post to blog with status "pending_translation"
6. Output the article data including detected tags (no summary generation)

**Step 2: AI Translation (by you, the AI)**
After running the script, tell me: "翻译待处理的文章" or similar

I will:
1. Get all pending articles from the blog API
2. Translate English content to Chinese
3. Update each article with translated title, content, and summary
4. Change status to "completed"

## Supported URL Formats

- `https://x.com/username/status/123456789`
- `https://x.com/username/article/123456789`
- `https://twitter.com/username/status/123456789`

## Blog API

- Endpoint: `http://localhost:3000/api/articles`
- Method: GET (list) / POST (create)

Article fields stored:
- `url`: Original X.com URL
- `title`: Article title
- `author`: Author display name
- `authorUsername`: Author's X handle
- `content`: Full article text (images as `<img>` tags)
- `coverImage`: Cover image URL
- `publishedAt`: ISO timestamp
- `originalLanguage`: "zh" or "en"
- `tags`: Array of auto-detected tags (e.g., ["Claude", "教程", "效率提升"])
- `translatedContent`: Original English content (filled by AI)
- `translatedSummary`: Chinese summary (filled by AI)
- `status`: "pending_translation" → "completed"

## Auto-Tagging Rules

The script automatically detects tags based on keywords in title and content:

**Products/Tools:**
- Claude, Claude Code, OpenClaw, Skills, MCP, Prompt Engineering

**Content Types:**
- 教程 (tutorial/guide), 最佳实践 (best practices), 快捷键 (shortcuts)
- 工作流 (workflow), 技巧 (tips), 资源合集 (collections)

**Features:**
- 效率提升 (productivity), 自动化 (automation), 安全 (security)

**Topics:**
- AI Agent, 开发者向 (developer-focused)

Tags are displayed with color-coded badges on the blog homepage and can be used to filter articles.

> **Note:** This skill only generates tags, no summary. Summary/translation is done by the AI assistant in Step 2.

## Blog URL

**https://heitu.wang**

## Example

User: "添加 https://x.com/username/article/123"

Action 1:
```bash
python3 /opt/openclaw/tester/workspace/skills/x-article-to-blog/scripts/fetch_and_post.py "https://x.com/username/article/123"
```

Output:
```
Fetching article from: https://x.com/username/article/123
=== Article Data (needs translation) ===
Title: How to use Claude Code
Author: Test User (@testuser)
Language: en
Content length: 5000 chars
Tags: Claude Code, 教程, 效率提升

Success! Article ID: art_xxx
Status: pending_translation - AI will translate this article
```

Action 2 (by you, the AI):
User tells you: "翻译待处理文章"

You respond:
- Fetch pending articles
- Translate each one
- Update via PATCH to /api/articles/[id]
- Confirm completion

## Note

Translation is done by the AI assistant directly (no external API needed), so there's no daily limit.
