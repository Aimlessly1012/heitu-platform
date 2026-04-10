---
group:
  title: 动画
  order: 4

toc: content
order: 1
---

# Animate

## 描述

为 Canvas 图形添加补间动画。通过指定起始值、目标值和缓动函数,Animate 会在每帧计算插值并通过 `pushQueue` 回调驱动图形属性更新。

## 演示 — 点击圆形触发动画

```tsx
import { Circle, Text, Stage, Animate, useResizeObserver } from 'heitu';
import React, { useLayoutEffect, useRef } from 'react';

export default () => {
  const _stage = new Stage();
  const container = useRef<HTMLElement | null>(null);

  const _circle = new Circle({
    x: 100, y: 120, radius: 40,
    fillStyle: '#4F46E5', border: 0,
    shadowColor: 'rgba(79,70,229,0.3)', shadowBlur: 20, shadowOffsetY: 4,
  });

  const _hint = new Text({
    content: 'Click to animate', x: 100, y: 115,
    fontSize: 11, fillStyle: '#fff', textAlign: 'center',
  });

  _circle.on('click', () => {
    const ani = new Animate(
      { value: 0 },
      { value: 1 },
      { duration: 800, easing: 'cubicInOut' },
    );
    const startX = _circle.x;
    const startY = _circle.y;
    ani.pushQueue((_, ratio) => {
      _circle.attr({
        x: startX + (350 - startX) * ratio,
        y: startY + (120 - startY) * ratio,
      });
      _hint.attr({
        x: startX + (350 - startX) * ratio,
        y: startY + (120 - startY) * ratio - 5,
      });
    });
    ani.start();
  });

  _stage.add(_circle, _hint);

  useLayoutEffect(() => {
    _stage.buildContentDOM({
      container: container.current,
      backgroundColor: '#F8FAFC',
      height: 240,
    });

    // 入场动画 — 半径从 0 到 40
    const entry = new Animate(
      { value: 0 },
      { value: 40 },
      { duration: 600, easing: 'backOut' },
    );
    entry.pushQueue((props) => {
      _circle.attr({ radius: props.value });
    });
    entry.start();

    return () => _stage.destroy();
  }, []);

  useResizeObserver(container, () => _stage._resizeDOM());
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <div style={{ padding: '8px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0', fontSize: 12, color: '#64748B' }}>
        Click the circle to trigger a cubic easing animation
      </div>
      <div ref={container} />
    </div>
  );
};
```

## API

### `new Animate(startProp, targetProp, config)`

| 参数       | 说明           | 类型                       |
| ---------- | -------------- | -------------------------- |
| startProp  | 起始属性值     | `Record<string, number>`   |
| targetProp | 目标属性值     | `Record<string, number>`   |
| config     | 动画配置       | `AnimateConfig`            |

### AnimateConfig

| 参数           | 说明                           | 类型       | 默认值     |
| -------------- | ------------------------------ | ---------- | ---------- |
| duration       | 动画时长(ms)                   | `number`   | `1000`     |
| easing         | 缓动函数名                     | `string`   | `linear`   |
| iterationCount | 循环次数,`Infinity` 表示无限  | `number`   | `1`        |

### 实例方法

| 方法      | 说明                                                   | 类型                                                     |
| --------- | ------------------------------------------------------ | -------------------------------------------------------- |
| start     | 启动动画                                               | `() => void`                                             |
| stop      | 停止动画                                               | `() => void`                                             |
| pushQueue | 注册每帧回调,参数为当前插值属性和进度比(0~1)          | `(cb: (props: Record<string, number>, ratio: number) => void) => void` |

### 可用缓动函数

`linear` / `quadraticIn` / `quadraticOut` / `quadraticInOut` / `cubicIn` / `cubicOut` / `cubicInOut` / `backIn` / `backOut` / `backInOut` / `bounceIn` / `bounceOut` / `bounceInOut` / `elasticIn` / `elasticOut` / `elasticInOut` 等。
