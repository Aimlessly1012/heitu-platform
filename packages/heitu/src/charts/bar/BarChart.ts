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
      });
      rect.radius = config.radius ? config.radius[0] : 0;
      rect.name = 'dataBar';
      rect.data = { chartData: d, chartIndex: i };
      stage.add(rect as any);

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
      const uniqueLabels = Array.from(new Set(config.data.map((d) => String((d as any)[colorField]))));
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
