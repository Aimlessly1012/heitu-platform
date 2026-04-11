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
