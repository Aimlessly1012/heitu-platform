import { isInShape } from 'heitu/canvas/utils';
import { forIn } from 'lodash-es';
import { dpr } from '../constant';
import { Vector2d } from '../type';
import Node from './node';

interface ILine {
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  points?: number[];
  smooth?: boolean;
  strokeStyle?: string;
  lineWidth?: number;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'miter' | 'round' | 'miter';
  index?: number;
  lineDash?: [number, number] | [];
}

class Line extends Node {
  name = 'Line';
  start: { x: number; y: number };
  end: { x: number; y: number };
  points: number[];
  smooth: boolean;
  strokeStyle: string;
  lineWidth: number;
  lineCap: 'butt' | 'round' | 'square';
  lineJoin: 'miter' | 'round' | 'miter';
  index: number;
  path2D: Path2D | null;
  parent = null;
  shadowColor: string;
  shadowBlur: number = 0;
  shadowOffsetY: number = 0;
  shadowOffsetX: number = 0;
  lineDash: [number, number] | [] = [];

  constructor(config: ILine) {
    super();
    this.start = { x: 10, y: 10 };
    this.end = { x: 100, y: 100 };
    this.points = [];
    this.strokeStyle = 'black';
    this.lineWidth = 1;
    this.lineCap = 'butt';
    this.lineJoin = 'miter';
    this.smooth = false;
    this.index = 0;
    this.path2D = null;
    this.shadowColor = 'transparent';
    forIn(config, (value, key) => {
      if (value) (this as any)[key] = value;
    });
  }
  convertToNormalPoints(points: number[]): Vector2d[] {
    return points
      .reduce((acc: number[][], item, index) => {
        const tarIndex = Math.floor(index / 2);
        if (index % 2 === 0) acc.push([item]);
        else acc[tarIndex].push(item);
        return acc;
      }, [])
      .map(([x, y]) => ({ x, y }));
  }
  calcSmoothPath2D() {
    const path2D = new Path2D();

    // 收集所有点：start + points(中间点) + end
    const allPoints: Vector2d[] = [
      { x: this.start?.x || 0, y: this.start?.y || 0 },
      ...this.convertToNormalPoints(this.points),
      { x: this.end?.x || 0, y: this.end?.y || 0 },
    ];

    if (allPoints.length < 2) {
      this.path2D = path2D;
      return path2D;
    }

    path2D.moveTo(allPoints[0].x, allPoints[0].y);

    if (allPoints.length === 2) {
      // 只有两个点，直接连线
      path2D.lineTo(allPoints[1].x, allPoints[1].y);
    } else {
      // Catmull-Rom 样条 → 三次贝塞尔曲线转换
      for (let i = 0; i < allPoints.length - 1; i++) {
        const p0 = allPoints[Math.max(i - 1, 0)];
        const p1 = allPoints[i];
        const p2 = allPoints[i + 1];
        const p3 = allPoints[Math.min(i + 2, allPoints.length - 1)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path2D.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
    }

    this.path2D = path2D;
    return path2D;
  }
  calcStraightPath2D() {
    const path2D = new Path2D();
    path2D.moveTo(this.start?.x || 0, this.start?.y || 0);
    const restNormalPoints = this.convertToNormalPoints([
      ...(this.points as number[]),
      this.end?.x as number,
      this.end?.y as number,
    ]);

    restNormalPoints.forEach(({ x, y }) => {
      path2D.lineTo(x, y);
    });
    this.path2D = path2D;
    return path2D;
  }
  draw(ctx: CanvasRenderingContext2D) {

    const path2D = this.smooth
      ? this.calcSmoothPath2D()
      : this.calcStraightPath2D();
    if (this.strokeStyle) ctx.strokeStyle = this.strokeStyle;
    if (this.lineWidth) ctx.lineWidth = this.lineWidth;
    if (this.shadowColor) {
      // 设置阴影属性
      ctx.shadowColor = this.shadowColor; // 阴影颜色
      ctx.shadowBlur = this.shadowBlur; // 阴影模糊程度
      ctx.shadowOffsetX = this.shadowOffsetX; // 阴影的水平偏移
      ctx.shadowOffsetY = this.shadowOffsetY; // 阴影的垂直偏移
    } else {
      ctx.shadowColor = 'transparent'; // 取消阴影效果
    }
    if (this.lineDash.length <= 0) {
      ctx.setLineDash([]);
    } else {
      ctx.setLineDash(this.lineDash);
    }
    ctx.stroke(path2D);
    return this;
  }
  inScope(evt: MouseEvent, ctx: CanvasRenderingContext2D) {
    const mouseX = evt.offsetX * dpr;
    const mouseY = evt.offsetY * dpr;
    if (this?.path2D) {
      return isInShape({
        mouseX,
        mouseY,
        path2D: this?.path2D,
        ctx: ctx || undefined,
      });
    }
    return false;
  }
}

export default Line;
