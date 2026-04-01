# HeiTu 🐰 - 完整文档中心

> X (Twitter) 文章聚合博客 - 前后端 & 运维完整文档

---

## 📚 文档导航

### 🚀 快速开始

- **[项目说明](../README.md)** - 项目介绍、特性、快速开始
- **[文档总览](./DOCUMENTATION.md)** - 完整文档索引和导航
- **[快速参考](./QUICK-REFERENCE.md)** - 常用命令速查表
- **[变更日志](./CHANGELOG.md)** - 版本更新记录

### 🏗️ 架构设计

- **[系统架构](./architecture.md)** - 整体架构、技术选型、数据流
- **[数据库设计](./database.md)** - 表结构、索引、关系图
- **[API 设计](./api.md)** - 接口文档、认证、错误码

### 💻 前端开发

- **[前端指南](./frontend.md)** - 组件结构、状态管理、样式规范
- **[UI/UX 规范](./ui-ux.md)** - 设计系统、交互规范、响应式
- **[性能优化](./frontend-performance.md)** - 加载优化、缓存策略

### ⚙️ 后端开发

- **[后端指南](./backend.md)** - API 路由、数据库操作、认证授权
- **[翻译服务](./translation.md)** - AI 翻译流程、标签检测
- **[爬虫系统](./crawler.md)** - X.com 文章抓取、媒体提取

### 🐳 部署运维

- **[Docker 部署](./DOCKER-DEPLOY.md)** - 容器化部署完整指南
- **[运维手册](./OPERATIONS.md)** - 日常运维、监控、故障排查
- **[安全加固](./security.md)** - HTTPS、防火墙、权限管理
- **[监控告警](./monitoring.md)** - 健康检查、日志分析、告警配置

### 🔧 开发工具

- **[开发环境](./development.md)** - 本地开发、调试技巧
- **[Git 工作流](./git-workflow.md)** - 分支策略、提交规范
- **[测试指南](./testing.md)** - 单元测试、E2E 测试

### 📖 业务流程

- **[文章管理流程](./article-workflow.md)** - 抓取→翻译→发布
- **[用户管理流程](./user-workflow.md)** - 注册→审核→权限
- **[作者推荐流程](./author-workflow.md)** - 提交→审核→展示

### 📚 指南文档

- **[文档体系整理指南](./guides/documentation-system.md)** - 完整的文档创建和维护指南

### 🛠️ 故障处理

- **[常见问题 FAQ](./faq.md)** - 常见问题及解决方案
- **[故障排查手册](./troubleshooting.md)** - 问题诊断、应急处理

---

## 📊 项目概览

### 技术栈总览

```
前端:
├── Next.js 16.2 (App Router)
├── TypeScript
├── Tailwind CSS
├── Heroicons
├── react-markdown
└── Zustand

后端:
├── Next.js API Routes
├── NextAuth.js (GitHub OAuth)
├── SQLite + better-sqlite3
└── Claude API (翻译)

部署:
├── Docker + Docker Compose
├── Nginx (反向代理)
├── Ubuntu 24.04
└── PM2 (备用)
```

### 系统架构图

```
┌─────────────┐
│   用户请求   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Nginx    │ :80/:443
│   (代理层)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Docker    │ :3001
│  Container  │
│             │
│  ┌───────┐  │
│  │Next.js│  │
│  │  App  │  │
│  └───┬───┘  │
│      │      │
│  ┌───▼───┐  │
│  │SQLite │  │
│  │  DB   │  │
│  └───────┘  │
└─────────────┘
       │
       ▼
┌─────────────┐
│  GitHub     │
│   OAuth     │
└─────────────┘
```

### 数据流程图

```
X.com URL
    │
    ▼
fetch_and_post.py (Skill)
    │
    ├─→ fxtwitter API
    │       │
    │       ▼
    │   获取文章内容
    │   提取图片/媒体
    │   检测语言
    │
    ▼
POST /api/articles
    │
    ▼
SQLite Database
(status: pending_translation)
    │
    ▼
Claude API (翻译)
    │
    ▼
PATCH /api/articles/{id}
(translatedContent)
    │
    ▼
GET /api/articles
    │
    ▼
前端展示
```

---

## 🎯 核心功能模块

### 1. 文章管理

**前端组件**:
- `src/app/page.tsx` - 文章列表（Magazine 布局）
- `src/app/article/[id]/page.tsx` - 文章详情
- `src/components/SplitView.tsx` - 左右对照阅读

**后端 API**:
- `POST /api/articles` - 创建文章
- `GET /api/articles` - 获取列表
- `GET /api/articles/[id]` - 获取详情
- `PATCH /api/articles/[id]` - 更新文章
- `DELETE /api/articles/[id]` - 删除文章

**数据库**:
- `articles` 表 - 存储文章数据
- 字段：id, url, title, content, translated_content, tags...

**业务流程**:
1. X.com URL → fetch_and_post.py
2. 抓取内容 → POST /api/articles
3. 状态：pending_translation
4. AI 翻译 → PATCH /api/articles
5. 状态：completed
6. 前端展示

---

### 2. 用户系统

**前端组件**:
- `src/app/login/page.tsx` - 登录页
- `src/app/admin/users/page.tsx` - 用户管理
- `src/components/Navbar.tsx` - 导航栏（登录状态）

**后端 API**:
- `GET /api/auth/[...nextauth]` - NextAuth 路由
- `GET /api/admin/users` - 用户列表（管理员）
- `PATCH /api/admin/users` - 更新用户状态

**数据库**:
- `users` 表 - 存储用户数据
- 字段：id, github_id, name, email, status, is_admin...

**业务流程**:
1. GitHub OAuth 登录
2. 创建/查找用户
3. 管理员自动审核通过
4. 普通用户等待审核
5. 管理员批准/拒绝

---

### 3. 翻译服务

**实现方式**:
- Claude API (Sonnet 4.5)
- 智能语言检测
- 分段翻译（避免 Token 超限）

**翻译流程**:
1. 检测原文语言（zh/en）
2. 提取文本部分（跳过图片）
3. 分批翻译（每批 ~3000 chars）
4. 合并结果
5. 保存到 translated_content

---

### 4. 标签系统

**自动标签规则**:
- **产品**: Claude, OpenClaw, Claude Code, Skills, MCP...
- **类型**: 教程, 最佳实践, 快捷键, 工作流...
- **难度**: 新手入门, 进阶, 高级, 开发者向
- **特性**: 翻译, 自动化, 效率提升, 安全...
- **主题**: AI Agent, 效率工具, 开发工具...

**标签检测**:
- 关键词匹配
- 标题 + 内容分析
- 存储为 JSON 数组

---

## 🔒 安全机制

### 认证授权

- **NextAuth.js** - GitHub OAuth
- **JWT Session** - 会话管理
- **NEXTAUTH_SECRET** - 加密密钥
- **ADMIN_GITHUB_ID** - 管理员识别

### 权限控制

- **公开访问** - 文章列表、详情
- **登录用户** - 无特殊权限（预留）
- **管理员** - 用户管理、推荐审核

### 数据安全

- **环境变量加密** - .env.local (600 权限)
- **SQL 注入防护** - Prepared Statements
- **XSS 防护** - ReactMarkdown 安全渲染

---

## 📈 性能优化

### 前端优化

- **代码分割** - Next.js 自动分割
- **图片优化** - Next.js Image 组件
- **懒加载** - React.lazy + Suspense
- **缓存策略** - HTTP Cache Headers

### 后端优化

- **数据库索引** - status, created_at, original_language
- **连接池** - better-sqlite3 预处理语句
- **查询优化** - 仅查询必要字段

### 部署优化

- **Docker 多阶段构建** - 减小镜像体积
- **Alpine Linux** - 最小化基础镜像
- **Standalone 输出** - 减少依赖

---

## 🛠️ 开发工具链

### 脚本工具

```bash
scripts/
├── backup-db.sh          # 数据库备份
├── restore-backup.sh     # 数据库恢复
├── healthcheck.sh        # 健康检查
├── monitor-errors.sh     # 错误监控
├── auto-tag-articles.mjs # 自动标签
└── translate-articles.mjs # 批量翻译
```

### Docker 工具

```bash
# 部署脚本
./deploy-docker.sh        # 一键部署
./docker-manage.sh        # 管理工具
./install-docker.sh       # Docker 安装

# 常用命令
docker-manage.sh start    # 启动
docker-manage.sh stop     # 停止
docker-manage.sh logs     # 查看日志
docker-manage.sh shell    # 进入容器
docker-manage.sh rebuild  # 重新构建
```

---

## 📞 支持与反馈

- **GitHub Issues**: https://github.com/Aimlessly1012/x-blog/issues
- **项目作者**: Peko wong (@Aimlessly1012)
- **在线服务**: http://heitu.wang

---

## 📝 文档维护

### 更新流程

1. 修改对应文档
2. 更新目录索引（本文件）
3. 更新 CHANGELOG.md
4. Git 提交并推送

### 文档规范

- 使用 Markdown 格式
- 代码块标注语言
- 添加清晰的标题层级
- 保持简洁明了

---

> 🐰 **HeiTu** - 完整、清晰、易维护的文档体系
