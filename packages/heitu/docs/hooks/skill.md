---
group:
  title: 基础使用
  order: -1
title: Claude Code Skill
order: 0
toc: content
---

# Skill: heitu-hooks

HeiTu 提供了 Claude Code Skill，当对话中涉及 hooks 使用时自动加载，为 AI 提供精确的 API 参考。

## 触发条件

提到 `useAsyncFn`、`useWebSocket`、`usePolling`、`useLocalStorage` 等 hooks，或需要异步状态管理、轮询、存储等能力时自动触发。

## Skill 文件位置

```text
packages/heitu/.claude/skills/heitu-hooks/SKILL.md
```

## 覆盖 API

### 异步与请求

| Hook | 说明 |
|------|------|
| `useAsyncFn(fn, deps?, init?)` | 异步函数状态管理，返回 `[{loading, error, value}, callback]` |
| `useCancelAsyncFn(fn, deps)` | 可取消异步请求，`ctx.signal` 传给 fetch |
| `useHtAxios(config)` | Axios 封装，返回 `{get, post, put, del}` |
| `usePolling(fn, options)` | 轮询，支持 `interval`、`retryTimes`、`manual` |

### 状态与存储

| Hook | 说明 |
|------|------|
| `useLocalStorage(key, default?)` | 本地存储，跨 tab 同步 |
| `useSessionStorage(key, init?, raw?)` | 会话存储 |
| `useCookie(name, options?, default?)` | Cookie 读写 |
| `usePrevious(value)` | 获取上一次渲染的值 |
| `createContainer(hook)` | 共享状态容器 `{Provider, useContainer}` |

### DOM 与视口

| Hook | 说明 |
|------|------|
| `useWindowSize()` | 窗口尺寸 `{width, height}` |
| `useElementSize(ref)` | 元素尺寸 |
| `useResizeObserver(ref, cb)` | 尺寸观察 |
| `useInView(options?, once?)` | 视口检测 `[ref, inView]` |
| `useDevicePixelRatio()` | 设备像素比 |

### 功能型

| Hook | 说明 |
|------|------|
| `useCountDown()` | 倒计时 `[seconds, start, stop]` |
| `useWebSocket(url, options)` | WebSocket，自动重连、JSON 模式 |
| `useInfiniteScroll(options)` | 无限滚动 |
| `useImageLoad(config)` | 图片预加载 |
| `useDeepCompareEffect(fn, deps)` | 深比较 Effect |
