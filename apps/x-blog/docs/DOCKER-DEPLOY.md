# X-Blog Docker 部署文档

## 🐳 Docker 部署方案

### 架构说明

```
┌─────────────────┐
│   Nginx (80)    │
│   heitu.wang    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Docker容器       │
│ x-blog:3001     │
│                 │
│ ┌─────────────┐ │
│ │  Next.js    │ │
│ │  App        │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ SQLite DB   │ │
│ │ (volume)    │ │
│ └─────────────┘ │
└─────────────────┘
```

## 📦 文件说明

- `Dockerfile` - 多阶段构建配置
- `docker-compose.yml` - 服务编排配置
- `.dockerignore` - 忽略文件列表
- `deploy-docker.sh` - 一键部署脚本
- `docker-manage.sh` - 快速管理工具

## 🚀 快速开始

### 1. 首次部署

```bash
# 检查环境
docker --version
docker-compose --version

# 确保 .env.local 存在
ls -lh .env.local

# 一键部署
./deploy-docker.sh
```

### 2. 日常管理

```bash
# 启动服务
./docker-manage.sh start

# 停止服务
./docker-manage.sh stop

# 重启服务
./docker-manage.sh restart

# 查看日志
./docker-manage.sh logs

# 查看状态
./docker-manage.sh status

# 进入容器
./docker-manage.sh shell
```

## 📝 手动操作

### 构建镜像

```bash
docker-compose build
```

### 启动容器

```bash
docker-compose up -d
```

### 查看日志

```bash
# 实时日志
docker-compose logs -f x-blog

# 最近 100 行
docker-compose logs --tail=100 x-blog
```

### 停止容器

```bash
docker-compose stop
```

### 删除容器

```bash
docker-compose down
```

### 进入容器调试

```bash
docker exec -it x-blog sh
```

## 🔧 维护操作

### 更新代码并重新部署

```bash
# 方式 1：使用管理脚本
./docker-manage.sh update

# 方式 2：手动操作
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### 清理旧镜像

```bash
# 使用管理脚本
./docker-manage.sh clean

# 手动清理
docker rmi x-blog-x-blog
docker image prune -f
```

### 完全重建（无缓存）

```bash
# 使用管理脚本
./docker-manage.sh rebuild

# 手动操作
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📊 监控

### 查看资源使用

```bash
docker stats x-blog
```

### 健康检查

```bash
# 检查容器状态
docker-compose ps

# 手动健康检查
curl http://localhost:3001
```

## 🔍 故障排查

### 容器无法启动

```bash
# 查看构建日志
docker-compose build

# 查看启动日志
docker-compose logs x-blog

# 检查端口占用
lsof -i :3001
```

### 数据库问题

```bash
# 进入容器检查
docker exec -it x-blog sh
cd /app/data
ls -lh articles.db

# 从宿主机访问数据库
sqlite3 ./data/articles.db "SELECT COUNT(*) FROM articles;"
```

### 环境变量未生效

```bash
# 查看容器环境变量
docker exec -it x-blog env | grep NEXTAUTH

# 重新加载环境变量
docker-compose down
docker-compose up -d
```

## 💾 数据持久化

### 备份数据库

```bash
# 手动备份
cp ./data/articles.db ./data/articles.db.backup

# 使用 Docker 卷备份
docker run --rm -v x-blog_x-blog-data:/data -v $(pwd)/backup:/backup alpine tar czf /backup/data-$(date +%Y%m%d).tar.gz /data
```

### 恢复数据库

```bash
# 停止容器
docker-compose stop

# 恢复数据
cp ./data/articles.db.backup ./data/articles.db

# 启动容器
docker-compose start
```

## 🌐 Nginx 配置

当前 Nginx 配置已指向 `localhost:3001`，无需修改。

如需调整，编辑 `/etc/nginx/sites-available/heitu.wang`：

```nginx
location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

然后重载 Nginx：

```bash
nginx -t
nginx -s reload
```

## 🔐 安全建议

1. **限制容器权限**：已配置非 root 用户运行
2. **环境变量安全**：不要提交 `.env.local` 到 Git
3. **定期备份**：每天备份数据库
4. **监控日志**：定期查看异常日志
5. **更新镜像**：定期更新 Node.js 基础镜像

## 📈 性能优化

### 多阶段构建优化

当前 Dockerfile 使用三阶段构建：
1. `deps` - 安装依赖
2. `builder` - 构建应用
3. `runner` - 运行应用

最终镜像只包含运行必需的文件，大小约 200MB。

### 资源限制

在 `docker-compose.yml` 中添加资源限制：

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

## 🎯 生产环境建议

1. **使用具体版本标签**：`node:22.22.1-alpine` 而不是 `node:22-alpine`
2. **配置日志轮转**：避免日志文件过大
3. **添加监控告警**：集成 Prometheus + Grafana
4. **配置 HTTPS**：使用 Let's Encrypt 证书
5. **CDN 加速**：静态资源使用 CDN

## 📚 参考资料

- [Next.js Docker 部署](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)
