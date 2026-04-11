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
    stage.add(line as any);

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
          index: 0,
        });
        circle.name = 'dataPoint';
        circle.data = { chartData: d, chartIndex: i };
        stage.add(circle as any);
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

    // 入场动画
    if (config.animation) {
      const mask = new Rect({
        x: plotArea.x,
        y: plotArea.y - 5,
        width: plotArea.width,
        height: plotArea.height + 10,
        fillStyle: '#fff',
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
