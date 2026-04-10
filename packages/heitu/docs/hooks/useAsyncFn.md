---
group:
  title: effect
  order: 5

toc: content
order: 3
---

# useAsyncFn

## 描述

用于处理异步函数的 Hook,自动管理 loading / error / value 状态,支持竞态取消。

## 演示

### 基础用法

```tsx
import React from 'react';
import { useAsyncFn } from 'heitu';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 400 },
  result: { padding: '12px 14px', background: '#fff', borderRadius: 6, border: '1px solid #E2E8F0', marginBottom: 16, minHeight: 44, display: 'flex', alignItems: 'center', fontSize: 14 },
  btn: { padding: '8px 20px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: '#4F46E5', color: '#fff' },
  spinner: { display: 'inline-block', width: 14, height: 14, border: '2px solid #C7D2FE', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginRight: 8 },
  error: { color: '#EF4444', fontSize: 13 },
  value: { color: '#10B981', fontWeight: 600 },
};

export default () => {
  const [state, execute] = useAsyncFn(
    () => new Promise<number>((resolve) => setTimeout(() => resolve(200), 1000)),
    [],
  );

  return (
    <div style={styles.card}>
      <div style={styles.result}>
        {state.loading && <span style={{ color: '#64748B' }}>Loading...</span>}
        {state.error && <span style={styles.error}>{state.error.message}</span>}
        {!state.loading && state.value !== undefined && (
          <span style={styles.value}>Result: {state.value}</span>
        )}
        {!state.loading && !state.error && state.value === undefined && (
          <span style={{ color: '#94A3B8' }}>Click the button to fetch</span>
        )}
      </div>
      <button style={{ ...styles.btn, opacity: state.loading ? 0.7 : 1 }} onClick={() => execute()} disabled={state.loading}>
        {state.loading ? 'Loading...' : 'Fetch Data'}
      </button>
    </div>
  );
};
```

### 带参数调用

```tsx
import React from 'react';
import { useAsyncFn } from 'heitu';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 400 },
  result: { padding: '12px 14px', background: '#fff', borderRadius: 6, border: '1px solid #E2E8F0', marginBottom: 16, minHeight: 44, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 },
  row: { display: 'flex', gap: 8 },
  btn: { padding: '8px 16px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: '#4F46E5', color: '#fff' },
  tag: { padding: '2px 8px', borderRadius: 4, background: '#EEF2FF', color: '#4F46E5', fontSize: 12, fontWeight: 500 },
};

export default () => {
  const [state, fetchUser] = useAsyncFn(
    (userId: string) =>
      new Promise<{ id: string; name: string }>((resolve) => {
        setTimeout(() => resolve({ id: userId, name: `User-${userId}` }), 800);
      }),
    [],
  );

  return (
    <div style={styles.card}>
      <div style={styles.result}>
        {state.loading && <span style={{ color: '#64748B' }}>Loading...</span>}
        {!state.loading && state.value && (
          <>
            <span style={styles.tag}>#{state.value.id}</span>
            <span style={{ color: '#1E293B', fontWeight: 500 }}>{state.value.name}</span>
          </>
        )}
        {!state.loading && !state.value && <span style={{ color: '#94A3B8' }}>Select a user</span>}
      </div>
      <div style={styles.row}>
        {['101', '202', '303'].map((id) => (
          <button key={id} style={styles.btn} onClick={() => fetchUser(id)}>
            User #{id}
          </button>
        ))}
      </div>
    </div>
  );
};
```

## API

### Params

| 参数         | 说明                     | 类型                                                | 默认值               |
| ------------ | ------------------------ | --------------------------------------------------- | -------------------- |
| fn           | 要执行的异步函数         | `(...args: any[]) => Promise<any>`                  | -                    |
| deps         | 依赖数组                 | `any[]`                                             | `[]`                 |
| initialState | 初始状态                 | `{ loading?: boolean; error?: Error; value?: any }` | `{ loading: false }` |

### Result

| 参数    | 说明                 | 类型                                               |
| ------- | -------------------- | -------------------------------------------------- |
| state   | 异步操作的状态       | `{ loading: boolean; error?: Error; value?: any }` |
| execute | 执行异步函数的触发器 | `(...args: Parameters<typeof fn>) => Promise<any>` |
