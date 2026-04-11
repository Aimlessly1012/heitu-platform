---
nav:
  title: Charts
  order: 4
---

# Charts

基于 heitu/canvas 引擎的轻量图表库，支持命令式 API 和 React 组件两种使用方式。

## 安装

```bash
npm install heitu
```

## 导入

```ts
// 命令式 API
import { LineChart, BarChart, PieChart } from 'heitu/charts'

// React 组件
import { LineChartComponent, BarChartComponent, PieChartComponent } from 'heitu/charts'
```

## 图表类型

- **折线图** - 适用于展示数据趋势变化
- **柱状图** - 适用于分类数据对比
- **饼图/环形图** - 适用于占比分布展示
