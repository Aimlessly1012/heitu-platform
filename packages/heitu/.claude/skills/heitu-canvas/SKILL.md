---
name: heitu-canvas
description: 使用 heitu 包的 Canvas 2D 引擎编写代码。当需要绑定 canvas、绘制图形、处理拖拽动画事件时触发
allowed-tools: Read Bash Edit Write
---

# Heitu Canvas 开发指南

使用 `heitu/canvas` 包中的 Canvas 2D 引擎绘制图形、处理交互和动画。

## 安装与导入

```ts
import { Stage, Rect, Circle, Text, Line, Custom, Group, Animate } from 'heitu/canvas'
```

## 核心架构

```
Stage（舞台）
├── Rect / Circle / Text / Line / Custom（图形）
├── Group（分组，可嵌套图形）
└── Animate（动画控制器）
```

所有图形继承自 `Node`，支持事件绑定。`Stage` 和 `Group` 继承自 `Container`，支持子节点管理。

## Stage — 舞台

```ts
const stage = new Stage()
stage.buildContentDOM({
  container: document.getElementById('canvas-wrap')!, // 必须
  width: 800,
  height: 600,
  backgroundColor: '#F8FAFC',
})

// 添加图形
stage.add(rect, circle, text)

// 销毁
stage.destroy()
```

**关键方法：**
- `buildContentDOM(config)` — 初始化 canvas DOM
- `add(...children)` — 添加图形到舞台
- `setContainer(width, height, backgroundColor?)` — 调整尺寸
- `batchDraw(stage)` — 重绘所有子节点
- `destroy()` — 销毁并移除事件监听

## Rect — 矩形

```ts
const rect = new Rect({
  x: 50,
  y: 50,
  width: 200,
  height: 100,
  fillStyle: '#4F46E5',
  strokeStyle: '#312E81',
  lineWidth: 2,
  radius: 8,               // 圆角
  shadowColor: 'rgba(0,0,0,0.1)',
  shadowBlur: 10,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  index: 1,                 // 层级，越大越上层
})
```

## Circle — 圆 / 弧 / 环

```ts
// 实心圆
const circle = new Circle({
  x: 100, y: 100,
  radius: 40,
  fillStyle: '#10B981',
})

// 弧形
const arc = new Circle({
  x: 200, y: 200,
  radius: 60,
  arc: true,
  startAngle: 0,
  endAngle: 270,
  strokeStyle: '#F59E0B',
  lineWidth: 3,
  border: 1,              // 0: fill, 1: stroke only, 2: stroke + fill
})

// 环形（甜甜圈）
const ring = new Circle({
  x: 300, y: 200,
  radius: 50,
  innerRadius: 30,
  fillStyle: '#8B5CF6',
})
```

## Text — 文本

```ts
const text = new Text({
  x: 50, y: 20,
  content: 'Hello HeiTu',    // 必填，缺少会报错
  fillStyle: '#1E293B',
  fontSize: 16,
  fontFamily: '微软雅黑',
  textAlign: 'left',          // left | center | right
  textBaseline: 'top',        // top | middle | bottom
})
// 绘制后自动计算 text.width / text.height
```

## Line — 线条

```ts
// 两点连线
const line = new Line({
  start: { x: 0, y: 0 },
  end: { x: 200, y: 100 },
  strokeStyle: '#94A3B8',
  lineWidth: 2,
  lineDash: [5, 3],          // 虚线
  lineCap: 'round',          // butt | round | square
  lineJoin: 'round',         // miter | round | bevel
})

// 多点折线
const polyline = new Line({
  points: [10, 10, 50, 80, 100, 30, 150, 90],
  strokeStyle: '#4F46E5',
  lineWidth: 2,
})

// 平滑曲线
const curve = new Line({
  points: [10, 10, 50, 80, 100, 30, 150, 90],
  smooth: true,               // 贝塞尔平滑
  strokeStyle: '#10B981',
})
```

## Custom — 自定义图形

```ts
// 使用 Path2D 绘制任意形状
const path = new Path2D()
path.moveTo(0, 0)
path.lineTo(50, 100)
path.lineTo(100, 0)
path.closePath()

const custom = new Custom({
  path2D: path,               // 必填，缺少会报错
  x: 100, y: 100,
  fillStyle: '#F43F5E',
  width: 100,
  height: 100,
})
```

## Group — 分组

```ts
const group = new Group({ draggable: true })
group.add(
  new Rect({ x: 0, y: 0, width: 100, height: 50, fillStyle: '#4F46E5' }),
  new Text({ x: 10, y: 15, content: 'Button', fillStyle: '#fff' }),
)
stage.add(group)
// 整组可拖拽、事件冒泡
```

**方法：**
- `add(...children)` — 添加子图形
- `getChildren(filterFn?)` — 获取子节点
- `removeChildren()` — 移除所有子节点
- `sortChildren(sortFn)` — 排序子节点

## 事件系统

所有 Node 实例支持 `on` / `off` 事件绑定：

```ts
rect.on('click', ({ evt, target, currentTarget }) => {
  console.log('clicked!', evt.clientX, evt.clientY)
})

rect.on('mouseenter', (e) => { /* 鼠标进入 */ })
rect.on('mouseleave', (e) => { /* 鼠标离开 */ })
rect.on('contextmenu', (e) => { /* 右键菜单 */ })
rect.on('dblclick', (e) => { /* 双击 */ })
rect.on('wheel', (e) => { /* 滚轮 */ })

// 解绑
rect.off('click')
rect.off('click', specificHandler)
```

**支持事件：** mouseenter, mouseleave, mousedown, mousemove, mouseup, mouseout, mouseover, contextmenu, wheel, click, dblclick

## 拖拽

```ts
// 方式 1：布尔值
const rect = new Rect({ x: 50, y: 50, width: 100, height: 60 })
rect.draggable = true

// 方式 2：回调
rect.draggable = (evt, node) => {
  console.log('dragging', node.x, node.y)
}

// 舞台需要绑定事件才能生效
stage.bindEvent()
```

## Animate — 动画

```ts
const animate = new Animate(
  { x: 0, y: 0 },           // 起始属性
  { x: 200, y: 100 },       // 目标属性
  {
    duration: 1000,           // 毫秒
    delay: 0,
    easing: 'cubicInOut',     // 缓动函数
    iterationCount: 1,        // Infinity 为无限循环
    during: (percent, newState) => {
      // 每帧回调：更新图形属性并重绘
      rect.attr({ x: newState.x, y: newState.y })
      stage.bindAnimate(stage)
    },
    done: () => { console.log('动画完成') },
    aborted: () => { console.log('动画中断') },
  }
)

animate.start()
animate.stop()
```

**缓动函数：** linear, cubicIn, cubicOut, cubicInOut 等

## 完整示例

```ts
import { Stage, Rect, Circle, Text, Line, Animate } from 'heitu/canvas'

// 创建舞台
const stage = new Stage()
stage.buildContentDOM({
  container: document.getElementById('app')!,
  width: 600,
  height: 400,
  backgroundColor: '#F8FAFC',
})

// 绘制图形
const bg = new Rect({ x: 50, y: 50, width: 200, height: 120, fillStyle: '#EEF2FF', radius: 8 })
const title = new Text({ x: 70, y: 70, content: 'HeiTu Canvas', fillStyle: '#4F46E5', fontSize: 18 })
const dot = new Circle({ x: 300, y: 100, radius: 20, fillStyle: '#10B981' })

// 拖拽
dot.draggable = true

// 事件
bg.on('click', () => console.log('bg clicked'))

// 添加到舞台
stage.add(bg, title, dot)

// 启用事件
stage.bindEvent()
```

## 编码规范

1. **初始化顺序**：先 `new Stage()` → `buildContentDOM()` → 创建图形 → `add()` → `bindEvent()`
2. **重绘**：修改图形属性后需调用 `stage.batchDraw(stage)` 手动重绘
3. **path2D 必填**：`Custom` 图形必须传 `path2D`，`Text` 必须传 `content`
4. **层级**：用 `index` 控制绘制顺序，数值越大越上层
5. **销毁**：组件卸载时调用 `stage.destroy()` 避免内存泄漏
6. **React 集成**：在 `useEffect` 中初始化，返回 `stage.destroy` 清理
