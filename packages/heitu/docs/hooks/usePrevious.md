---
group:
  title: effect
  order: 5

toc: content
order: 1
---

# usePrevious

## 描述

返回组件上一次渲染时的值。首次渲染时返回 `undefined`,之后每次渲染返回上一帧的值。类型完全跟随入参,支持泛型推导。

## 演示

```tsx
import React, { useState } from 'react';
import { usePrevious } from 'heitu';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 360 },
  row: { display: 'flex', gap: 16, marginBottom: 16 },
  box: { flex: 1, padding: 14, borderRadius: 6, textAlign: 'center' as const },
  count: { fontSize: 32, fontWeight: 700, fontFamily: 'monospace' },
  label: { fontSize: 12, marginTop: 4 },
  btn: { padding: '8px 20px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: '#4F46E5', color: '#fff' },
};

export default () => {
  const [count, setCount] = useState(0);
  const prev = usePrevious(count);

  return (
    <div style={styles.card}>
      <div style={styles.row}>
        <div style={{ ...styles.box, background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
          <div style={{ ...styles.count, color: '#94A3B8' }}>{prev ?? '-'}</div>
          <div style={{ ...styles.label, color: '#64748B' }}>Previous</div>
        </div>
        <div style={{ ...styles.box, background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
          <div style={{ ...styles.count, color: '#4F46E5' }}>{count}</div>
          <div style={{ ...styles.label, color: '#4F46E5' }}>Current</div>
        </div>
      </div>
      <button style={styles.btn} onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
};
```

## Arguments

| name  | description    | type | default |
| ----- | -------------- | ---- | ------- |
| value | 需要追踪的值   | `T`  | -       |

## return

| name | description                                   | type           |
| ---- | --------------------------------------------- | -------------- |
| prev | 上一次渲染时的值,首次渲染为 `undefined` | `T \| undefined` |
