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

### 4. **heitu-hooks**
- **功能：** HeiTu React Hooks 开发指南
- **触发：** 使用 useAsyncFn、useWebSocket、usePolling、useLocalStorage 等 hooks 时
- **核心功能：**
  - 异步状态管理（useAsyncFn、useCancelAsyncFn）
  - 轮询与 WebSocket 连接
  - 本地存储 / 会话存储 / Cookie
  - DOM 尺寸与视口检测
  - 无限滚动、倒计时、图片预加载

### 5. **heitu-canvas**
- **功能：** HeiTu Canvas 2D 引擎开发指南
- **触发：** 绑定 canvas、绘制图形（Rect/Circle/Text/Line/Custom）、拖拽、动画时
- **核心功能：**
  - Stage 舞台 + 图形（Rect、Circle、Text、Line、Custom、Group）
  - 事件系统（click、mouseenter、drag 等）
  - Animate 补间动画
  - 分组与层级管理

### 6. **heitu-charts**
- **功能：** HeiTu Charts 图表库开发指南
- **触发：** 创建折线图、柱状图、饼图/环形图、柱线混合图时
- **核心功能：**
  - 折线图（单线/多线/平滑曲线）
  - 柱状图（颜色映射/圆角/动画）
  - 饼图/环形图（点击弹出）
  - 柱状折线混合图（双 Y 轴）
  - React 组件 + 命令式 API

### 7. **heitu-formrender**
- **功能：** HeiTu FormRender JSON 驱动表单开发指南
- **触发：** 创建表单、配置联动、异步数据源、注册自定义控件时
- **核心功能：**
  - 19 种内置控件
  - Watch 字段联动 + watchClean 级联清空
  - Service 异步数据源（内置竞态保护）
  - 多列布局（二维数组自动计算 span）
  - 自定义控件注册（全局/Provider 作用域）

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
