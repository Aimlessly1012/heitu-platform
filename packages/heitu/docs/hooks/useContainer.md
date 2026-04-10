---
group:
  title: State
  order: 1

toc: content
order: 5
---

# useContainer

## 描述

一个轻量级的状态管理工具，基于 React Context 和 Hooks，用于跨组件共享状态和逻辑。

## 特性

- 基于 React Hooks
- 支持 TypeScript
- 支持类组件和函数组件
- 支持初始状态注入
- 状态引用稳定
- 简单易用

## 演示

```tsx
import React, { useState } from 'react';
import { createContainer } from 'heitu';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 400 },
  row: { display: 'flex', gap: 12, marginBottom: 16 },
  swatch: { width: 48, height: 48, borderRadius: 8, transition: 'all .3s', border: '2px solid #E2E8F0' },
  label: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  value: { fontSize: 14, fontWeight: 600, color: '#1E293B', fontFamily: 'monospace', padding: '6px 12px', background: '#fff', borderRadius: 6, border: '1px solid #E2E8F0', marginBottom: 16, display: 'inline-block' },
  btn: { padding: '8px 16px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
};

const THEMES = [
  { name: 'Indigo', color: '#4F46E5', bg: '#EEF2FF' },
  { name: 'Emerald', color: '#10B981', bg: '#ECFDF5' },
  { name: 'Rose', color: '#F43F5E', bg: '#FFF1F2' },
];

function useTheme(props: { themeIndex: number }) {
  const theme = THEMES[props.themeIndex] || THEMES[0];
  return { theme };
}

const ThemeContainer = createContainer(useTheme);

const ThemedComponent = () => {
  const { theme } = ThemeContainer.useContainer();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ ...styles.swatch, background: theme.color, borderColor: theme.color }} />
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: theme.color }}>{theme.name}</div>
        <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>{theme.color}</div>
      </div>
    </div>
  );
};

export default () => {
  const [idx, setIdx] = useState(0);

  return (
    <div style={styles.card}>
      <div style={styles.label}>Current Theme (via Container)</div>

      <ThemeContainer.Provider themeIndex={idx}>
        <div style={{ padding: 14, background: '#fff', borderRadius: 6, border: '1px solid #E2E8F0', marginBottom: 16 }}>
          <ThemedComponent />
        </div>
      </ThemeContainer.Provider>

      <div style={{ display: 'flex', gap: 8 }}>
        {THEMES.map((t, i) => (
          <button
            key={t.name}
            style={{ ...styles.btn, background: idx === i ? t.color : t.bg, color: idx === i ? '#fff' : t.color, border: `1px solid ${t.color}` }}
            onClick={() => setIdx(i)}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
};
```

## API

### createContainer

```typescript
function createContainer<Value, Props = void>(
  useHook: (props: Props) => Value,
): {
  Provider: React.ComponentType<
    {
      initialState?: Partial<Value>;
      children: React.ReactNode;
    } & Props
  >;
  useContainer: () => Value;
  withContainer: <P extends object>(
    WrappedComponent: React.ComponentType<P & { container: Value }>,
  ) => React.ComponentType<P>;
  Context: React.Context<Value | null>;
};
```

### Provider Props

| 参数         | 说明                  | 类型              | 默认值 |
| ------------ | --------------------- | ----------------- | ------ |
| initialState | 初始状态              | `Partial<Value>`  | -      |
| children     | 子组件                | `React.ReactNode` | -      |
| ...props     | 传递给 useHook 的参数 | `Props`           | -      |
