---
group:
  title: effect
  order: 5

toc: content
order: 4
---

# usePolling

## 描述

处理轮询请求的 Hook,支持定时轮询、错误重试、手动控制。

## 演示

```tsx
import React from 'react';
import { usePolling } from 'heitu';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 400 },
  status: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  result: { padding: '12px 14px', background: '#fff', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 15, fontWeight: 600, color: '#4F46E5', fontFamily: 'monospace', marginBottom: 16, minHeight: 42, display: 'flex', alignItems: 'center' },
  row: { display: 'flex', gap: 8 },
  btn: { padding: '8px 16px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  success: { background: '#10B981', color: '#fff' },
  danger: { background: '#EF4444', color: '#fff' },
};

export default () => {
  const { data, loading, state, start, stop } = usePolling(
    () =>
      new Promise<string>((resolve) => {
        setTimeout(() => resolve(`user-${Math.floor(Math.random() * 1000)}`), 500);
      }),
    { interval: 3000, manual: true },
  );

  const isPolling = state === 1;

  return (
    <div style={styles.card}>
      <div style={{ ...styles.status, background: isPolling ? '#ECFDF5' : '#F1F5F9' }}>
        <span style={{ ...styles.dot, background: isPolling ? '#10B981' : '#94A3B8' }} />
        {isPolling ? 'Polling (3s)' : 'Stopped'}
        {loading && <span style={{ color: '#64748B', marginLeft: 4 }}>fetching...</span>}
      </div>

      <div style={styles.result}>
        {data ?? <span style={{ color: '#94A3B8', fontWeight: 400 }}>No data</span>}
      </div>

      <div style={styles.row}>
        <button style={{ ...styles.btn, ...styles.success, opacity: isPolling ? 0.5 : 1 }} onClick={start} disabled={isPolling}>
          Start
        </button>
        <button style={{ ...styles.btn, ...styles.danger, opacity: !isPolling ? 0.5 : 1 }} onClick={stop} disabled={!isPolling}>
          Stop
        </button>
      </div>
    </div>
  );
};
```

## API

### Options

| 参数          | 说明             | 类型                     | 默认值 |
| ------------- | ---------------- | ------------------------ | ------ |
| interval      | 轮询间隔时间(ms) | `number`                 | 3000   |
| manual        | 是否手动控制轮询 | `boolean`                | false  |
| retryTimes    | 失败重试次数     | `number`                 | 0      |
| retryInterval | 重试间隔时间(ms) | `number`                 | 1000   |
| onSuccess     | 成功回调         | `(data: T) => void`      | -      |
| onError       | 失败回调         | `(error: Error) => void` | -      |

### 返回值

| 参数    | 说明           | 类型                 |
| ------- | -------------- | -------------------- |
| data    | 轮询返回的数据 | `T \| undefined`     |
| loading | 加载状态       | `boolean`            |
| error   | 错误信息       | `Error \| undefined` |
| start   | 开始轮询       | `() => void`         |
| stop    | 停止轮询       | `() => void`         |
| state   | 0=stopped 1=polling | `number`        |
