---
group:
  title: 图形
  order: 2

toc: content
order: 6
---

# Custom

## 描述

通过传入 `Path2D` 对象绘制任意自定义图形,支持填充、描边和阴影。适合绘制 SVG 路径、爱心、星星等不规则形状。

## 核心使用

```tsx
import { Custom, Text, Stage, useResizeObserver } from 'heitu';
import React, { useLayoutEffect, useRef } from 'react';

export default () => {
  const _stage = new Stage();
  const container = useRef<HTMLElement | null>(null);

  // 爱心路径
  const heart = new Path2D();
  heart.moveTo(120, 120);
  heart.bezierCurveTo(120, 90, 60, 60, 60, 100);
  heart.bezierCurveTo(60, 160, 120, 180, 120, 210);
  heart.bezierCurveTo(120, 180, 180, 160, 180, 100);
  heart.bezierCurveTo(180, 60, 120, 90, 120, 120);

  const _heart = new Custom({
    path2D: heart,
    fillStyle: '#F43F5E',
    strokeStyle: '#E11D48',
    lineWidth: 2,
    shadowColor: 'rgba(244,63,94,0.3)', shadowBlur: 16, shadowOffsetY: 4,
  });
  const _heartLabel = new Text({
    content: 'Heart', x: 120, y: 225, fontSize: 12, fillStyle: '#64748B', textAlign: 'center',
  });

  // 五角星路径
  const star = new Path2D();
  const cx = 320, cy = 130, outerR = 45, innerR = 20;
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const method = i === 0 ? 'moveTo' : 'lineTo';
    star[method](cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  star.closePath();

  const _star = new Custom({
    path2D: star,
    fillStyle: '#F59E0B',
    strokeStyle: '#D97706',
    lineWidth: 2,
    shadowColor: 'rgba(245,158,11,0.3)', shadowBlur: 16, shadowOffsetY: 4,
  });
  const _starLabel = new Text({
    content: 'Star', x: 320, y: 225, fontSize: 12, fillStyle: '#64748B', textAlign: 'center',
  });

  // 菱形路径
  const diamond = new Path2D();
  diamond.moveTo(500, 85);
  diamond.lineTo(550, 130);
  diamond.lineTo(500, 175);
  diamond.lineTo(450, 130);
  diamond.closePath();

  const _diamond = new Custom({
    path2D: diamond,
    fillStyle: '#8B5CF6',
    strokeStyle: '#7C3AED',
    lineWidth: 2,
    shadowColor: 'rgba(139,92,246,0.3)', shadowBlur: 16, shadowOffsetY: 4,
  });
  const _diamondLabel = new Text({
    content: 'Diamond', x: 500, y: 225, fontSize: 12, fillStyle: '#64748B', textAlign: 'center',
  });

  _stage.add(_heart, _heartLabel, _star, _starLabel, _diamond, _diamondLabel);

  useLayoutEffect(() => {
    _stage.buildContentDOM({
      container: container.current,
      backgroundColor: '#F8FAFC',
      height: 260,
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

| 参数          | 说明                   | 类型      | 默认值        |
| ------------- | ---------------------- | --------- | ------------- |
| path2D        | 自定义图形的 Path2D    | `Path2D`  | - (必填)      |
| fillStyle     | 填充颜色               | `string`  | -             |
| strokeStyle   | 描边颜色               | `string`  | -             |
| lineWidth     | 描边宽度               | `number`  | `1`           |
| index         | 层级                   | `number`  | -             |
| shadowColor   | 阴影颜色               | `string`  | `transparent` |
| shadowBlur    | 阴影模糊度             | `number`  | `0`           |
| shadowOffsetX | 阴影水平偏移           | `number`  | `0`           |
| shadowOffsetY | 阴影垂直偏移           | `number`  | `0`           |
