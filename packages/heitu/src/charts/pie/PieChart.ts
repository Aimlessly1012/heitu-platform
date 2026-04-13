import { Circle, Text } from '../../canvas';
import { BaseChart } from '../core/BaseChart';
import { drawLegend } from '../core/Legend';
import { arcScale } from '../core/Scale';
import { animateProps } from '../core/animate';
import type { IPieChartConfig } from '../core/types';

export class PieChart<T = Record<string, any>> extends BaseChart<T> {
  protected declare config: IPieChartConfig<T>;
  /** 当前弹出（explode）的扇区索引，-1 表示无 */
  private activeIndex = -1;

  constructor(config: IPieChartConfig<T>) {
    super(config);
    // 绑定饼图专属点击事件（扇区弹出/收回）
    this.stage.on('click', (e: any) => {
      const evt: MouseEvent = e instanceof MouseEvent ? e : e?.evt;
      if (!evt) return;
      const canvas = this.stage.canvas!;
      const ctx = canvas.getContext();
      const children = this.stage.getChildren();

      let clickedIndex = -1;
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child.name === 'dataPie' && child.data?.chartData && child.inScope?.(evt, ctx)) {
          clickedIndex = child.data.chartIndex;
          // 同时触发外部 onClickItem
          this.config.onClickItem?.(child.data.chartData, child.data.chartIndex);
          break;
        }
      }

      if (clickedIndex >= 0) {
        // 切换弹出状态
        this.activeIndex = this.activeIndex === clickedIndex ? -1 : clickedIndex;
        this.clear();
        this.render();
        this.stage.batchDraw(this.stage);
      }
    });
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
    const allData = config.data;
    const data = this.getFilteredData();

    // 图例始终用完整数据，确保全部关闭后仍可点击恢复
    const allLabels = allData.map((d) => String((d as any)[config.colorField]));

    if (!data.length) {
      // 数据全被过滤，仅绘制图例
      if (config.legend !== false) {
        drawLegend({
          stage,
          items: allLabels.map((label, i) => ({
            label,
            color: colors[i % colors.length],
            active: !this.filteredIndices.has(i),
          })),
          position: typeof config.legend === 'object' ? config.legend.position ?? 'top' : 'top',
          chartWidth: config.width ?? 400,
          chartHeight: config.height ?? 300,
          onToggle: (idx) => this.handleLegendToggle(idx),
        });
      }
      stage.batchDraw(stage);
      return;
    }

    const values = data.map((d) => Number((d as any)[config.angleField]) || 0);
    const labels = data.map((d) => String((d as any)[config.colorField]));
    const arcs = arcScale(values);

    // 圆心和半径
    const cx = plotArea.x + plotArea.width / 2;
    const cy = plotArea.y + plotArea.height / 2;
    const outerRadius = Math.min(plotArea.width, plotArea.height) / 2 - 20;
    const innerRadius = (config.innerRadius ?? 0) * outerRadius;
    const explodeOffset = 12; // 弹出偏移量

    // 绘制扇区
    arcs.forEach((arc, i) => {
      const targetStart = arc.startAngle;
      const targetEnd = arc.endAngle;
      const isActive = this.activeIndex === i;

      // 计算弹出偏移
      let offsetX = 0;
      let offsetY = 0;
      if (isActive) {
        const midAngle = (targetStart + targetEnd) / 2;
        const rad = (midAngle * Math.PI) / 180;
        offsetX = explodeOffset * Math.cos(rad);
        offsetY = explodeOffset * Math.sin(rad);
      }

      const circle = new Circle({
        x: cx + offsetX,
        y: cy + offsetY,
        radius: isActive ? outerRadius + 4 : outerRadius,
        innerRadius,
        arc: true,
        startAngle: config.animation && this.activeIndex === -1 ? -90 : targetStart,
        endAngle: config.animation && this.activeIndex === -1 ? -90 : targetEnd,
        fillStyle: colors[i % colors.length],
        border: 0,
        index: 0,
      });

      // 弹出时加阴影
      if (isActive) {
        circle.shadowColor = 'rgba(0, 0, 0, 0.5)';
        circle.shadowBlur = 16;
        circle.shadowOffsetX = 2;
        circle.shadowOffsetY = 2;
      }

      circle.name = 'dataPie';
      circle.data = { chartData: data[i], chartIndex: i };
      stage.add(circle as any);

      // 入场动画（仅首次，非点击交互时）
      if (config.animation && this.activeIndex === -1) {
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
          : outerRadius + (isActive ? 24 : 16);
        const rad = (midAngle * Math.PI) / 180;
        const lx = cx + offsetX + labelRadius * Math.cos(rad);
        const ly = cy + offsetY + labelRadius * Math.sin(rad);

        const text = new Text({
          x: lx,
          y: ly,
          content: labels[i],
          fillStyle: labelType === 'inner' ? '#fff' : '#CBD5E1',
          fontSize: isActive ? 12 : 11,
          textAlign: 'center',
          textBaseline: 'middle',
        });
        text.name = 'pieLabel';
        stage.add(text as any);
      }
    });

    // 图例（用完整数据，保证全部关闭后仍可恢复）
    if (config.legend !== false) {
      drawLegend({
        stage,
        items: allLabels.map((label, i) => ({
          label,
          color: colors[i % colors.length],
          active: !this.filteredIndices.has(i),
        })),
        position: typeof config.legend === 'object' ? config.legend.position ?? 'top' : 'top',
        chartWidth: config.width ?? 400,
        chartHeight: config.height ?? 300,
        onToggle: (idx) => this.handleLegendToggle(idx),
      });
    }

    if (!config.animation || this.activeIndex >= 0) {
      stage.batchDraw(stage);
    }
  }
}
