---
group:
  title: Request
  order: 3

toc: content
order: 1
---

# useHtAxios

## 描述

基于 axios 封装的请求 Hook,提供统一的拦截器配置和简便的 GET/POST/PUT/DELETE 方法。

## 演示

```tsx
import { useHtAxios } from 'heitu';
import React, { useState } from 'react';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 480 },
  result: { padding: '10px 14px', background: '#fff', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13, color: '#1E293B', marginBottom: 16, minHeight: 60, maxHeight: 160, overflow: 'auto', fontFamily: 'monospace', whiteSpace: 'pre-wrap' as const, wordBreak: 'break-all' as const },
  btn: { padding: '8px 20px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: '#4F46E5', color: '#fff' },
  tag: { display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, marginBottom: 12 },
};

export default () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const htAxios = useHtAxios({
    config: { timeout: 5000 },
    responseInterceptorsCallBack: (response) => response.data,
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await htAxios.get('https://jsonplaceholder.typicode.com/posts', { _limit: 2 });
      setResult(res);
    } catch (e) {
      setResult({ error: (e as Error).message });
    }
    setLoading(false);
  };

  return (
    <div style={styles.card}>
      <div style={{ ...styles.tag, background: loading ? '#FFFBEB' : '#ECFDF5', color: loading ? '#F59E0B' : '#10B981' }}>
        {loading ? 'Fetching...' : 'Ready'}
      </div>
      <div style={styles.result}>
        {result
          ? JSON.stringify(result, null, 2).slice(0, 500)
          : <span style={{ color: '#94A3B8' }}>Response will appear here</span>}
      </div>
      <button style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }} onClick={fetchPosts} disabled={loading}>
        GET /posts
      </button>
    </div>
  );
};
```

## 参数

| 参数名                                 | 描述                   | 类型                                                 | 默认值 |
| -------------------------------------- | ---------------------- | ---------------------------------------------------- | ------ |
| `config`                               | axios 全局配置项       | `AxiosRequestConfig`                                 | `{}`   |
| `requestInterceptorsCallback`          | 请求拦截器回调函数     | `(config: AxiosRequestConfig) => AxiosRequestConfig` | -      |
| `responseInterceptorOnSuccessCallback` | 响应成功拦截器回调函数 | `(response: AxiosResponse) => AxiosResponse`         | -      |
| `responseInterceptorOnErrorCallback`   | 响应错误拦截器回调函数 | `(error: any) => any`                                | -      |

## 返回值

| 名称   | 描述            | 类型                                                                            |
| ------ | --------------- | ------------------------------------------------------------------------------- |
| `get`  | GET 请求方法    | `<T, R>(url: string, data: T, config?: AxiosRequestConfig) => AxiosPromise<R>`  |
| `post` | POST 请求方法   | `<T, R>(url: string, data?: T, config?: AxiosRequestConfig) => AxiosPromise<R>` |
| `put`  | PUT 请求方法    | `<T, R>(url: string, data?: T, config?: AxiosRequestConfig) => AxiosPromise<R>` |
| `del`  | DELETE 请求方法 | `<T, R>(url: string, data: T, config?: AxiosRequestConfig) => AxiosPromise<R>`  |
