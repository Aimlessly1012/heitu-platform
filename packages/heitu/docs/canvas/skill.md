---
group:
  title: 基础使用
  order: -1
title: Claude Code Skill
order: 0
toc: content
---

# Skill: heitu-canvas

HeiTu 提供了 Claude Code Skill，当对话中涉及 Canvas 图形绘制时自动加载，为 AI 提供精确的 API 参考。

## 触发条件

当需要绑定 canvas、绘制图形（Rect/Circle/Text/Line/Custom）、处理拖拽、动画事件时自动触发。

## Skill 文件位置

```text
packages/heitu/.claude/skills/heitu-canvas/SKILL.md
```

## 覆盖内容

### 核心架构

```text
Stage（舞台）
├── Rect / Circle / Text / Line / Custom（图形）
├── Group（分组，可嵌套图形）
└── Animate（动画控制器）
```

### 图形一览

| 图形 | 说明 | 关键属性 |
|------|------|---------|
| `Stage` | 舞台容器 | `buildContentDOM`, `add`, `batchDraw`, `destroy` |
| `Rect` | 矩形 | `x, y, width, height, fillStyle, radius, shadow` |
| `Circle` | 圆/弧/环 | `radius, innerRadius, arc, startAngle, endAngle, border` |
| `Text` | 文本 | `content, fontSize, textAlign, textBaseline` |
| `Line` | 直线/折线/曲线 | `start, end, points, smooth, lineDash` |
| `Custom` | 自定义 Path2D | `path2D, fillStyle` |
| `Group` | 分组 | `add, getChildren, draggable` |

### 事件系统

支持：`click` `dblclick` `mouseenter` `mouseleave` `mousedown` `mousemove` `mouseup` `contextmenu` `wheel`

### 拖拽

`node.draggable = true` 或传入回调函数

### 动画

`Animate` 类：补间动画，支持 `duration`、`easing`、`iterationCount`、`during` 回调

### 编码规范

1. 初始化：`new Stage()` → `buildContentDOM()` → 创建图形 → `add()` → `bindEvent()`
2. 修改属性后需 `stage.batchDraw(stage)` 重绘
3. 用 `index` 控制层级
4. 组件卸载时调用 `stage.destroy()`
