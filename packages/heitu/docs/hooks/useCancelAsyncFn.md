---
group:
  title: Request
  order: 3

toc: content
order: 3
---

# useCancelAsyncFn

## 描述

- 一个用于管理可取消异步请求的 Hook，特别适用于搜索、列表加载等需要取消前一个请求的场景。

- 调试请将 network 改为 slow 4G

## 特性

- 自动取消前一个未完成的请求
- 支持 AbortController 取消机制
- 适配 axios 请求
- 防止竞态条件
- 自动管理加载状态

## 演示

```tsx
import React from 'react';
import { useCancelAsyncFn, useHtAxios } from 'heitu';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 480 },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  result: { padding: '12px 14px', background: '#fff', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14, fontWeight: 600, color: '#1E293B', fontFamily: 'monospace', marginBottom: 16, minHeight: 42, display: 'flex', alignItems: 'center', gap: 8 },
  hint: { fontSize: 12, color: '#94A3B8', marginBottom: 16 },
  btn: { padding: '8px 20px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: '#4F46E5', color: '#fff' },
};

export default () => {
  const htAxios = useHtAxios({
    config: { timeout: 10000 },
    responseInterceptorsCallBack: (response) => response.data,
  });

  const [{ loading, value }, fetchList] = useCancelAsyncFn(
    async ({ signal }) => {
      const data = await htAxios.get(
        'https://jsonplaceholder.typicode.com/posts',
        {},
        { signal },
      );
      return data;
    },
    [],
  );

  const count = Array.isArray(value) ? value.length : 0;

  return (
    <div style={styles.card}>
      <div style={{ ...styles.tag, background: loading ? '#FFFBEB' : count > 0 ? '#ECFDF5' : '#F1F5F9', color: loading ? '#F59E0B' : count > 0 ? '#10B981' : '#94A3B8' }}>
        <span style={{ ...styles.dot, background: loading ? '#F59E0B' : count > 0 ? '#10B981' : '#94A3B8' }} />
        {loading ? 'Fetching...' : count > 0 ? 'Loaded' : 'Ready'}
      </div>

      <div style={styles.result}>
        <span style={{ color: '#64748B', fontWeight: 400, fontSize: 13 }}>Posts:</span>
        <span style={{ color: '#4F46E5', fontSize: 20 }}>{count}</span>
      </div>

      <div style={styles.hint}>调试请将 Network 改为 Slow 4G，连续点击可观察请求自动取消</div>

      <button
        style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
        onClick={() => fetchList()}
        disabled={loading}
      >
        {loading ? 'Fetching...' : 'Fetch Posts'}
      </button>
    </div>
  );
};
```

## API

### 参数

| 参数         | 说明                                          | 类型                                                         | 默认值               |
| ------------ | --------------------------------------------- | ------------------------------------------------------------ | -------------------- |
| fn           | 异步函数，接收 cancelInterceptor 用于取消请求 | `(context: { cancelInterceptor: () => void }) => Promise<T>` | -                    |
| deps         | 依赖数组                                      | `any[]`                                                      | `[]`                 |
| initialState | 初始状态                                      | `{ loading?: boolean; error?: Error; value?: T }`            | `{ loading: false }` |

### 返回值

| 参数    | 说明         | 类型                                             |
| ------- | ------------ | ------------------------------------------------ |
| state   | 异步操作状态 | `{ loading: boolean; error?: Error; value?: T }` |
| execute | 执行异步函数 | `() => Promise<T>`                               |

### State 状态

| 字段    | 说明         | 类型                 |
| ------- | ------------ | -------------------- |
| loading | 是否正在加载 | `boolean`            |
| error   | 错误信息     | `Error \| undefined` |
| value   | 请求结果     | `T \| undefined`     |
