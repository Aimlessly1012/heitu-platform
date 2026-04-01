# 本地开发环境设置

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Aimlessly1012/x-blog.git
cd x-blog
```

### 2. 安装依赖

```bash
npm install
```

### 3. 初始化数据库

```bash
node scripts/init-db.mjs
```

这会创建 `data/articles.db` 数据库文件，包含所有必要的表和索引。

### 4. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：

```env
# 基础配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl

# GitHub OAuth（从 https://github.com/settings/developers 获取）
GITHUB_ID=your-github-oauth-client-id
GITHUB_SECRET=your-github-oauth-client-secret

# 管理员 GitHub ID（你的 GitHub 数字 ID）
ADMIN_GITHUB_ID=your-github-user-id
```

**如何获取 GitHub OAuth 凭据：**

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   - Application name: `X-Blog Local`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. 创建后复制 Client ID 和 Client Secret

**如何生成 NEXTAUTH_SECRET：**

```bash
openssl rand -base64 32
```

**如何获取你的 GitHub ID：**

访问 https://api.github.com/users/YOUR_USERNAME 查看 `id` 字段。

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 🐳 使用 Docker（推荐生产环境）

如果你想使用 Docker 部署：

```bash
# 确保已配置 .env.local
cp .env.local.example .env.local
# 编辑 .env.local...

# 构建并启动
docker compose up -d

# 查看日志
docker compose logs -f

# 停止
docker compose down
```

---

## 📋 常见问题

### ❌ `SQLITE_CANTOPEN: unable to open database file`

**原因**：数据库文件不存在

**解决**：运行数据库初始化脚本

```bash
node scripts/init-db.mjs
```

### ❌ `Error: [next-auth][error][SIGNIN_OAUTH_ERROR]`

**原因**：GitHub OAuth 配置错误

**解决**：
1. 检查 `.env.local` 中的 `GITHUB_ID` 和 `GITHUB_SECRET`
2. 确认 GitHub OAuth App 的回调 URL 是 `http://localhost:3000/api/auth/callback/github`

### ❌ React Hydration 错误

**原因**：已修复（最新代码已包含修复）

**如果仍然出现**：
1. 清除浏览器缓存（Ctrl+Shift+R）
2. 删除 `.next` 目录重新构建
3. 确保使用最新代码

---

## 🛠️ 开发工具

### 数据库管理

查看数据库内容：

```bash
sqlite3 data/articles.db

# 查看所有表
.tables

# 查看 users 表
SELECT * FROM users;

# 查看 articles 表
SELECT id, title, status FROM articles;

# 退出
.quit
```

### 测试

运行端到端测试：

```bash
# 安装 Playwright（首次）
npx playwright install

# 运行测试脚本（需要先启动开发服务器）
python3 /tmp/test_x_blog_full.py
```

---

## 📚 更多文档

- [完整文档中心](docs/README.md)
- [Docker 部署指南](docs/DOCKER-DEPLOY.md)
- [运维手册](docs/OPERATIONS.md)
- [API 文档](docs/api.md)
- [数据库设计](docs/database.md)

---

## 🆘 需要帮助？

如果遇到问题：

1. 检查本文档的"常见问题"部分
2. 查看项目 Issues: https://github.com/Aimlessly1012/x-blog/issues
3. 提交新 Issue 描述问题
