# HeiTu 🐰 - 信息茧房

> X (Twitter) 文章聚合博客 | 自动翻译 & 总结

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ 特性

- 🐦 **X 文章聚合**: 自动抓取 X.com 长文章
- 🌏 **智能翻译**: AI 驱动的中英文互译
- 🏷️ **智能标签**: 自动识别文章主题和分类
- 🎨 **精美界面**: 暗色主题 + Magazine 布局
- 🔐 **GitHub 登录**: OAuth 认证 + 管理员审核
- 📱 **响应式设计**: 完美支持移动端
- 🐳 **Docker 部署**: 一键启动，开箱即用

## 🚀 快速开始

### 前置要求

- Node.js 22+
- Docker 20.10+
- Docker Compose 2.0+
- SQLite 3

### Docker 部署（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/Aimlessly1012/x-blog.git
cd x-blog

# 2. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入你的配置

# 3. 一键部署
./deploy-docker.sh

# 4. 访问应用
# http://localhost:3001
# 或你的域名 http://heitu.wang
```

### 本地开发

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 📚 文档

- **[📖 文档中心](docs/README.md)** - 完整技术文档导航
- **[🚀 部署指南](docs/DOCKER-DEPLOY.md)** - Docker 部署完整文档
- **[🛠️ 运维手册](docs/OPERATIONS.md)** - 日常运维、监控、故障排查
- **[⚡ 快速参考](docs/QUICK-REFERENCE.md)** - 常用命令速查
- **[📝 变更日志](docs/CHANGELOG.md)** - 版本更新记录
- **[🤖 开发指南](AGENTS.md)** - AI Agent 协作指南

## 🔧 核心功能

### 文章管理

- ✅ X.com 文章抓取（支持长文格式）
- ✅ 自动提取图片和媒体内容
- ✅ 智能语言检测（中/英）
- ✅ AI 翻译（中英互译）
- ✅ 自动标签分类

### 用户系统

- ✅ GitHub OAuth 登录
- ✅ 管理员审核机制
- ✅ 用户权限管理
- ✅ 个人资料展示

### 内容展示

- ✅ Magazine 风格卡片布局
- ✅ 左右对照阅读模式
- ✅ Markdown 渲染
- ✅ 标签筛选
- ✅ 搜索功能

## 🛠️ 技术栈

### 前端

- **框架**: Next.js 16.2 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI**: Heroicons + 自定义组件
- **状态管理**: Zustand
- **Markdown**: react-markdown + remark-gfm

### 后端

- **运行时**: Node.js 22
- **API**: Next.js API Routes
- **认证**: NextAuth.js (GitHub OAuth)
- **数据库**: SQLite + better-sqlite3
- **翻译**: Claude API

### 部署

- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **进程管理**: Docker Healthcheck
- **日志**: Docker Logs

## 📦 项目结构

```
x-blog/
├── src/
│   ├── app/                # Next.js 路由
│   │   ├── api/           # API 端点
│   │   ├── admin/         # 管理页面
│   │   ├── article/       # 文章详情
│   │   ├── authors/       # 作者推荐
│   │   └── skills/        # 技能页面
│   ├── components/        # React 组件
│   │   ├── Navbar.tsx    # 导航栏
│   │   ├── SplitView.tsx # 双栏阅读
│   │   └── Providers.tsx # 全局提供者
│   └── lib/              # 工具函数
│       ├── db.ts         # 数据库操作
│       └── types.ts      # TypeScript 类型
├── data/                  # 数据目录
│   └── articles.db       # SQLite 数据库
├── public/               # 静态资源
│   └── images/          # 图片资源
├── scripts/              # 运维脚本
│   ├── backup-db.sh     # 数据库备份
│   ├── healthcheck.sh   # 健康检查
│   └── restore-backup.sh # 恢复备份
├── docker-compose.yml    # Docker 编排
├── Dockerfile           # 镜像构建
├── .env.local           # 环境变量
└── README.md            # 项目说明
```

## 🔐 环境变量

创建 `.env.local` 文件：

```env
# NextAuth 配置
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# 管理员 GitHub ID
ADMIN_GITHUB_ID=your-github-user-id
```

## 📊 数据库结构

### articles 表

- `id`: 文章 ID
- `url`: 原文链接
- `title`: 标题
- `author`: 作者
- `author_username`: 作者用户名
- `content`: 内容
- `summary`: 摘要
- `original_language`: 原文语言
- `translated_content`: 翻译内容
- `translated_summary`: 翻译摘要
- `cover_image`: 封面图
- `published_at`: 发布时间
- `status`: 状态（completed/pending_translation）
- `tags`: 标签（JSON）
- `created_at`: 创建时间

### users 表

- `id`: 用户 ID
- `github_id`: GitHub ID
- `name`: 用户名
- `email`: 邮箱
- `image`: 头像
- `status`: 状态（approved/pending/rejected）
- `is_admin`: 是否管理员
- `created_at`: 创建时间

## 🎯 运维命令

```bash
# 查看服务状态
./scripts/healthcheck.sh

# 备份数据库
./scripts/backup-db.sh

# 恢复备份
./scripts/restore-backup.sh

# 查看容器日志
docker logs -f x-blog

# 重启服务
docker compose restart

# 更新部署
./docker-manage.sh update
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发计划

- [ ] HTTPS 支持
- [ ] 自动备份脚本
- [ ] Prometheus 监控
- [ ] RSS 订阅
- [ ] 文章收藏功能
- [ ] 评论系统
- [ ] 全文搜索
- [ ] 多语言支持

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👨‍💻 作者

**Peko wong** - [@Aimlessly1012](https://github.com/Aimlessly1012)

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [NextAuth.js](https://next-auth.js.org/) - 认证库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Heroicons](https://heroicons.com/) - 图标库
- [SQLite](https://www.sqlite.org/) - 数据库

---

⭐ 如果这个项目对你有帮助，请给个 Star！

🐰 **HeiTu** - 打破信息茧房，连接世界知识
