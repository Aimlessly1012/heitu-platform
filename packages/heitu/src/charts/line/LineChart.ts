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

    // 支持多线系列：将 yField 统一为数组
    const yFields = Array.isArray(config.yField) ? config.yField : [config.yField];

    // 图例始终用完整数据，确保全部关闭后可恢复
    if (!data.length) {
      if (config.legend !== false) {
        const legendPos = typeof config.legend === 'object' ? config.legend.position : 'top';
        drawLegend({
          stage,
          items: yFields.map((field, idx) => ({
            label: String(field),
            color: colors[idx % colors.length],
            active: !this.filteredIndices.has(idx),
          })),
          position: legendPos ?? 'top',
          chartWidth: config.width ?? 400,
          chartHeight: config.height ?? 300,
          onToggle: (idx) => this.handleLegendToggle(idx),
        });
      }
      stage.batchDraw(stage);
      return;
    }

    // 提取数据
    const categories = data.map((d) => String((d as any)[config.xField]));

    // 合并所有系列的值，计算统一的 Y 轴范围
    let maxVal = 1;
    for (const field of yFields) {
      for (const d of data) {
        const v = Number((d as any)[field]) || 0;
        if (v > maxVal) maxVal = v;
      }
    }
    const minVal = 0;

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

    // 遍历每个系列，绘制折线 + 数据点
    yFields.forEach((field, seriesIdx) => {
      // 跳过被图例过滤的系列
      if (this.filteredIndices.has(seriesIdx)) return;

      const seriesColor = colors[seriesIdx % colors.length];
      const values = data.map((d) => Number((d as any)[field]) || 0);

      // 折线坐标
      const allXY = data.map((_, i) => ({
        x: xScale(categories[i]),
        y: yScale(values[i]),
      }));

      // 提取首尾点作为 start/end，中间点作为 points
      const startPt = allXY[0];
      const endPt = allXY[allXY.length - 1];
      const middlePoints: number[] = [];
      for (let i = 1; i < allXY.length - 1; i++) {
        middlePoints.push(allXY[i].x, allXY[i].y);
      }

      const line = new Line({
        start: startPt,
        end: endPt,
        points: middlePoints,
        smooth: config.smooth ?? false,
        strokeStyle: seriesColor,
        lineWidth: 2,
      });
      line.name = 'dataLine';
      stage.add(line as any);

      // 数据点
      if (config.point !== false) {
        const pointSize = typeof config.point === 'object' ? (config.point.size ?? 4) : 4;
        data.forEach((d, i) => {
          const { x, y } = allXY[i];
          const circle = new Circle({
            x,
            y,
            radius: pointSize,
            fillStyle: '#0F172A',
            strokeStyle: seriesColor,
            lineWidth: 2,
            border: 2,
            index: 0,
          });
          circle.name = 'dataPoint';
          circle.data = { chartData: d, chartIndex: i };
          stage.add(circle as any);
        });
      }
    });

    // 图例
    if (config.legend !== false) {
      const legendPos = typeof config.legend === 'object' ? config.legend.position : 'top';
      drawLegend({
        stage,
        items: yFields.map((field, idx) => ({
          label: String(field),
          color: colors[idx % colors.length],
          active: !this.filteredIndices.has(idx),
        })),
        position: legendPos ?? 'top',
        chartWidth: config.width ?? 400,
        chartHeight: config.height ?? 300,
        onToggle: (idx) => this.handleLegendToggle(idx),
      });
    }

    // 入场动画
    if (config.animation) {
      const mask = new Rect({
        x: plotArea.x,
        y: plotArea.y - 5,
        width: plotArea.width,
        height: plotArea.height + 10,
        fillStyle: '#0F172A',
      });
      mask.index = 999;
      mask.name = 'animMask';
      stage.add(mask as any);
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
          mask.attr({ width: 0, height: 0 });
          stage.batchDraw(stage);
        },
      );
    } else {
      stage.batchDraw(stage);
    }
  }
}
