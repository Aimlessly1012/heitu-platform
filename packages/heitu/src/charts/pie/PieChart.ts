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
        index: 0,
      });
      circle.name = 'dataPie';
      circle.data = { chartData: data[i], chartIndex: i };
      stage.add(circle as any);

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
          fillStyle: labelType === 'inner' ? '#fff' : '#CBD5E1',
          fontSize: 11,
          textAlign: 'center',
          textBaseline: 'middle',
        });
        text.name = 'pieLabel';
        stage.add(text as any);
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
