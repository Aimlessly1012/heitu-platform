---
group:
  title: Element
  order: 2

toc: content
order: 4
---

# useInfiniteScroll

## 描述

无线滚动 hook

## 演示


```tsx
import React, { useEffect, useMemo } from 'react';
import { useInfiniteScroll, useInView } from 'heitu';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 480 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#EEF2FF', color: '#4F46E5' },
  list: { height: 360, overflowY: 'auto' as const, borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff' },
  item: { padding: '10px 14px', borderBottom: '1px solid #F1F5F9', fontSize: 13, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 10 },
  idx: { width: 28, height: 28, borderRadius: 6, background: '#EEF2FF', color: '#4F46E5', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', flexShrink: 0 },
  footer: { padding: '12px 14px', textAlign: 'center' as const, fontSize: 12, color: '#94A3B8' },
};

function InfiniteScrollTrigger({ hasMore, loadMore }: { hasMore: boolean; loadMore: () => void }) {
  const [targetRef, inView] = useInView();
  useEffect(() => {
    if (inView && hasMore) loadMore?.();
  }, [hasMore, inView, loadMore]);
  return (
    <div ref={targetRef} style={styles.footer}>
      {hasMore ? (
        <span style={{ color: '#4F46E5' }}>Loading...</span>
      ) : (
        <span>No more data</span>
      )}
    </div>
  );
}

export default () => {
  const dataSource = useMemo(
    () => new Array(100).fill(0).map((_, i) => `Item #${i + 1}`),
    [],
  );
  const { data, hasMore, loadMore } = useInfiniteScroll({
    dataSource,
    pageSize: 10,
    delay: 300,
  });

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={{ fontSize: 13, color: '#64748B' }}>Infinite Scroll List</span>
        <span style={styles.badge}>{data?.length || 0} / 100</span>
      </div>

      <div style={styles.list}>
        {data?.map((item, idx) => (
          <div key={idx} style={styles.item}>
            <span style={styles.idx}>{idx + 1}</span>
            <span>{item}</span>
          </div>
        ))}
        <InfiniteScrollTrigger loadMore={loadMore} hasMore={hasMore} />
      </div>
    </div>
  );
};
```

## Arguments

| name       | description | type                                  | default |
| ---------- | ----------- | ------------------------------------- | ------- |
| dataSource | 数据源      | any[]                                 | -       |
| delay      | 延迟        | number                                | 100     |
| pageSize   | 每页的个数  | number                                | 10      |
| fetchData  | 请求接口    | Promise<{total?: number; list?: T[]}> | -       |

## return

| name     | description        | type                                        | default |
| -------- | ------------------ | ------------------------------------------- | ------- |
| data     | 数据               | any[]                                       | -       |
| setData  | 操作 data          | React.Dispatch<React.SetStateAction<any[]>> | -       |
| loading  | 加载状态           | boolean                                     | false   |
| hasMore  | 是否还有更多数据   | boolean                                     | true    |
| loadMore | 加载更多数据的函数 | Promise<void>                               | -       |
