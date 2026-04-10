---
group:
  title: Element
  order: 2

toc: content
order: 3
---
# useInView

## 描述

获取元素是否在可视范围内的 hook

## 演示



```tsx
import React from 'react';
import { useInView } from 'heitu';

const styles = {
  card: { background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 480, overflow: 'hidden' },
  sticky: { position: 'sticky' as const, top: 0, zIndex: 1, padding: '10px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: '50%', display: 'inline-block', transition: 'background .3s' },
  scroll: { height: 300, overflowY: 'auto' as const },
  spacer: { height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 },
  target: { margin: 16, padding: 32, borderRadius: 8, textAlign: 'center' as const, transition: 'all .3s', fontWeight: 600, fontSize: 15 },
};

export default () => {
  const [targetRef, inView] = useInView();

  return (
    <div style={styles.card}>
      <div style={styles.sticky}>
        <span style={{ ...styles.dot, background: inView ? '#10B981' : '#94A3B8' }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: inView ? '#10B981' : '#64748B' }}>
          {inView ? 'In Viewport' : 'Out of Viewport'}
        </span>
      </div>

      <div style={styles.scroll}>
        <div style={styles.spacer}>Scroll down</div>

        <div
          ref={targetRef}
          style={{
            ...styles.target,
            background: inView ? '#ECFDF5' : '#F1F5F9',
            color: inView ? '#10B981' : '#94A3B8',
            border: `2px solid ${inView ? '#A7F3D0' : '#E2E8F0'}`,
          }}
        >
          Target Element
        </div>

        <div style={{ ...styles.spacer, height: 300 }} />
      </div>
    </div>
  );
};
```

## Arguments

| name    | description              | type                     | default                                        |
|---------|--------------------------|--------------------------|------------------------------------------------|
| options | 绑定元素的基础用作依赖 | IntersectionObserverInit | { root: null,rootMargin: '0px',threshold: 1,}, |
| triggerOnce  | 触发一次         | boolean                  | false                                          |

## return

| name      | description              | type                                     | default |
|-----------|--------------------------|------------------------------------------|---------|
| targetRef | 用于绑定所作用元素的 ref | React.MutableRefObject<'HTMLElement' ,null> | -       |
| inView    | 是否在可视范围内         | boolean                                  | false   |
