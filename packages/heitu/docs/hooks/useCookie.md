---
group:
  title: State
  order: 1

toc: content
order: 1
---

# useCookie

## 描述

Cookie 简便操作,支持自动同步(cookieStore API)和手动刷新。

## 演示

```tsx
import React from 'react';
import { useCookie } from 'heitu';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 460 },
  label: { fontSize: 12, color: '#64748B', marginBottom: 4, display: 'block' },
  value: { padding: '10px 14px', background: '#EEF2FF', borderRadius: 6, fontSize: 15, fontWeight: 600, color: '#4F46E5', marginBottom: 16, fontFamily: 'monospace', wordBreak: 'break-all' as const },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  btn: { padding: '8px 16px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  primary: { background: '#4F46E5', color: '#fff' },
  secondary: { background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' },
  danger: { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' },
  muted: { background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' },
};

export default () => {
  const cookieName = 'heitu-demo';
  const [cookieValue, updateCookie, refreshCookie] = useCookie(
    cookieName,
    { path: '/' },
    'default-value',
  );

  return (
    <div style={styles.card}>
      <span style={styles.label}>cookie["{cookieName}"]</span>
      <div style={styles.value}>{cookieValue || <em style={{ color: '#94A3B8' }}>empty</em>}</div>
      <div style={styles.row}>
        <button style={{ ...styles.btn, ...styles.primary }} onClick={() => updateCookie('new-value')}>
          Set new-value
        </button>
        <button style={{ ...styles.btn, ...styles.danger }} onClick={() => updateCookie(undefined)}>
          Delete
        </button>
        <button style={{ ...styles.btn, ...styles.secondary }} onClick={() => {
          document.cookie = `${cookieName}=external-change; path=/`;
        }}>
          External Change
        </button>
        <button style={{ ...styles.btn, ...styles.muted }} onClick={refreshCookie}>
          Refresh
        </button>
      </div>
    </div>
  );
};
```

## API

### 参数

| 参数         | 说明          | 类型            | 默认值          |
| ------------ | ------------- | --------------- | --------------- |
| key          | Cookie 的名称 | `string`        | -               |
| options      | Cookie 配置项 | `CookieOptions` | `{ path: '/' }` |
| defaultValue | 默认值        | `any`           | `undefined`     |

### CookieOptions

| 参数     | 说明                  | 类型                          | 默认值  |
| -------- | --------------------- | ----------------------------- | ------- |
| path     | Cookie 路径           | `string`                      | `'/'`   |
| domain   | Cookie 域名           | `string`                      | -       |
| maxAge   | 过期时间(秒)        | `number`                      | -       |
| expires  | 过期日期              | `Date`                        | -       |
| secure   | 是否只通过 HTTPS 传输 | `boolean`                     | `false` |
| sameSite | 跨站点请求设置        | `'strict' \| 'lax' \| 'none'` | -       |

### 返回值

| 参数          | 说明               | 类型                                             |
| ------------- | ------------------ | ------------------------------------------------ |
| cookieValue   | 当前 Cookie 值     | `T \| undefined`                                 |
| updateCookie  | 更新 Cookie 的函数 | `(newValue: T \| ((prevValue: T) => T)) => void` |
| refreshCookie | 刷新 Cookie 的函数 | `() => void`                                     |
