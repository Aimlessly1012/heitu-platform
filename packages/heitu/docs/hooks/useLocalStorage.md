---
group:
  title: State
  order: 1

toc: content
order: 4
---

# useLocalStorage

## 描述

LocalStorage 简便操作,支持序列化选项、函数式更新、跨标签页同步。SSR 安全。

## 演示

```tsx
import { useLocalStorage } from 'heitu';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 420 },
  label: { fontSize: 12, color: '#64748B', marginBottom: 4, display: 'block' },
  value: { padding: '10px 14px', background: '#EEF2FF', borderRadius: 6, fontSize: 16, fontWeight: 600, color: '#4F46E5', marginBottom: 16, fontFamily: 'monospace' },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  btn: { padding: '8px 16px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .2s' },
  primary: { background: '#4F46E5', color: '#fff' },
  secondary: { background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' },
  danger: { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' },
};

export default () => {
  const [value, setValue, remove] = useLocalStorage('demo-key', 'hello');

  return (
    <div style={styles.card}>
      <span style={styles.label}>localStorage["demo-key"]</span>
      <div style={styles.value}>{value ?? <em style={{ color: '#94A3B8' }}>empty</em>}</div>
      <div style={styles.row}>
        <button style={{ ...styles.btn, ...styles.primary }} onClick={() => setValue('bar')}>
          Set "bar"
        </button>
        <button style={{ ...styles.btn, ...styles.primary }} onClick={() => setValue('baz')}>
          Set "baz"
        </button>
        <button style={{ ...styles.btn, ...styles.secondary }} onClick={() => setValue((p) => (p || '') + '!')}>
          Append !
        </button>
        <button style={{ ...styles.btn, ...styles.danger }} onClick={() => remove()}>
          Remove
        </button>
      </div>
    </div>
  );
};
```

## Arguments

| name         | description                              | type                | default |
| ------------ | ---------------------------------------- | ------------------- | ------- |
| key          | localStorage 的 key                      | `string`            | -       |
| initialValue | 默认值(localStorage 无值时使用)          | `T`                 | -       |
| options      | `{ raw: true }` 时以原始字符串读写,否则可传自定义 `serializer` / `deserializer` | `ParserOptions<T>` | -       |

## return

| name     | description                    | type                                           |
| -------- | ------------------------------ | ---------------------------------------------- |
| value    | 当前值,SSR 环境返回 initialValue | `T \| undefined`                               |
| setValue | 设置值,支持函数式更新          | `(v: T \| ((prev: T \| undefined) => T)) => void` |
| remove   | 清除 key 并把 state 设为 undefined | `() => void`                                   |
