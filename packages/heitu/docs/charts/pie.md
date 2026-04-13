---
title: 饼图
order: 3
---

# 饼图 PieChart

## 基础饼图

点击任意扇区可弹出高亮，再次点击收回。

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

## 点击弹出交互

点击扇区弹出并高亮，配合 `onClickItem` 回调获取数据。

```tsx
import React, { useState } from 'react';
import { PieChartComponent } from 'heitu/charts';

const data = [
  { channel: '直接访问', visits: 335 },
  { channel: '搜索引擎', visits: 580 },
  { channel: '社交媒体', visits: 484 },
  { channel: '广告投放', visits: 300 },
  { channel: '邮件营销', visits: 230 },
  { channel: '合作推荐', visits: 410 },
];

export default () => {
  const [selected, setSelected] = useState('点击扇区查看详情');

  return (
    <div>
      <div style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8 }}>{selected}</div>
      <PieChartComponent
        data={data}
        angleField="visits"
        colorField="channel"
        width={420}
        height={380}
        tooltip={{ formatter: (d) => `${d.channel}: ${d.visits} 次` }}
        legend={{ position: 'top' }}
        onClickItem={(item) => setSelected(`${item.channel}: ${item.visits} 次访问`)}
        colors={['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']}
      />
    </div>
  );
};
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
| onClickItem | `(item, index) => void` | — | 点击扇区回调 |
