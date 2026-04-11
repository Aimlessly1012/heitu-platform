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
