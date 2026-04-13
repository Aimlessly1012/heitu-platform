import { Circle, Line, Rect } from '../../canvas';
import { drawXAxis, drawYAxis, drawYAxisRight } from '../core/Axis';
import { BaseChart } from '../core/BaseChart';
import { drawGrid } from '../core/Grid';
import { drawLegend } from '../core/Legend';
import { bandScale, linearScale, linearTicks } from '../core/Scale';
import { animateProps } from '../core/animate';
import type { IBarLineChartConfig } from '../core/types';

/** 默认柱状图调色板 */
const BAR_PALETTE = ['#4F46E5', '#8B5CF6', '#06B6D4', '#64748B'];
/** 默认折线图调色板 */
const LINE_PALETTE = ['#10B981', '#F59E0B', '#F43F5E', '#EF4444'];

export class BarLineChart<T = Record<string, any>> extends BaseChart<T> {
  protected declare config: IBarLineChartConfig<T>;

  constructor(config: IBarLineChartConfig<T>) {
    super(config);
  }

  /** 右侧留出空间给右 Y 轴 */
  protected calcPlotArea(): void {
    const [pt, pr, pb, pl] = this.config.padding ?? [40, 50, 40, 50];
    const width = this.config.width ?? this.config.container.clientWidth ?? 400;
    const height = this.config.height ?? this.config.container.clientHeight ?? 300;
    const legendSpace = this.config.legend !== false ? 30 : 0;
    const legendPos = typeof this.config.legend === 'object' ? this.config.legend.position : 'top';

    this.plotArea = {
      x: pl,
      y: pt + (legendPos === 'top' ? legendSpace : 0),
      width: width - pl - pr,
      height: height - pt - pb - legendSpace,
    };
  }

  protected render(): void {
    const { config, plotArea, stage } = this;

    // 统一为数组
    const barFields = Array.isArray(config.yFieldBar) ? config.yFieldBar : [config.yFieldBar];
    const lineFields = Array.isArray(config.yFieldLine) ? config.yFieldLine : [config.yFieldLine];
    const barColorArr = Array.isArray(config.barColor) ? config.barColor : config.barColor ? [config.barColor] : [];
    const lineColorArr = Array.isArray(config.lineColor) ? config.lineColor : config.lineColor ? [config.lineColor] : [];

    // 为每个系列分配颜色
    const getBarColor = (idx: number) => barColorArr[idx] ?? BAR_PALETTE[idx % BAR_PALETTE.length];
    const getLineColor = (idx: number) => lineColorArr[idx] ?? LINE_PALETTE[idx % LINE_PALETTE.length];

    // 图例项：柱系列 + 线系列
    const totalSeries = barFields.length + lineFields.length;
    const legendItems = [
      ...barFields.map((field, i) => ({
        label: i === 0 && config.yLabelLeft ? config.yLabelLeft : String(field),
        color: getBarColor(i),
      })),
      ...lineFields.map((field, i) => ({
        label: i === 0 && config.yLabelRight ? config.yLabelRight : String(field),
        color: getLineColor(i),
      })),
    ];

    const data = this.getFilteredData();

    // 空数据时仍绘制图例
    if (!data.length) {
      if (config.legend !== false) {
        const legendPos = typeof config.legend === 'object' ? config.legend.position : 'top';
        drawLegend({
          stage,
          items: legendItems.map((item, i) => ({ ...item, active: !this.filteredIndices.has(i) })),
          position: legendPos ?? 'top',
          chartWidth: config.width ?? 400,
          chartHeight: config.height ?? 300,
          onToggle: (idx) => this.handleLegendToggle(idx),
        });
      }
      stage.batchDraw(stage);
      return;
    }

    const categories = data.map((d) => String((d as any)[config.xField]));

    // 计算左轴范围（所有柱系列最大值）
    let barMax = 1;
    for (const field of barFields) {
      for (const d of data) {
        const v = Number((d as any)[field]) || 0;
        if (v > barMax) barMax = v;
      }
    }

    // 计算右轴范围（所有线系列最大值）
    let lineMax = 1;
    for (const field of lineFields) {
      for (const d of data) {
        const v = Number((d as any)[field]) || 0;
        if (v > lineMax) lineMax = v;
      }
    }

    // 比例尺
    const xScale = bandScale(categories, [plotArea.x, plotArea.x + plotArea.width]);
    const barTicks = linearTicks([0, barMax]);
    const barDomain: [number, number] = [barTicks[0], barTicks[barTicks.length - 1]];
    const barScale = linearScale(barDomain, [plotArea.y + plotArea.height, plotArea.y]);

    const lineTicks = linearTicks([0, lineMax]);
    const lineDomain: [number, number] = [lineTicks[0], lineTicks[lineTicks.length - 1]];
    const lineScale = linearScale(lineDomain, [plotArea.y + plotArea.height, plotArea.y]);

    const baseY = plotArea.y + plotArea.height;

    // 哪些系列可见
    const visibleBarFields = barFields.filter((_, i) => !this.filteredIndices.has(i));
    const visibleLineFields = lineFields.filter((_, i) => !this.filteredIndices.has(barFields.length + i));

    // 网格 + 坐标轴
    drawGrid(stage, plotArea, barTicks, barScale);
    const xPositions = categories.map((c) => xScale(c));
    drawXAxis({ stage, plotArea }, categories, xPositions);
    drawYAxis({ stage, plotArea }, barTicks, barScale, visibleBarFields.length > 0 ? getBarColor(0) : '#475569');
    drawYAxisRight({ stage, plotArea }, lineTicks, lineScale, visibleLineFields.length > 0 ? getLineColor(0) : '#475569');

    // ── 柱状图（分组） ──
    if (visibleBarFields.length > 0) {
      const groupCount = visibleBarFields.length;
      const singleBarWidth = config.barWidth ?? Math.min(xScale.bandwidth() * 0.6 / groupCount, 36);
      const groupWidth = singleBarWidth * groupCount;

      data.forEach((d, dataIdx) => {
        const cx = xScale(categories[dataIdx]);

        visibleBarFields.forEach((field, groupIdx) => {
          const origIdx = barFields.indexOf(field);
          const value = Number((d as any)[field]) || 0;
          const targetY = barScale(value);
          const targetH = baseY - targetY;
          const barX = cx - groupWidth / 2 + groupIdx * singleBarWidth;

          const rect = new Rect({
            x: barX,
            y: config.animation ? baseY : targetY,
            width: singleBarWidth - 2,
            height: config.animation ? 0 : targetH,
            fillStyle: getBarColor(origIdx),
          });
          rect.radius = config.radius ? config.radius[0] : 2;
          rect.name = 'dataBar';
          rect.data = { chartData: d, chartIndex: dataIdx };
          stage.add(rect as any);

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
      });
    }

    // ── 折线图（多线） ──
    visibleLineFields.forEach((field) => {
      const origIdx = lineFields.indexOf(field);
      const color = getLineColor(origIdx);
      const values = data.map((d) => Number((d as any)[field]) || 0);

      const allXY = data.map((_, i) => ({
        x: xScale(categories[i]),
        y: lineScale(values[i]),
      }));

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
        strokeStyle: color,
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
            strokeStyle: color,
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
        items: legendItems.map((item, i) => ({ ...item, active: !this.filteredIndices.has(i) })),
        position: legendPos ?? 'top',
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
