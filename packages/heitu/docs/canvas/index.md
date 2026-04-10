---
nav:
  title: Canvas
  order: 3
---

# HeiTu Canvas

## 描述

一个轻量的 HTML5 Canvas 2D 图形框架,提供声明式的图形创建、事件绑定、拖拽和补间动画能力。

## 安装

```bash
npm install heitu
# or
yarn add heitu
# or
pnpm add heitu
```

## 快速上手

```tsx
import {
  Circle, Custom, Rect, Text, Stage, useResizeObserver,
} from 'heitu';
import React, { useLayoutEffect, useRef } from 'react';

export default () => {
  const container = useRef<HTMLElement | null>(null);
  const _stage = new Stage();

  // 矩形
  const _rect = new Rect({
    x: 30, y: 60, width: 120, height: 80,
    fillStyle: '#4F46E5', radius: 10,
    shadowColor: 'rgba(79,70,229,0.25)', shadowBlur: 16, shadowOffsetY: 4,
  });
  const _rectLabel = new Text({
    content: 'Rect', x: 65, y: 150, fontSize: 12, fillStyle: '#64748B',
    textAlign: 'center',
  });

  // 圆形
  const _circle = new Circle({
    x: 240, y: 100, radius: 42,
    fillStyle: '#10B981', border: 0,
    shadowColor: 'rgba(16,185,129,0.25)', shadowBlur: 16, shadowOffsetY: 4,
  });
  const _circleLabel = new Text({
    content: 'Circle', x: 240, y: 150, fontSize: 12, fillStyle: '#64748B',
    textAlign: 'center',
  });

  // 文字
  const _text = new Text({
    content: 'HeiTu Canvas',
    x: 350, y: 85, fontSize: 20, fillStyle: '#1E293B',
  });
  const _textLabel = new Text({
    content: 'Text', x: 350, y: 150, fontSize: 12, fillStyle: '#64748B',
  });

  // 自定义图形 — 爱心
  const heart = new Path2D();
  heart.moveTo(200, 260);
  heart.bezierCurveTo(200, 230, 140, 190, 140, 230);
  heart.bezierCurveTo(140, 290, 200, 310, 200, 340);
  heart.bezierCurveTo(200, 310, 260, 290, 260, 230);
  heart.bezierCurveTo(260, 190, 200, 230, 200, 260);
  const _heart = new Custom({
    path2D: heart,
    fillStyle: '#F43F5E',
    strokeStyle: '#E11D48',
    shadowColor: 'rgba(244,63,94,0.25)', shadowBlur: 16, shadowOffsetY: 4,
  });
  const _heartLabel = new Text({
    content: 'Custom (Path2D)', x: 200, y: 350, fontSize: 12, fillStyle: '#64748B',
    textAlign: 'center',
  });

  _stage.add(_rect, _rectLabel, _circle, _circleLabel, _text, _textLabel, _heart, _heartLabel);

  useLayoutEffect(() => {
    _stage.buildContentDOM({
      container: container.current,
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
