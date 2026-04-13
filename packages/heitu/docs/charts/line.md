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
    point={{ size: 5 }}
    width={600}
    height={350}
    tooltip={{ formatter: (d) => `${d.month}: ¥${d.sales}` }}
    legend={{ position: 'top' }}
  />
);
```

## 平滑曲线

```tsx
import React from 'react';
import { LineChartComponent } from 'heitu/charts';

const data = [
  { week: '第1周', uv: 800 },
  { week: '第2周', uv: 1200 },
  { week: '第3周', uv: 950 },
  { week: '第4周', uv: 1500 },
  { week: '第5周', uv: 1100 },
  { week: '第6周', uv: 1800 },
  { week: '第7周', uv: 1400 },
  { week: '第8周', uv: 2100 },
];

export default () => (
  <LineChartComponent
    data={data}
    xField="week"
    yField="uv"
    smooth
    point={{ size: 4 }}
    width={600}
    height={350}
    tooltip={{ formatter: (d) => `${d.week}: ${d.uv} UV` }}
    colors={['#06B6D4']}
  />
);
```

## 双线对比

```tsx
import React from 'react';
import { LineChartComponent } from 'heitu/charts';

const data = [
  { month: '1月', revenue: 186, cost: 120 },
  { month: '2月', revenue: 305, cost: 198 },
  { month: '3月', revenue: 237, cost: 160 },
  { month: '4月', revenue: 473, cost: 280 },
  { month: '5月', revenue: 409, cost: 310 },
  { month: '6月', revenue: 540, cost: 350 },
  { month: '7月', revenue: 615, cost: 420 },
];

export default () => (
  <LineChartComponent
    data={data}
    xField="month"
    yField={['revenue', 'cost']}
    point={{ size: 4 }}
    width={600}
    height={350}
    tooltip={{ formatter: (d) => `收入: ¥${d.revenue} / 成本: ¥${d.cost}` }}
    legend={{ position: 'top' }}
    colors={['#4F46E5', '#F43F5E']}
  />
);
```

## 双线平滑曲线

```tsx
import React from 'react';
import { LineChartComponent } from 'heitu/charts';

const data = [
  { date: 'Mon', pageView: 1200, uniqueVisitor: 820 },
  { date: 'Tue', pageView: 1800, uniqueVisitor: 1100 },
  { date: 'Wed', pageView: 1400, uniqueVisitor: 960 },
  { date: 'Thu', pageView: 2200, uniqueVisitor: 1450 },
  { date: 'Fri', pageView: 1950, uniqueVisitor: 1300 },
  { date: 'Sat', pageView: 2800, uniqueVisitor: 1900 },
  { date: 'Sun', pageView: 2400, uniqueVisitor: 1650 },
];

export default () => (
  <LineChartComponent
    data={data}
    xField="date"
    yField={['pageView', 'uniqueVisitor']}
    smooth
    point={{ size: 4 }}
    width={600}
    height={350}
    tooltip={{ formatter: (d) => `PV: ${d.pageView} / UV: ${d.uniqueVisitor}` }}
    legend={{ position: 'top' }}
    colors={['#10B981', '#8B5CF6']}
  />
);
```

## API

### ILineChartConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | `T[]` | — | 数据源 |
| xField | `string` | — | X 轴字段名 |
| yField | `string \| string[]` | — | Y 轴字段名，传入数组绘制多条线 |
| smooth | `boolean` | `false` | 平滑曲线 |
| point | `{ size?: number } \| false` | `{ size: 4 }` | 数据点配置 |
| animation | `boolean \| { duration?, easing? }` | `false` | 动画配置 |
| tooltip | `{ formatter? } \| false` | `{}` | 提示框 |
| legend | `{ position? } \| false` | `{ position: 'top' }` | 图例 |
| colors | `string[]` | 默认 8 色 | 调色板，多线时按序分配 |
| padding | `[number, number, number, number]` | `[40, 20, 40, 50]` | 内边距 |
| width | `number` | 容器宽度 | 宽度 |
| height | `number` | 300 | 高度 |
| onClickItem | `(item, index) => void` | — | 点击回调 |
