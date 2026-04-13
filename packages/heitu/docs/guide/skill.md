---
group:
  title: 指南
  order: -1
title: Claude Code Skill
order: 1
toc: content
---

# Claude Code Skill

HeiTu 内置了 4 个 Claude Code Skill，安装 `heitu` 后即可自动使用，无需额外配置。

## 什么是 Skill

Skill 是 Claude Code 的能力扩展文件，以 `SKILL.md` 形式存在。当对话中涉及相关场景时，Claude 会自动加载对应的 Skill，获取精确的 API 参考和编码规范，从而生成更准确的代码。

## 自动生效

```bash
# 安装 heitu 后，Skill 自动可用
npm i heitu
# or
yarn add heitu
```

安装后 Skill 位于 `node_modules/heitu/.claude/skills/`，Claude Code 会自动发现并加载，**零配置**。

## 内置 Skill 一览

| Skill | 触发场景 | 覆盖能力 |
|-------|---------|---------|
| **heitu-hooks** | 使用 `useAsyncFn`、`useWebSocket`、`usePolling` 等 | 20+ hooks 完整 API、类型签名、最佳实践 |
| **heitu-canvas** | 绑定 canvas、绘制图形、拖拽、动画 | Stage/Rect/Circle/Text/Line/Group/Animate 全量 API |
| **heitu-charts** | 创建折线图、柱状图、饼图、柱线混合图 | 4 种图表配置、React 组件 + 命令式 API |
| **heitu-formrender** | 创建表单、字段联动、异步数据源 | 19 种控件、Watch 联动、Service 异步、自定义控件 |

## Skill 文件位置

```text
node_modules/heitu/.claude/skills/
├── heitu-hooks/SKILL.md
├── heitu-canvas/SKILL.md
├── heitu-charts/SKILL.md
└── heitu-formrender/SKILL.md
```

## 使用示例

安装 `heitu` 后，在 Claude Code 中直接描述需求即可：

### 示例 1：Hooks

```text
用 heitu 的 usePolling 做一个每 3 秒刷新一次的状态面板
```

Claude 自动加载 `heitu-hooks` Skill，生成使用 `usePolling` 的代码，包含 `interval`、`retryTimes`、`manual` 等参数。

### 示例 2：Canvas

```text
用 heitu canvas 画一个可拖拽的流程图节点
```

Claude 自动加载 `heitu-canvas` Skill，生成 `Stage` + `Group` + `Rect` + `Text` 的组合代码，并正确配置 `draggable` 和事件绑定。

### 示例 3：Charts

```text
用 heitu 做一个双 Y 轴的柱状折线混合图
```

Claude 自动加载 `heitu-charts` Skill，生成 `BarLineChartComponent` 的配置代码，包含 `yFieldBar`、`yFieldLine`、双 Y 轴标签等。

### 示例 4：FormRender

```text
用 heitu FormRender 做一个省市区级联表单
```

Claude 自动加载 `heitu-formrender` Skill，生成带 `watch`、`watchClean`、`service` 异步数据源的级联配置。

## 各模块详细文档

每个模块的文档中都包含对应 Skill 的详细说明：

- [Hooks Skill](/hooks/skill) — 异步请求、状态管理、DOM 操作等 20+ hooks
- [Canvas Skill](/canvas/skill) — Stage 舞台、图形绑定、事件、动画
- [Charts Skill](/charts/skill) — 折线图、柱状图、饼图、柱线混合图
- [FormRender Skill](/components/skill) — JSON 驱动表单、联动、自定义控件
