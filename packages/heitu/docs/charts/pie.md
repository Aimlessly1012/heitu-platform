---
title: 饼图
order: 3
---

# 饼图 PieChart

## 基础饼图

```tsx
import React from 'react';
import { PieChartComponent } from 'heitu/charts';

const data = [
  { type: '食品', value: 320 },
  { type: '服饰', value: 280 },
  { type: '电子', value: 450 },
  { type: '家居', value: 190 },
  { type: '美妆', value: 360 },
];

export default () => (
  <PieChartComponent
    data={data}
    angleField="value"
    colorField="type"
    width={400}
    height={350}
    tooltip={{ formatter: (d) => `${d.type}: ${d.value}` }}
    legend={{ position: 'top' }}
  />
);
```

## 环形图

```tsx
import React from 'react';
import { PieChartComponent } from 'heitu/charts';

const data = [
  { type: '食品', value: 320 },
  { type: '服饰', value: 280 },
  { type: '电子', value: 450 },
  { type: '家居', value: 190 },
  { type: '美妆', value: 360 },
];

export default () => (
  <PieChartComponent
    data={data}
    angleField="value"
    colorField="type"
    innerRadius={0.6}
    width={400}
    height={350}
    label={{ type: 'outer' }}
    animation
  />
);
```

## API

### IPieChartConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | `T[]` | — | 数据源 |
| angleField | `string` | — | 角度映射字段 |
| colorField | `string` | — | 颜色映射字段 |
| innerRadius | `number` | `0` | 内半径比例（0=饼图，>0=环形图） |
| label | `{ type?: 'inner' \| 'outer' } \| false` | `{ type: 'outer' }` | 标签 |
| animation | `boolean \| { duration?, easing? }` | `false` | 动画配置 |
| tooltip | `{ formatter? } \| false` | `{}` | 提示框 |
| legend | `{ position? } \| false` | `{ position: 'top' }` | 图例 |
| colors | `string[]` | 默认 8 色 | 调色板 |
| width | `number` | 容器宽度 | 宽度 |
| height | `number` | 300 | 高度 |
| onClickItem | `(item, index) => void` | — | 点击回调 |
