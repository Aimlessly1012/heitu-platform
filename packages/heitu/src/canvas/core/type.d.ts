export interface Vector2d {
  x: number;
  y: number;
}

/** 节点排序时使用的最小接口 */
export interface Node {
  index: number;
  [key: string]: any;
}
