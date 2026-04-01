# X-Blog 运维手册

> HeiTu 🐰 - 信息茧房 | Twitter 文章聚合博客运维指南

---

## 📋 目录

1. [项目概览](#项目概览)
2. [快速开始](#快速开始)
3. [日常运维](#日常运维)
4. [故障排查](#故障排查)
5. [备份恢复](#备份恢复)
6. [监控告警](#监控告警)
7. [性能优化](#性能优化)
8. [安全加固](#安全加固)

---

## 项目概览

### 技术栈
- **前端**: Next.js 16.2.1 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes + NextAuth.js
- **数据库**: SQLite (articles.db)
- **部署**: Docker + Docker Compose
- **反向代理**: Nginx
- **认证**: GitHub OAuth

### 架构图
```
用户请求 → Nginx (80/443) → Docker Container (3001) → Next.js App → SQLite
                                                      ↓
                                              GitHub OAuth
```

### 目录结构
```
x-blog/
├── src/                    # 源代码
│   ├── app/               # Next.js 路由
│   ├── components/        # React 组件
│   └── lib/               # 工具函数
├── data/                   # 数据目录（持久化）
│   └── articles.db        # SQLite 数据库
├── public/                 # 静态资源
├── scripts/                # 运维脚本
├── docker-compose.yml      # Docker 配置
├── Dockerfile             # 镜像构建
├── .env.local             # 环境变量（敏感）
└── OPERATIONS.md          # 本文档
```

---

## 快速开始

### 前置条件
- Docker 20.10+
- Docker Compose 2.0+
- Nginx 1.18+
- 域名（heitu.wang）
- GitHub OAuth App

### 一键部署
```bash
cd /opt/openclaw/tester/workspace/x-blog
./deploy-docker.sh
```

### 环境变量配置
创建 `.env.local` 文件：
```env
# NextAuth
NEXTAUTH_URL=http://heitu.wang
NEXTAUTH_SECRET=your-secret-key-here

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# 管理员 GitHub ID
ADMIN_GITHUB_ID=51191827
```

---

## 日常运维

### 容器管理

#### 查看状态
```bash
cd /opt/openclaw/tester/workspace/x-blog
./docker-manage.sh status
```

或使用 Docker 命令：
```bash
docker ps | grep x-blog
docker stats x-blog --no-stream
```

#### 启动/停止/重启
```bash
# 启动
./docker-manage.sh start
# 或
docker compose up -d

# 停止
./docker-manage.sh stop
# 或
docker compose down

# 重启
./docker-manage.sh restart
# 或
docker compose restart
```

#### 查看日志
```bash
# 实时日志
./docker-manage.sh logs

# 最近 100 行
docker logs x-blog --tail 100

# 实时跟踪
docker logs -f x-blog

# 带时间戳
docker logs -t x-blog
```

#### 进入容器
```bash
./docker-manage.sh shell
# 或
docker exec -it x-blog sh
```

### 数据库管理

#### 备份数据库
```bash
# 手动备份
cp data/articles.db data/backup-$(date +%Y%m%d-%H%M%S).db

# 或使用脚本
./scripts/backup-db.sh
```

#### 查看数据库状态
```bash
# 进入容器
docker exec -it x-blog sh

# SQLite 命令
sqlite3 /app/data/articles.db

# 查看表
.tables

# 查看文章数量
SELECT COUNT(*) FROM articles;

# 查看用户数量
SELECT COUNT(*) FROM users;

# 退出
.quit
```

#### 数据库维护
```bash
# 真空清理（回收空间）
sqlite3 data/articles.db "VACUUM;"

# 检查完整性
sqlite3 data/articles.db "PRAGMA integrity_check;"

# 优化
sqlite3 data/articles.db "PRAGMA optimize;"
```

### Nginx 管理

#### 检查配置
```bash
nginx -t
```

#### 重载配置
```bash
nginx -s reload
# 或
systemctl reload nginx
```

#### 查看日志
```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log

# 针对 heitu.wang
tail -f /var/log/nginx/heitu.wang.access.log
tail -f /var/log/nginx/heitu.wang.error.log
```

### 更新部署

#### 更新代码
```bash
cd /opt/openclaw/tester/workspace/x-blog

# 拉取最新代码
git pull

# 重新构建并部署
./docker-manage.sh rebuild
```

#### 仅更新镜像
```bash
./docker-manage.sh update
```

---

## 故障排查

### 常见问题

#### 1. 容器启动失败
**症状**: `docker ps` 看不到容器
**排查步骤**:
```bash
# 查看容器状态
docker ps -a | grep x-blog

# 查看启动日志
docker logs x-blog

# 常见原因：
# - 端口被占用
# - 环境变量缺失
# - 权限问题
```

**解决方案**:
```bash
# 检查端口占用
netstat -tlnp | grep 3001
lsof -i :3001

# 清理旧容器
docker compose down
docker system prune -f

# 重新启动
docker compose up -d
```

#### 2. 登录 500 错误
**症状**: 点击"GitHub 登录"返回 500
**排查步骤**:
```bash
# 查看容器日志
docker logs x-blog 2>&1 | grep -i error

# 常见错误：
# - NO_SECRET: 缺少 NEXTAUTH_SECRET
# - Invalid credentials: GitHub OAuth 配置错误
```

**解决方案**:
```bash
# 检查环境变量
docker exec x-blog env | grep -E "NEXTAUTH|GITHUB"

# 确保 .env.local 存在且正确
cat .env.local

# 重启容器加载环境变量
docker compose down
docker compose up -d
```

#### 3. 数据库锁定
**症状**: "database is locked" 错误
**排查步骤**:
```bash
# 检查进程
docker exec x-blog ps aux | grep node

# 查看数据库连接
docker exec x-blog sh -c "lsof /app/data/articles.db 2>/dev/null || fuser /app/data/articles.db"
```

**解决方案**:
```bash
# 重启容器
docker compose restart

# 如果问题持续，检查是否有备份脚本锁定数据库
```

#### 4. 权限问题
**症状**: "EACCES: permission denied"
**排查步骤**:
```bash
# 检查文件权限
ls -la data/
ls -la .next/

# 检查容器内权限
docker exec x-blog ls -la /app/data/
docker exec x-blog ls -la /app/.next/
```

**解决方案**:
```bash
# 修复权限（开发环境）
sudo chown -R 1001:1001 data/

# 生产环境重建镜像
docker compose down
docker compose build --no-cache
docker compose up -d
```

#### 5. 内存/CPU 过高
**症状**: 容器资源占用异常
**排查步骤**:
```bash
# 实时监控
docker stats x-blog

# 检查进程
docker exec x-blog ps aux --sort=-%mem
docker exec x-blog ps aux --sort=-%cpu
```

**解决方案**:
```bash
# 重启容器释放资源
docker compose restart

# 设置资源限制（docker-compose.yml）
services:
  x-blog:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
```

### 日志分析

#### 查看错误日志
```bash
# NextAuth 错误
docker logs x-blog 2>&1 | grep -i "\[next-auth\]"

# 数据库错误
docker logs x-blog 2>&1 | grep -i "sqlite"

# API 错误
docker logs x-blog 2>&1 | grep -i "error"

# 500 错误
docker logs x-blog 2>&1 | grep "500"
```

#### 按时间过滤
```bash
# 最近 1 小时
docker logs x-blog --since 1h

# 今天的日志
docker logs x-blog --since $(date +%Y-%m-%d)

# 特定时间段
docker logs x-blog --since "2026-03-27T14:00:00" --until "2026-03-27T15:00:00"
```

---

## 备份恢复

### 自动备份脚本

创建 `scripts/backup-db.sh`:
```bash
#!/bin/bash
set -e

BACKUP_DIR="/opt/openclaw/tester/workspace/x-blog/backups"
DB_FILE="/opt/openclaw/tester/workspace/x-blog/data/articles.db"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/articles-$DATE.db"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份数据库
cp "$DB_FILE" "$BACKUP_FILE"

# 压缩备份
gzip "$BACKUP_FILE"

# 保留最近 7 天的备份
find "$BACKUP_DIR" -name "articles-*.db.gz" -mtime +7 -delete

echo "✅ 备份完成: $BACKUP_FILE.gz"
```

### 定时备份（Crontab）
```bash
# 编辑 crontab
crontab -e

# 添加定时任务
# 每天凌晨 3 点备份
0 3 * * * /opt/openclaw/tester/workspace/x-blog/scripts/backup-db.sh

# 每 6 小时备份一次
0 */6 * * * /opt/openclaw/tester/workspace/x-blog/scripts/backup-db.sh
```

### 恢复备份
```bash
# 停止容器
docker compose down

# 恢复备份
gunzip -c backups/articles-20260327-030000.db.gz > data/articles.db

# 或直接复制
cp backups/articles-20260327-030000.db data/articles.db

# 启动容器
docker compose up -d
```

### 导出数据
```bash
# 导出为 SQL
sqlite3 data/articles.db .dump > articles-dump.sql

# 导出为 CSV
sqlite3 data/articles.db <<EOF
.mode csv
.headers on
.output articles.csv
SELECT * FROM articles;
.quit
EOF
```

### 导入数据
```bash
# 从 SQL 导入
sqlite3 data/articles.db < articles-dump.sql

# 从 CSV 导入
sqlite3 data/articles.db <<EOF
.mode csv
.import articles.csv articles
EOF
```

---

## 监控告警

### 健康检查

#### Docker 健康检查
```bash
# 查看健康状态
docker inspect x-blog | grep -A 10 Health

# 健康检查配置在 docker-compose.yml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

#### HTTP 健康检查
```bash
# 创建 scripts/healthcheck.sh
#!/bin/bash
URL="http://heitu.wang"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$STATUS" -eq 200 ]; then
  echo "✅ 服务正常 (HTTP $STATUS)"
  exit 0
else
  echo "❌ 服务异常 (HTTP $STATUS)"
  exit 1
fi
```

### 资源监控

#### CPU/内存监控
```bash
# 实时监控
watch -n 5 'docker stats x-blog --no-stream'

# 记录到日志
docker stats x-blog --no-stream >> logs/resource-usage.log
```

#### 磁盘使用
```bash
# 数据库大小
du -sh data/articles.db

# Docker 卷大小
docker system df -v | grep x-blog

# 系统磁盘
df -h
```

### 日志监控

创建 `scripts/monitor-errors.sh`:
```bash
#!/bin/bash
# 监控错误日志并发送告警

ERROR_COUNT=$(docker logs x-blog --since 1h 2>&1 | grep -c "Error")

if [ "$ERROR_COUNT" -gt 10 ]; then
  echo "⚠️  最近 1 小时内检测到 $ERROR_COUNT 个错误"
  # 这里可以添加告警逻辑（邮件、钉钉、企业微信等）
fi
```

---

## 性能优化

### Docker 优化

#### 多阶段构建
已在 Dockerfile 中实现：
```dockerfile
FROM node:22-alpine AS deps
# 安装依赖

FROM node:22-alpine AS builder
# 构建应用

FROM node:22-alpine AS runner
# 运行时镜像（最小化）
```

#### 镜像大小优化
```bash
# 查看镜像大小
docker images | grep x-blog

# 清理未使用的镜像
docker image prune -a

# 使用 Alpine 基础镜像（已实现）
```

### 数据库优化

#### 索引优化
```sql
-- 为常用查询字段添加索引
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_original_language ON articles(original_language);
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
```

#### 查询优化
```sql
-- 使用 EXPLAIN QUERY PLAN 分析查询
EXPLAIN QUERY PLAN
SELECT * FROM articles WHERE status = 'completed' ORDER BY created_at DESC LIMIT 10;
```

### Nginx 优化

#### 启用 Gzip 压缩
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript 
           application/json application/javascript application/xml+rss;
```

#### 启用缓存
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 启用 HTTP/2
```nginx
listen 443 ssl http2;
```

---

## 安全加固

### HTTPS 配置

#### 使用 Let's Encrypt
```bash
# 安装 certbot
apt install certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d heitu.wang -d www.heitu.wang

# 自动续期
certbot renew --dry-run
```

#### Nginx SSL 配置
```nginx
server {
    listen 443 ssl http2;
    server_name heitu.wang;

    ssl_certificate /etc/letsencrypt/live/heitu.wang/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/heitu.wang/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name heitu.wang;
    return 301 https://$server_name$request_uri;
}
```

### 环境变量安全

#### 保护 .env.local
```bash
# 设置文件权限
chmod 600 .env.local

# 添加到 .gitignore
echo ".env.local" >> .gitignore

# 不要将敏感信息提交到 Git
```

#### 密钥轮换
```bash
# 定期更换 NEXTAUTH_SECRET
openssl rand -base64 32

# 更新 .env.local 后重启
docker compose down
docker compose up -d
```

### 防火墙配置

#### UFW 规则
```bash
# 允许 SSH
ufw allow 22/tcp

# 允许 HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 禁止直接访问 3001
ufw deny 3001/tcp

# 启用防火墙
ufw enable
```

### 限流保护

#### Nginx 限流
```nginx
# 限制请求频率
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
}
```

---

## 附录

### 快速命令参考

```bash
# 查看状态
docker ps | grep x-blog
docker logs x-blog --tail 50

# 重启服务
docker compose restart

# 进入容器
docker exec -it x-blog sh

# 备份数据库
cp data/articles.db backups/articles-$(date +%Y%m%d).db

# 查看资源使用
docker stats x-blog --no-stream

# 查看健康状态
curl -I http://heitu.wang

# 重载 Nginx
nginx -s reload

# 查看 Nginx 日志
tail -f /var/log/nginx/error.log
```

### 应急联系

- **项目负责人**: Peko wong
- **GitHub Issues**: https://github.com/Aimlessly1012/x-blog/issues
- **紧急处理**: 重启容器后联系管理员

### 更新日志

- **2026-03-27**: 初始版本，Docker 部署上线
- **2026-03-27**: 修复登录 500 错误（环境变量 + 权限问题）

---

> 📝 本文档持续更新中，如有问题请提交 Issue
