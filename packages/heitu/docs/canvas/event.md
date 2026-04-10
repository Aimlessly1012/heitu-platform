---
group:
  title: 事件
  order: 3

toc: content
order: 1
---

# Event

## 描述

使用 `on` 方法为图形绑定事件,使用 `off` 方法解绑。支持 click / mousedown / mousemove / mouseup / mouseenter / mouseleave / contextmenu 等标准鼠标事件。

## 给图形添加事件监听

```tsx
import { Circle, Text, Stage, useResizeObserver } from 'heitu';
import React, { useLayoutEffect, useRef, useState } from 'react';

const EVENT_COLORS: Record<string, string> = {
  click: '#4F46E5',
  mousedown: '#F59E0B',
  mouseup: '#10B981',
  mouseenter: '#06B6D4',
  'contextmenu': '#F43F5E',
};

export default () => {
  const [log, setLog] = useState('Click or hover the circle');
  const [eventColor, setEventColor] = useState('#94A3B8');
  const _stage = new Stage();
  const container = useRef<HTMLElement | null>(null);

  const _circle = new Circle({
    x: 200, y: 120, radius: 55,
    strokeStyle: '#4F46E5', fillStyle: '#EEF2FF',
    lineWidth: 2, border: 2,
    shadowColor: 'rgba(79,70,229,0.15)', shadowBlur: 20, shadowOffsetY: 4,
  });

  const _hint = new Text({
    content: 'Interact with me', x: 200, y: 115,
    fontSize: 12, fillStyle: '#4F46E5', textAlign: 'center',
  });

  const handleEvent = (name: string) => {
    setLog(name);
    setEventColor(EVENT_COLORS[name] || '#94A3B8');
  };

  _circle.on('click', () => handleEvent('click'));
  _circle.on('mousedown', () => handleEvent('mousedown'));
  _circle.on('mouseup', () => handleEvent('mouseup'));
  _circle.on('mouseenter', () => handleEvent('mouseenter'));
  _circle.on('contextmenu', () => handleEvent('contextmenu'));

  _stage.add(_circle, _hint);

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
      <div style={{ padding: '10px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: eventColor, display: 'inline-block' }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: eventColor, fontFamily: 'monospace' }}>{log}</span>
      </div>
      <div ref={container} />
    </div>
  );
};
```

## API

### on(eventType, handler)

绑定事件监听。

| 参数      | 说明       | 类型                                          |
| --------- | ---------- | --------------------------------------------- |
| eventType | 事件名称   | `string` (click / mousedown / mouseup / ...)  |
| handler   | 回调函数   | `(evt: MouseEvent, node?: Shape) => void`     |

### off(eventType?, handler?)

解绑事件监听。不传参数则移除所有事件。

| 参数      | 说明                     | 类型                                      |
| --------- | ------------------------ | ----------------------------------------- |
| eventType | 事件名称(可选)          | `string`                                  |
| handler   | 要移除的回调函数(可选)   | `(evt: MouseEvent, node?: Shape) => void` |
