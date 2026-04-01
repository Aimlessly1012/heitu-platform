# 系统架构设计

> HeiTu 🐰 - 技术架构与设计决策

---

## 📐 整体架构

### 三层架构

```
┌────────────────────────────────────────────┐
│          展示层 (Presentation)              │
│                                            │
│  Next.js App Router + React Components     │
│  Tailwind CSS + Heroicons                  │
└────────────────┬───────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────┐
│           业务层 (Business)                 │
│                                            │
│  Next.js API Routes                        │
│  NextAuth.js (认证)                         │
│  业务逻辑处理                               │
└────────────────┬───────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────┐
│          数据层 (Data)                      │
│                                            │
│  SQLite Database                           │
│  better-sqlite3 (ORM-lite)                 │
└────────────────────────────────────────────┘
```

---

## 🏗️ 技术选型

### 前端框架

**选择：Next.js 16.2 (App Router)**

**理由**:
- ✅ React 服务端渲染（SSR）
- ✅ App Router 现代化路由
- ✅ API Routes 内置后端
- ✅ 优秀的开发体验
- ✅ 自动代码分割
- ✅ 图片优化内置

**替代方案**:
- ❌ Vite + React Router - 需要单独后端
- ❌ Remix - 学习曲线陡峭
- ❌ Nuxt.js - Vue 生态，团队熟悉 React

### 数据库

**选择：SQLite**

**理由**:
- ✅ 零配置，文件数据库
- ✅ 适合中小规模（<100K 文章）
- ✅ 事务支持完善
- ✅ 备份简单（直接复制文件）
- ✅ 性能足够（<1ms 查询）
- ✅ 运维成本低

**替代方案**:
- ❌ PostgreSQL - 需要独立服务，运维复杂
- ❌ MySQL - 同上
- ❌ MongoDB - 文档型不适合关系数据

**迁移路径**:
- 当文章数 > 50K 或 QPS > 100 时，考虑迁移到 PostgreSQL

### 认证系统

**选择：NextAuth.js + GitHub OAuth**

**理由**:
- ✅ Next.js 官方推荐
- ✅ GitHub OAuth 开发者友好
- ✅ JWT Session 无状态
- ✅ 内置 CSRF 保护
- ✅ 类型安全（TypeScript）

**流程**:
1. 用户点击"GitHub 登录"
2. 重定向到 GitHub OAuth
3. 用户授权
4. 回调 `/api/auth/callback/github`
5. 创建/查找用户
6. 生成 JWT Session
7. 重定向到首页

### 部署方案

**选择：Docker + Docker Compose**

**理由**:
- ✅ 环境一致性
- ✅ 一键部署
- ✅ 资源隔离
- ✅ 版本管理方便
- ✅ 跨平台兼容

**容器化策略**:
- 多阶段构建（减小镜像）
- Alpine Linux（最小基础镜像）
- Non-root 用户（安全）
- Health check（自动重启）

---

## 🔄 数据流设计

### 文章抓取流程

```
┌──────────────┐
│  X.com URL   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  fetch_and_post.py   │  (OpenClaw Skill)
│                      │
│  1. 调用 fxtwitter  │
│  2. 解析 JSON       │
│  3. 提取内容        │
│  4. 提取图片        │
│  5. 检测语言        │
│  6. 检测标签        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  POST /api/articles  │
│                      │
│  Body: {            │
│    url,             │
│    title,           │
│    content,         │
│    originalLanguage,│
│    tags,            │
│    status: "pending"│
│  }                  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  SQLite Database     │
│                      │
│  INSERT INTO articles│
│  status = "pending"  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  AI 翻译 (Claude)    │
│                      │
│  1. 检测语言         │
│  2. 分段翻译         │
│  3. 合并结果         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ PATCH /api/articles  │
│                      │
│  Body: {            │
│    translatedContent│
│    status:"completed"│
│  }                  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  前端展示            │
│                      │
│  GET /api/articles  │
│  渲染 Magazine 布局  │
└──────────────────────┘
```

### 用户认证流程

```
┌──────────────┐
│ GitHub 登录  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  GitHub OAuth        │
│                      │
│  1. 授权页面         │
│  2. 用户点击同意     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Callback 处理       │
│                      │
│  /api/auth/callback  │
│  /github             │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  signIn Callback     │
│                      │
│  1. GitHub ID 查询   │
│  2. 新用户 INSERT    │
│  3. 判断是否管理员   │
│  4. 设置 status      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  JWT Callback        │
│                      │
│  1. 查询用户信息     │
│  2. 写入 token       │
│     - userId         │
│     - status         │
│     - isAdmin        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Session Callback    │
│                      │
│  1. token → session  │
│  2. 添加用户字段     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  前端获取 Session    │
│                      │
│  useSession()        │
│  session.user.status │
└──────────────────────┘
```

---

## 🎨 前端架构

### 目录结构

```
src/
├── app/                      # Next.js App Router
│   ├── api/                 # API 路由
│   │   ├── auth/           # NextAuth
│   │   ├── articles/       # 文章 CRUD
│   │   ├── admin/          # 管理接口
│   │   └── recommend-author/# 推荐接口
│   ├── admin/              # 管理页面
│   │   ├── users/         # 用户管理
│   │   └── recommendations/# 推荐审核
│   ├── article/           # 文章详情
│   │   └── [id]/
│   ├── authors/           # 作者推荐
│   ├── skills/            # 技能页面
│   ├── login/            # 登录页
│   └── page.tsx          # 首页
├── components/           # React 组件
│   ├── Navbar.tsx       # 导航栏
│   ├── SplitView.tsx    # 左右对照
│   ├── Providers.tsx    # 全局 Provider
│   └── RequireAuth.tsx  # 权限守卫
└── lib/                 # 工具函数
    ├── db.ts           # 数据库操作
    └── types.ts        # TypeScript 类型
```

### 组件设计原则

1. **单一职责** - 每个组件只做一件事
2. **Props 类型安全** - 使用 TypeScript 接口
3. **可复用性** - 提取公共组件
4. **状态管理** - 优先使用 Server Components
5. **性能优化** - 避免不必要的重渲染

### 状态管理策略

**Server Components 优先**:
- 文章列表 - Server Component
- 文章详情 - Server Component
- 管理页面 - Server Component

**Client Components**:
- 导航栏 - 需要 useSession
- SplitView - 需要滚动同步
- 表单 - 需要交互状态

**无需全局状态管理**:
- 不使用 Redux/Zustand
- 数据通过 API 获取
- Session 由 NextAuth 管理

---

## ⚙️ 后端架构

### API 设计原则

**RESTful 风格**:
- GET - 查询
- POST - 创建
- PATCH - 部分更新
- DELETE - 删除

**路由规范**:
```
/api/articles          # 文章列表
/api/articles/[id]     # 文章详情
/api/admin/users       # 管理-用户
/api/admin/recommendations # 管理-推荐
/api/recommend-author  # 推荐作者
```

**响应格式**:
```json
{
  "data": [...],       // 成功数据
  "error": "message"   // 错误信息（可选）
}
```

### 数据库访问层

**抽象层设计** (`src/lib/db.ts`):

```typescript
// 文章相关
export function createArticle(input: CreateArticleInput): Article
export function getArticles(): Article[]
export function getArticleById(id: string): Article | null
export function updateArticle(id: string, input: UpdateArticleInput): void
export function deleteArticle(id: string): void

// 用户相关
export function findOrCreateUser(profile: any): User
export function getUserByGithubId(githubId: string): User | null
export function updateUserStatus(id: number, status: string): void

// 推荐相关
export function createRecommendation(input: any): Recommendation
export function getRecommendations(status?: string): Recommendation[]
export function updateRecommendation(id: number, data: any): void
```

**优点**:
- 隐藏 SQL 细节
- 类型安全
- 易于测试
- 统一错误处理

---

## 🔐 安全架构

### 认证层

```
┌─────────────────────────────────────┐
│         用户请求                     │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      NextAuth Middleware            │
│                                     │
│  1. 检查 Session Cookie             │
│  2. 验证 JWT 签名                   │
│  3. 解析 User 信息                  │
└─────────────┬───────────────────────┘
              │
              ▼
      ┌───────┴──────┐
      │              │
      ▼              ▼
  已认证         未认证
      │              │
      │              └─→ 401 Unauthorized
      │
      ▼
┌─────────────────────────────────────┐
│         授权层                       │
│                                     │
│  检查 session.user.status           │
│  检查 session.user.isAdmin          │
└─────────────┬───────────────────────┘
              │
              ▼
      ┌───────┴──────┐
      │              │
      ▼              ▼
   已授权        未授权
      │              │
      │              └─→ 403 Forbidden
      │
      ▼
  执行业务逻辑
```

### 数据安全

**SQL 注入防护**:
```typescript
// ❌ 不安全
db.prepare(`SELECT * FROM users WHERE id = ${userId}`).all()

// ✅ 安全
db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
```

**XSS 防护**:
- ReactMarkdown 自动转义
- rehype-raw 仅在必要时启用
- 用户输入严格验证

**CSRF 防护**:
- NextAuth 内置 CSRF Token
- Same-Site Cookies

---

## 📊 性能架构

### 数据库优化

**索引策略**:
```sql
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_created_at ON articles(created_at);
CREATE INDEX idx_articles_language ON articles(original_language);
CREATE INDEX idx_users_github_id ON users(github_id);
```

**查询优化**:
- 仅查询需要的字段
- 使用 LIMIT 分页
- 避免 SELECT *

**连接池**:
- better-sqlite3 预处理语句
- 单连接复用（SQLite 特性）

### 前端优化

**代码分割**:
- Next.js 自动路由分割
- React.lazy 懒加载大组件
- Dynamic Import 动态导入

**资源优化**:
- Next.js Image 自动优化
- Tailwind CSS PurgeCSS
- Gzip 压缩

**缓存策略**:
```typescript
// API 缓存
export const revalidate = 60 // 60秒

// 静态生成
export const dynamic = 'force-static'
```

---

## 🚀 部署架构

### Docker 架构

```
┌─────────────────────────────────────────┐
│          Host Machine (Ubuntu)          │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │        Docker Container           │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │      Node.js Runtime        │ │ │
│  │  │                             │ │ │
│  │  │  ┌───────────────────────┐ │ │ │
│  │  │  │   Next.js Server      │ │ │ │
│  │  │  │   Port: 3001          │ │ │ │
│  │  │  └───────────────────────┘ │ │ │
│  │  │                             │ │ │
│  │  │  ┌───────────────────────┐ │ │ │
│  │  │  │   SQLite DB           │ │ │ │
│  │  │  │   /app/data/          │ │ │ │
│  │  │  └───────────────────────┘ │ │ │
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  │  Volume Mount:                    │ │
│  │  ./data → /app/data              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │           Nginx                   │ │
│  │      Port: 80, 443               │ │
│  │                                   │ │
│  │  Reverse Proxy:                  │ │
│  │  heitu.wang → localhost:3001     │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 网络架构

```
Internet
    │
    ▼
┌─────────────┐
│  Firewall   │  UFW
│  :80, :443  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Nginx    │  Reverse Proxy
│  :80, :443  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Docker    │  Bridge Network
│   :3001     │
└─────────────┘
```

---

## 🔄 扩展性设计

### 水平扩展路径

**当前架构** (单机):
- Docker 单容器
- SQLite 单文件
- Nginx 单实例

**扩展方案 1** (负载均衡):
```
Nginx (Load Balancer)
    │
    ├─→ Docker Container 1
    ├─→ Docker Container 2
    └─→ Docker Container 3
         │
         └─→ PostgreSQL (共享数据库)
```

**扩展方案 2** (微服务):
```
┌──────────────┐
│   Gateway    │ (Nginx)
└──────┬───────┘
       │
       ├─→ Web Service (Next.js)
       ├─→ API Service (Node.js)
       ├─→ Auth Service (独立认证)
       └─→ Worker Service (翻译队列)
            │
            └─→ PostgreSQL + Redis
```

### 数据库迁移路径

**SQLite → PostgreSQL**:

1. 导出 SQLite 数据
```bash
sqlite3 articles.db .dump > dump.sql
```

2. 转换 SQL 语法
```bash
# 修改 SQLite 特定语法
# INTEGER PRIMARY KEY → SERIAL PRIMARY KEY
# AUTOINCREMENT → SERIAL
```

3. 导入 PostgreSQL
```bash
psql -U postgres -d x_blog < dump.sql
```

4. 更新应用配置
```typescript
// 切换到 pg 驱动
import { Pool } from 'pg'
```

---

## 📈 监控架构

### 日志层级

```
Application Logs (Docker Logs)
    │
    ├─→ Access Logs (Nginx)
    ├─→ Error Logs (Next.js)
    ├─→ Auth Logs (NextAuth)
    └─→ Database Logs (SQLite)
```

### 监控指标

**系统级**:
- CPU 使用率
- 内存使用率
- 磁盘使用率
- 网络流量

**应用级**:
- HTTP 响应时间
- API 错误率
- 数据库查询时间
- Session 数量

**业务级**:
- 文章数量
- 用户数量
- 登录成功率
- 翻译成功率

---

## 🎯 设计决策总结

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 前端框架 | Next.js | SSR + API Routes |
| 数据库 | SQLite | 简单、够用、易备份 |
| 认证 | NextAuth + GitHub | 官方推荐、开发者友好 |
| 部署 | Docker | 环境一致、易维护 |
| 样式 | Tailwind CSS | 快速开发、可定制 |
| 状态管理 | 无 | Server Components 足够 |

---

> 🐰 **HeiTu** - 简单、高效、可扩展的架构设计
