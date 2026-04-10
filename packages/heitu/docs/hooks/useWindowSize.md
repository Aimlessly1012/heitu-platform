---
group:
  title: Element
  order: 2

toc: content
order: 5
---

# useWindowSize

## 描述

实时获取窗口尺寸,resize 时自动更新。SSR 安全(返回 0)。

## 演示

```tsx
import React from 'react';
import { useWindowSize } from 'heitu';

export default () => {
  const { width, height } = useWindowSize();

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 360 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, padding: 16, background: '#EEF2FF', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#4F46E5', fontFamily: 'monospace' }}>{width}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>width</div>
        </div>
        <div style={{ flex: 1, padding: 16, background: '#EEF2FF', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#4F46E5', fontFamily: 'monospace' }}>{height}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>height</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 12, textAlign: 'center' }}>
        Resize the browser window to see updates
      </div>
    </div>
  );
};
```

## return

| name   | description                   | type     |
| ------ | ----------------------------- | -------- |
| width  | 窗口宽度,SSR 环境返回 0       | `number` |
| height | 窗口高度,SSR 环境返回 0       | `number` |
