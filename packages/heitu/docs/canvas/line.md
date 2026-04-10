---
group:
  title: 图形
  order: 2

toc: content
order: 2
---

# Line

## 描述

基于 Canvas 绘制线条,支持直线、折线、二次贝塞尔曲线、三次贝塞尔曲线,以及虚线样式。

## 核心使用

```tsx
import { Line, Circle, Text, Stage, useResizeObserver } from 'heitu';
import React, { useLayoutEffect, useRef } from 'react';

export default () => {
  const _stage = new Stage();
  const container = useRef<HTMLElement | null>(null);

  const labelColor = '#64748B';

  // ── 1. Straight ──
  const straightLine = new Line({
    start: { x: 40, y: 40 },
    end: { x: 220, y: 40 },
    strokeStyle: '#4F46E5', lineWidth: 2,
  });
  const straightLabel = new Text({
    content: 'Straight', x: 235, y: 32, fontSize: 12, fillStyle: labelColor,
  });

  // ── 2. Dashed ──
  const dashedLine = new Line({
    start: { x: 40, y: 85 },
    end: { x: 220, y: 85 },
    strokeStyle: '#F59E0B', lineWidth: 2, lineDash: [8, 4],
  });
  const dashedLabel = new Text({
    content: 'Dashed [8,4]', x: 235, y: 77, fontSize: 12, fillStyle: labelColor,
  });

  // ── 3. Polyline ──
  const polyline = new Line({
    start: { x: 40, y: 145 },
    points: [100, 115, 160, 175, 220, 115],
    end: { x: 300, y: 145 },
    strokeStyle: '#10B981', lineWidth: 2,
  });
  const polyLabel = new Text({
    content: 'Polyline', x: 310, y: 137, fontSize: 12, fillStyle: labelColor,
  });

  // ── 4. Quadratic Bezier ──
  const quadCurve = new Line({
    start: { x: 40, y: 220 },
    points: [170, 160],
    end: { x: 300, y: 220 },
    strokeStyle: '#F43F5E', lineWidth: 2, smooth: true,
  });
  const ctrlDot1 = new Circle({
    x: 170, y: 160, radius: 4, fillStyle: '#F43F5E', border: 0,
  });
  const quadLabel = new Text({
    content: 'Quadratic', x: 310, y: 212, fontSize: 12, fillStyle: labelColor,
  });

  // ── 5. Cubic Bezier ──
  const cubicCurve = new Line({
    start: { x: 40, y: 300 },
    points: [100, 240, 240, 360],
    end: { x: 300, y: 300 },
    strokeStyle: '#8B5CF6', lineWidth: 3, smooth: true,
  });
  const ctrlDot2 = new Circle({
    x: 100, y: 240, radius: 4, fillStyle: '#8B5CF6', border: 0,
  });
  const ctrlDot3 = new Circle({
    x: 240, y: 360, radius: 4, fillStyle: '#8B5CF6', border: 0,
  });
  const cubicLabel = new Text({
    content: 'Cubic', x: 310, y: 292, fontSize: 12, fillStyle: labelColor,
  });

  // ── 6. Glow ──
  const glowLine = new Line({
    start: { x: 40, y: 390 },
    end: { x: 300, y: 390 },
    strokeStyle: '#06B6D4', lineWidth: 4,
    shadowColor: 'rgba(6,182,212,0.5)', shadowBlur: 12, shadowOffsetY: 3,
  });
  const glowLabel = new Text({
    content: 'Glow / Shadow', x: 310, y: 382, fontSize: 12, fillStyle: labelColor,
  });

  _stage.add(
    straightLine, straightLabel,
    dashedLine, dashedLabel,
    polyline, polyLabel,
    quadCurve, ctrlDot1, quadLabel,
    cubicCurve, ctrlDot2, ctrlDot3, cubicLabel,
    glowLine, glowLabel,
  );

  useLayoutEffect(() => {
    _stage.buildContentDOM({
      container: container.current,
      height: 430,
      backgroundColor: '#F8FAFC',
    });
    return () => _stage.destroy();
  }, []);

  useResizeObserver(container, () => _stage._resizeDOM());
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <div ref={container} />
    </div>
  );
};
```

## API

| 参数          | 说明                                               | 类型                           | 默认值    |
| ------------- | -------------------------------------------------- | ------------------------------ | --------- |
| start         | 起始点坐标                                         | `{ x: number; y: number }`    | `{10,10}` |
| end           | 终点坐标                                           | `{ x: number; y: number }`    | `{100,100}` |
| points        | 中间点:直线模式为折线顶点;`smooth` 模式为控制点   | `number[]`                     | `[]`      |
| smooth        | `false` 折线,`true` 贝塞尔(2 个值=二次,4 个值=三次) | `boolean`                    | `false`   |
| strokeStyle   | 线条颜色                                           | `string`                       | `black`   |
| lineWidth     | 线条宽度                                           | `number`                       | `1`       |
| lineDash      | 虚线模式 `[线段, 间隙]`                            | `[number, number]`             | `[]`      |
| lineCap       | 端点样式                                           | `'butt' \| 'round' \| 'square'` | `butt`  |
| lineJoin      | 连接样式                                           | `'miter' \| 'round'`          | `miter`   |
| index         | 层级                                               | `number`                       | `0`       |
| shadowColor   | 阴影颜色                                           | `string`                       | -         |
| shadowBlur    | 阴影模糊度                                         | `number`                       | `0`       |
| shadowOffsetX | 阴影水平偏移                                       | `number`                       | `0`       |
| shadowOffsetY | 阴影垂直偏移                                       | `number`                       | `0`       |
