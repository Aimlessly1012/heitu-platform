---
group:
  title: 图形
  order: 2

toc: content
order: 1
---

# Rect

## 描述

基于 canvas 绘制的矩形

## 核心使用

```tsx
import { Rect, Text, Stage, useResizeObserver } from 'heitu';
import React, { useLayoutEffect, useRef } from 'react';

export default () => {
  const _stage = new Stage();
  const container = useRef<HTMLElement | null>(null);

  // 基础矩形
  const _rect = new Rect({
    fillStyle: '#4F46E5',
    x: 40, y: 50, width: 120, height: 90,
    radius: 8,
  });
  const _label1 = new Text({
    content: 'Basic', x: 100, y: 150, fontSize: 12, fillStyle: '#64748B', textAlign: 'center',
  });

  // 带阴影 + 圆角矩形
  const _rect1 = new Rect({
    shadowColor: 'rgba(79,70,229,0.3)',
    shadowBlur: 20,
    shadowOffsetX: 4,
    shadowOffsetY: 8,
    fillStyle: '#818CF8',
    x: 210, y: 50, width: 120, height: 90,
    radius: 12,
  });
  const _label2 = new Text({
    content: 'Shadow + Radius', x: 270, y: 150, fontSize: 12, fillStyle: '#64748B', textAlign: 'center',
  });

  // 描边矩形
  const _rect2 = new Rect({
    fillStyle: '#EEF2FF',
    strokeStyle: '#4F46E5',
    lineWidth: 2,
    x: 380, y: 50, width: 120, height: 90,
    radius: 8,
  });
  const _label3 = new Text({
    content: 'Stroke', x: 440, y: 150, fontSize: 12, fillStyle: '#64748B', textAlign: 'center',
  });

  _stage.add(_rect, _label1, _rect1, _label2, _rect2, _label3);

  useLayoutEffect(() => {
    _stage.buildContentDOM({
      container: container.current,
      backgroundColor: '#F8FAFC',
      height: 200,
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

| name          | description  | type                                 | default |
| ------------- | ------------ | ------------------------------------ | ------- |
| x             | x 坐标       | number                               | 0       |
| y             | y 坐标       | number                               | 0       |
| width         | 宽度         | number                               | 0       |
| height        | 高度         | number                               | 0       |
| fillStyle     | 填充颜色     | string                               | #000    |
| strokeStyle   | 描边颜色     | string                               | #000    |
| lineWidth     | 描边宽度     | number                               | 1       |
| draggable     | 是否可拖动   | (evt: MouseEvent) => void / boolean; | false   |
| index         | 层级         | number                               | 1       |
| radius        | 圆角         | number                               | -       |
| shadowColor   | 阴影颜色     | string                               | -       |
| shadowBlur    | 阴影模糊度   | number                               | -       |
| shadowOffsetX | 阴影水平偏移 | number                               | -       |
| shadowOffsetY | 阴影垂直偏移 | number                               | -       |
