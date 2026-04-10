---
group:
  title: 事件
  order: 3

toc: content
order: 2
---

# Drag

## 描述

为图形启用拖拽能力。设置 `draggable: true` 即可拖动,也可以传入函数在拖拽过程中获取实时坐标。

## 演示

```tsx
import { Circle, Rect, Text, Stage, useResizeObserver } from 'heitu';
import React, { useLayoutEffect, useRef, useState } from 'react';

export default () => {
  const [pos, setPos] = useState({ x: 250, y: 120 });
  const _stage = new Stage();
  const container = useRef<HTMLElement | null>(null);

  // draggable: true — 简单拖拽
  const _rect = new Rect({
    x: 60, y: 80, width: 90, height: 90,
    fillStyle: '#4F46E5', radius: 10,
    draggable: true,
    shadowColor: 'rgba(79,70,229,0.25)', shadowBlur: 14, shadowOffsetY: 4,
  });
  const _rectLabel = new Text({
    content: 'boolean', x: 105, y: 180, fontSize: 11, fillStyle: '#64748B', textAlign: 'center',
  });

  // draggable: function — 拖拽时回调坐标
  const _circle = new Circle({
    x: 250, y: 120, radius: 45,
    fillStyle: '#F43F5E', border: 0,
    draggable: (evt, node) => {
      setPos({ x: Math.round(node.x), y: Math.round(node.y) });
    },
    shadowColor: 'rgba(244,63,94,0.25)', shadowBlur: 14, shadowOffsetY: 4,
  });
  const _circleLabel = new Text({
    content: 'callback', x: 250, y: 180, fontSize: 11, fillStyle: '#64748B', textAlign: 'center',
  });

  _stage.add(_rect, _rectLabel, _circle, _circleLabel);

  useLayoutEffect(() => {
    _stage.buildContentDOM({
      container: container.current,
      backgroundColor: '#F8FAFC',
      height: 240,
    });
    return () => _stage.destroy();
  }, []);

  useResizeObserver(container, () => _stage._resizeDOM());
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <div style={{ padding: '10px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 12, color: '#64748B' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#4F46E5', marginRight: 6, verticalAlign: 'middle' }} />
          Rect: <code style={{ color: '#4F46E5' }}>draggable: true</code>
        </span>
        <span style={{ fontSize: 12, color: '#64748B' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#F43F5E', marginRight: 6, verticalAlign: 'middle' }} />
          Circle: <code style={{ color: '#F43F5E' }}>x={pos.x} y={pos.y}</code>
        </span>
      </div>
      <div ref={container} />
    </div>
  );
};
```

## API

| 参数      | 说明                                     | 类型                                                     | 默认值  |
| --------- | ---------------------------------------- | -------------------------------------------------------- | ------- |
| draggable | `true` 启用拖拽;传函数可在拖拽时回调     | `boolean \| ((evt: MouseEvent, node: Shape) => void)`    | `false` |
