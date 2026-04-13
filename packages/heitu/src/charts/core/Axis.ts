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
    strokeStyle: '#334155',
    lineWidth: 1,
  });
  axisLine.name = 'xAxisLine';
  stage.add(axisLine as any);

  // 刻度标签
  labels.forEach((label, i) => {
    const text = new Text({
      x: positions[i],
      y: y + 8,
      content: label,
      fillStyle: '#94A3B8',
      fontSize: 11,
      textAlign: 'center',
      textBaseline: 'top',
    });
    text.name = 'xAxisLabel';
    stage.add(text as any);
  });
}

/** 绘制 Y 轴（左侧） */
export function drawYAxis(
  config: IAxisConfig,
  ticks: number[],
  scale: (v: number) => number,
  color?: string,
): void {
  const { stage, plotArea } = config;

  ticks.forEach((tick) => {
    const y = scale(tick);
    const text = new Text({
      x: plotArea.x - 8,
      y,
      content: String(tick),
      fillStyle: color ?? '#94A3B8',
      fontSize: 11,
      textAlign: 'right',
      textBaseline: 'middle',
    });
    text.name = 'yAxisLabel';
    stage.add(text as any);
  });
}

/** 绘制右 Y 轴 */
export function drawYAxisRight(
  config: IAxisConfig,
  ticks: number[],
  scale: (v: number) => number,
  color?: string,
): void {
  const { stage, plotArea } = config;
  const rightX = plotArea.x + plotArea.width;

  // 轴线
  const axisLine = new Line({
    start: { x: rightX, y: plotArea.y },
    end: { x: rightX, y: plotArea.y + plotArea.height },
    strokeStyle: '#334155',
    lineWidth: 1,
  });
  axisLine.name = 'yAxisRightLine';
  stage.add(axisLine as any);

  ticks.forEach((tick) => {
    const y = scale(tick);
    const text = new Text({
      x: rightX + 8,
      y,
      content: String(tick),
      fillStyle: color ?? '#94A3B8',
      fontSize: 11,
      textAlign: 'left',
      textBaseline: 'middle',
    });
    text.name = 'yAxisRightLabel';
    stage.add(text as any);
  });
}
