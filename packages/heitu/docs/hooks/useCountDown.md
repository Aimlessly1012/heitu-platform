---
group:
  title: State
  order: 1

toc: content
order: 2
---

# useCountDown

## 描述

倒计时 Hook,到 0 自动停止。支持开始/暂停/继续。

## 演示

```tsx
import React from 'react';
import { useCountDown } from 'heitu';

const styles = {
  card: { padding: 24, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 360, textAlign: 'center' as const },
  timer: { fontSize: 56, fontWeight: 700, color: '#4F46E5', fontFamily: 'monospace', lineHeight: 1, margin: '16px 0' },
  sub: { fontSize: 13, color: '#94A3B8', marginBottom: 20 },
  row: { display: 'flex', gap: 8, justifyContent: 'center' },
  btn: { padding: '8px 20px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  primary: { background: '#4F46E5', color: '#fff' },
  success: { background: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0' },
  warning: { background: '#FFFBEB', color: '#F59E0B', border: '1px solid #FDE68A' },
};

export default () => {
  const [seconds, startCountDown, stopCountDown] = useCountDown();
  const isRunning = seconds > 0;

  return (
    <div style={styles.card}>
      <div style={styles.timer}>{seconds}</div>
      <div style={styles.sub}>{isRunning ? 'counting...' : 'ready'}</div>
      <div style={styles.row}>
        <button style={{ ...styles.btn, ...styles.primary }} onClick={() => startCountDown(60)}>
          60s
        </button>
        <button style={{ ...styles.btn, ...styles.warning }} onClick={stopCountDown} disabled={!isRunning}>
          Pause
        </button>
        <button style={{ ...styles.btn, ...styles.success }} onClick={() => startCountDown()} disabled={!isRunning}>
          Resume
        </button>
      </div>
    </div>
  );
};
```

## API

### 返回值

| 参数           | 说明                                      | 类型                    | 默认值 |
| -------------- | ----------------------------------------- | ----------------------- | ------ |
| seconds        | 当前剩余秒数,到 0 自动停止                | `number`                | 0      |
| startCountDown | 开始倒计时,传参重置为指定秒数,不传则继续 | `(num?: number) => void` | -      |
| stopCountDown  | 暂停/停止倒计时,清理内部计时器            | `() => void`            | -      |
