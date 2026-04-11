---
title: 柱状图
order: 2
---

# 柱状图 BarChart

## 基础用法

```tsx
import React from 'react';
import { BarChartComponent } from 'heitu/charts';

const data = [
  { category: '食品', value: 320 },
  { category: '服饰', value: 280 },
  { category: '电子', value: 450 },
  { category: '家居', value: 190 },
  { category: '美妆', value: 360 },
];

export default () => (
  <BarChartComponent
    data={data}
    xField="category"
    yField="value"
    width={600}
    height={350}
    tooltip={{ formatter: (d) => `${d.category}: ${d.value}` }}
    animation
  />
);
```

## 颜色映射

```tsx
import React from 'react';
import { BarChartComponent } from 'heitu/charts';

const data = [
  { month: '1月', value: 120, type: 'A' },
  { month: '2月', value: 200, type: 'A' },
  { month: '3月', value: 150, type: 'B' },
  { month: '4月', value: 280, type: 'B' },
  { month: '5月', value: 220, type: 'A' },
  { month: '6月', value: 310, type: 'B' },
];

export default () => (
  <BarChartComponent
    data={data}
    xField="month"
    yField="value"
    colorField="type"
    width={600}
    height={350}
    legend={{ position: 'top' }}
  />
);
```

## API

### IBarChartConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | `T[]` | — | 数据源 |
| xField | `string` | — | X 轴字段名 |
| yField | `string` | — | Y 轴字段名 |
| barWidth | `number` | 自动计算 | 柱宽 |
| colorField | `string` | — | 颜色映射字段 |
| radius | `[number, number, number, number]` | — | 柱子圆角 |
| animation | `boolean \| { duration?, easing? }` | `false` | 动画配置 |
| tooltip | `{ formatter? } \| false` | `{}` | 提示框 |
| legend | `{ position? } \| false` | `{ position: 'top' }` | 图例 |
| colors | `string[]` | 默认 8 色 | 调色板 |
| padding | `[number, number, number, number]` | `[40, 20, 40, 50]` | 内边距 |
| width | `number` | 容器宽度 | 宽度 |
| height | `number` | 300 | 高度 |
| onClickItem | `(item, index) => void` | — | 点击回调 |
