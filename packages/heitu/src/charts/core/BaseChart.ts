import { Stage } from '../../canvas';
import { Tooltip } from './Tooltip';
import type { IChartConfig, IPlotArea } from './types';
import { DEFAULT_COLORS, DEFAULT_PADDING } from './types';

export abstract class BaseChart<T = Record<string, any>> {
  protected stage: Stage;
  protected config: IChartConfig<T>;
  protected plotArea!: IPlotArea;
  protected tooltip: Tooltip | null = null;
  protected colors: string[];
  /** 当前被图例过滤掉的数据索引集合 */
  protected filteredIndices: Set<number> = new Set();

  constructor(config: IChartConfig<T>) {
    this.config = config;
    this.colors = config.colors ?? DEFAULT_COLORS;

    // 创建 Stage
    this.stage = new Stage();
    const container = config.container;
    const width = config.width ?? container.clientWidth ?? 400;
    const height = config.height ?? container.clientHeight ?? 300;

    this.stage.buildContentDOM({
      container,
      width,
      height,
      backgroundColor: '#fff',
    });

    // 计算绘图区域
    this.calcPlotArea();

    // 创建 Tooltip
    if (config.tooltip !== false) {
      const formatter = typeof config.tooltip === 'object' ? config.tooltip.formatter : undefined;
      this.tooltip = new Tooltip(container, formatter);
    }

    // 绑定事件
    this.bindEvents();

    // 首次渲染
    this.render();
  }

  /** 计算绘图区域（去掉 padding 和 legend 空间） */
  protected calcPlotArea(): void {
    const [pt, pr, pb, pl] = this.config.padding ?? DEFAULT_PADDING;
    const width = this.config.width ?? this.config.container.clientWidth ?? 400;
    const height = this.config.height ?? this.config.container.clientHeight ?? 300;

    // legend 占用空间
    const legendSpace = this.config.legend !== false ? 30 : 0;
    const legendPos = typeof this.config.legend === 'object' ? this.config.legend.position : 'top';

    this.plotArea = {
      x: pl,
      y: pt + (legendPos === 'top' ? legendSpace : 0),
      width: width - pl - pr,
      height: height - pt - pb - legendSpace,
    };
  }

  /** 绑定 Stage 事件 */
  private bindEvents(): void {
    this.stage.on('mousemove', ({ evt }) => {
      this.stage.setPointersPositions(evt);
      const canvas = this.stage.canvas!;
      const ctx = canvas.getContext();
      const rect = canvas.canvas?.getBoundingClientRect();
      const x = evt.clientX - (rect?.left ?? 0);
      const y = evt.clientY - (rect?.top ?? 0);

      // 碰撞检测：找到当前 hover 的数据图元
      let found = false;
      const children = this.stage.getChildren();
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child.data?.chartData && child.inScope?.(evt, ctx)) {
          this.tooltip?.show(x, y, child.data.chartData);
          found = true;
          break;
        }
      }
      if (!found) {
        this.tooltip?.hide();
      }
    });

    this.stage.on('mouseleave', () => {
      this.tooltip?.hide();
    });

    // 点击事件
    if (this.config.onClickItem) {
      this.stage.on('click', ({ evt }) => {
        const canvas = this.stage.canvas!;
        const ctx = canvas.getContext();
        const children = this.stage.getChildren();
        for (let i = children.length - 1; i >= 0; i--) {
          const child = children[i];
          if (child.data?.chartData && child.inScope?.(evt, ctx)) {
            this.config.onClickItem?.(child.data.chartData, child.data.chartIndex);
            break;
          }
        }
      });
    }

  }

  /** 清除所有图元，准备重绘 */
  protected clear(): void {
    this.stage.removeChildren();
  }

  /** 获取过滤后的数据 */
  protected getFilteredData(): T[] {
    return this.config.data.filter((_, i) => !this.filteredIndices.has(i));
  }

  /** 图例切换回调 */
  protected handleLegendToggle(index: number): void {
    if (this.filteredIndices.has(index)) {
      this.filteredIndices.delete(index);
    } else {
      this.filteredIndices.add(index);
    }
    this.clear();
    this.render();
    this.stage.batchDraw(this.stage);
  }

  /** 更新配置并重绘 */
  update(newConfig: Partial<IChartConfig<T>>): void {
    Object.assign(this.config, newConfig);
    if (newConfig.padding) this.calcPlotArea();
    this.clear();
    this.render();
    this.stage.batchDraw(this.stage);
  }

  /** 销毁图表 */
  destroy(): void {
    this.tooltip?.destroy();
    this.stage.destroy();
  }

  /** 子类实现：渲染图表内容 */
  protected abstract render(): void;
}
