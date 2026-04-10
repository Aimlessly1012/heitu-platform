---
group:
  title: Element
  order: 2

toc: content
order: 2
---

# useElementSize

## 描述

实时获取 DOM 元素的宽高,尺寸变化时自动更新。

## 演示

```tsx
import React, { useRef } from 'react';
import { useElementSize } from 'heitu';

export default () => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const size = useElementSize(ref);

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 400 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, padding: '8px 12px', background: '#EEF2FF', borderRadius: 6, textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>width: </span>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#4F46E5', fontFamily: 'monospace' }}>{Math.round(size.width)}</span>
        </div>
        <div style={{ flex: 1, padding: '8px 12px', background: '#EEF2FF', borderRadius: 6, textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>height: </span>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#4F46E5', fontFamily: 'monospace' }}>{Math.round(size.height)}</span>
        </div>
      </div>
      <textarea
        ref={ref}
        defaultValue="Drag the bottom-right corner to resize"
        style={{
          width: '100%', minHeight: 100, padding: 12,
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

| name | description        | type              | default |
| ---- | ------------------ | ----------------- | ------- |
| ref  | 需要处理的元素 ref | `RefObject<Element>` | -    |
