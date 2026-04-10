import { dpr } from './core/constant';

export const isStage = (obj: any) => {
  return obj.name === 'Stage';
};

interface TextShapeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const isInTextShape = (
  mouseX: number,
  mouseY: number,
  data: Partial<TextShapeBounds>,
) => {
  const { x, y, width, height } = data;
  if (x != null && y != null && width != null && height != null) {
    return (
      mouseX > x * dpr &&
      mouseX < (x + width) * dpr &&
      mouseY > y * dpr &&
      mouseY < (y + height) * dpr
    );
  }
  return false;
};

export const isInShape = ({
  mouseX,
  mouseY,
  path2D,
  ctx,
}: {
  mouseX: number;
  mouseY: number;
  path2D?: Path2D;
  ctx?: CanvasRenderingContext2D;
}) => {
  return path2D && ctx && ctx.isPointInPath(path2D, mouseX, mouseY);
};
