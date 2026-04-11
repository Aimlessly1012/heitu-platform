---
title: 折线图
order: 1
---

# 折线图 LineChart

## 基础用法

```tsx
import React from 'react';
import { LineChartComponent } from 'heitu/charts';

const data = [
  { month: '1月', sales: 120 },
  { month: '2月', sales: 200 },
  { month: '3月', sales: 150 },
  { month: '4月', sales: 280 },
  { month: '5月', sales: 220 },
  { month: '6月', sales: 310 },
];

export default () => (
  <LineChartComponent
    data={data}
    xField="month"
    yField="sales"
    width={600}
    height={350}
    tooltip={{ formatter: (d) => `${d.month}: ${d.sales}` }}
    legend={{ position: 'top' }}
  />
);
```

## 平滑曲线

```tsx
import React from 'react';
import { LineChartComponent } from 'heitu/charts';

const data = [
  { month: '1月', sales: 120 },
  { month: '2月', sales: 200 },
  { month: '3月', sales: 150 },
  { month: '4月', sales: 280 },
  { month: '5月', sales: 220 },
  { month: '6月', sales: 310 },
];

export default () => (
  <LineChartComponent
    data={data}
    xField="month"
    yField="sales"
    smooth
    point={{ size: 5 }}
    width={600}
    height={350}
    animation
  />
);
```

## API

### ILineChartConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | `T[]` | — | 数据源 |
| xField | `string` | — | X 轴字段名 |
| yField | `string` | — | Y 轴字段名 |
| smooth | `boolean` | `false` | 平滑曲线 |
| point | `{ size?: number } \| false` | `{ size: 4 }` | 数据点配置 |
| animation | `boolean \| { duration?, easing? }` | `false` | 动画配置 |
| tooltip | `{ formatter? } \| false` | `{}` | 提示框 |
| legend | `{ position? } \| false` | `{ position: 'top' }` | 图例 |
| colors | `string[]` | 默认 8 色 | 调色板 |
| padding | `[number, number, number, number]` | `[40, 20, 40, 50]` | 内边距 |
| width | `number` | 容器宽度 | 宽度 |
| height | `number` | 300 | 高度 |
| onClickItem | `(item, index) => void` | — | 点击回调 |
