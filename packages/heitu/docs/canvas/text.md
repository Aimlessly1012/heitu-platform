---
group:
  title: 图形
  order: 2

toc: content
order: 4
---

# Text

## 描述

基于 Canvas 绘制的文本,支持字体、颜色、对齐方式和阴影等配置。

## 核心使用

```tsx
import { Text, Rect, Stage, useResizeObserver } from 'heitu';
import React, { useLayoutEffect, useRef } from 'react';

export default () => {
  const _stage = new Stage();
  const container = useRef<HTMLElement | null>(null);

  // 大标题
  const _text1 = new Text({
    content: 'Hello HeiTu',
    x: 40, y: 40,
    fontSize: 26, fillStyle: '#4F46E5',
  });

  // 带阴影文本
  const _text2 = new Text({
    content: 'Text with Shadow',
    x: 40, y: 90,
    fontSize: 18, fillStyle: '#1E293B',
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowBlur: 6, shadowOffsetX: 2, shadowOffsetY: 2,
  });

  // 描述文本
  const _text3 = new Text({
    content: 'Supports font, color, alignment and shadow.',
    x: 40, y: 130,
    fontSize: 13, fillStyle: '#94A3B8',
  });

  // 可拖拽标签
  const _tagBg = new Rect({
    x: 40, y: 170, width: 160, height: 32,
    fillStyle: '#EEF2FF', radius: 16,
    draggable: true,
  });
  const _text4 = new Text({
    content: 'Drag me around',
    x: 54, y: 178,
    fontSize: 13, fillStyle: '#4F46E5',
    draggable: true,
  });

  _stage.add(_text1, _text2, _text3, _tagBg, _text4);

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
      <div ref={container} />
    </div>
  );
};
```

## API

| 参数          | 说明         | 类型                 | 默认值     |
| ------------- | ------------ | -------------------- | ---------- |
| content       | 文本内容     | `string`             | -          |
| x             | x 坐标       | `number`             | `100`      |
| y             | y 坐标       | `number`             | `100`      |
| fontSize      | 字体大小(px) | `number`             | `14`       |
| fontFamily    | 字体         | `string`             | `微软雅黑` |
| fillStyle     | 文字颜色     | `string`             | `#333`     |
| textAlign     | 水平对齐     | `CanvasTextAlign`    | `left`     |
| textBaseline  | 基线对齐     | `CanvasTextBaseline` | `top`      |
| draggable     | 是否可拖拽   | `boolean`            | `false`    |
| index         | 层级         | `number`             | -          |
| shadowColor   | 阴影颜色     | `string`             | -          |
| shadowBlur    | 阴影模糊度   | `number`             | `0`        |
| shadowOffsetX | 阴影水平偏移 | `number`             | `0`        |
| shadowOffsetY | 阴影垂直偏移 | `number`             | `0`        |
