/**
 * 拖拽状态机 — 从 node.ts fire() 中提取。
 * 三个纯函数,不依赖 this。
 */
import type Stage from '../stage';
import type Container from '../stage/container';
import type { ChildType } from '../stage/container';

/**
 * mousedown 时调用:
 * 找到 index 最高的可拖拽 shape,标记 dragging 并记录 offset。
 */
export function handleDragStart(
  children: ChildType[],
  evt: MouseEvent,
  ctx?: CanvasRenderingContext2D,
) {
  const dragShapes = children.filter((item) => item.draggable);
  const inScopeDragShape = dragShapes.filter(
    (item) => item.inScope?.(evt, ctx),
  );
  const top = inScopeDragShape.sort((a, b) => b.index - a.index)[0];
  if (!top) return;

  top.dragging = true;

  if (top.name === 'Group' && top.children) {
    top.children.forEach((child) => {
      child.offsetX = child.x ? evt.offsetX - child.x : evt.offsetX;
      child.offsetY = child.y ? evt.offsetY - child.y : evt.offsetY;
    });
  } else {
    top.offsetX = top.x ? evt.offsetX - top.x : evt.offsetX;
    top.offsetY = top.y ? evt.offsetY - top.y : evt.offsetY;
  }
}

/**
 * mousemove 时调用:
 * 根据拖拽 offset 更新坐标,然后重绘。
 */
export function handleDragMove(
  currentTarget: ChildType,
  stage: Stage,
  evt: MouseEvent,
  container: Container,
) {
  if (!currentTarget.draggable || !currentTarget.dragging) return;

  const rect = stage.canvas?.canvas?.getBoundingClientRect();
  const x = rect?.left ? evt.clientX - rect.left : evt.clientX;
  const y = rect?.top ? evt.clientY - rect.top : evt.clientY;

  const applyDrag = (node: ChildType) => {
    node.x = node.offsetX ? x - node.offsetX : x;
    node.y = node.offsetY ? y - node.offsetY : y;
  };

  if (currentTarget.name === 'Group' && currentTarget.children) {
    currentTarget.children.forEach(applyDrag);
  } else {
    applyDrag(currentTarget);
  }

  container.batchDraw(stage);
}

/**
 * mouseup 时调用:释放拖拽状态。
 */
export function handleDragEnd(currentTarget: ChildType) {
  if (currentTarget.draggable) {
    currentTarget.dragging = false;
  }
}
