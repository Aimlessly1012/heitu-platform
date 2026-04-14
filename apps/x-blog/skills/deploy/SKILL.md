---
name: deploy
description: heitu-platform 项目的服务器部署与发布。当需要部署 x-blog 应用、更新文档站、查看服务状态、排查线上问题时触发。关键词：部署、发布、上线、deploy、服务器、docker。
allowed-tools: Bash Read Edit Write
---

# heitu-platform 部署指南

服务器发布流程，覆盖 x-blog 应用和 heitu 文档站的部署。

## 架构总览

```
用户浏览器 (HTTPS)
    |
  Nginx (SSL 终止 + 反向代理)
    |-- /docs/*  --> 静态文件 (/var/www/heitu-docs/)
    |-- /*       --> Docker 容器 (127.0.0.1:3001)
                        |
                  x-blog (Next.js 16 standalone)
                  SQLite (/app/apps/x-blog/data/)
```

## 服务器信息

- **IP**: 43.167.170.20
- **用户**: root
- **SSH**: `ssh root@43.167.170.20`
- **项目路径**: `/root/peko/heitu-platform`
- **域名**: heitu.wang (Let's Encrypt SSL)

## x-blog 发布流程

### 完整流程（代码有改动时）

```bash
# 1. 本地提交推送
git add . && git commit -m "feat: xxx" && git push

# 2. SSH 到服务器
ssh root@43.167.170.20

# 3. 拉取 + 构建 + 部署（后台执行防止 SSH 断连）
cd /root/peko/heitu-platform
git pull
nohup bash -c 'docker compose build --no-cache x-blog && docker compose up -d x-blog' > /tmp/build.log 2>&1 &

# 4. 查看构建进度
tail -f /tmp/build.log

# 5. 验证部署
docker compose ps
docker compose logs --tail 20 x-blog
curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/
```

### 快速重启（仅配置/环境变量改动）

```bash
ssh root@43.167.170.20
cd /root/peko/heitu-platform
# 修改环境变量
vi apps/x-blog/.env.local
# 需要重新构建（Next.js 构建时内联环境变量）
docker compose build --no-cache x-blog && docker compose up -d x-blog
```

### Docker 构建说明

Dockerfile 采用多阶段构建（`apps/x-blog/Dockerfile`）：

| 阶段 | 作用 |
|------|------|
| `deps` | pnpm 安装依赖 + 编译原生模块 |
| `native-builder` | 独立编译 better-sqlite3（绕过 pnpm 符号链接） |
| `heitu-builder` | 构建 heitu 组件库 |
| `builder` | 构建 Next.js 应用（standalone 模式） |
| `runner` | 生产运行镜像（node:22-alpine） |

关键点：
- better-sqlite3 原生模块需要复制到 pnpm 路径：`/app/node_modules/.pnpm/better-sqlite3@12.8.0/node_modules/better-sqlite3/build`
- public 目录需要复制到 `apps/x-blog/public`（不是根 `/app/public`）
- data 目录在 `apps/x-blog/data/`（SQLite 数据库）

## 文档站发布流程

```bash
# 1. 本地构建文档（需要 Node 20+）
cd heitu-platform
pnpm --filter heitu docs:build

# 2. 同步到服务器（用 rsync 而不是 scp，确保完整传输）
rsync -avz packages/heitu/docs-dist/ root@43.167.170.20:/var/www/heitu-docs/
```

文档是纯静态文件，上传后立即生效，无需重启任何服务。

## 关键路径

| 路径 | 说明 |
|------|------|
| `/root/peko/heitu-platform/` | 项目代码根目录 |
| `/root/peko/heitu-platform/docker-compose.yml` | Docker Compose 配置 |
| `/root/peko/heitu-platform/apps/x-blog/.env.local` | 环境变量（OAuth、密钥） |
| `/root/peko/heitu-platform/apps/x-blog/data/` | SQLite 数据库（volume 挂载） |
| `/var/www/heitu-docs/` | 文档站静态文件 |
| `/etc/nginx/sites-enabled/heitu.wang` | Nginx 配置 |
| `/etc/letsencrypt/live/heitu.wang/` | SSL 证书（自动续期） |

## 环境变量

`apps/x-blog/.env.local` 包含：

```
NEXTAUTH_URL=https://heitu.wang        # 必须是 https
NEXTAUTH_SECRET=<secret>
GITHUB_ID=<github-oauth-client-id>
GITHUB_SECRET=<github-oauth-secret>
ADMIN_GITHUB_ID=51191827               # 管理员 GitHub 用户 ID
```

## Nginx 配置要点

- SSL 由 Let's Encrypt 提供，证书自动续期
- `/docs` 路径用 `alias` 指向 `/var/www/heitu-docs`
- 其余路径反向代理到 `127.0.0.1:3001`
- 设置了 `X-Forwarded-Proto $scheme`（NextAuth 需要）
- CSP、频率限制、安全头均已配置

## 常用运维命令

```bash
# 容器状态
docker compose ps

# 实时日志
docker compose logs -f x-blog

# 查看最近日志
docker compose logs --tail 50 x-blog

# 重启容器
docker compose restart x-blog

# 进入容器调试
docker exec -it x-blog sh

# 检查 Nginx 配置
nginx -t && systemctl reload nginx

# 查看磁盘使用
docker system df

# 清理无用镜像
docker image prune -a
```

## 故障排查

### 登录失败（500 / bindings error）
- 检查 better-sqlite3 原生模块：`docker exec x-blog ls /app/node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3/build/Release/`
- 如果 `.node` 文件不存在，需要 `docker compose build --no-cache x-blog` 重新构建

### 登录重定向循环
- 检查 `NEXTAUTH_URL` 是否为 `https://heitu.wang`
- 确认 middleware 中 `getToken()` 指定了 `cookieName: 'next-auth.session-token'`
- 确认 `useSecureCookies: false`（反向代理终止 SSL，容器内部是 HTTP）

### GitHub OAuth redirect_uri 不匹配
- GitHub OAuth App 的回调 URL 必须与 `NEXTAUTH_URL` 协议一致
- 正确值：`https://heitu.wang/api/auth/callback/github`

### middleware ByteString 错误
- middleware.ts 中不能有非 ASCII 字符（Edge Runtime 限制）
- 注释中避免使用中文箭头 `->` 等

### 文档站白屏
- 检查文件是否完整：`find /var/www/heitu-docs -type f | wc -l`（应 234 个）
- 用 `rsync` 重新同步：`rsync -avz packages/heitu/docs-dist/ root@43.167.170.20:/var/www/heitu-docs/`

### SSH 构建超时
- 长时间构建会导致 SSH 断连
- 始终用 `nohup ... &` 后台执行，用 `tail -f /tmp/build.log` 查看进度
