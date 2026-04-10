import { dpr } from '../constant';
import { createCanvasElement } from './utils';

// interface ICanvasConfig {
//   width?: number;
//   height?: number;
//   pixelRatio?: number;
//   willReadFrequently?: boolean;
// }

export class Canvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width = 0;
  height = 0;

  constructor() {
    this.canvas = createCanvasElement();
    this.canvas.style.padding = '0';
    this.canvas.style.margin = '0';
    this.canvas.style.border = '0';
    this.canvas.style.background = 'transparent';
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  setWidth(width: number) {
    this.width = this.canvas.width = width * dpr;
    this.canvas.style.width = width + 'px';
  }
  setHeight(height: number) {
    this.height = this.canvas.height = height * dpr;
    this.canvas.style.height = height + 'px';
  }
  /**
   * setSize 统一调用,设置完宽高后重置并应用一次 scale,
   * 避免 setHeight 每次单独 scale 导致累乘变形。
   */
  setSize(width: number, height: number) {
    this.setWidth(width || 0);
    this.setHeight(height || 0);
    // 重置变换矩阵后统一缩放,避免多次 resize 累乘
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  setBackgroundColor(color: string) {
    this.canvas.style.background = color;
  }
  getContext() {
    return this.context;
  }
  getCanvasDom(
    width: number,
    height: number,
    backgroundColor?: string,
  ) {
    this.setSize(width, height);
    if (backgroundColor) this.setBackgroundColor(backgroundColor);
    return this.canvas;
  }
}
