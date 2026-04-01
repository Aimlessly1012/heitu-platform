# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-27

### 🎉 初始发布

第一个生产版本发布！HeiTu 🐰 正式上线。

### ✨ Added

#### 核心功能
- X (Twitter) 文章聚合与抓取
- AI 驱动的中英文智能翻译
- Markdown 内容渲染
- 图片和媒体内容自动提取
- 智能标签分类系统
- 左右对照阅读模式

#### 用户系统
- GitHub OAuth 登录
- 管理员审核机制
- 用户权限管理
- 个人资料展示

#### 界面设计
- 暗色主题 + 粉色配色
- Magazine 风格卡片布局
- 响应式设计（完美支持移动端）
- 导航栏交互优化
- 页面加载进度条
- Heroicons 图标库

#### 管理功能
- 用户管理页面
- 作者推荐系统
- 推荐审核流程
- 邀请码系统（已移除，改用 OAuth）

#### 部署运维
- Docker 容器化部署
- Docker Compose 编排
- 完整运维文档（OPERATIONS.md）
- 自动化脚本集合
  - 数据库备份脚本
  - 健康检查脚本
  - 错误监控脚本
  - 恢复脚本
- Nginx 反向代理配置
- 环境变量配置模板

#### 文档
- README.md 项目说明
- OPERATIONS.md 运维手册
- DOCKER-DEPLOY.md 部署指南
- QUICK-REFERENCE.md 速查表
- .env.local.example 配置模板

### 🐛 Fixed

#### 部署问题
- 修复 Docker 容器缺少环境变量导致的登录 500 错误
- 修复容器内 `/app/.next/cache` 权限问题
- 修复 docker-compose.yml 网络配置错误

#### 界面问题
- 修复 Navbar 用户头像不显示
- 修复 ReactMarkdown 不渲染 HTML 标签
- 修复 Summary 重复显示
- 修复 Tailwind Typography 插件不生效

#### 功能问题
- 修复文章创建时 tags 字段未序列化
- 修复翻译 API 字段映射错误（camelCase vs snake_case）
- 修复 x-article-to-blog skill 未提取图片

### 🔧 Changed

#### 认证系统
- 从邀请码系统切换到 GitHub OAuth
- 从 Google OAuth 切换到 GitHub OAuth（更简单可靠）
- 移除 RequireAuth 全局包裹（改为公开访问）

#### 数据库
- 添加 google_id 列（保留以备后用）
- 添加 tags 列支持智能标签
- 添加 author_recommendations 表

#### 界面优化
- 移除"添加文章"功能（后台操作）
- 优化文章详情页布局
- 简化 Header 高度
- 优化标签显示（最多显示 5 个）

### 🔐 Security

- 环境变量文件权限保护（600）
- .gitignore 排除敏感文件
- NextAuth secret 加密
- SQLite 数据库访问控制

### 📊 Performance

- Docker 多阶段构建优化镜像大小
- 使用 Alpine Linux 减小体积
- 数据库索引优化
- Standalone 输出模式减少依赖

---

## [0.9.0] - 2026-03-26

### 🚧 Beta 测试版

内部测试阶段，主要功能开发完成。

### Added
- 基础文章展示功能
- 翻译功能原型
- Google OAuth 登录（后废弃）
- 邀请码系统（后废弃）

### Issues
- OAuth 状态 cookie 问题
- 数据库权限问题
- 环境变量加载问题

---

## [0.5.0] - 2026-03-24

### 🏗️ 开发版

项目初始化，搭建基础架构。

### Added
- Next.js 16 项目初始化
- TypeScript + Tailwind CSS 配置
- SQLite 数据库设计
- 基础 API 路由
- 文章列表页面

---

## 未来计划

### [1.1.0] - 计划中

- [ ] HTTPS 支持（Let's Encrypt）
- [ ] 自动备份定时任务（Cron）
- [ ] Prometheus + Grafana 监控
- [ ] RSS 订阅功能
- [ ] 文章收藏功能
- [ ] 评论系统
- [ ] 全文搜索（SQLite FTS5）
- [ ] 多语言支持（i18n）
- [ ] PWA 支持
- [ ] 性能优化（CDN、图片压缩）

### [2.0.0] - 未来

- [ ] PostgreSQL 迁移（水平扩展）
- [ ] Redis 缓存层
- [ ] 微服务架构
- [ ] Kubernetes 部署
- [ ] CI/CD 流水线
- [ ] E2E 测试覆盖

---

## 版本说明

### 版本号规则

遵循语义化版本：`MAJOR.MINOR.PATCH`

- **MAJOR**: 不兼容的 API 修改
- **MINOR**: 向下兼容的功能新增
- **PATCH**: 向下兼容的问题修正

### 标签说明

- 🎉 **Added**: 新增功能
- 🐛 **Fixed**: 问题修复
- 🔧 **Changed**: 功能变更
- 🗑️ **Deprecated**: 即将废弃
- ❌ **Removed**: 已删除功能
- 🔐 **Security**: 安全更新
- 📊 **Performance**: 性能优化

---

> 📝 持续更新中... 查看 [GitHub Releases](https://github.com/Aimlessly1012/x-blog/releases) 获取最新版本
