# Heitu Charts 设计文档

## 概述

基于 heitu/canvas 引擎构建的轻量图表库。MVP 支持折线图、柱状图、饼图/环形图三种图表类型，提供命令式 JS API 和 React 组件两种使用方式。

## 需求总结

- **图表类型（MVP）**：折线图、柱状图、饼图/环形图
- **使用方式**：命令式 API + React 组件封装
- **交互**：hover tooltip、点击回调、动画过渡、图例切换筛选
- **模块位置**：`src/charts/`，导入路径 `heitu/charts`
- **架构方案**：薄包装层，直接组合 canvas 图元

## 目录结构

```
src/charts/
├── core/
│   ├── BaseChart.ts      → 图表基类（Stage 管理、事件代理、update/destroy）
│   ├── Scale.ts          → 数据→像素坐标映射（线性/分类/角度）
│   ├── Axis.ts           → 坐标轴绘制（刻度线、标签、标题）
│   ├── Grid.ts           → 网格线
│   ├── Tooltip.ts        → 悬浮提示框（DOM 覆盖层）
│   ├── Legend.ts         → 图例组件（点击切换数据系列显隐）
│   ├── animate.ts        → 图表入场/更新动画封装
│   └── types.ts          → 公共类型定义
├── line/
│   ├── LineChart.ts      → 命令式折线图类
│   └── index.tsx         → React 组件封装
├── bar/
│   ├── BarChart.ts       → 命令式柱状图类
│   └── index.tsx         → React 组件封装
├── pie/
│   ├── PieChart.ts       → 命令式饼图/环形图类
│   └── index.tsx         → React 组件封装
└── index.ts              → 统一导出
```

## API 设计

### 通用配置接口

```ts
interface IChartConfig<T = Record<string, any>> {
  container: HTMLElement        // 命令式必填
  width?: number
  height?: number
  data: T[]
  animation?: boolean | { duration?: number; easing?: string }
  tooltip?: { formatter?: (item: T) => string } | false
  legend?: { position?: 'top' | 'bottom' | 'left' | 'right' } | false
  colors?: string[]
  padding?: [number, number, number, number]  // 上右下左
  onClickItem?: (item: T, index: number) => void
}
```

### 命令式 API

```ts
import { LineChart, BarChart, PieChart } from 'heitu/charts'

const line = new LineChart({
  container: document.getElementById('chart')!,
  width: 600,
  height: 400,
  data: [
    { month: '1月', sales: 120 },
    { month: '2月', sales: 200 },
  ],
  xField: 'month',
  yField: 'sales',
  smooth: true,
  point: { size: 4 },
  animation: true,
  tooltip: { formatter: (d) => `${d.month}: ${d.sales}` },
  legend: { position: 'top' },
  onClickItem: (item, index) => {},
})

line.update({ data: newData })
line.destroy()
```

### React 组件 API

```tsx
import { LineChart, BarChart, PieChart } from 'heitu/charts'

<LineChart
  data={data}
  xField="month"
  yField="sales"
  smooth
  point={{ size: 4 }}
  animation
  tooltip={{ formatter: (d) => `${d.month}: ${d.sales}` }}
  legend={{ position: 'top' }}
  onClickItem={(item, i) => {}}
  width={600}
  height={400}
/>
```

### 折线图配置（LineChart）

```ts
interface ILineChartConfig<T> extends IChartConfig<T> {
  xField: string
  yField: string
  smooth?: boolean                     // 平滑曲线，默认 false
  point?: { size?: number } | false    // 数据点，默认不显示
}
```

### 柱状图配置（BarChart）

```ts
interface IBarChartConfig<T> extends IChartConfig<T> {
  xField: string
  yField: string
  barWidth?: number                    // 柱宽，默认自动计算
  group?: boolean                      // 分组柱状图（多系列）
  stack?: boolean                      // 堆叠柱状图
  radius?: [number, number, number, number]  // 柱子圆角
  colorField?: string                  // 颜色映射字段
}
```

### 饼图配置（PieChart）

```ts
interface IPieChartConfig<T> extends IChartConfig<T> {
  angleField: string                   // 角度映射字段
  colorField: string                   // 颜色映射字段
  innerRadius?: number                 // 0 = 饼图，>0 = 环形图
  label?: { type?: 'inner' | 'outer' } | false
}
```

## 内部架构

### 渲染流程

```
data + config
    ↓
Scale 计算（数据范围 → 像素坐标）
    ↓
┌─────────────────────────────┐
│  Stage（heitu/canvas）       │
│  ├── Grid（Line 图元）       │
│  ├── Axis（Line + Text）     │
│  ├── DataShapes             │
│  │   ├── 折线：Line + Circle │
│  │   ├── 柱状：Rect          │
│  │   └── 饼图：Circle(arc)   │
│  └── Legend（Rect + Text）   │
├─────────────────────────────┤
│  Tooltip（DOM div 覆盖层）   │
└─────────────────────────────┘
```

### 核心模块职责

**BaseChart（基类）**

所有图表继承，负责：
- 创建 Stage 和 canvas
- 管理 padding/布局区域计算
- 绑定事件代理（hover → tooltip，click → 回调）
- 提供 `update(config)` 方法（diff data → 动画过渡）
- 提供 `destroy()` 清理

**Scale**

```ts
// 线性比例尺（y 轴数值）
linearScale(domain: [number, number], range: [number, number])
// 输入: value → 输出: pixel

// 分类比例尺（x 轴类目）
bandScale(domain: string[], range: [number, number], padding?: number)
// 输入: category → 输出: pixel + bandwidth

// 角度比例尺（饼图）
arcScale(values: number[])
// 输入: values → 输出: [startAngle, endAngle][]
```

**Tooltip**
- 绝对定位 `<div>`，挂在 canvas 容器上
- Stage 的 mousemove 事件触发，碰撞检测找到 hover 图元
- 图元创建时绑定原始数据（存在 shape 的 data 属性上）
- hover 显示，移出隐藏

**Legend**
- canvas 内 Rect + Text 绘制在图表区域外
- 点击图例项 → 过滤数据系列 → 重新计算 Scale → 动画过渡重绘
- 被过滤的系列颜色变灰

### 动画过渡策略

| 图表 | 入场动画 | 数据更新动画 |
|------|---------|------------|
| 折线图 | 从左到右逐渐展开 | 数据点平滑移动到新位置 |
| 柱状图 | 从底部向上生长 | 柱高平滑变化 |
| 饼图 | 角度从 0 展开到目标值 | 各扇区角度平滑过渡 |

使用 heitu/canvas 的 Animate 类，在 `during` 回调中更新图元属性 + `batchDraw`。

### Canvas 引擎需要的改动

1. **Node 基类加 data 字段** — `data?: any`，用于存储图元对应的原始数据，tooltip 和 click 事件需要读取
2. **fillStyle 支持渐变（可选，MVP 不做）** — 类型从 `string` 扩展为 `string | CanvasGradient`

## 调色板

默认 8 色，复用设计系统 token：

```ts
const DEFAULT_COLORS = [
  '#4F46E5',  // Primary (Indigo)
  '#10B981',  // Success (Emerald)
  '#F59E0B',  // Warning (Amber)
  '#EF4444',  // Danger (Red)
  '#8B5CF6',  // Violet
  '#06B6D4',  // Cyan
  '#F43F5E',  // Rose
  '#64748B',  // Slate
]
```

## 文档与导出

### package.json 新增导出

```json
"./charts": {
  "types": "./dist/charts/index.d.ts",
  "import": "./dist/esm/charts/index.js",
  "require": "./dist/charts/index.js"
}
```

### src/index.ts 新增

```ts
export * from './charts'
```

### 文档导航

新增 Charts 菜单栏：

```
docs/charts/
├── index.md         → Charts 导航入口（nav: { title: Charts, order: 4 }）
├── line.md          → 折线图 demo + API 文档
├── bar.md           → 柱状图 demo + API 文档
└── pie.md           → 饼图 demo + API 文档
```

顶部导航顺序：Hooks(1) → Components(2) → Canvas(3) → Charts(4) → Tools(5)
