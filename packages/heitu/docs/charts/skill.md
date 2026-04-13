---
title: Claude Code Skill
order: 0
toc: content
---

# Skill: heitu-charts

HeiTu 提供了 Claude Code Skill，当对话中涉及数据可视化图表时自动加载，为 AI 提供精确的 API 参考。

## 触发条件

当提到"图表"、"折线图"、"柱状图"、"饼图"、"环形图"、"柱线混合"、"双Y轴" 或需要可视化数据时自动触发。

## Skill 文件位置

```text
packages/heitu/.claude/skills/heitu-charts/SKILL.md
```

## 覆盖内容

### 4 种图表

| 图表 | 组件 | 核心能力 |
|------|------|---------|
| **折线图** | `LineChartComponent` | 单线、多线对比（`yField` 数组）、平滑曲线 |
| **柱状图** | `BarChartComponent` | 颜色映射、圆角、动画 |
| **饼图/环形图** | `PieChartComponent` | 点击弹出、`innerRadius` 环形 |
| **柱状折线混合** | `BarLineChartComponent` | 双 Y 轴、多柱+多线任意组合 |

### 通用配置

| 属性 | 说明 |
|------|------|
| `data` | 数据源数组 |
| `width / height` | 图表尺寸 |
| `animation` | 入场动画 |
| `tooltip` | 提示框，支持 `formatter` |
| `legend` | 图例，支持切换显示/隐藏 |
| `colors` | 调色板（默认 8 色暗色主题） |
| `onClickItem` | 点击数据项回调 |

### 使用方式

- **React 组件**：`LineChartComponent`、`BarChartComponent` 等，自动管理生命周期
- **命令式 API**：`new LineChart({container, ...})`，支持 `update()` 和 `destroy()`
