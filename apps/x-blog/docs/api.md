# API 接口文档

> HeiTu 🐰 - RESTful API 完整文档

---

## 📡 API 概览

### Base URL

```
生产环境: http://heitu.wang
开发环境: http://localhost:3001
```

### 通用响应格式

**成功响应**:
```json
{
  "data": { ... }  // 或数组 [...]
}
```

**错误响应**:
```json
{
  "error": "错误信息"
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 📝 文章接口

### GET /api/articles

获取文章列表

**请求参数**: 无

**响应示例**:
```json
{
  "data": [
    {
      "id": "art_1774437798264_kncr078",
      "url": "https://x.com/user/status/123",
      "title": "Claude Code 最佳实践",
      "author": "Peko wong",
      "author_username": "@Aimlessly1012",
      "content": "## 标题\n内容...",
      "summary": "本文介绍...",
      "original_language": "en",
      "translated_content": "## 标题\n翻译...",
      "translated_summary": "文章总结...",
      "cover_image": "https://pbs.twimg.com/...",
      "published_at": "2026-03-24T10:30:56.000Z",
      "status": "completed",
      "tags": ["Claude", "教程"],
      "created_at": "2026-03-24 18:36:58"
    }
  ]
}
```

---

### POST /api/articles

创建文章

**请求 Body**:
```json
{
  "url": "https://x.com/user/status/123",
  "title": "文章标题",
  "author": "作者",
  "author_username": "@username",
  "content": "文章内容",
  "summary": "摘要",
  "originalLanguage": "en",
  "tags": ["标签1", "标签2"],
  "coverImage": "https://...",
  "publishedAt": "2026-03-24T10:30:56.000Z"
}
```

**响应**:
```json
{
  "data": {
    "id": "art_1774437798264_kncr078",
    ...
  }
}
```

---

## 🔐 认证接口

### POST /api/auth/signin

GitHub OAuth 登录（NextAuth 处理）

### GET /api/auth/session

获取当前会话

**响应**:
```json
{
  "user": {
    "id": 1,
    "name": "Peko wong",
    "email": "user@example.com",
    "image": "https://avatars.githubusercontent.com/...",
    "status": "approved",
    "isAdmin": true
  }
}
```

---

## 👥 用户管理接口

### GET /api/admin/users

获取用户列表（管理员）

**查询参数**:
- `status`: 可选，筛选状态（pending/approved/rejected）

**响应**:
```json
{
  "data": [
    {
      "id": 1,
      "github_id": "51191827",
      "name": "Peko wong",
      "email": "user@example.com",
      "image": "https://...",
      "status": "approved",
      "is_admin": 1,
      "created_at": "2026-03-24 18:36:58"
    }
  ]
}
```

---

## 🐰 作者推荐接口

### POST /api/recommend-author

提交作者推荐

**请求 Body**:
```json
{
  "url": "https://x.com/@username"
}
```

**响应**:
```json
{
  "data": {
    "id": 1,
    "username": "@username",
    "display_name": "用户名",
    "bio": "简介",
    "avatar_url": "https://unavatar.io/x/@username",
    "status": "pending"
  }
}
```

---

更多详细接口文档见代码注释。

---

> 🐰 **HeiTu** - 清晰、规范的 API 设计
