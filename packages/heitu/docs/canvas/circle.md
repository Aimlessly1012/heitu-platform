---
group:
  title: 图形
  order: 2

toc: content
order: 3
---

# Circle

## 描述

基于 canvas 绘制的圆形圆弧

## 核心使用

```tsx
import { Circle, Text, Stage, useResizeObserver } from 'heitu';
import React, { useLayoutEffect, useRef } from 'react';

export default () => {
  const _stage = new Stage();
  const container = useRef<HTMLElement | null>(null);

  // 填充圆形
  const _circle1 = new Circle({
    x: 80, y: 90, radius: 45,
    fillStyle: '#10B981', border: 0,
    shadowColor: 'rgba(16,185,129,0.25)', shadowBlur: 12, shadowOffsetY: 4,
  });
  const _label1 = new Text({
    content: 'Fill', x: 80, y: 150, fontSize: 12, fillStyle: '#64748B', textAlign: 'center',
  });

  // 描边 + 填充
  const _circle2 = new Circle({
    x: 220, y: 90, radius: 45,
    strokeStyle: '#4F46E5', fillStyle: '#EEF2FF',
    lineWidth: 2, border: 2,
  });
  const _label2 = new Text({
    content: 'Stroke + Fill', x: 220, y: 150, fontSize: 12, fillStyle: '#64748B', textAlign: 'center',
  });

  // 圆弧
  const _circle3 = new Circle({
    x: 370, y: 90, radius: 45,
    strokeStyle: '#F59E0B', fillStyle: '#FFFBEB',
    lineWidth: 3, border: 0,
    startAngle: 200, endAngle: 320,
  });
  const _label3 = new Text({
    content: 'Arc', x: 370, y: 150, fontSize: 12, fillStyle: '#64748B', textAlign: 'center',
  });

  _stage.add(_circle1, _label1, _circle2, _label2, _circle3, _label3);

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

| name          | description                            | type                                 | default |
| ------------- | -------------------------------------- | ------------------------------------ | ------- |
| x             | x 坐标                                 | number                               | 0       |
| y             | y 坐标                                 | number                               | 0       |
| fillStyle     | 填充颜色                               | string                               | #000    |
| strokeStyle   | 描边颜色                               | string                               | #000    |
| lineWidth     | 描边宽度                               | number                               | 1       |
| draggable     | 是否可拖动                             | (evt: MouseEvent) => void / boolean; | false   |
| radius        | 半径                                   | number                               | 0       |
| startAngle    | 起始角度                               | number                               | 0       |
| endAngle      | 结束角度                               | number                               | 0       |
| border        | 边框 // 0 填充 1 只有边框 2 边框和填充 | number                               | 0       |
| index         | 层级                                   | number                               | 1       |
| shadowColor   | 阴影颜色                               | string                               | -       |
| shadowBlur    | 阴影模糊度                             | number                               | -       |
| shadowOffsetX | 阴影水平偏移                           | number                               | -       |
| shadowOffsetY | 阴影垂直偏移                           | number                               | -       |
