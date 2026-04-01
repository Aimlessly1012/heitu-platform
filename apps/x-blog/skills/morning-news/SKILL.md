---
name: morning-news
description: "AI 早报自动生成。每天早上定时触发，通过主动搜索 + 社区监听两条线获取 AI 领域最新动态，AI 聚合评分后生成结构化早报，写入博客并推送。使用方式：直接运行 generate_morning_news.py 或通过 OpenClaw Cron 定时触发。"
---

# Morning News Skill - AI 早报自动生成

## 架构

两条信息线汇入 AI 聚合层：

1. **主动巡逻** — Tavily 搜索当天 AI 热点 + GitHub Trending
2. **社区监听** — X 大V 列表推文 + RSS + HackerNews

## 使用方式

### 手动触发
```bash
python3 skills/morning-news/scripts/generate_morning_news.py
```

### 定时触发（OpenClaw Cron）
每天 08:00 自动执行，配置见 HEARTBEAT.md 或 OpenClaw cron。

## 输出

- 写入博客 `/api/morning-news` API
- 返回结构化 JSON 供 AI 进一步处理（翻译/推送）

## 配置

大V列表从 `src/app/authors/page.tsx` 中的 AUTHORS 数组读取。
也可通过 `/api/recommend-author` API 动态管理。

## 搜索关键词

脚本内置多组搜索关键词，覆盖：
- AI 动态（Claude, GPT, Gemini, 新模型）
- 工具更新（Skills, Plugin, CLI, MCP, SDK）
- AI 就业（AI engineer, 招聘趋势）
- AI 创业（AI startup, 融资, 产品发布）
- 教程实践（Harness Engineering, Agent, Prompt）
