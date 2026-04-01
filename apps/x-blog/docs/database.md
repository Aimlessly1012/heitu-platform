# 数据库设计

> HeiTu 🐰 - SQLite 数据库结构设计

---

## 📊 ER 图

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ github_id       │
│ google_id       │
│ name            │
│ email           │
│ image           │
│ status          │◄─────┐
│ is_admin        │      │
│ created_at      │      │ (submitted_by)
│ updated_at      │      │
└─────────────────┘      │
                         │
                         │
┌─────────────────┐      │
│    articles     │      │
├─────────────────┤      │
│ id (PK)         │      │
│ url             │      │
│ title           │      │
│ author          │      │
│ author_username │      │
│ content         │      │
│ summary         │      │
│ original_lang   │      │
│ translated_*    │      │
│ cover_image     │      │
│ published_at    │      │
│ status          │      │
│ tags (JSON)     │      │
│ created_at      │      │
└─────────────────┘      │
                         │
                         │
┌──────────────────────┐ │
│ author_recommendations│─┘
├──────────────────────┤
│ id (PK)              │
│ username             │
│ display_name         │
│ bio                  │
│ avatar_url           │
│ specialties (JSON)   │
│ submitted_by (FK)    │
│ submitted_at         │
│ status               │
│ reviewed_by (FK)     │
│ reviewed_at          │
└──────────────────────┘
```

---

## 📋 表结构

### 1. articles 表

**用途**: 存储文章数据

```sql
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  author TEXT,
  author_username TEXT,
  content TEXT NOT NULL,
  summary TEXT,
  original_language TEXT,
  translated_content TEXT,
  translated_summary TEXT,
  cover_image TEXT,
  published_at TEXT,
  status TEXT DEFAULT 'pending',
  tags TEXT,  -- JSON array
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**字段说明**:

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| id | TEXT | 主键，格式: `art_{timestamp}_{random}` | `art_1774437798264_kncr078` |
| url | TEXT | 原文链接（唯一） | `https://x.com/user/status/123` |
| title | TEXT | 文章标题 | `"Claude Code 最佳实践"` |
| author | TEXT | 作者名称 | `"Peko wong"` |
| author_username | TEXT | 作者用户名（@开头） | `"@Aimlessly1012"` |
| content | TEXT | 文章内容（Markdown+HTML） | `"## 标题\n内容..."` |
| summary | TEXT | 摘要（自动生成） | `"本文介绍..."` |
| original_language | TEXT | 原文语言 | `"en"` 或 `"zh"` |
| translated_content | TEXT | 翻译后内容 | `"## 标题\n翻译..."` |
| translated_summary | TEXT | 翻译后摘要 | `"文章总结..."` |
| cover_image | TEXT | 封面图URL | `"https://pbs.twimg.com/..."` |
| published_at | TEXT | 发布时间（ISO 8601） | `"2026-03-24T10:30:56.000Z"` |
| status | TEXT | 状态 | `"pending"` / `"completed"` |
| tags | TEXT | 标签（JSON数组） | `'["Claude","教程"]'` |
| created_at | TEXT | 创建时间 | `"2026-03-24 18:36:58"` |

**索引**:
```sql
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_created_at ON articles(created_at);
CREATE INDEX idx_articles_language ON articles(original_language);
```

**状态流转**:
```
pending → pending_translation → completed
   │                              ↑
   └──────────────────────────────┘
        (中文文章直接 completed)
```

---

### 2. users 表

**用途**: 存储用户信息

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id TEXT,
  google_id TEXT,
  name TEXT,
  email TEXT,
  image TEXT,
  status TEXT DEFAULT 'pending',
  is_admin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**字段说明**:

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| id | INTEGER | 自增主键 | `1` |
| github_id | TEXT | GitHub 用户 ID | `"51191827"` |
| google_id | TEXT | Google 用户 ID（预留） | `"110597267953649585195"` |
| name | TEXT | 用户名 | `"Peko wong"` |
| email | TEXT | 邮箱 | `"user@example.com"` |
| image | TEXT | 头像 URL | `"https://avatars.githubusercontent.com/..."` |
| status | TEXT | 审核状态 | `"pending"` / `"approved"` / `"rejected"` |
| is_admin | INTEGER | 是否管理员（布尔值） | `0` / `1` |
| created_at | TEXT | 创建时间 | `"2026-03-24 18:36:58"` |
| updated_at | TEXT | 更新时间 | `"2026-03-24 18:36:58"` |

**索引**:
```sql
CREATE UNIQUE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_status ON users(status);
```

**用户状态流转**:
```
GitHub 登录
    │
    ▼
  创建用户
    │
    ├─→ 管理员 → status: "approved", is_admin: 1
    │
    └─→ 普通用户 → status: "pending", is_admin: 0
         │
         ├─→ 管理员批准 → status: "approved"
         │
         └─→ 管理员拒绝 → status: "rejected"
```

---

### 3. author_recommendations 表

**用途**: 存储作者推荐

```sql
CREATE TABLE author_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  specialties TEXT,  -- JSON array
  submitted_by INTEGER,
  submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending',
  reviewed_by INTEGER,
  reviewed_at TEXT,
  FOREIGN KEY (submitted_by) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

**字段说明**:

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| id | INTEGER | 自增主键 | `1` |
| username | TEXT | X.com 用户名（@开头） | `"@Aimlessly1012"` |
| display_name | TEXT | 显示名称 | `"Peko wong"` |
| bio | TEXT | 简介 | `"AI 开发者"` |
| avatar_url | TEXT | 头像 URL | `"https://unavatar.io/x/@username"` |
| specialties | TEXT | 专长（JSON数组） | `'["AI","Claude"]'` |
| submitted_by | INTEGER | 提交人 ID（外键） | `1` |
| submitted_at | TEXT | 提交时间 | `"2026-03-24 18:36:58"` |
| status | TEXT | 审核状态 | `"pending"` / `"approved"` / `"rejected"` |
| reviewed_by | INTEGER | 审核人 ID（外键） | `1` |
| reviewed_at | TEXT | 审核时间 | `"2026-03-24 18:36:58"` |

**索引**:
```sql
CREATE INDEX idx_recommendations_status ON author_recommendations(status);
CREATE INDEX idx_recommendations_submitted_by ON author_recommendations(submitted_by);
```

**推荐流程**:
```
用户提交 X.com URL
    │
    ▼
自动提取用户名
调用 unavatar.io 获取头像
    │
    ▼
创建推荐记录
status: "pending"
    │
    ├─→ 管理员批准
    │   status: "approved"
    │   添加到 AUTHORS 列表
    │
    └─→ 管理员拒绝
        status: "rejected"
```

---

## 🔄 数据迁移记录

### 迁移脚本

**1. 添加 tags 列**:
```javascript
// scripts/add-tags-column.mjs
import Database from 'better-sqlite3';

const db = new Database('data/articles.db');

db.exec(`
  ALTER TABLE articles ADD COLUMN tags TEXT;
`);

console.log('✅ tags 列添加成功');
```

**2. 添加 google_id 列**:
```javascript
// scripts/migrate-add-google-id.mjs
import Database from 'better-sqlite3';

const db = new Database('data/articles.db');

db.exec(`
  ALTER TABLE users ADD COLUMN google_id TEXT;
`);

console.log('✅ google_id 列添加成功');
```

**3. 创建 author_recommendations 表**:
```javascript
// scripts/create-recommendations-table.mjs
import Database from 'better-sqlite3';

const db = new Database('data/articles.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS author_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    specialties TEXT,
    submitted_by INTEGER,
    submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    reviewed_by INTEGER,
    reviewed_at TEXT,
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
  );
`);

console.log('✅ author_recommendations 表创建成功');
```

---

## 📈 数据统计

### 常用查询

**文章统计**:
```sql
-- 总文章数
SELECT COUNT(*) FROM articles;

-- 按状态统计
SELECT status, COUNT(*) as count 
FROM articles 
GROUP BY status;

-- 按语言统计
SELECT original_language, COUNT(*) as count 
FROM articles 
GROUP BY original_language;

-- 最新文章
SELECT title, author, created_at 
FROM articles 
ORDER BY created_at DESC 
LIMIT 10;
```

**用户统计**:
```sql
-- 总用户数
SELECT COUNT(*) FROM users;

-- 按状态统计
SELECT status, COUNT(*) as count 
FROM users 
GROUP BY status;

-- 管理员数量
SELECT COUNT(*) FROM users WHERE is_admin = 1;
```

**推荐统计**:
```sql
-- 总推荐数
SELECT COUNT(*) FROM author_recommendations;

-- 待审核推荐
SELECT COUNT(*) FROM author_recommendations WHERE status = 'pending';

-- 已批准推荐
SELECT username, display_name, specialties 
FROM author_recommendations 
WHERE status = 'approved';
```

---

## 🔧 数据库维护

### 日常维护命令

**真空清理** (回收空间):
```bash
sqlite3 data/articles.db "VACUUM;"
```

**完整性检查**:
```bash
sqlite3 data/articles.db "PRAGMA integrity_check;"
```

**优化**:
```bash
sqlite3 data/articles.db "PRAGMA optimize;"
```

**查看数据库大小**:
```bash
du -sh data/articles.db
```

**查看表大小**:
```sql
SELECT 
  name, 
  SUM(pgsize) as size 
FROM dbstat 
GROUP BY name;
```

---

## 🚀 性能优化

### 索引策略

**已创建索引**:
```sql
-- articles 表
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_created_at ON articles(created_at);
CREATE INDEX idx_articles_language ON articles(original_language);

-- users 表
CREATE UNIQUE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_status ON users(status);

-- author_recommendations 表
CREATE INDEX idx_recommendations_status ON author_recommendations(status);
CREATE INDEX idx_recommendations_submitted_by ON author_recommendations(submitted_by);
```

**查询优化建议**:
```sql
-- ✅ 使用索引
SELECT * FROM articles WHERE status = 'completed';

-- ✅ 使用索引排序
SELECT * FROM articles ORDER BY created_at DESC LIMIT 10;

-- ❌ 避免全表扫描
SELECT * FROM articles WHERE content LIKE '%keyword%';

-- ✅ 使用 FTS5 全文搜索
CREATE VIRTUAL TABLE articles_fts USING fts5(title, content);
```

### WAL 模式

**启用 Write-Ahead Logging**:
```sql
PRAGMA journal_mode = WAL;
```

**优点**:
- 读写并发
- 更快的写入
- 更好的崩溃恢复

**配置** (在 `src/lib/db.ts`):
```typescript
const db = new Database('data/articles.db');
db.pragma('journal_mode = WAL');
```

---

## 💾 备份策略

### 热备份

**使用 `.backup` 命令**:
```bash
sqlite3 data/articles.db ".backup 'backup/articles-$(date +%Y%m%d).db'"
```

### 冷备份

**直接复制文件**:
```bash
# 停止服务
docker compose down

# 复制文件
cp data/articles.db backups/articles-$(date +%Y%m%d).db

# 启动服务
docker compose up -d
```

### 自动备份脚本

见 `scripts/backup-db.sh` - 支持：
- 自动压缩
- 保留 7 天
- 定时任务集成

---

## 🔍 数据查询示例

### 文章查询

**获取所有已完成文章**:
```typescript
const articles = db.prepare(
  'SELECT * FROM articles WHERE status = ? ORDER BY created_at DESC'
).all('completed');
```

**搜索文章**:
```typescript
const articles = db.prepare(`
  SELECT * FROM articles 
  WHERE (title LIKE ? OR author LIKE ? OR summary LIKE ?)
    AND status = ?
  ORDER BY created_at DESC
`).all(`%${query}%`, `%${query}%`, `%${query}%`, 'completed');
```

**按标签筛选**:
```typescript
const articles = db.prepare(
  'SELECT * FROM articles WHERE status = ?'
).all('completed');

// 前端过滤（tags 是 JSON）
const filtered = articles.filter(article => {
  if (!article.tags) return false;
  const tags = JSON.parse(article.tags);
  return tags.some(tag => selectedTags.includes(tag));
});
```

### 用户查询

**通过 GitHub ID 查找用户**:
```typescript
const user = db.prepare(
  'SELECT * FROM users WHERE github_id = ?'
).get(githubId);
```

**获取所有待审核用户**:
```typescript
const users = db.prepare(
  'SELECT * FROM users WHERE status = ? ORDER BY created_at DESC'
).all('pending');
```

---

## 🎯 未来扩展

### 计划添加的表

**1. article_bookmarks** (收藏):
```sql
CREATE TABLE article_bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  article_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (article_id) REFERENCES articles(id)
);
```

**2. article_comments** (评论):
```sql
CREATE TABLE article_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**3. article_views** (阅读统计):
```sql
CREATE TABLE article_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id TEXT NOT NULL,
  user_id INTEGER,
  ip_address TEXT,
  viewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id)
);
```

---

> 🐰 **HeiTu** - 清晰、规范、可扩展的数据库设计
