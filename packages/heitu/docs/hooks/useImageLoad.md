---
group:
  title: Element
  order: 2

toc: content
order: 6
---

# useImageLoad

## 描述

用于 获取 img 加载状态, 支持传入图片的数组 逐个检查状态展示 可加载的，如果都不成功返回 裂图图片

- 注：异步的!!!

## 演示

```tsx
import React from 'react';
import { useImageLoad } from 'heitu';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  section: { flex: 1, minWidth: 0 },
  sectionTitle: { fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 8 },
  imgWrap: { background: '#fff', borderRadius: 6, border: '1px solid #E2E8F0', padding: 8, marginBottom: 8 },
  img: { width: '100%', borderRadius: 4, display: 'block' },
};

export default () => {
  const list = [
    'https://www.yhwxj.com/wp-content/uploads/2022/08/2022081509213479.png',
    'https://cdn.pixabay.com/photo/2023/08/11/08/29/highland-cattle-8183107_640.jpg',
    'http://whhysz.com/upload/20210507/6094e47dce9c1.jpg',
  ];
  const [img, ftimgList, allowImgList, loading] = useImageLoad({ imgList: list });

  return (
    <div style={styles.card}>
      <div style={{ ...styles.tag, background: loading ? '#FFFBEB' : '#ECFDF5', color: loading ? '#F59E0B' : '#10B981' }}>
        <span style={{ ...styles.dot, background: loading ? '#F59E0B' : '#10B981' }} />
        {loading ? 'Loading...' : 'Loaded'}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>Checking images...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>First Available</div>
            <div style={styles.imgWrap}>
              <img src={img} style={styles.img} />
            </div>
          </div>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Fallback List ({ftimgList?.length || 0})</div>
            {ftimgList?.map((item, i) => (
              <div key={i} style={styles.imgWrap}>
                <img src={item} style={styles.img} />
              </div>
            ))}
          </div>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Valid Only ({allowImgList?.length || 0})</div>
            {allowImgList?.map((item, i) => (
              <div key={i} style={styles.imgWrap}>
                <img src={item} style={styles.img} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## Arguments

| name    | description                          | type     | default |
| ------- | ------------------------------------ | -------- | ------- |
| imgList | 图片数组(需要查询是否可展示数组列表) | string[] | -       |

## return

| name         | description                                                | type     | default |
| ------------ | ---------------------------------------------------------- | -------- | ------- |
| img          | 图片地址(按照数组顺序能展现的图片)                         | string   | -       |
| ftimgList    | 图片数组（会将不能展示的图片改为加载失败显示图像占位符。） | string[] | -       |
| allowImgList | 图片数组（只将可以展示图片返回）                           | string[] | -       |
