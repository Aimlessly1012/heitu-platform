---
group:
  title: Element
  order: 2

toc: content
order: 1
---

# useResizeObserver

## 描述

用于监听 DOM 元素尺寸变化的 Hook。基于浏览器的 ResizeObserver API，当目标元素尺寸发生变化时触发回调。当 `containerRef`、`callback` 或 `options` 变化时会自动重新订阅;在非浏览器环境(如 SSR)下会跳过执行。

## 演示

```tsx
import React, { useRef, useState } from 'react';
import { useResizeObserver } from 'heitu';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 400 },
  metrics: { display: 'flex', gap: 12, marginBottom: 12 },
  metric: { flex: 1, padding: '8px 12px', background: '#EEF2FF', borderRadius: 6, textAlign: 'center' as const },
  label: { fontSize: 12, color: '#64748B' },
  value: { fontSize: 16, fontWeight: 600, color: '#4F46E5', fontFamily: 'monospace' },
};

export default () => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useResizeObserver(ref, (entries) => {
    const [entry] = entries;
    const { width, height } = entry.contentRect;
    setSize({ width, height });
  });

  return (
    <div style={styles.card}>
      <div style={styles.metrics}>
        <div style={styles.metric}>
          <span style={styles.label}>width: </span>
          <span style={styles.value}>{Math.round(size.width)}</span>
        </div>
        <div style={styles.metric}>
          <span style={styles.label}>height: </span>
          <span style={styles.value}>{Math.round(size.height)}</span>
        </div>
      </div>
      <textarea
        ref={ref}
        defaultValue="Drag the bottom-right corner to resize"
        style={{
          width: '100%', minHeight: 120, padding: 12,
          borderRadius: 6, border: '1px solid #E2E8F0',
          fontSize: 13, color: '#64748B', resize: 'both',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
};
```

## Arguments

| 参数名   | 描述                       | 类型                                                                 | 默认值 |
| -------- | -------------------------- | -------------------------------------------------------------------- | ------ |
| target   | 需要监听尺寸变化的元素引用 | `RefObject<Element> \| Element`                                      | -      |
| callback | 尺寸变化时的回调函数       | `(entries: ResizeObserverEntry[], observer: ResizeObserver) => void` | -      |
| options  | ResizeObserver 的配置选项  | `ResizeObserverOptions`                                              | -      |

## return

| name | description | type | default |
| ---- | ----------- | ---- | ------- |
