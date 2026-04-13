# Heitu Charts 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 heitu/canvas 引擎构建折线图、柱状图、饼图三种图表组件，支持命令式 API 和 React 组件两种使用方式。

**Architecture:** 薄包装层架构。core 模块提供 Scale、Axis、Grid、Tooltip、Legend 等通用能力，三种图表类继承 BaseChart 基类，直接组合 canvas 图元（Rect/Circle/Line/Text）渲染。React 组件包裹命令式内核，负责生命周期管理。

**Tech Stack:** TypeScript, heitu/canvas (Stage/Rect/Circle/Line/Text/Animate), React 18+, Dumi 文档

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `src/canvas/core/shapes/node.ts` | **修改**：添加 `data?: any` 字段 |
| `src/charts/core/types.ts` | 公共类型定义（IChartConfig, ILineChartConfig 等） |
| `src/charts/core/Scale.ts` | linearScale / bandScale / arcScale 三种比例尺 |
| `src/charts/core/Axis.ts` | X/Y 坐标轴绘制（刻度线 + 标签） |
| `src/charts/core/Grid.ts` | 网格线绘制 |
| `src/charts/core/Tooltip.ts` | DOM 覆盖层 tooltip |
| `src/charts/core/Legend.ts` | 图例组件（canvas 内绘制，支持点击筛选） |
| `src/charts/core/animate.ts` | 图表动画封装（入场 + 数据更新过渡） |
| `src/charts/core/BaseChart.ts` | 图表基类（Stage 管理、事件代理、update/destroy） |
| `src/charts/line/LineChart.ts` | 折线图命令式类 |
| `src/charts/line/index.tsx` | 折线图 React 组件 |
| `src/charts/bar/BarChart.ts` | 柱状图命令式类 |
| `src/charts/bar/index.tsx` | 柱状图 React 组件 |
| `src/charts/pie/PieChart.ts` | 饼图命令式类 |
| `src/charts/pie/index.tsx` | 饼图 React 组件 |
| `src/charts/index.ts` | 统一导出 |
| `src/index.ts` | **修改**：添加 `export * from './charts'` |
| `package.json` | **修改**：添加 `./charts` 导出路径 |
| `docs/charts/index.md` | Charts 导航入口 |
| `docs/charts/line.md` | 折线图文档 + demo |
| `docs/charts/bar.md` | 柱状图文档 + demo |
| `docs/charts/pie.md` | 饼图文档 + demo |

---

## Task 1: Canvas 引擎改动 — Node 添加 data 字段

**Files:**
- Modify: `src/canvas/core/shapes/node.ts`

- [ ] **Step 1: 在 Node 类添加 data 字段**

在 `src/canvas/core/shapes/node.ts` 的 Node 类中，`eventListeners` 属性下方添加：

```ts
/** 挂载自定义数据（图表中用于存储原始数据项） */
data?: any;
```

- [ ] **Step 2: 验证构建**

```bash
cd /Users/peco/Documents/Peco/MyApp/heitu-platform/packages/heitu && pnpm build
```

预期：构建成功，无类型错误。

- [ ] **Step 3: 提交**

```bash
git add src/canvas/core/shapes/node.ts
git commit -m "feat(canvas): add data field to Node base class for chart bindings"
```

---

## Task 2: 公共类型定义

**Files:**
- Create: `src/charts/core/types.ts`

- [ ] **Step 1: 创建类型文件**

```ts
import type React from 'react';

/** 动画配置 */
export interface IAnimationConfig {
  duration?: number;
  easing?: string;
}

/** 图表通用配置（命令式） */
export interface IChartConfig<T = Record<string, any>> {
  /** 挂载容器（命令式必填） */
  container: HTMLElement;
  width?: number;
  height?: number;
  data: T[];
  animation?: boolean | IAnimationConfig;
  tooltip?: { formatter?: (item: T) => string } | false;
  legend?: { position?: 'top' | 'bottom' | 'left' | 'right' } | false;
  colors?: string[];
  /** 内边距 [上, 右, 下, 左] */
  padding?: [number, number, number, number];
  onClickItem?: (item: T, index: number) => void;
}

/** React 组件 props（container 不需要，由组件内部创建） */
export type IChartProps<T = Record<string, any>> = Omit<IChartConfig<T>, 'container'> & {
  style?: React.CSSProperties;
  className?: string;
};

/** 折线图配置 */
export interface ILineChartConfig<T = Record<string, any>> extends IChartConfig<T> {
  xField: string;
  yField: string;
  /** 平滑曲线 */
  smooth?: boolean;
  /** 数据点，false 不显示 */
  point?: { size?: number } | false;
}

export type ILineChartProps<T = Record<string, any>> = Omit<ILineChartConfig<T>, 'container'> & {
  style?: React.CSSProperties;
  className?: string;
};

/** 柱状图配置 */
export interface IBarChartConfig<T = Record<string, any>> extends IChartConfig<T> {
  xField: string;
  yField: string;
  barWidth?: number;
  /** 分组柱状图 */
  group?: boolean;
  /** 堆叠柱状图 */
  stack?: boolean;
  /** 柱子圆角 [左上, 右上, 右下, 左下] */
  radius?: [number, number, number, number];
  /** 颜色映射字段 */
  colorField?: string;
}

export type IBarChartProps<T = Record<string, any>> = Omit<IBarChartConfig<T>, 'container'> & {
  style?: React.CSSProperties;
  className?: string;
};

/** 饼图配置 */
export interface IPieChartConfig<T = Record<string, any>> extends IChartConfig<T> {
  /** 角度映射字段 */
  angleField: string;
  /** 颜色映射字段 */
  colorField: string;
  /** 内半径比例，0 = 饼图，>0 = 环形图 */
  innerRadius?: number;
  /** 标签 */
  label?: { type?: 'inner' | 'outer' } | false;
}

export type IPieChartProps<T = Record<string, any>> = Omit<IPieChartConfig<T>, 'container'> & {
  style?: React.CSSProperties;
  className?: string;
};

/** 比例尺返回值 */
export interface IBandScaleResult {
  (value: string): number;
  bandwidth: () => number;
}

/** 弧度比例尺返回值 */
export interface IArcItem {
  startAngle: number;
  endAngle: number;
  value: number;
  index: number;
}

/** 布局区域 */
export interface IPlotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 默认调色板 */
export const DEFAULT_COLORS = [
  '#4F46E5',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#F43F5E',
  '#64748B',
];

/** 默认内边距 */
export const DEFAULT_PADDING: [number, number, number, number] = [40, 20, 40, 50];
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
cd /Users/peco/Documents/Peco/MyApp/heitu-platform/packages/heitu && npx tsc --noEmit src/charts/core/types.ts
```

预期：无类型错误。

- [ ] **Step 3: 提交**

```bash
git add src/charts/core/types.ts
git commit -m "feat(charts): add shared type definitions and constants"
```

---

## Task 3: Scale 比例尺

**Files:**
- Create: `src/charts/core/Scale.ts`

- [ ] **Step 1: 实现三种比例尺**

```ts
import type { IArcItem, IBandScaleResult } from './types';

/**
 * 线性比例尺：数值 → 像素
 * domain: [min, max] 数据范围
 * range: [startPx, endPx] 像素范围
 */
export function linearScale(
  domain: [number, number],
  range: [number, number],
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const ratio = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (value: number) => r0 + (value - d0) * ratio;
}

/**
 * 计算线性比例尺 nice 刻度值
 * 返回均匀分布的刻度数组，边界值取整
 */
export function linearTicks(
  domain: [number, number],
  tickCount: number = 5,
): number[] {
  const [min, max] = domain;
  const span = max - min || 1;
  const step = niceNum(span / (tickCount - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step) {
    ticks.push(parseFloat(v.toFixed(10)));
  }
  return ticks;
}

/** 取"好看"的整数步长 */
function niceNum(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(range));
  const frac = range / Math.pow(10, exp);
  let nice: number;
  if (round) {
    if (frac < 1.5) nice = 1;
    else if (frac < 3) nice = 2;
    else if (frac < 7) nice = 5;
    else nice = 10;
  } else {
    if (frac <= 1) nice = 1;
    else if (frac <= 2) nice = 2;
    else if (frac <= 5) nice = 5;
    else nice = 10;
  }
  return nice * Math.pow(10, exp);
}

/**
 * 分类比例尺：类目名称 → 像素（条带中心点）
 * domain: 类目名称数组
 * range: [startPx, endPx]
 * padding: 条带间距比例 0~1
 */
export function bandScale(
  domain: string[],
  range: [number, number],
  padding: number = 0.1,
): IBandScaleResult {
  const [r0, r1] = range;
  const n = domain.length || 1;
  const totalWidth = r1 - r0;
  const step = totalWidth / (n + padding * 2);
  const bw = step * (1 - padding);
  const offset = step * padding;

  const fn = ((value: string) => {
    const idx = domain.indexOf(value);
    if (idx === -1) return r0;
    return r0 + offset + idx * step + bw / 2;
  }) as IBandScaleResult;

  fn.bandwidth = () => bw;
  return fn;
}

/**
 * 角度比例尺：数值数组 → 起止角度
 */
export function arcScale(values: number[]): IArcItem[] {
  const total = values.reduce((s, v) => s + v, 0) || 1;
  let currentAngle = -90; // 从顶部开始
  return values.map((value, index) => {
    const angle = (value / total) * 360;
    const item: IArcItem = {
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      value,
      index,
    };
    currentAngle += angle;
    return item;
  });
}
```

- [ ] **Step 2: 提交**

```bash
git add src/charts/core/Scale.ts
git commit -m "feat(charts): add linear, band, and arc scale functions"
```

---

## Task 4: Axis 坐标轴

**Files:**
- Create: `src/charts/core/Axis.ts`

- [ ] **Step 1: 实现坐标轴绘制**

```ts
import { Line, Text } from '../../canvas';
import type { Stage } from '../../canvas';
import type { IPlotArea } from './types';

interface IAxisConfig {
  stage: Stage;
  plotArea: IPlotArea;
}

/** 绘制 X 轴（底部） */
export function drawXAxis(
  config: IAxisConfig,
  labels: string[],
  positions: number[],
): void {
  const { stage, plotArea } = config;
  const y = plotArea.y + plotArea.height;

  // 轴线
  const axisLine = new Line({
    start: { x: plotArea.x, y },
    end: { x: plotArea.x + plotArea.width, y },
    strokeStyle: '#E2E8F0',
    lineWidth: 1,
  });
  axisLine.name = 'xAxisLine';
  stage.add(axisLine);

  // 刻度标签
  labels.forEach((label, i) => {
    const text = new Text({
      x: positions[i],
      y: y + 8,
      content: label,
      fillStyle: '#64748B',
      fontSize: 11,
      textAlign: 'center',
      textBaseline: 'top',
    });
    text.name = 'xAxisLabel';
    stage.add(text);
  });
}

/** 绘制 Y 轴（左侧） */
export function drawYAxis(
  config: IAxisConfig,
  ticks: number[],
  scale: (v: number) => number,
): void {
  const { stage, plotArea } = config;

  ticks.forEach((tick) => {
    const y = scale(tick);
    // 刻度标签
    const text = new Text({
      x: plotArea.x - 8,
      y,
      content: String(tick),
      fillStyle: '#64748B',
      fontSize: 11,
      textAlign: 'right',
      textBaseline: 'middle',
    });
    text.name = 'yAxisLabel';
    stage.add(text);
  });
}
```

- [ ] **Step 2: 提交**

```bash
git add src/charts/core/Axis.ts
git commit -m "feat(charts): add X/Y axis drawing functions"
```

---

## Task 5: Grid 网格线

**Files:**
- Create: `src/charts/core/Grid.ts`

- [ ] **Step 1: 实现网格线绘制**

```ts
import { Line } from '../../canvas';
import type { Stage } from '../../canvas';
import type { IPlotArea } from './types';

/** 绘制水平网格线（与 Y 轴刻度对齐） */
export function drawGrid(
  stage: Stage,
  plotArea: IPlotArea,
  yTicks: number[],
  yScale: (v: number) => number,
): void {
  yTicks.forEach((tick) => {
    const y = yScale(tick);
    const line = new Line({
      start: { x: plotArea.x, y },
      end: { x: plotArea.x + plotArea.width, y },
      strokeStyle: '#F1F5F9',
      lineWidth: 1,
      lineDash: [4, 4],
    });
    line.name = 'gridLine';
    stage.add(line);
  });
}
```

- [ ] **Step 2: 提交**

```bash
git add src/charts/core/Grid.ts
git commit -m "feat(charts): add grid line drawing"
```

---

## Task 6: Tooltip

**Files:**
- Create: `src/charts/core/Tooltip.ts`

- [ ] **Step 1: 实现 DOM Tooltip**

```ts
export class Tooltip {
  private el: HTMLDivElement;
  private formatter?: (item: any) => string;

  constructor(
    container: HTMLElement,
    formatter?: (item: any) => string,
  ) {
    this.formatter = formatter;
    this.el = document.createElement('div');
    Object.assign(this.el.style, {
      position: 'absolute',
      pointerEvents: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      color: '#fff',
      padding: '6px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      lineHeight: '1.5',
      whiteSpace: 'nowrap',
      opacity: '0',
      transition: 'opacity 0.15s',
      zIndex: '10',
    });
    // 容器需要 relative 定位
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    container.appendChild(this.el);
  }

  show(x: number, y: number, data: any): void {
    const text = this.formatter ? this.formatter(data) : String(data);
    this.el.textContent = text;
    this.el.style.opacity = '1';

    // 根据位置调整方向，避免溢出
    const parent = this.el.parentElement!;
    const maxX = parent.clientWidth;
    const elWidth = this.el.offsetWidth;
    const left = x + elWidth + 10 > maxX ? x - elWidth - 10 : x + 10;
    const top = Math.max(0, y - 30);

    this.el.style.left = `${left}px`;
    this.el.style.top = `${top}px`;
  }

  hide(): void {
    this.el.style.opacity = '0';
  }

  destroy(): void {
    this.el.remove();
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/charts/core/Tooltip.ts
git commit -m "feat(charts): add DOM-based tooltip component"
```

---

## Task 7: Legend 图例

**Files:**
- Create: `src/charts/core/Legend.ts`

- [ ] **Step 1: 实现图例组件**

```ts
import { Rect, Text } from '../../canvas';
import type { Stage } from '../../canvas';

export interface ILegendItem {
  label: string;
  color: string;
  active: boolean;
}

export interface ILegendConfig {
  stage: Stage;
  items: ILegendItem[];
  position: 'top' | 'bottom' | 'left' | 'right';
  chartWidth: number;
  chartHeight: number;
  onToggle: (index: number) => void;
}

/** 绘制图例并绑定点击事件 */
export function drawLegend(config: ILegendConfig): void {
  const { stage, items, position, chartWidth, onToggle } = config;
  const isHorizontal = position === 'top' || position === 'bottom';
  const itemWidth = 70;
  const itemHeight = 20;
  const dotSize = 10;
  const gap = 8;

  // 计算起始位置（水平居中）
  const totalWidth = items.length * itemWidth;
  let startX = isHorizontal ? (chartWidth - totalWidth) / 2 : 10;
  let startY = position === 'top' ? 10 : position === 'bottom' ? config.chartHeight - 25 : 50;

  items.forEach((item, i) => {
    const x = isHorizontal ? startX + i * itemWidth : startX;
    const y = isHorizontal ? startY : startY + i * (itemHeight + gap);

    // 色块
    const dot = new Rect({
      x,
      y,
      width: dotSize,
      height: dotSize,
      fillStyle: item.active ? item.color : '#CBD5E1',
      radius: 2,
    });
    dot.name = 'legendDot';
    dot.data = { legendIndex: i };

    // 标签文字
    const label = new Text({
      x: x + dotSize + 4,
      y: y - 1,
      content: item.label,
      fillStyle: item.active ? '#334155' : '#94A3B8',
      fontSize: 11,
    });
    label.name = 'legendLabel';
    label.data = { legendIndex: i };

    // 点击切换
    dot.on('click', () => onToggle(i));
    label.on('click', () => onToggle(i));

    stage.add(dot, label);
  });
}
```

- [ ] **Step 2: 提交**

```bash
git add src/charts/core/Legend.ts
git commit -m "feat(charts): add legend component with toggle support"
```

---

## Task 8: 动画封装

**Files:**
- Create: `src/charts/core/animate.ts`

- [ ] **Step 1: 实现图表动画工具**

```ts
import { Animate } from '../../canvas';
import type { Stage } from '../../canvas';
import type { IAnimationConfig } from './types';

const DEFAULT_DURATION = 600;
const DEFAULT_EASING = 'cubicOut';

/**
 * 属性过渡动画
 * 从 startProps 平滑过渡到 targetProps，每帧调用 onFrame 更新图元
 */
export function animateProps(
  startProps: Record<string, number>,
  targetProps: Record<string, number>,
  onFrame: (currentProps: Record<string, number>) => void,
  stage: Stage,
  config?: boolean | IAnimationConfig,
  onDone?: () => void,
): Animate | null {
  if (config === false) {
    // 无动画，直接设置最终值
    onFrame(targetProps);
    stage.batchDraw(stage);
    onDone?.();
    return null;
  }

  const duration = typeof config === 'object' ? (config.duration ?? DEFAULT_DURATION) : DEFAULT_DURATION;
  const easing = typeof config === 'object' ? (config.easing ?? DEFAULT_EASING) : DEFAULT_EASING;

  const anim = new Animate(startProps, targetProps, {
    duration,
    easing,
    during: (_percent, newState) => {
      const current: Record<string, number> = {};
      for (const key of Object.keys(targetProps)) {
        current[key] = Number(newState[key]) || 0;
      }
      onFrame(current);
      stage.batchDraw(stage);
    },
    done: () => {
      onFrame(targetProps);
      stage.batchDraw(stage);
      onDone?.();
    },
  });

  anim.start();
  return anim;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/charts/core/animate.ts
git commit -m "feat(charts): add chart animation utility"
```

---

## Task 9: BaseChart 基类

**Files:**
- Create: `src/charts/core/BaseChart.ts`

- [ ] **Step 1: 实现基类**

```ts
import { Stage } from '../../canvas';
import { Tooltip } from './Tooltip';
import type { IChartConfig, IPlotArea } from './types';
import { DEFAULT_COLORS, DEFAULT_PADDING } from './types';

export abstract class BaseChart<T = Record<string, any>> {
  protected stage: Stage;
  protected config: IChartConfig<T>;
  protected plotArea!: IPlotArea;
  protected tooltip: Tooltip | null = null;
  protected colors: string[];
  /** 当前被图例过滤掉的数据索引集合 */
  protected filteredIndices: Set<number> = new Set();

  constructor(config: IChartConfig<T>) {
    this.config = config;
    this.colors = config.colors ?? DEFAULT_COLORS;

    // 创建 Stage
    this.stage = new Stage();
    const container = config.container;
    const width = config.width ?? container.clientWidth ?? 400;
    const height = config.height ?? container.clientHeight ?? 300;

    this.stage.buildContentDOM({
      container,
      width,
      height,
      backgroundColor: '#fff',
    });

    // 计算绘图区域
    this.calcPlotArea();

    // 创建 Tooltip
    if (config.tooltip !== false) {
      const formatter = typeof config.tooltip === 'object' ? config.tooltip.formatter : undefined;
      this.tooltip = new Tooltip(container, formatter);
    }

    // 绑定事件
    this.bindEvents();

    // 首次渲染
    this.render();
  }

  /** 计算绘图区域（去掉 padding 和 legend 空间） */
  protected calcPlotArea(): void {
    const [pt, pr, pb, pl] = this.config.padding ?? DEFAULT_PADDING;
    const width = this.config.width ?? this.config.container.clientWidth ?? 400;
    const height = this.config.height ?? this.config.container.clientHeight ?? 300;

    // legend 占用空间
    const legendSpace = this.config.legend !== false ? 30 : 0;
    const legendPos = typeof this.config.legend === 'object' ? this.config.legend.position : 'top';

    this.plotArea = {
      x: pl,
      y: pt + (legendPos === 'top' ? legendSpace : 0),
      width: width - pl - pr,
      height: height - pt - pb - legendSpace,
    };
  }

  /** 绑定 Stage 事件 */
  private bindEvents(): void {
    this.stage.on('mousemove', ({ evt }) => {
      const pos = this.stage.setPointersPositions(evt);
      const canvas = this.stage.canvas!;
      const ctx = canvas.getContext();
      const x = (evt.clientX - pos.left) * pos.scaleX;
      const y = (evt.clientY - pos.top) * pos.scaleY;

      // 碰撞检测：找到当前 hover 的数据图元
      let found = false;
      const children = this.stage.getChildren();
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child.data?.chartData && child.inScope?.(evt, ctx)) {
          this.tooltip?.show(x, y, child.data.chartData);
          found = true;
          break;
        }
      }
      if (!found) {
        this.tooltip?.hide();
      }
    });

    this.stage.on('mouseleave', () => {
      this.tooltip?.hide();
    });

    // 点击事件
    if (this.config.onClickItem) {
      this.stage.on('click', ({ evt }) => {
        const canvas = this.stage.canvas!;
        const ctx = canvas.getContext();
        const children = this.stage.getChildren();
        for (let i = children.length - 1; i >= 0; i--) {
          const child = children[i];
          if (child.data?.chartData && child.inScope?.(evt, ctx)) {
            this.config.onClickItem?.(child.data.chartData, child.data.chartIndex);
            break;
          }
        }
      });
    }

    this.stage.bindEvent();
  }

  /** 清除所有图元，准备重绘 */
  protected clear(): void {
    this.stage.removeChildren();
  }

  /** 获取过滤后的数据 */
  protected getFilteredData(): T[] {
    return this.config.data.filter((_, i) => !this.filteredIndices.has(i));
  }

  /** 图例切换回调 */
  protected handleLegendToggle(index: number): void {
    if (this.filteredIndices.has(index)) {
      this.filteredIndices.delete(index);
    } else {
      this.filteredIndices.add(index);
    }
    this.clear();
    this.render();
    this.stage.batchDraw(this.stage);
  }

  /** 更新配置并重绘 */
  update(newConfig: Partial<IChartConfig<T>>): void {
    Object.assign(this.config, newConfig);
    if (newConfig.padding) this.calcPlotArea();
    this.clear();
    this.render();
    this.stage.batchDraw(this.stage);
  }

  /** 销毁图表 */
  destroy(): void {
    this.tooltip?.destroy();
    this.stage.destroy();
  }

  /** 子类实现：渲染图表内容 */
  protected abstract render(): void;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/charts/core/BaseChart.ts
git commit -m "feat(charts): add BaseChart abstract class"
```

---

## Task 10: 折线图 — LineChart

**Files:**
- Create: `src/charts/line/LineChart.ts`
- Create: `src/charts/line/index.tsx`

- [ ] **Step 1: 实现命令式 LineChart**

```ts
import { Circle, Line, Rect } from '../../canvas';
import { drawXAxis, drawYAxis } from '../core/Axis';
import { BaseChart } from '../core/BaseChart';
import { drawGrid } from '../core/Grid';
import { drawLegend } from '../core/Legend';
import { bandScale, linearScale, linearTicks } from '../core/Scale';
import { animateProps } from '../core/animate';
import type { ILineChartConfig } from '../core/types';

export class LineChart<T = Record<string, any>> extends BaseChart<T> {
  protected declare config: ILineChartConfig<T>;

  constructor(config: ILineChartConfig<T>) {
    super(config);
  }

  protected render(): void {
    const { config, plotArea, stage, colors } = this;
    const data = this.getFilteredData();
    if (!data.length) return;

    // 提取数据
    const categories = data.map((d) => String((d as any)[config.xField]));
    const values = data.map((d) => Number((d as any)[config.yField]) || 0);
    const minVal = 0;
    const maxVal = Math.max(...values, 1);

    // 比例尺
    const xScale = bandScale(categories, [plotArea.x, plotArea.x + plotArea.width]);
    const yTicks = linearTicks([minVal, maxVal]);
    const yDomain: [number, number] = [yTicks[0], yTicks[yTicks.length - 1]];
    const yScale = linearScale(yDomain, [plotArea.y + plotArea.height, plotArea.y]);

    // 网格 + 坐标轴
    drawGrid(stage, plotArea, yTicks, yScale);
    const xPositions = categories.map((c) => xScale(c));
    drawXAxis({ stage, plotArea }, categories, xPositions);
    drawYAxis({ stage, plotArea }, yTicks, yScale);

    // 折线
    const points: number[] = [];
    data.forEach((d, i) => {
      const x = xScale(categories[i]);
      const y = yScale(values[i]);
      points.push(x, y);
    });

    const line = new Line({
      points,
      smooth: config.smooth ?? false,
      strokeStyle: colors[0],
      lineWidth: 2,
    });
    line.name = 'dataLine';
    stage.add(line);

    // 数据点
    if (config.point !== false) {
      const pointSize = typeof config.point === 'object' ? (config.point.size ?? 4) : 4;
      data.forEach((d, i) => {
        const x = xScale(categories[i]);
        const y = yScale(values[i]);
        const circle = new Circle({
          x,
          y,
          radius: pointSize,
          fillStyle: '#fff',
          strokeStyle: colors[0],
          lineWidth: 2,
          border: 2,
        });
        circle.name = 'dataPoint';
        circle.data = { chartData: d, chartIndex: i };
        stage.add(circle);
      });
    }

    // 图例
    if (config.legend !== false) {
      const legendPos = typeof config.legend === 'object' ? config.legend.position : 'top';
      drawLegend({
        stage,
        items: [{ label: String(config.yField), color: colors[0], active: true }],
        position: legendPos ?? 'top',
        chartWidth: config.width ?? 400,
        chartHeight: config.height ?? 300,
        onToggle: (idx) => this.handleLegendToggle(idx),
      });
    }

    // 入场动画（可选）
    if (config.animation) {
      // 用一个遮罩 Rect 从右往左收缩来实现展开效果
      const mask = new Rect({
        x: plotArea.x,
        y: plotArea.y - 5,
        width: plotArea.width,
        height: plotArea.height + 10,
        fillStyle: '#fff',
        index: 999,
      });
      mask.name = 'animMask';
      stage.add(mask);
      stage.batchDraw(stage);

      animateProps(
        { maskX: plotArea.x },
        { maskX: plotArea.x + plotArea.width },
        ({ maskX }) => {
          mask.attr({ x: maskX, width: plotArea.x + plotArea.width - maskX });
        },
        stage,
        config.animation,
        () => {
          // 动画结束后移除遮罩
          mask.attr({ width: 0, height: 0 });
          stage.batchDraw(stage);
        },
      );
    } else {
      stage.batchDraw(stage);
    }
  }
}
```

- [ ] **Step 2: 实现 React 组件**

```tsx
import React, { useEffect, useRef } from 'react';
import type { ILineChartProps } from '../core/types';
import { LineChart as LineChartCore } from './LineChart';

const LineChartComponent = <T extends Record<string, any>>(
  props: ILineChartProps<T>,
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<LineChartCore<T> | null>(null);
  const { style, className, ...chartConfig } = props;

  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = new LineChartCore<T>({
      ...chartConfig,
      container: containerRef.current,
      width: props.width ?? containerRef.current.clientWidth,
      height: props.height ?? containerRef.current.clientHeight,
    } as any);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  // data 变化时更新
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update({ data: props.data });
    }
  }, [props.data]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: props.width ?? '100%', height: props.height ?? 300, ...style }}
    />
  );
};

export default LineChartComponent;
```

- [ ] **Step 3: 提交**

```bash
git add src/charts/line/
git commit -m "feat(charts): add LineChart with imperative API and React component"
```

---

## Task 11: 柱状图 — BarChart

**Files:**
- Create: `src/charts/bar/BarChart.ts`
- Create: `src/charts/bar/index.tsx`

- [ ] **Step 1: 实现命令式 BarChart**

```ts
import { Rect } from '../../canvas';
import { drawXAxis, drawYAxis } from '../core/Axis';
import { BaseChart } from '../core/BaseChart';
import { drawGrid } from '../core/Grid';
import { drawLegend } from '../core/Legend';
import { bandScale, linearScale, linearTicks } from '../core/Scale';
import { animateProps } from '../core/animate';
import type { IBarChartConfig } from '../core/types';

export class BarChart<T = Record<string, any>> extends BaseChart<T> {
  protected declare config: IBarChartConfig<T>;

  constructor(config: IBarChartConfig<T>) {
    super(config);
  }

  protected render(): void {
    const { config, plotArea, stage, colors } = this;
    const data = this.getFilteredData();
    if (!data.length) return;

    const categories = data.map((d) => String((d as any)[config.xField]));
    const values = data.map((d) => Number((d as any)[config.yField]) || 0);
    const maxVal = Math.max(...values, 1);

    // 比例尺
    const xScale = bandScale(categories, [plotArea.x, plotArea.x + plotArea.width]);
    const yTicks = linearTicks([0, maxVal]);
    const yDomain: [number, number] = [yTicks[0], yTicks[yTicks.length - 1]];
    const yScale = linearScale(yDomain, [plotArea.y + plotArea.height, plotArea.y]);
    const barWidth = config.barWidth ?? Math.min(xScale.bandwidth() * 0.6, 40);
    const baseY = plotArea.y + plotArea.height;

    // 网格 + 坐标轴
    drawGrid(stage, plotArea, yTicks, yScale);
    const xPositions = categories.map((c) => xScale(c));
    drawXAxis({ stage, plotArea }, categories, xPositions);
    drawYAxis({ stage, plotArea }, yTicks, yScale);

    // 柱子
    const colorField = config.colorField;
    data.forEach((d, i) => {
      const cx = xScale(categories[i]);
      const targetY = yScale(values[i]);
      const targetH = baseY - targetY;
      const color = colorField
        ? colors[(config.data.map((dd) => String((dd as any)[colorField])).indexOf(String((d as any)[colorField]))) % colors.length]
        : colors[i % colors.length];

      const rect = new Rect({
        x: cx - barWidth / 2,
        y: config.animation ? baseY : targetY,
        width: barWidth,
        height: config.animation ? 0 : targetH,
        fillStyle: color,
        radius: config.radius ? config.radius[0] : 0,
      });
      rect.name = 'dataBar';
      rect.data = { chartData: d, chartIndex: i };
      stage.add(rect);

      // 入场动画：从底部生长
      if (config.animation) {
        animateProps(
          { h: 0 },
          { h: targetH },
          ({ h }) => {
            rect.attr({ y: baseY - h, height: h });
          },
          stage,
          config.animation,
        );
      }
    });

    // 图例
    if (config.legend !== false && colorField) {
      const uniqueLabels = [...new Set(config.data.map((d) => String((d as any)[colorField])))];
      const legendItems = uniqueLabels.map((label, i) => ({
        label,
        color: colors[i % colors.length],
        active: !this.filteredIndices.has(i),
      }));
      drawLegend({
        stage,
        items: legendItems,
        position: typeof config.legend === 'object' ? config.legend.position ?? 'top' : 'top',
        chartWidth: config.width ?? 400,
        chartHeight: config.height ?? 300,
        onToggle: (idx) => this.handleLegendToggle(idx),
      });
    }

    if (!config.animation) {
      stage.batchDraw(stage);
    }
  }
}
```

- [ ] **Step 2: 实现 React 组件**

```tsx
import React, { useEffect, useRef } from 'react';
import type { IBarChartProps } from '../core/types';
import { BarChart as BarChartCore } from './BarChart';

const BarChartComponent = <T extends Record<string, any>>(
  props: IBarChartProps<T>,
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<BarChartCore<T> | null>(null);
  const { style, className, ...chartConfig } = props;

  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = new BarChartCore<T>({
      ...chartConfig,
      container: containerRef.current,
      width: props.width ?? containerRef.current.clientWidth,
      height: props.height ?? containerRef.current.clientHeight,
    } as any);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update({ data: props.data });
    }
  }, [props.data]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: props.width ?? '100%', height: props.height ?? 300, ...style }}
    />
  );
};

export default BarChartComponent;
```

- [ ] **Step 3: 提交**

```bash
git add src/charts/bar/
git commit -m "feat(charts): add BarChart with imperative API and React component"
```

---

## Task 12: 饼图 — PieChart

**Files:**
- Create: `src/charts/pie/PieChart.ts`
- Create: `src/charts/pie/index.tsx`

- [ ] **Step 1: 实现命令式 PieChart**

```ts
import { Circle, Text } from '../../canvas';
import { BaseChart } from '../core/BaseChart';
import { drawLegend } from '../core/Legend';
import { arcScale } from '../core/Scale';
import { animateProps } from '../core/animate';
import type { IPieChartConfig } from '../core/types';

export class PieChart<T = Record<string, any>> extends BaseChart<T> {
  protected declare config: IPieChartConfig<T>;

  constructor(config: IPieChartConfig<T>) {
    super(config);
  }

  /** 饼图不需要坐标轴的 plotArea，重新计算 */
  protected calcPlotArea(): void {
    const width = this.config.width ?? this.config.container.clientWidth ?? 400;
    const height = this.config.height ?? this.config.container.clientHeight ?? 300;
    const legendSpace = this.config.legend !== false ? 30 : 0;
    this.plotArea = {
      x: 0,
      y: legendSpace,
      width,
      height: height - legendSpace,
    };
  }

  protected render(): void {
    const { config, plotArea, stage, colors } = this;
    const data = this.getFilteredData();
    if (!data.length) return;

    const values = data.map((d) => Number((d as any)[config.angleField]) || 0);
    const labels = data.map((d) => String((d as any)[config.colorField]));
    const arcs = arcScale(values);

    // 圆心和半径
    const cx = plotArea.x + plotArea.width / 2;
    const cy = plotArea.y + plotArea.height / 2;
    const outerRadius = Math.min(plotArea.width, plotArea.height) / 2 - 20;
    const innerRadius = (config.innerRadius ?? 0) * outerRadius;

    // 绘制扇区
    arcs.forEach((arc, i) => {
      const targetStart = arc.startAngle;
      const targetEnd = arc.endAngle;

      const circle = new Circle({
        x: cx,
        y: cy,
        radius: outerRadius,
        innerRadius,
        arc: true,
        startAngle: config.animation ? -90 : targetStart,
        endAngle: config.animation ? -90 : targetEnd,
        fillStyle: colors[i % colors.length],
        border: 0,
      });
      circle.name = 'dataPie';
      circle.data = { chartData: data[i], chartIndex: i };
      stage.add(circle);

      // 入场动画
      if (config.animation) {
        animateProps(
          { s: -90, e: -90 },
          { s: targetStart, e: targetEnd },
          ({ s, e }) => {
            circle.attr({ startAngle: s, endAngle: e });
          },
          stage,
          config.animation,
        );
      }

      // 标签
      if (config.label !== false) {
        const midAngle = (targetStart + targetEnd) / 2;
        const labelType = typeof config.label === 'object' ? config.label.type : 'outer';
        const labelRadius = labelType === 'inner'
          ? (outerRadius + innerRadius) / 2
          : outerRadius + 16;
        const rad = (midAngle * Math.PI) / 180;
        const lx = cx + labelRadius * Math.cos(rad);
        const ly = cy + labelRadius * Math.sin(rad);

        const text = new Text({
          x: lx,
          y: ly,
          content: labels[i],
          fillStyle: labelType === 'inner' ? '#fff' : '#334155',
          fontSize: 11,
          textAlign: 'center',
          textBaseline: 'middle',
        });
        text.name = 'pieLabel';
        stage.add(text);
      }
    });

    // 图例
    if (config.legend !== false) {
      const legendItems = labels.map((label, i) => ({
        label,
        color: colors[i % colors.length],
        active: !this.filteredIndices.has(i),
      }));
      drawLegend({
        stage,
        items: legendItems,
        position: typeof config.legend === 'object' ? config.legend.position ?? 'top' : 'top',
        chartWidth: config.width ?? 400,
        chartHeight: config.height ?? 300,
        onToggle: (idx) => this.handleLegendToggle(idx),
      });
    }

    if (!config.animation) {
      stage.batchDraw(stage);
    }
  }
}
```

- [ ] **Step 2: 实现 React 组件**

```tsx
import React, { useEffect, useRef } from 'react';
import type { IPieChartProps } from '../core/types';
import { PieChart as PieChartCore } from './PieChart';

const PieChartComponent = <T extends Record<string, any>>(
  props: IPieChartProps<T>,
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<PieChartCore<T> | null>(null);
  const { style, className, ...chartConfig } = props;

  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = new PieChartCore<T>({
      ...chartConfig,
      container: containerRef.current,
      width: props.width ?? containerRef.current.clientWidth,
      height: props.height ?? containerRef.current.clientHeight,
    } as any);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update({ data: props.data });
    }
  }, [props.data]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: props.width ?? '100%', height: props.height ?? 300, ...style }}
    />
  );
};

export default PieChartComponent;
```

- [ ] **Step 3: 提交**

```bash
git add src/charts/pie/
git commit -m "feat(charts): add PieChart with imperative API and React component"
```

---

## Task 13: 统一导出与 package.json

**Files:**
- Create: `src/charts/index.ts`
- Modify: `src/index.ts`
- Modify: `package.json`

- [ ] **Step 1: 创建 charts 入口**

```ts
// src/charts/index.ts
export { LineChart } from './line/LineChart';
export { default as LineChartComponent } from './line/index';
export { BarChart } from './bar/BarChart';
export { default as BarChartComponent } from './bar/index';
export { PieChart } from './pie/PieChart';
export { default as PieChartComponent } from './pie/index';
export type {
  IChartConfig,
  IChartProps,
  ILineChartConfig,
  ILineChartProps,
  IBarChartConfig,
  IBarChartProps,
  IPieChartConfig,
  IPieChartProps,
} from './core/types';
```

- [ ] **Step 2: 修改 src/index.ts**

在文件末尾添加：

```ts
export * from './charts';
```

- [ ] **Step 3: 修改 package.json exports**

在 `"./components"` 导出后面添加：

```json
"./charts": {
  "types": "./dist/charts/index.d.ts",
  "import": "./dist/esm/charts/index.js",
  "require": "./dist/charts/index.js"
}
```

- [ ] **Step 4: 验证构建**

```bash
pnpm build
```

预期：构建成功，`dist/charts/` 和 `dist/esm/charts/` 目录生成。

- [ ] **Step 5: 提交**

```bash
git add src/charts/index.ts src/index.ts package.json
git commit -m "feat(charts): add unified exports and package.json chart subpath"
```

---

## Task 14: 文档 — Charts 菜单与 Demo 页面

**Files:**
- Create: `docs/charts/index.md`
- Create: `docs/charts/line.md`
- Create: `docs/charts/bar.md`
- Create: `docs/charts/pie.md`

- [ ] **Step 1: 创建 Charts 导航入口**

```md
---
nav:
  title: Charts
  order: 4
---

# Charts

基于 heitu/canvas 引擎的轻量图表库。

## 安装

\`\`\`bash
npm install heitu
\`\`\`

## 快速开始

\`\`\`tsx
import { LineChart, BarChart, PieChart } from 'heitu/charts'
\`\`\`

支持命令式 API 和 React 组件两种使用方式。
```

- [ ] **Step 2: 创建折线图文档**

`docs/charts/line.md`：包含基础折线图、平滑曲线、自定义 tooltip 等 demo，以及完整 API 表格。每个 demo 使用 ````tsx` 代码块包裹，dumi 自动渲染。

- [ ] **Step 3: 创建柱状图文档**

`docs/charts/bar.md`：包含基础柱状图、圆角柱子、颜色映射等 demo。

- [ ] **Step 4: 创建饼图文档**

`docs/charts/pie.md`：包含饼图、环形图、带标签等 demo。

- [ ] **Step 5: 修改 Canvas 和 Tools 导航顺序**

`docs/canvas/index.md`：将 `order` 改为 `3`（保持不变）。
`docs/tools/index.md`：将 `order` 改为 `5`。

- [ ] **Step 6: 验证文档站**

```bash
pnpm dev
```

预期：顶部导航出现 Charts 菜单，点击进入可看到折线图/柱状图/饼图三个子页面。

- [ ] **Step 7: 提交**

```bash
git add docs/charts/ docs/tools/index.md
git commit -m "docs(charts): add Charts nav with line, bar, and pie chart demos"
```

---

## Task 15: Claude Skill — heitu-charts

**Files:**
- Create: `.claude/skills/heitu-charts/SKILL.md`

- [ ] **Step 1: 创建 skill 文件**

包含完整的 charts API 参考：三种图表的命令式 + React 用法、配置项说明、调色板、动画配置等。

- [ ] **Step 2: 提交**

```bash
git add .claude/skills/heitu-charts/
git commit -m "feat: add heitu-charts Claude skill"
```
