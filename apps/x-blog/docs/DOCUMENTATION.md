# 📚 完整文档索引

> HeiTu 🐰 - X (Twitter) 文章聚合博客 - 完整文档体系

---

## 🎯 快速导航

### 🚀 新手入门
- **[README.md](README.md)** - 项目介绍、快速开始
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - 常用命令速查表
- **[DOCKER-DEPLOY.md](DOCKER-DEPLOY.md)** - Docker 部署指南

### 📖 深入学习
- **[docs/README.md](docs/README.md)** - 文档中心导航
- **[docs/architecture.md](docs/architecture.md)** - 系统架构设计
- **[docs/database.md](docs/database.md)** - 数据库设计
- **[docs/api.md](docs/api.md)** - API 接口文档
- **[docs/article-workflow.md](docs/article-workflow.md)** - 文章管理流程

### 🛠️ 运维管理
- **[OPERATIONS.md](OPERATIONS.md)** - 完整运维手册
- **[CHANGELOG.md](CHANGELOG.md)** - 版本变更日志

---

## 📂 文档分类

### 一、项目文档

| 文档 | 描述 | 适用人群 |
|------|------|----------|
| [README.md](README.md) | 项目说明、特性介绍、快速开始 | 所有人 |
| [CHANGELOG.md](CHANGELOG.md) | 版本更新记录、未来计划 | 开发者、运维 |
| [AGENTS.md](AGENTS.md) | AI Agent 协作指南 | 开发者 |
| [CLAUDE.md](CLAUDE.md) | Claude 相关配置 | 开发者 |

### 二、开发文档

| 文档 | 描述 | 内容 |
|------|------|------|
| [docs/README.md](docs/README.md) | **文档中心** | 导航、架构图、流程图 |
| [docs/architecture.md](docs/architecture.md) | **系统架构** | 技术选型、三层架构、数据流 |
| [docs/database.md](docs/database.md) | **数据库设计** | ER图、表结构、索引、迁移 |
| [docs/api.md](docs/api.md) | **API 接口** | RESTful API、认证、错误码 |
| [docs/article-workflow.md](docs/article-workflow.md) | **业务流程** | 抓取→翻译→发布完整流程 |

### 三、部署运维

| 文档 | 描述 | 内容 |
|------|------|------|
| [DOCKER-DEPLOY.md](DOCKER-DEPLOY.md) | **Docker 部署** | 容器化、一键部署 |
| [OPERATIONS.md](OPERATIONS.md) | **运维手册** | 监控、备份、故障排查 |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | **快速参考** | 常用命令、应急处理 |

### 四、运维脚本

| 脚本 | 功能 | 用法 |
|------|------|------|
| [scripts/backup-db.sh](scripts/backup-db.sh) | 数据库备份 | `./scripts/backup-db.sh` |
| [scripts/restore-backup.sh](scripts/restore-backup.sh) | 数据库恢复 | `./scripts/restore-backup.sh` |
| [scripts/healthcheck.sh](scripts/healthcheck.sh) | 健康检查 | `./scripts/healthcheck.sh` |
| [scripts/monitor-errors.sh](scripts/monitor-errors.sh) | 错误监控 | `./scripts/monitor-errors.sh` |
| [scripts/auto-tag-articles.mjs](scripts/auto-tag-articles.mjs) | 自动标签 | `node scripts/auto-tag-articles.mjs` |
| [scripts/translate-articles.mjs](scripts/translate-articles.mjs) | 批量翻译 | `node scripts/translate-articles.mjs` |

### 五、Docker 工具

| 脚本 | 功能 | 用法 |
|------|------|------|
| [deploy-docker.sh](deploy-docker.sh) | 一键部署 | `./deploy-docker.sh` |
| [docker-manage.sh](docker-manage.sh) | 容器管理 | `./docker-manage.sh [start\|stop\|restart\|logs\|...]` |
| [install-docker.sh](install-docker.sh) | Docker 安装 | `./install-docker.sh` |

---

## 📊 文档统计

### 总览

- **文档总数**: 21个文件
- **文档类型**: Markdown (16) + Shell (5)
- **总大小**: ~100KB
- **覆盖范围**: 前端、后端、运维、部署

### 分类统计

```
项目文档:    4 个 (README, CHANGELOG, AGENTS, CLAUDE)
开发文档:    5 个 (docs/)
运维文档:    3 个 (OPERATIONS, DOCKER-DEPLOY, QUICK-REFERENCE)
运维脚本:    4 个 (scripts/*.sh)
数据脚本:    4 个 (scripts/*.mjs)
Docker 工具: 3 个 (deploy, manage, install)
```

---

## 🎓 学习路径

### 路径 1: 用户/运维人员

```
1. README.md (了解项目)
   ↓
2. DOCKER-DEPLOY.md (部署服务)
   ↓
3. QUICK-REFERENCE.md (常用命令)
   ↓
4. OPERATIONS.md (日常运维)
```

### 路径 2: 前端开发者

```
1. README.md (了解项目)
   ↓
2. docs/README.md (文档中心)
   ↓
3. docs/architecture.md (系统架构)
   ↓
4. docs/api.md (接口文档)
```

### 路径 3: 后端开发者

```
1. README.md (了解项目)
   ↓
2. docs/architecture.md (系统架构)
   ↓
3. docs/database.md (数据库设计)
   ↓
4. docs/api.md (API 设计)
   ↓
5. docs/article-workflow.md (业务流程)
```

### 路径 4: 全栈开发者

```
按顺序阅读所有 docs/ 下的文档
```

---

## 🔍 快速查找

### 我想...

**部署项目**:
→ [DOCKER-DEPLOY.md](DOCKER-DEPLOY.md)

**了解架构**:
→ [docs/architecture.md](docs/architecture.md)

**查看数据库**:
→ [docs/database.md](docs/database.md)

**调用 API**:
→ [docs/api.md](docs/api.md)

**日常运维**:
→ [OPERATIONS.md](OPERATIONS.md)

**应急处理**:
→ [QUICK-REFERENCE.md](QUICK-REFERENCE.md)

**查看命令**:
→ [QUICK-REFERENCE.md](QUICK-REFERENCE.md)

**查看更新**:
→ [CHANGELOG.md](CHANGELOG.md)

**自动备份**:
→ [scripts/backup-db.sh](scripts/backup-db.sh)

**健康检查**:
→ [scripts/healthcheck.sh](scripts/healthcheck.sh)

---

## 📋 文档规范

### Markdown 格式

所有文档使用 Markdown 编写，遵循：

- 清晰的标题层级（h1-h4）
- 代码块标注语言
- 表格对齐
- 链接有效性

### 文档结构

每个文档应包含：

1. **标题** - 清晰描述文档主题
2. **引言** - 简要说明文档用途
3. **目录** - 长文档需要目录
4. **正文** - 分段清晰、重点突出
5. **示例** - 代码示例、命令示例
6. **总结** - 关键要点回顾

### 更新流程

1. 修改对应文档
2. 更新 CHANGELOG.md
3. 更新本文件（如需要）
4. Git 提交并推送

---

## 🛠️ 文档维护

### 贡献指南

欢迎改进文档！请：

1. Fork 仓库
2. 创建文档分支
3. 修改并提交
4. 发起 Pull Request

### 问题反馈

发现文档问题？

- GitHub Issues: https://github.com/Aimlessly1012/x-blog/issues
- 标签: `documentation`

---

## 📞 联系方式

- **项目作者**: Peko wong (@Aimlessly1012)
- **GitHub**: https://github.com/Aimlessly1012/x-blog
- **在线服务**: http://heitu.wang

---

## 📝 文档版本

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-03-27 | 完整文档体系创建 |

---

## 🎯 下一步

选择适合你的学习路径开始吧！

- 👉 [快速开始](README.md)
- 👉 [文档中心](docs/README.md)
- 👉 [部署指南](DOCKER-DEPLOY.md)

---

> 🐰 **HeiTu** - 完整、清晰、易维护的文档体系

**让知识传递更简单 | 让开发协作更高效**
