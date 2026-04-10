---
group:
  title: 图形
  order: 2

toc: content
order: 5
---

# Group

## 描述

将多个图形编为一组,支持整组拖拽。组内图形共享同一坐标变换,方便批量操作。

## 核心使用

```tsx
import { Group, Text, Circle, Rect, Stage, useResizeObserver } from 'heitu';
import React, { useLayoutEffect, useRef } from 'react';

export default () => {
  const container = useRef<HTMLElement | null>(null);
  const _stage = new Stage();

  // ── 静态编组 ──
  const _circle = new Circle({
    x: 80, y: 80, radius: 40,
    fillStyle: '#818CF8', border: 0,
    shadowColor: 'rgba(129,140,248,0.25)', shadowBlur: 10, shadowOffsetY: 3,
  });
  const _rect = new Rect({
    fillStyle: '#4F46E5', x: 120, y: 60, width: 80, height: 60,
    radius: 8, shadowColor: 'rgba(79,70,229,0.25)', shadowBlur: 10, shadowOffsetY: 3,
  });
  const staticLabel = new Text({
    content: 'Static Group', x: 100, y: 135, fontSize: 12, fillStyle: '#64748B', textAlign: 'center',
  });
  const staticGroup = new Group({});
  staticGroup.add(_circle, _rect);

  // ── 可拖拽编组(卡片) ──
  const card = new Rect({
    fillStyle: '#fff', x: 60, y: 190, width: 220, height: 90,
    shadowColor: 'rgba(0,0,0,0.08)', shadowBlur: 16,
    shadowOffsetX: 0, shadowOffsetY: 4, radius: 10,
  });
  const accent = new Rect({
    fillStyle: '#4F46E5', x: 60, y: 190, width: 4, height: 90,
    radius: 2,
  });
  const title = new Text({ content: 'Draggable Card', x: 80, y: 208, fontSize: 15, fillStyle: '#1E293B' });
  const desc = new Text({ content: 'Drag to move the whole group', x: 80, y: 232, fontSize: 12, fillStyle: '#94A3B8' });
  const dragGroup = new Group({ draggable: true });
  dragGroup.add(card, accent, title, desc);

  _stage.add(staticGroup, staticLabel, dragGroup);

  useLayoutEffect(() => {
    _stage.buildContentDOM({
      container: container.current,
      backgroundColor: '#F8FAFC',
      height: 320,
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

| 参数      | 说明               | 类型                                        | 默认值  |
| --------- | ------------------ | ------------------------------------------- | ------- |
| draggable | 整组是否可拖拽     | `boolean \| ((evt: MouseEvent) => void)`    | `false` |
