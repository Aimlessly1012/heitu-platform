---
group:
  title: browser
  order: 6

toc: content
order: 1
---

# useDevicePixelRatio

## 描述

获取并实时监听屏幕设备像素比,缩放时自动更新。

## 演示

```tsx
import React from 'react';
import { useDevicePixelRatio } from 'heitu';

export default () => {
  const { pixelRatio } = useDevicePixelRatio();

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 300, textAlign: 'center' }}>
      <div style={{ fontSize: 48, fontWeight: 700, color: '#4F46E5', fontFamily: 'monospace' }}>
        {pixelRatio}x
      </div>
      <div style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>Device Pixel Ratio</div>
      <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
        Try Cmd+/- to zoom the page
      </div>
    </div>
  );
};
```

## 返回值

| 参数名     | 说明             | 类型     | 默认值 |
| ---------- | ---------------- | -------- | ------ |
| pixelRatio | 当前设备的像素比 | `number` | 1      |
