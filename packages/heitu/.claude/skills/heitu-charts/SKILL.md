---
name: heitu-charts
description: 使用 heitu 包的 Charts 图表库编写代码。当需要创建折线图、柱状图、饼图/环形图时触发
allowed-tools: Read Bash Edit Write
---

# Heitu Charts 开发指南

使用 `heitu/charts` 包中的图表组件，支持命令式 API 和 React 组件两种方式。

## 安装与导入

```ts
// 命令式 API
import { LineChart, BarChart, PieChart } from 'heitu/charts'

// React 组件
import { LineChartComponent, BarChartComponent, PieChartComponent } from 'heitu/charts'

// 或从根路径
import { LineChart, BarChart, PieChart } from 'heitu'
```

## 命令式 API

### 折线图

```ts
const chart = new LineChart({
  container: document.getElementById('chart')!,
  width: 600,
  height: 400,
  data: [
    { month: '1月', sales: 120 },
    { month: '2月', sales: 200 },
  ],
  xField: 'month',
  yField: 'sales',
  smooth: true,              // 平滑曲线
  point: { size: 4 },        // 数据点
  animation: true,           // 入场动画
  tooltip: { formatter: (d) => `${d.month}: ${d.sales}` },
  legend: { position: 'top' },
  onClickItem: (item, index) => {},
})

chart.update({ data: newData })  // 更新数据
chart.destroy()                  // 销毁
```

### 柱状图

```ts
const chart = new BarChart({
  container: document.getElementById('chart')!,
  width: 600,
  height: 400,
  data: [
    { category: '食品', value: 320 },
    { category: '服饰', value: 280 },
  ],
  xField: 'category',
  yField: 'value',
  barWidth: 30,              // 柱宽（可选，默认自动计算）
  colorField: 'category',    // 颜色映射字段
  radius: [4, 4, 0, 0],     // 柱子圆角 [左上, 右上, 右下, 左下]
  animation: true,
})
```

### 饼图 / 环形图

```ts
const chart = new PieChart({
  container: document.getElementById('chart')!,
  width: 400,
  height: 400,
  data: [
    { type: '食品', value: 320 },
    { type: '服饰', value: 280 },
  ],
  angleField: 'value',       // 角度映射字段
  colorField: 'type',        // 颜色映射字段
  innerRadius: 0.6,          // 0 = 饼图，>0 = 环形图
  label: { type: 'outer' },  // 'inner' | 'outer' | false
  animation: true,
})
```

## React 组件 API

### 折线图

```tsx
<LineChartComponent
  data={data}
  xField="month"
  yField="sales"
  smooth
  point={{ size: 4 }}
  width={600}
  height={400}
  animation
  tooltip={{ formatter: (d) => `${d.month}: ${d.sales}` }}
  legend={{ position: 'top' }}
  onClickItem={(item, i) => {}}
/>
```

### 柱状图

```tsx
<BarChartComponent
  data={data}
  xField="category"
  yField="value"
  colorField="category"
  width={600}
  height={400}
  animation
/>
```

### 饼图

```tsx
<PieChartComponent
  data={data}
  angleField="value"
  colorField="type"
  innerRadius={0.6}
  width={400}
  height={400}
  label={{ type: 'outer' }}
  animation
/>
```

## 通用配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `container` | `HTMLElement` | — | 命令式必填，React 组件不需要 |
| `width` | `number` | 容器宽度 | 图表宽度 |
| `height` | `number` | 300 | 图表高度 |
| `data` | `T[]` | — | 数据源 |
| `animation` | `boolean \| { duration?, easing? }` | `false` | 动画 |
| `tooltip` | `{ formatter? } \| false` | `{}` | 提示框 |
| `legend` | `{ position? } \| false` | `{ position: 'top' }` | 图例 |
| `colors` | `string[]` | 8 色调色板 | 自定义颜色 |
| `padding` | `[number, number, number, number]` | `[40, 20, 40, 50]` | 内边距 |
| `onClickItem` | `(item, index) => void` | — | 点击数据项回调 |

## 默认调色板

```ts
['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F43F5E', '#64748B']
```

## 缓动函数

支持：`linear`, `cubicIn`, `cubicOut`, `cubicInOut`

默认入场动画使用 `cubicOut`，时长 600ms。

## 编码规范

1. **命令式必须销毁**：组件卸载或不需要时调用 `chart.destroy()`
2. **React 组件自动管理生命周期**：挂载时创建，卸载时销毁，`data` 变化时自动更新
3. **data 变化触发更新**：React 组件只监听 `props.data` 引用变化
4. **tooltip formatter**：接收原始数据项，返回显示字符串
5. **legend 交互**：点击图例项可切换数据系列显隐
6. **innerRadius 范围**：0~1 之间的比例值，0 为饼图，0.6 常用于环形图
