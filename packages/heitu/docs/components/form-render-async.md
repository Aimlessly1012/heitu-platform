---
title: 异步数据
toc: content
order: 3
---

# FormRender 异步数据

## 异步数据源 (Service)

通过 `nodeProps.service` 异步获取下拉选项，自动管理 loading / disabled 状态。支持配合 `watch` 实现级联选择 — 选择省份后自动请求城市列表：

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button } from 'antd';

// 模拟接口：获取省份列表
const fetchProvinces = () =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve([
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
        { label: '广东', value: 'guangdong' },
        { label: '浙江', value: 'zhejiang' },
      ]);
    }, 800),
  );

// 模拟接口：根据省份获取城市列表
const fetchCities = (province) =>
  new Promise((resolve) =>
    setTimeout(() => {
      const map = {
        beijing: [
          { label: '东城区', value: 'dongcheng' },
          { label: '西城区', value: 'xicheng' },
          { label: '朝阳区', value: 'chaoyang' },
        ],
        shanghai: [
          { label: '黄浦区', value: 'huangpu' },
          { label: '徐汇区', value: 'xuhui' },
          { label: '浦东新区', value: 'pudong' },
        ],
        guangdong: [
          { label: '广州', value: 'guangzhou' },
          { label: '深圳', value: 'shenzhen' },
          { label: '东莞', value: 'dongguan' },
        ],
        zhejiang: [
          { label: '杭州', value: 'hangzhou' },
          { label: '宁波', value: 'ningbo' },
          { label: '温州', value: 'wenzhou' },
        ],
      };
      resolve(map[province] || []);
    }, 600),
  );

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    {
      type: 'Select',
      name: 'province',
      label: '省份（异步加载）',
      nodeProps: {
        placeholder: '请选择省份',
        allowClear: true,
        service: async () => {
          return await fetchProvinces();
        },
        transformData: (data) => data || [],
      },
    },
    {
      type: 'Select',
      name: 'city',
      label: '城市（级联 — 选择省份后自动加载）',
      watch: ['province'],
      nodeProps: {
        placeholder: '请先选择省份',
        allowClear: true,
        service: async (form, watchValue) => {
          const province = watchValue?.[0];
          if (!province) return [];
          return await fetchCities(province);
        },
        transformData: (data) => data || [],
      },
    },
    {
      type: 'Input',
      name: 'address',
      label: '详细地址',
      nodeProps: { placeholder: '请输入详细地址' },
    },
  ];

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 520 }}>
      <div style={{ marginBottom: 12, padding: '8px 12px', background: '#EEF2FF', borderRadius: 6, border: '1px solid #C7D2FE', fontSize: 12, color: '#4F46E5' }}>
        省份选项从异步接口加载（800ms 延迟），城市列表根据所选省份级联请求（600ms 延迟），加载中控件会自动 disabled。
      </div>
      <FormRender
        form={form}
        config={config}
        onFinish={(values) => alert(JSON.stringify(values, null, 2))}
      >
        <Button type="primary" htmlType="submit" style={{ borderRadius: 6 }}>
          Submit
        </Button>
      </FormRender>
    </div>
  );
};
```

## 异步错误回调 (onError)

`nodeProps.onError` 在 service 请求失败时触发，可以用来提示用户或上报错误：

```tsx
import React, { useState } from 'react';
import { FormRender } from 'heitu';
import { Alert } from 'antd';

export default () => {
  const [form] = FormRender.useForm();
  const [error, setError] = useState(null);

  const config = [
    {
      type: 'Select',
      name: 'data',
      label: '异步数据（模拟失败）',
      nodeProps: {
        placeholder: '点击下拉触发请求',
        service: async () => {
          // 模拟请求失败
          await new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network Error: 请求超时')), 1000),
          );
        },
        onError: (err) => {
          setError(err.message);
        },
      },
    },
  ];

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 520 }}>
      {error && (
        <Alert
          type="error"
          message={error}
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 12 }}
        />
      )}
      <FormRender form={form} config={config} />
    </div>
  );
};
```
