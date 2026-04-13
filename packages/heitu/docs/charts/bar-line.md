---
title: 柱状折线图
order: 4
---

# 柱状折线图 BarLineChart

柱状图 + 折线图混合展示，左 Y 轴对应柱状数据，右 Y 轴对应折线数据。支持多柱多线。

## 基础用法

```tsx
import React from 'react';
import { BarLineChartComponent } from 'heitu/charts';

const data = [
  { month: '1月', sales: 186, rate: 72 },
  { month: '2月', sales: 305, rate: 68 },
  { month: '3月', sales: 237, rate: 75 },
  { month: '4月', sales: 473, rate: 82 },
  { month: '5月', sales: 409, rate: 79 },
  { month: '6月', sales: 540, rate: 88 },
  { month: '7月', sales: 615, rate: 91 },
];

export default () => (
  <BarLineChartComponent
    data={data}
    xField="month"
    yFieldBar="sales"
    yFieldLine="rate"
    yLabelLeft="销售额"
    yLabelRight="转化率"
    point={{ size: 4 }}
    width={650}
    height={380}
    tooltip={{ formatter: (d) => `销售: ¥${d.sales} / 转化率: ${d.rate}%` }}
    legend={{ position: 'top' }}
  />
);
```

## 多柱 + 单线

两组柱子对比，叠加一条趋势折线。

```tsx
import React from 'react';
import { BarLineChartComponent } from 'heitu/charts';

const data = [
  { month: '1月', online: 320, offline: 180, growth: 12 },
  { month: '2月', online: 410, offline: 220, growth: 18 },
  { month: '3月', online: 380, offline: 195, growth: 15 },
  { month: '4月', online: 520, offline: 260, growth: 22 },
  { month: '5月', online: 490, offline: 310, growth: 20 },
  { month: '6月', online: 650, offline: 340, growth: 28 },
];

export default () => (
  <BarLineChartComponent
    data={data}
    xField="month"
    yFieldBar={['online', 'offline']}
    yFieldLine="growth"
    barColor={['#4F46E5', '#8B5CF6']}
    lineColor="#F59E0B"
    yLabelRight="增长率(%)"
    smooth
    point={{ size: 4 }}
    width={650}
    height={380}
    tooltip={{ formatter: (d) => `线上: ${d.online} / 线下: ${d.offline} / 增长: ${d.growth}%` }}
    legend={{ position: 'top' }}
  />
);
```

## 单柱 + 多线

一组柱子搭配多条折线趋势。

```tsx
import React from 'react';
import { BarLineChartComponent } from 'heitu/charts';

const data = [
  { month: '1月', orders: 1200, satisfaction: 82, retention: 68 },
  { month: '2月', orders: 1800, satisfaction: 85, retention: 72 },
  { month: '3月', orders: 1500, satisfaction: 79, retention: 65 },
  { month: '4月', orders: 2200, satisfaction: 88, retention: 76 },
  { month: '5月', orders: 2000, satisfaction: 86, retention: 74 },
  { month: '6月', orders: 2800, satisfaction: 91, retention: 80 },
  { month: '7月', orders: 2500, satisfaction: 89, retention: 78 },
];

export default () => (
  <BarLineChartComponent
    data={data}
    xField="month"
    yFieldBar="orders"
    yFieldLine={['satisfaction', 'retention']}
    barColor="#06B6D4"
    lineColor={['#10B981', '#F43F5E']}
    yLabelLeft="订单量"
    yLabelRight="百分比(%)"
    smooth
    point={{ size: 4 }}
    width={650}
    height={380}
    tooltip={{ formatter: (d) => `订单: ${d.orders} / 满意度: ${d.satisfaction}% / 留存: ${d.retention}%` }}
    legend={{ position: 'top' }}
  />
);
```

## 平滑曲线 + 动画

```tsx
import React from 'react';
import { BarLineChartComponent } from 'heitu/charts';

const data = [
  { quarter: 'Q1', revenue: 4200, growth: 12 },
  { quarter: 'Q2', revenue: 5800, growth: 18 },
  { quarter: 'Q3', revenue: 5100, growth: 15 },
  { quarter: 'Q4', revenue: 7300, growth: 24 },
];

export default () => (
  <BarLineChartComponent
    data={data}
    xField="quarter"
    yFieldBar="revenue"
    yFieldLine="growth"
    yLabelLeft="营收(万)"
    yLabelRight="增长率(%)"
    smooth
    point={{ size: 5 }}
    barColor="#8B5CF6"
    lineColor="#F59E0B"
    radius={[4, 4, 0, 0]}
    width={650}
    height={380}
    animation
    tooltip={{ formatter: (d) => `营收: ¥${d.revenue}万 / 增长: ${d.growth}%` }}
    legend={{ position: 'top' }}
  />
);
```

## API

### IBarLineChartConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | `T[]` | — | 数据源 |
| xField | `string` | — | X 轴字段名 |
| yFieldBar | `string \| string[]` | — | 柱状图字段（左轴），多字段分组显示 |
| yFieldLine | `string \| string[]` | — | 折线图字段（右轴），多字段多条线 |
| barColor | `string \| string[]` | 默认 4 色 | 柱状图颜色 |
| lineColor | `string \| string[]` | 默认 4 色 | 折线图颜色 |
| yLabelLeft | `string` | — | 左轴图例标签 |
| yLabelRight | `string` | — | 右轴图例标签 |
| smooth | `boolean` | `false` | 折线平滑曲线 |
| point | `{ size?: number } \| false` | `{ size: 4 }` | 折线数据点 |
| barWidth | `number` | 自动 | 单根柱子宽度 |
| radius | `[number, number, number, number]` | — | 柱子圆角 |
| animation | `boolean \| { duration?, easing? }` | `false` | 动画配置 |
| tooltip | `{ formatter? } \| false` | `{}` | 提示框 |
| legend | `{ position? } \| false` | `{ position: 'top' }` | 图例（支持切换系列可见性） |
| padding | `[number, number, number, number]` | `[40, 50, 40, 50]` | 内边距 |
| width | `number` | 容器宽度 | 宽度 |
| height | `number` | 300 | 高度 |
| onClickItem | `(item, index) => void` | — | 点击回调 |
