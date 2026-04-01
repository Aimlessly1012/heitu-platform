/**
 * Mock data seed script
 * Run: node scripts/seed-mock.mjs
 */
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'data', 'articles.db')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

// Ensure tags column exists
try {
  db.exec(`ALTER TABLE articles ADD COLUMN tags TEXT DEFAULT '[]'`)
} catch (e) {
  // column already exists
}

function insert(article) {
  const existing = db.prepare('SELECT id FROM articles WHERE id = ?').get(article.id)
  if (existing) {
    console.log(`  skip (exists): ${article.id}`)
    return
  }
  db.prepare(`
    INSERT INTO articles (id, url, title, author, author_username, content, summary,
      translated_content, translated_summary, original_language, cover_image,
      published_at, status, error, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    article.id,
    article.url,
    article.title,
    article.author,
    article.authorUsername,
    article.content,
    article.summary,
    article.translatedContent,
    article.translatedSummary,
    article.originalLanguage,
    article.coverImage,
    article.publishedAt,
    article.status,
    null,
    JSON.stringify(article.tags),
    article.createdAt,
    article.updatedAt,
  )
  console.log(`  inserted: ${article.title}`)
}

const now = new Date()
function daysAgo(n) {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}
function hoursAgo(n) {
  const d = new Date(now)
  d.setHours(d.getHours() - n)
  return d.toISOString()
}

// ── 晨报文章（首页 + 晨报页）────────────────────────────────────────────────
console.log('\n📰 插入晨报文章...')

const morningNews = [
  {
    id: 'morning_2026-03-30_001',
    url: 'https://x.com/alexalbert__/status/1000001',
    title: 'Claude 3.7 发布：Sonnet 模型迎来重大升级，推理能力突破新高',
    author: 'Alex Albert',
    authorUsername: 'alexalbert__',
    content: `Claude 3.7 Sonnet 今天正式发布，这是迄今为止 Anthropic 最强大的模型之一。

## 核心亮点

- **推理能力大幅提升**：在数学、代码和逻辑推理方面达到新高度
- **更长的上下文窗口**：支持 200K token，适合处理长文档和复杂代码库
- **混合推理模式**：可以在快速响应和深度思考之间自由切换
- **更准确的指令跟随**：减少幻觉，更忠实地执行用户意图

## 在 Claude Code 中使用

\`\`\`bash
# 切换到 Claude 3.7 Sonnet
claude --model claude-sonnet-3-7
\`\`\`

这次更新对开发者来说是个重大利好，特别是在需要深度代码审查和架构设计的场景中。`,
    summary: 'Claude 3.7 Sonnet 正式发布，推理能力大幅提升，支持 200K 上下文，混合推理模式让 AI 编程体验再上新台阶。',
    translatedContent: null,
    translatedSummary: null,
    originalLanguage: 'zh',
    coverImage: null,
    publishedAt: hoursAgo(2),
    status: 'completed',
    tags: ['晨报', 'Claude', '新功能', 'AI资讯'],
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'morning_2026-03-30_002',
    url: 'https://x.com/nash_su/status/1000002',
    title: 'Claude Code 迎来重大更新：并行 Agent 模式正式开放',
    author: 'Nash Su',
    authorUsername: 'nash_su',
    content: `Claude Code 最新版本带来了令人兴奋的并行 Agent 功能。

## 什么是并行 Agent 模式？

你现在可以同时运行多个 Claude Code Agent，每个 Agent 处理不同的子任务，最后汇总结果。这对于大型项目重构、多模块同步开发非常有用。

## 实战用法

\`\`\`bash
# 在 3 个 worktree 中并行运行
claude --parallel 3 "重构认证模块、数据库层和 API 层"
\`\`\`

## 性能对比

| 模式 | 耗时 | 质量 |
|------|------|------|
| 串行 | 45 分钟 | 好 |
| 并行 | 12 分钟 | 更好 |

并行模式不仅快，而且因为每个 Agent 上下文更聚焦，质量反而更高。`,
    summary: 'Claude Code 并行 Agent 模式开放，多 Agent 协作让大型重构速度提升 3-4 倍，上下文更聚焦质量也更高。',
    translatedContent: null,
    translatedSummary: null,
    originalLanguage: 'zh',
    coverImage: null,
    publishedAt: hoursAgo(4),
    status: 'completed',
    tags: ['晨报', 'Claude Code', '新功能', '实用技巧'],
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(4),
  },
  {
    id: 'morning_2026-03-29_001',
    url: 'https://x.com/zodchiii/status/1000003',
    title: '深度解析：如何用 Prompt Engineering 让 Claude 输出质量提升 10 倍',
    author: 'Dark Zodchi',
    authorUsername: 'zodchiii',
    content: `今天分享几个经过验证的 Prompt 技巧，能显著提升 Claude 的输出质量。

## 技巧 1：角色设定 + 约束组合

\`\`\`
你是一位有 10 年经验的高级软件工程师，专注于代码质量和可维护性。
在回答时：
- 优先考虑边界情况
- 提供可运行的代码示例
- 指出潜在的性能问题
\`\`\`

## 技巧 2：思维链提示

在复杂问题前加上"请一步步思考"，能让 Claude 减少跳跃性错误。

## 技巧 3：Few-shot 示例

提供 2-3 个高质量示例，让 Claude 理解你期望的输出格式和深度。

## 技巧 4：负面约束

明确告诉 Claude 不要做什么，往往比正面描述更有效。

这些技巧组合使用，我的代码审查 Prompt 输出质量提升了接近 10 倍。`,
    summary: '4 个经过验证的 Prompt 技巧：角色设定+约束、思维链提示、Few-shot 示例和负面约束，组合使用可让输出质量提升 10 倍。',
    translatedContent: null,
    translatedSummary: null,
    originalLanguage: 'zh',
    coverImage: null,
    publishedAt: daysAgo(1),
    status: 'completed',
    tags: ['晨报', '实用技巧', '开发教程', 'Claude'],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'morning_2026-03-29_002',
    url: 'https://x.com/heynavtoor/status/1000004',
    title: 'Context Engineering：比 Prompt Engineering 更重要的 AI 开发技能',
    author: 'Nav Toor',
    authorUsername: 'heynavtoor',
    content: `大家都在谈 Prompt Engineering，但真正决定 AI 输出质量的是 Context Engineering。

## 什么是 Context Engineering？

Context Engineering 是指系统性地设计和管理 AI 看到的所有信息——不仅仅是当前的 prompt，还包括：

- 对话历史的选择和压缩
- 工具调用结果的格式化
- 系统提示的架构设计
- 记忆系统的取舍策略

## 为什么它比 Prompt Engineering 更重要？

一个精心设计的 prompt 放在混乱的 context 中，效果会大打折扣。而一个精心设计的 context 能让即使普通的 prompt 也产生优秀的结果。

## 实践建议

1. 永远先清理 context，再优化 prompt
2. 对 context 进行"预算管理"——每个 token 都要有价值
3. 使用结构化格式（XML、JSON）让 AI 更容易解析`,
    summary: 'Context Engineering 比 Prompt Engineering 更基础，系统性地设计 AI 看到的所有信息，才能从根本上提升输出质量。',
    translatedContent: null,
    translatedSummary: null,
    originalLanguage: 'zh',
    coverImage: null,
    publishedAt: daysAgo(1),
    status: 'completed',
    tags: ['晨报', 'AI资讯', '实用技巧', '热门讨论'],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'morning_2026-03-28_001',
    url: 'https://x.com/LawrenceW_Zen/status/1000005',
    title: '我如何用 Claude Code 在 3 天内搭建一个完整的 SaaS 产品',
    author: '劳伦斯',
    authorUsername: 'LawrenceW_Zen',
    content: `分享一下我最近的实战经历：用 Claude Code 3 天搭建了一个完整 SaaS 产品。

## 项目概况

- **产品**：AI 驱动的合同审查工具
- **技术栈**：Next.js + PostgreSQL + Stripe
- **工作量**：~2000 行核心代码

## Day 1：架构设计

用 Claude Code 的 brainstorming skill 梳理需求，生成了完整的技术架构文档。关键是让 Claude 帮我识别潜在的技术债务和扩展性问题。

## Day 2：核心功能

重点是文件上传、AI 解析和结果展示。Claude Code 在处理复杂的异步流程时表现出色，一次性写出了正确的 streaming 实现。

## Day 3：支付和上线

Stripe 集成是最容易出错的部分，但 Claude Code 对 Stripe 的 API 非常熟悉，webhook 处理几乎没有 debug。

## 关键经验

最重要的不是让 Claude 写代码，而是让它帮你**做决策**——技术选型、架构取舍、安全边界。`,
    summary: '用 Claude Code 3 天构建 SaaS 产品的实战复盘：关键不是让 AI 写代码，而是让它参与架构决策和技术选型。',
    translatedContent: null,
    translatedSummary: null,
    originalLanguage: 'zh',
    coverImage: null,
    publishedAt: daysAgo(2),
    status: 'completed',
    tags: ['晨报', 'Claude Code', '开发教程', '热门讨论'],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
]

for (const article of morningNews) {
  insert(article)
}

// ── 精选文章（文章列表页 + 文章详情页）──────────────────────────────────────
console.log('\n📚 插入精选文章...')

const articles = [
  {
    id: 'art_mock_001',
    url: 'https://x.com/Khazix0918/status/2000001',
    title: 'Claude Code 最佳快捷键完全指南：让你的开发效率翻倍',
    author: 'Khazix',
    authorUsername: 'Khazix0918',
    content: `# Claude Code 快捷键完全指南

掌握这些快捷键，你的 Claude Code 使用效率将大幅提升。

## 最常用快捷键

| 快捷键 | 功能 |
|--------|------|
| \`Ctrl+C\` | 中断当前操作 |
| \`Ctrl+L\` | 清空对话历史 |
| \`↑/↓\` | 浏览历史命令 |
| \`Tab\` | 自动补全 |
| \`Shift+Enter\` | 多行输入 |

## 进阶技巧

### 1. 快速切换模型
\`\`\`
/model sonnet
/model opus
\`\`\`

### 2. 使用 /clear 保持上下文干净

每完成一个独立任务后，用 \`/clear\` 清空对话，避免旧上下文干扰新任务。

### 3. 善用 ! 前缀运行 Shell 命令

在 Claude Code 对话中直接运行 shell 命令：
\`\`\`
! git status
! npm test
\`\`\`

这些命令的输出会直接进入 Claude 的上下文，方便它理解当前项目状态。

## 高级用法：快捷键组合

将常用操作组合成工作流：
1. \`/compact\` 压缩历史
2. 描述任务
3. \`/review-pr\` 审查 PR`,
    summary: 'Claude Code 完整快捷键指南，涵盖基础操作、模型切换、Shell 命令集成等高效用法，让开发效率翻倍。',
    translatedContent: null,
    translatedSummary: null,
    originalLanguage: 'zh',
    coverImage: null,
    publishedAt: daysAgo(3),
    status: 'completed',
    tags: ['Claude Code', '快捷键', '实用技巧', '效率提升'],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 'art_mock_002',
    url: 'https://x.com/PandaTalk8/status/2000002',
    title: 'MCP（Model Context Protocol）入门：让 Claude 连接任意外部服务',
    author: 'Mr Panda',
    authorUsername: 'PandaTalk8',
    content: `# MCP 完全入门指南

MCP 是 Anthropic 推出的开放协议，让 Claude 能够安全地连接外部工具和服务。

## 核心概念

MCP 由三部分组成：
- **MCP Server**：提供工具和资源的服务端
- **MCP Client**：Claude Code 等 AI 客户端
- **协议层**：标准化的通信接口

## 快速上手：安装一个 MCP Server

\`\`\`bash
# 安装 filesystem MCP server
npm install -g @modelcontextprotocol/server-filesystem

# 在 Claude Code 中配置
claude mcp add filesystem -- npx @modelcontextprotocol/server-filesystem /your/path
\`\`\`

## 实用 MCP Servers 推荐

### 1. GitHub MCP
让 Claude 直接操作 GitHub Issues、PR 和代码库。

### 2. Postgres MCP
直接查询和修改数据库，无需手动复制粘贴 SQL。

### 3. Slack MCP
让 Claude 发送通知、读取频道消息。

## 自己写一个 MCP Server

\`\`\`typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js'

const server = new Server({
  name: 'my-tool',
  version: '1.0.0',
}, {
  capabilities: { tools: {} }
})

server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'get_weather',
    description: '获取城市天气',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名称' }
      }
    }
  }]
}))
\`\`\`

MCP 是 AI 工具生态的未来，现在学习正是时候。`,
    summary: 'MCP 协议入门完整指南：从核心概念到实战安装，再到自己编写 MCP Server，让 Claude 连接任意外部服务。',
    translatedContent: null,
    translatedSummary: null,
    originalLanguage: 'zh',
    coverImage: null,
    publishedAt: daysAgo(5),
    status: 'completed',
    tags: ['MCP', 'Claude Code', '开发教程', '开发者向'],
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: 'art_mock_003',
    url: 'https://x.com/affaanmustafa/status/2000003',
    title: 'AI Agent 工作流设计模式：从单 Agent 到多 Agent 编排',
    author: 'Affaan Mustafa',
    authorUsername: 'affaanmustafa',
    content: `# AI Agent 工作流设计模式

随着 AI Agent 越来越成熟，设计好的 Agent 工作流成为关键能力。

## 模式一：单 Agent 顺序执行

最简单的模式，一个 Agent 按步骤完成任务。

适用场景：任务简单、步骤少、不需要并行。

## 模式二：并行 Fan-out

将大任务分解为多个独立子任务，并行执行后汇总。

\`\`\`
主 Agent
  ├── Agent A：处理认证模块
  ├── Agent B：处理数据库层
  └── Agent C：处理 API 接口
       ↓
  汇总 Agent：整合结果
\`\`\`

**优势**：速度快，3-5x 性能提升
**注意**：需要确保子任务真正独立，无共享状态

## 模式三：Pipeline 流水线

每个 Agent 的输出是下一个 Agent 的输入。

适用场景：数据处理、文档生成、代码审查流程。

## 模式四：Evaluator-Optimizer 循环

一个 Agent 执行，另一个 Agent 评估，循环直到质量达标。

这是目前质量最高但成本最贵的模式，适合高价值任务。

## 选择建议

- 简单任务 → 单 Agent
- 独立子任务 → Fan-out
- 有依赖的流程 → Pipeline
- 高质量要求 → Evaluator-Optimizer`,
    summary: '四种 AI Agent 工作流设计模式详解：单 Agent、并行 Fan-out、Pipeline 流水线和 Evaluator-Optimizer 循环，各有适用场景。',
    translatedContent: null,
    translatedSummary: null,
    originalLanguage: 'zh',
    coverImage: null,
    publishedAt: daysAgo(7),
    status: 'completed',
    tags: ['AI Agent', 'Claude Code', '开发教程', '工作流'],
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
  {
    id: 'art_mock_004',
    url: 'https://x.com/bindureddy/status/2000004',
    title: 'How Claude Handles Ambiguous Instructions: A Deep Dive',
    author: 'Bindu Reddy',
    authorUsername: 'bindureddy',
    content: `# How Claude Handles Ambiguous Instructions

One of the most underappreciated aspects of Claude's behavior is how it deals with ambiguity.

## The Challenge

When you give Claude an instruction like "make this code better," there are dozens of valid interpretations:
- Better performance?
- Better readability?
- Better test coverage?
- Better error handling?

## Claude's Approach

Unlike some models that just pick an interpretation and run with it, Claude tends to:

1. **Acknowledge the ambiguity** when stakes are high
2. **Make reasonable assumptions** for low-stakes tasks
3. **Ask clarifying questions** strategically, not excessively

## The "Minimal Footprint" Principle

Claude is designed to prefer reversible actions and ask permission before doing anything irreversible. This is especially important in agentic contexts.

\`\`\`python
# Claude will ask before doing this:
# "I'm about to delete 47 files. Should I proceed?"

# But will just do this:
# Reading and analyzing a file
\`\`\`

## Practical Implications

For developers using Claude Code:

- **Be specific about success criteria** - Claude will optimize for what you measure
- **Use /compact wisely** - compressing context can lose nuance
- **Leverage CLAUDE.md** - set project-level defaults to reduce ambiguity

Understanding how Claude reasons about instructions helps you write better prompts and design better AI workflows.`,
    summary: 'Deep dive into how Claude handles ambiguous instructions: acknowledge ambiguity, make reasonable assumptions, and apply the minimal footprint principle for irreversible actions.',
    translatedContent: `# Claude 如何处理模糊指令：深度解析

Claude 行为中最被低估的方面之一，是它如何处理模糊性。

## 挑战

当你给 Claude 一个像"让这段代码更好"这样的指令时，有几十种有效的解读方式：
- 更好的性能？
- 更好的可读性？
- 更好的测试覆盖率？
- 更好的错误处理？

## Claude 的处理方式

与一些直接选择某种解读就开始执行的模型不同，Claude 倾向于：

1. 当风险较高时**承认模糊性**
2. 对低风险任务**做出合理假设**
3. **策略性地提问**，而非过度询问

## "最小足迹"原则

Claude 被设计为偏好可逆操作，在做任何不可逆操作之前请求许可。这在 Agent 场景中尤为重要。

## 实际影响

对于使用 Claude Code 的开发者：

- **明确成功标准** - Claude 会针对你衡量的指标进行优化
- **合理使用 /compact** - 压缩上下文可能会丢失细节
- **利用 CLAUDE.md** - 设置项目级默认值以减少模糊性`,
    translatedSummary: '深度解析 Claude 如何处理模糊指令：承认模糊性、做出合理假设，以及对不可逆操作应用"最小足迹"原则。',
    originalLanguage: 'en',
    coverImage: null,
    publishedAt: daysAgo(10),
    status: 'completed',
    tags: ['Claude', 'AI资讯', '开发教程', '最佳实践'],
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: 'art_mock_005',
    url: 'https://x.com/rowancheung/status/2000005',
    title: 'The State of AI Coding Tools in 2026: Claude Code vs Cursor vs Copilot',
    author: 'Rowan Cheung',
    authorUsername: 'rowancheung',
    content: `# The State of AI Coding Tools in 2026

A comprehensive comparison of the top three AI coding tools.

## Overview

| Tool | Best For | Pricing |
|------|----------|---------|
| Claude Code | Complex refactors, agentic tasks | Usage-based |
| Cursor | IDE integration, autocomplete | $20/month |
| GitHub Copilot | Enterprise, GitHub integration | $10/month |

## Claude Code: Strengths

- **Agentic capabilities**: Can run tests, read files, make commits autonomously
- **Large context window**: Handle entire codebases
- **Skills ecosystem**: Extensible with community skills
- **Terminal-native**: No IDE lock-in

## Cursor: Strengths

- **Seamless IDE experience**: Feels like a natural extension of VS Code
- **Fast autocomplete**: Sub-100ms completions
- **Composer mode**: Multi-file edits in one session

## GitHub Copilot: Strengths

- **Enterprise ready**: SOC 2 compliance, audit logs
- **GitHub integration**: PR summaries, issue resolution
- **Wide IDE support**: Works in any JetBrains IDE

## The Bottom Line

Use **Claude Code** when you need an autonomous agent that can handle complex, multi-step tasks.

Use **Cursor** when you want the smoothest in-editor experience.

Use **Copilot** when you're in an enterprise environment with compliance requirements.

The good news? They're not mutually exclusive. Many top engineers use all three.`,
    summary: '2026 年 AI 编程工具全面对比：Claude Code 擅长复杂 Agent 任务，Cursor 提供最流畅的 IDE 体验，Copilot 适合企业合规场景。',
    translatedContent: `# 2026 年 AI 编程工具现状：Claude Code vs Cursor vs Copilot

对三大顶级 AI 编程工具的全面比较。

## 概览

| 工具 | 最适合 | 定价 |
|------|--------|------|
| Claude Code | 复杂重构、Agent 任务 | 按用量计费 |
| Cursor | IDE 集成、代码补全 | $20/月 |
| GitHub Copilot | 企业、GitHub 集成 | $10/月 |

## Claude Code：优势

- **Agent 能力**：可自主运行测试、读取文件、提交代码
- **大上下文窗口**：处理整个代码库
- **Skills 生态**：可通过社区 skills 扩展
- **终端原生**：不依赖特定 IDE

## 最终建议

当你需要处理复杂多步骤任务时，使用 **Claude Code**。

当你想要最流畅的编辑器内体验时，使用 **Cursor**。

当你在有合规要求的企业环境中，使用 **Copilot**。

好消息是：它们并不互斥，很多顶级工程师同时使用三款工具。`,
    translatedSummary: '2026 年 AI 编程工具全面对比：Claude Code 擅长复杂 Agent 任务，Cursor 提供最流畅 IDE 体验，Copilot 适合企业场景。',
    originalLanguage: 'en',
    coverImage: null,
    publishedAt: daysAgo(14),
    status: 'completed',
    tags: ['Claude Code', 'AI资讯', '热门讨论', '开发者向'],
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14),
  },
  {
    id: 'art_mock_006',
    url: 'https://x.com/Voxyz_ai/status/2000006',
    title: 'Claude Code Hooks 完全指南：自动化你的 AI 开发工作流',
    author: 'Voxyz AI',
    authorUsername: 'Voxyz_ai',
    content: `# Claude Code Hooks 完全指南

Hooks 是 Claude Code 最强大但最少人使用的功能之一。

## 什么是 Hooks？

Hooks 是在特定事件发生时自动执行的 shell 命令。例如：
- 每次 Claude 写文件后，自动运行 lint
- 每次对话开始，自动加载项目上下文
- 每次工具调用，自动记录日志

## 配置方式

在 \`settings.json\` 中配置：

\`\`\`json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint -- --fix"
          }
        ]
      }
    ]
  }
}
\`\`\`

## 实用 Hooks 配方

### 1. 自动格式化
\`\`\`json
{
  "matcher": "Write|Edit",
  "hooks": [{ "type": "command", "command": "prettier --write ." }]
}
\`\`\`

### 2. 自动运行测试
\`\`\`json
{
  "matcher": "Write",
  "hooks": [{ "type": "command", "command": "npm test -- --passWithNoTests" }]
}
\`\`\`

### 3. 安全检查
\`\`\`json
{
  "matcher": "Bash",
  "hooks": [{ "type": "command", "command": "echo 'Running: $CLAUDE_TOOL_INPUT'" }]
}
\`\`\`

## 高级技巧

Hooks 可以通过返回非零退出码来**阻止** Claude 继续操作。这对于实现安全护栏非常有用。

掌握 Hooks，你就掌握了 Claude Code 的"元编程"能力。`,
    summary: 'Claude Code Hooks 完全指南：配置自动 lint、格式化、测试运行，以及用 Hooks 实现安全护栏，解锁 AI 开发的"元编程"能力。',
    translatedContent: null,
    translatedSummary: null,
    originalLanguage: 'zh',
    coverImage: null,
    publishedAt: daysAgo(4),
    status: 'completed',
    tags: ['Claude Code', '开发教程', '自动化', '工作流'],
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
]

for (const article of articles) {
  insert(article)
}

console.log('\n✅ Mock 数据插入完成！')
console.log(`   晨报文章: ${morningNews.length} 篇`)
console.log(`   精选文章: ${articles.length} 篇`)
console.log(`   合计: ${morningNews.length + articles.length} 篇\n`)

db.close()
