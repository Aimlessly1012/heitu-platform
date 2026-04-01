# X-Blog Skills

这个目录包含与 X (Twitter) 相关的 OpenClaw Skills。

## 📦 已安装的 Skills

### 1. **x-article-to-blog** 🐰
- **功能：** X 文章聚合器 - 自动抓取 X.com 文章并添加到博客
- **触发：** "添加 X 文章"，"抓取推文"，"fetch tweet"
- **核心功能：**
  - 通过 fxtwitter API 抓取 X 文章内容
  - 自动检测语言（中文/英文）
  - 智能标签检测
  - 保存到博客数据库
- **脚本：** `scripts/fetch_and_post.py`

### 2. **x-api**
- **功能：** X/Twitter API 集成 - 发推文、读时间线、搜索、分析
- **触发：** "post to X"，"tweet"，"X API"，"Twitter API"
- **核心功能：**
  - OAuth 2.0 认证
  - 发推文/线程
  - 读取时间线和提及
  - 搜索内容
  - 分析和参与度跟踪
- **认证：** 需要 X_BEARER_TOKEN 环境变量

### 3. **crosspost**
- **功能：** 跨平台内容发布 - 同时发布到 X、LinkedIn、Threads 等
- **触发：** "发布到多个平台"，"crosspost"，"同步发布"
- **核心功能：**
  - 一次性发布到多个平台
  - 自动格式转换
  - 支持 X、LinkedIn、Threads、Mastodon
  - 媒体上传支持

## 🚀 使用方法

### x-article-to-blog 使用示例

```bash
# 抓取 X 文章
python3 /opt/openclaw/tester/workspace/x-blog/skills/x-article-to-blog/scripts/fetch_and_post.py https://x.com/username/status/1234567890
```

### x-api 使用示例

```bash
# 设置环境变量
export X_BEARER_TOKEN="your-bearer-token"

# 发推文（需要 OAuth 1.0a）
curl -X POST https://api.twitter.com/2/tweets \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from X-Blog!"}'
```

## 📝 配置

Skills 会自动被 OpenClaw 识别。如果你想手动加载：

```bash
# 将 skills 目录添加到 OpenClaw 配置
openclaw config.patch '{"skills":{"paths":["/opt/openclaw/tester/workspace/x-blog/skills"]}}'
```

## 🔗 相关文档

- [OpenClaw Skills 文档](https://docs.openclaw.ai/skills)
- [X API 官方文档](https://developer.twitter.com/en/docs)
- [fxtwitter API](https://github.com/FixTweet/FxTwitter)

---

🐰 **黑兔提示：** 这些 skills 已经集成到 X-Blog 项目，可以直接通过 OpenClaw 调用！
