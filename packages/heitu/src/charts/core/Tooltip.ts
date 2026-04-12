export class Tooltip {
  private el: HTMLDivElement;
  private formatter?: (item: any) => string;

  constructor(
    container: HTMLElement,
    formatter?: (item: any) => string,
  ) {
    this.formatter = formatter;
    this.el = document.createElement('div');
    Object.assign(this.el.style, {
      position: 'absolute',
      pointerEvents: 'none',
      backgroundColor: 'rgba(30, 41, 59, 0.92)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      backdropFilter: 'blur(8px)',
      color: '#fff',
      padding: '6px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      lineHeight: '1.5',
      whiteSpace: 'nowrap',
      opacity: '0',
      transition: 'opacity 0.15s',
      zIndex: '10',
    });
    // 容器需要 relative 定位
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    container.appendChild(this.el);
  }

  show(x: number, y: number, data: any): void {
    const text = this.formatter ? this.formatter(data) : String(data);
    this.el.textContent = text;
    this.el.style.opacity = '1';

    // 根据位置调整方向，避免溢出
    const parent = this.el.parentElement!;
    const maxX = parent.clientWidth;
    const elWidth = this.el.offsetWidth;
    const left = x + elWidth + 10 > maxX ? x - elWidth - 10 : x + 10;
    const top = Math.max(0, y - 30);

    this.el.style.left = `${left}px`;
    this.el.style.top = `${top}px`;
  }

  hide(): void {
    this.el.style.opacity = '0';
  }

  destroy(): void {
    this.el.remove();
  }
}
