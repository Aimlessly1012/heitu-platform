import { Rect, Text } from '../../canvas';
import type { Stage } from '../../canvas';

export interface ILegendItem {
  label: string;
  color: string;
  active: boolean;
}

export interface ILegendConfig {
  stage: Stage;
  items: ILegendItem[];
  position: 'top' | 'bottom' | 'left' | 'right';
  chartWidth: number;
  chartHeight: number;
  onToggle: (index: number) => void;
}

/** 绘制图例并绑定点击事件 */
export function drawLegend(config: ILegendConfig): void {
  const { stage, items, position, chartWidth, onToggle } = config;
  const isHorizontal = position === 'top' || position === 'bottom';
  const itemWidth = 70;
  const itemHeight = 20;
  const dotSize = 10;
  const gap = 8;

  // 计算起始位置（水平居中）
  const totalWidth = items.length * itemWidth;
  let startX = isHorizontal ? (chartWidth - totalWidth) / 2 : 10;
  let startY = position === 'top' ? 10 : position === 'bottom' ? config.chartHeight - 25 : 50;

  items.forEach((item, i) => {
    const x = isHorizontal ? startX + i * itemWidth : startX;
    const y = isHorizontal ? startY : startY + i * (itemHeight + gap);

    // 色块
    const dot = new Rect({
      x,
      y,
      width: dotSize,
      height: dotSize,
      fillStyle: item.active ? item.color : '#475569',
    });
    dot.radius = 2;
    dot.name = 'legendDot';
    dot.data = { legendIndex: i };

    // 标签文字
    const label = new Text({
      x: x + dotSize + 4,
      y: y - 1,
      content: item.label,
      fillStyle: item.active ? '#E2E8F0' : '#64748B',
      fontSize: 11,
    });
    label.name = 'legendLabel';
    label.data = { legendIndex: i };

    // 点击切换
    dot.on('click', () => onToggle(i));
    label.on('click', () => onToggle(i));

    stage.add(dot as any, label as any);
  });
}
