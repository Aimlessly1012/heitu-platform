# 文章管理流程

> HeiTu 🐰 - 从抓取到发布的完整流程

---

## 📊 流程图

```
┌──────────────────┐
│  用户提供 X URL  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  x-article-to-blog Skill │
│                          │
│  1. 调用 fxtwitter API  │
│  2. 解析文章内容         │
│  3. 提取图片/媒体        │
│  4. 检测语言（zh/en）    │
│  5. 自动标签检测         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  POST /api/articles      │
│                          │
│  创建文章记录            │
│  status: "pending"       │
└────────┬─────────────────┘
         │
         ▼
    ┌────┴────┐
    │  语言?   │
    └────┬────┘
         │
    ┌────┼────┐
    │         │
   中文      英文
    │         │
    │         ▼
    │   ┌─────────────────┐
    │   │  等待 AI 翻译    │
    │   │  status:         │
    │   │  "pending"       │
    │   └────────┬─────────┘
    │            │
    │            ▼
    │   ┌─────────────────┐
    │   │  Claude API     │
    │   │  翻译为中文      │
    │   └────────┬─────────┘
    │            │
    │            ▼
    │   ┌─────────────────┐
    │   │ PATCH /articles │
    │   │ translatedContent│
    │   └────────┬─────────┘
    │            │
    └────────────┼────────┐
                 │        │
                 ▼        ▼
         ┌──────────────────┐
         │ status:          │
         │ "completed"      │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │  前端展示         │
         │  Magazine 布局   │
         │  左右对照阅读    │
         └──────────────────┘
```

---

## 🔧 详细步骤

### 1. 文章抓取

**触发方式**:
```bash
# 使用 x-article-to-blog Skill
cd /opt/openclaw/tester/workspace/skills/x-article-to-blog
python3 scripts/fetch_and_post.py <X_URL>
```

**抓取内容**:
- 文章标题
- 作者信息
- 发布时间
- 文章正文（Markdown + HTML）
- 图片/视频（自动提取）
- 封面图

**示例 URL**:
```
https://x.com/Suryanshti777/article/2035725923983507873
```

---

### 2. 内容处理

**语言检测**:
```python
def detect_language(text):
    # 中文字符比例 > 50% → zh
    # 否则 → en
```

**标签检测** (TAG_RULES):
- **产品**: Claude, OpenClaw, Claude Code...
- **类型**: 教程, 最佳实践, 快捷键...
- **难度**: 新手入门, 进阶, 高级...
- **特性**: 翻译, 自动化, 效率提升...
- **主题**: AI Agent, 效率工具...

**图片提取**:
```python
# 从 article.media_entities 构建 media_id → URL 映射
# 替换 entityMap 中的 MEDIA 引用
# 插入 <img> 标签到正文
```

---

### 3. 创建文章

**API 调用**:
```http
POST /api/articles
Content-Type: application/json

{
  "url": "https://x.com/user/status/123",
  "title": "文章标题",
  "author": "作者",
  "author_username": "@username",
  "content": "文章内容（含图片）",
  "summary": "自动生成摘要",
  "originalLanguage": "en",
  "tags": ["Claude", "教程"],
  "coverImage": "https://...",
  "publishedAt": "2026-03-24T10:30:56.000Z"
}
```

**数据库记录**:
```sql
INSERT INTO articles (
  id, url, title, content, 
  original_language, tags, status, ...
) VALUES (
  'art_1774437798264_kncr078',
  'https://...',
  '文章标题',
  '文章内容',
  'en',
  '["Claude","教程"]',
  'pending',
  ...
);
```

---

### 4. AI 翻译

**触发时机**:
- 英文文章创建后
- 手动触发翻译

**翻译流程**:
```python
# 1. 提取纯文本（跳过图片标签）
text_parts = extract_text_parts(content)

# 2. 分批翻译（每批 ~3000 chars）
translations = []
for part in text_parts:
    translation = claude_translate(part)
    translations.append(translation)

# 3. 合并结果
final_translation = merge_with_images(translations, images)
```

**更新数据库**:
```http
PATCH /api/articles/art_1774437798264_kncr078
Content-Type: application/json

{
  "translatedContent": "翻译后内容",
  "translatedSummary": "翻译后摘要",
  "status": "completed"
}
```

---

### 5. 前端展示

**列表页** (`/`):
- Magazine 布局
- 显示标题、作者、摘要
- 标签筛选
- 搜索功能

**详情页** (`/article/[id]`):
- 左右对照阅读（英文 vs 中文）
- Markdown 渲染
- 图片展示
- 同步滚动

---

## 🎯 状态机

```
pending (待处理)
    │
    ├─→ 中文文章 → completed (直接完成)
    │
    └─→ 英文文章 → pending_translation (待翻译)
                      │
                      └─→ 翻译完成 → completed
```

---

## 🛠️ 常用操作

### 手动添加文章

```bash
# 1. 准备 URL
URL="https://x.com/user/status/123"

# 2. 运行抓取脚本
cd /opt/openclaw/tester/workspace/skills/x-article-to-blog
python3 scripts/fetch_and_post.py "$URL"

# 3. 查看结果
sqlite3 /opt/openclaw/tester/workspace/x-blog/data/articles.db \
  "SELECT id, title, status FROM articles ORDER BY created_at DESC LIMIT 1;"
```

### 批量翻译

```bash
# 使用翻译脚本
cd /opt/openclaw/tester/workspace/x-blog
node scripts/translate-articles.mjs
```

### 自动标签

```bash
# 重新生成所有文章标签
cd /opt/openclaw/tester/workspace/x-blog
node scripts/auto-tag-articles.mjs
```

---

## 📊 数据统计

### 文章状态分布

```sql
SELECT status, COUNT(*) as count 
FROM articles 
GROUP BY status;
```

### 语言分布

```sql
SELECT original_language, COUNT(*) as count 
FROM articles 
GROUP BY original_language;
```

### 标签统计

```sql
-- 需要在应用层处理 JSON
SELECT tags FROM articles WHERE tags IS NOT NULL;
```

---

> 🐰 **HeiTu** - 自动化、智能化的文章管理流程
