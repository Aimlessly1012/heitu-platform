# X-Blog 运维速查表 🚀

> 快速参考 - 常用命令和操作指南

---

## 📋 一键命令

### 服务控制

```bash
# 项目目录
cd /opt/openclaw/tester/workspace/x-blog

# 启动服务
docker compose up -d

# 停止服务
docker compose down

# 重启服务
docker compose restart

# 查看状态
docker ps | grep x-blog

# 查看日志
docker logs -f x-blog
```

### 健康检查

```bash
# 完整健康检查
./scripts/healthcheck.sh

# 快速检查 HTTP
curl -I http://heitu.wang

# 查看容器状态
docker inspect x-blog | grep -A 5 Health
```

### 备份恢复

```bash
# 备份数据库
./scripts/backup-db.sh

# 恢复备份（交互式）
./scripts/restore-backup.sh

# 手动备份
cp data/articles.db backups/articles-$(date +%Y%m%d).db
```

---

## 🔍 故障排查

### 问题：容器启动失败

```bash
# 1. 检查日志
docker logs x-blog

# 2. 检查端口占用
netstat -tlnp | grep 3001

# 3. 清理重启
docker compose down
docker system prune -f
docker compose up -d
```

### 问题：登录 500 错误

```bash
# 1. 检查环境变量
docker exec x-blog env | grep -E "NEXTAUTH|GITHUB"

# 2. 检查日志
docker logs x-blog 2>&1 | grep -i error

# 3. 重启容器
docker compose restart
```

### 问题：数据库锁定

```bash
# 1. 重启容器
docker compose restart

# 2. 检查数据库完整性
sqlite3 data/articles.db "PRAGMA integrity_check;"

# 3. 真空清理
sqlite3 data/articles.db "VACUUM;"
```

### 问题：权限错误

```bash
# 1. 检查文件权限
ls -la data/

# 2. 修复权限（开发）
sudo chown -R 1001:1001 data/

# 3. 重建镜像（生产）
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 📊 监控命令

### 资源使用

```bash
# 实时监控
docker stats x-blog

# 单次查看
docker stats x-blog --no-stream

# 磁盘使用
du -sh data/articles.db
df -h
```

### 日志分析

```bash
# 最近错误
docker logs x-blog 2>&1 | grep -i error | tail -20

# NextAuth 错误
docker logs x-blog 2>&1 | grep "\[next-auth\]"

# 500 错误
docker logs x-blog 2>&1 | grep "500"

# 最近 1 小时
docker logs x-blog --since 1h
```

### 错误监控

```bash
# 运行监控脚本
./scripts/monitor-errors.sh

# 统计错误数量
docker logs x-blog --since 1h 2>&1 | grep -c "Error"
```

---

## 🗄️ 数据库操作

### 查看数据

```bash
# 进入 SQLite
sqlite3 data/articles.db

# 查看表
.tables

# 文章数量
SELECT COUNT(*) FROM articles;

# 用户数量
SELECT COUNT(*) FROM users;

# 最新文章
SELECT title, author, created_at FROM articles 
ORDER BY created_at DESC LIMIT 5;

# 退出
.quit
```

### 数据维护

```bash
# 真空清理
sqlite3 data/articles.db "VACUUM;"

# 完整性检查
sqlite3 data/articles.db "PRAGMA integrity_check;"

# 优化
sqlite3 data/articles.db "PRAGMA optimize;"
```

### 导出数据

```bash
# 导出 SQL
sqlite3 data/articles.db .dump > articles-dump.sql

# 导出 CSV
sqlite3 data/articles.db <<EOF
.mode csv
.headers on
.output articles.csv
SELECT * FROM articles;
.quit
EOF
```

---

## 🔧 配置管理

### 环境变量

```bash
# 查看容器环境变量
docker exec x-blog env | grep -E "NEXTAUTH|GITHUB"

# 编辑配置
vim .env.local

# 重启生效
docker compose down
docker compose up -d
```

### Nginx 配置

```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload

# 查看日志
tail -f /var/log/nginx/error.log
```

---

## 🚀 部署更新

### 更新代码

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建
docker compose down
docker compose build
docker compose up -d

# 或使用脚本
./docker-manage.sh rebuild
```

### 快速更新

```bash
# 仅重启容器（不重新构建）
docker compose restart

# 更新并重启
./docker-manage.sh update
```

---

## 📝 日志位置

```
应用日志:       docker logs x-blog
Nginx 访问:     /var/log/nginx/access.log
Nginx 错误:     /var/log/nginx/error.log
数据库:         data/articles.db
备份:           backups/
```

---

## 🔐 安全检查

```bash
# 检查防火墙
ufw status

# 检查端口
netstat -tlnp | grep -E "80|443|3001"

# 检查 SSL 证书（如有）
certbot certificates

# 检查文件权限
ls -la .env.local
# 应为 -rw------- (600)
```

---

## 📞 应急处理

### 服务宕机

1. 检查容器状态：`docker ps -a | grep x-blog`
2. 查看错误日志：`docker logs x-blog`
3. 重启服务：`docker compose restart`
4. 如果无法恢复，恢复备份

### 数据丢失

1. 停止服务：`docker compose down`
2. 恢复备份：`./scripts/restore-backup.sh`
3. 启动服务：`docker compose up -d`
4. 验证数据：`sqlite3 data/articles.db "SELECT COUNT(*) FROM articles;"`

### 性能问题

1. 检查资源：`docker stats x-blog`
2. 重启释放：`docker compose restart`
3. 清理日志：`docker logs x-blog --tail 100`
4. 数据库优化：`sqlite3 data/articles.db "VACUUM;"`

---

## 📚 文档链接

- **[完整运维手册](OPERATIONS.md)** - 详细指南
- **[Docker 部署](DOCKER-DEPLOY.md)** - 部署文档
- **[项目说明](README.md)** - 项目介绍
- **[GitHub 仓库](https://github.com/Aimlessly1012/x-blog)** - 源代码

---

## 💡 小贴士

- ✅ 每天自动备份数据库（设置 cron）
- ✅ 定期查看错误日志（`./scripts/monitor-errors.sh`）
- ✅ 保留至少 7 天的备份
- ✅ 更新前先备份
- ✅ 生产环境使用 HTTPS
- ✅ 定期更新依赖和安全补丁

---

> 🐰 **HeiTu** - 快速、可靠、易维护
