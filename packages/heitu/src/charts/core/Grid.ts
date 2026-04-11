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
    stage.add(line as any);
  });
}
