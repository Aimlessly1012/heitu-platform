---
group:
  title: effect
  order: 5

toc: content
order: 3
---

# useDeepCompareEffect

## 描述

依赖项使用深度比较而不是引用相等,避免对象/数组引用变化导致的多余副作用执行。

## 演示

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { useDeepCompareEffect } from 'heitu';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 440 },
  row: { display: 'flex', gap: 16, marginBottom: 16 },
  box: { flex: 1, padding: 14, borderRadius: 6, textAlign: 'center' as const },
  count: { fontSize: 28, fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 },
  label: { fontSize: 12, marginTop: 4 },
  btn: { padding: '8px 20px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: '#4F46E5', color: '#fff' },
  hint: { fontSize: 12, color: '#94A3B8', marginTop: 12 },
};

export default () => {
  const [count, setCount] = useState(0);
  const effectRef = useRef(0);
  const deepRef = useRef(0);

  useEffect(() => {
    effectRef.current += 1;
  }, [{ value: 'static' }]);

  useDeepCompareEffect(() => {
    deepRef.current += 1;
  }, [{ value: 'static' }]);

  return (
    <div style={styles.card}>
      <div style={styles.row}>
        <div style={{ ...styles.box, background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <div style={{ ...styles.count, color: '#EF4444' }}>{effectRef.current}</div>
          <div style={{ ...styles.label, color: '#EF4444' }}>useEffect</div>
        </div>
        <div style={{ ...styles.box, background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
          <div style={{ ...styles.count, color: '#10B981' }}>{deepRef.current}</div>
          <div style={{ ...styles.label, color: '#10B981' }}>useDeepCompare</div>
        </div>
      </div>
      <button style={styles.btn} onClick={() => setCount((c) => c + 1)}>
        Re-render ({count})
      </button>
      <div style={styles.hint}>
        deps 都是 {`{ value: 'static' }`},useEffect 每次渲染都触发,useDeepCompareEffect 只触发一次
      </div>
    </div>
  );
};
```

## API

### 参数

| 参数   | 说明       | 类型                                      | 默认值 |
| ------ | ---------- | ----------------------------------------- | ------ |
| effect | 副作用函数 | `() => void \| (() => void \| undefined)` | -      |
| deps   | 依赖数组   | `any[]`                                   | -      |
