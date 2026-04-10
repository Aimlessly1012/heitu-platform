---
title: 字段联动
toc: content
order: 2
---

# FormRender 字段联动

## 字段联动 (Watch)

监听「类型」字段的值，动态更新「名称」的 placeholder：

```tsx
import React from 'react';
import { FormRender } from 'heitu';

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    {
      type: 'Select',
      name: 'category',
      label: '类型',
      nodeProps: {
        placeholder: '选择后下方输入框会变化',
        options: [
          { label: '文章', value: 'article' },
          { label: '视频', value: 'video' },
          { label: '音频', value: 'audio' },
        ],
      },
    },
    {
      type: 'Input',
      name: 'title',
      label: '标题',
      watch: ['category'],
      nodeProps: (form, watchValue) => {
        const category = watchValue?.[0];
        const map = {
          article: '请输入文章标题...',
          video: '请输入视频标题...',
          audio: '请输入音频标题...',
        };
        return { placeholder: map[category] || '请先选择类型' };
      },
    },
  ];

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 520 }}>
      <FormRender form={form} config={config} />
    </div>
  );
};
```

## 级联清空 (watchClean)

`watchClean: true` 时，当被监听的字段值变化后，自动清空当前字段的值。常用于省市区级联 — 切换省份后城市自动清空：

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button } from 'antd';

const cityMap = {
  beijing: [
    { label: '东城区', value: 'dongcheng' },
    { label: '朝阳区', value: 'chaoyang' },
    { label: '海淀区', value: 'haidian' },
  ],
  shanghai: [
    { label: '黄浦区', value: 'huangpu' },
    { label: '浦东新区', value: 'pudong' },
    { label: '徐汇区', value: 'xuhui' },
  ],
  guangdong: [
    { label: '广州', value: 'guangzhou' },
    { label: '深圳', value: 'shenzhen' },
    { label: '东莞', value: 'dongguan' },
  ],
};

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    {
      type: 'Select',
      name: 'province',
      label: '省份',
      nodeProps: {
        placeholder: '请选择省份',
        allowClear: true,
        options: [
          { label: '北京', value: 'beijing' },
          { label: '上海', value: 'shanghai' },
          { label: '广东', value: 'guangdong' },
        ],
      },
    },
    {
      type: 'Select',
      name: 'city',
      label: '城市',
      watch: ['province'],
      watchClean: true,
      nodeProps: (form, watchValue) => {
        const province = watchValue?.[0];
        return {
          placeholder: province ? '请选择城市' : '请先选择省份',
          disabled: !province,
          options: cityMap[province] || [],
        };
      },
    },
  ];

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 520 }}>
      <div style={{ marginBottom: 12, padding: '8px 12px', background: '#EEF2FF', borderRadius: 6, border: '1px solid #C7D2FE', fontSize: 12, color: '#4F46E5' }}>
        切换省份后，城市字段会自动清空（watchClean: true）
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

## 动态规则 (Dynamic Rules)

`rules`、`itemProps`、`nodeProps` 都支持传入函数，根据 `watch` 的值动态控制校验规则和 props：

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button } from 'antd';

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    {
      type: 'Switch',
      name: 'needEmail',
      label: '需要填写邮箱',
      itemProps: { valuePropName: 'checked' },
    },
    {
      type: 'Input',
      name: 'email',
      label: '邮箱',
      watch: ['needEmail'],
      rules: (form, watchValue) => {
        if (watchValue?.[0]) {
          return [
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ];
        }
        return [];
      },
      nodeProps: (form, watchValue) => ({
        placeholder: watchValue?.[0] ? '请输入邮箱地址' : '当前无需填写',
        disabled: !watchValue?.[0],
      }),
      itemProps: (form, watchValue) => ({
        extra: watchValue?.[0] ? '开关已打开，邮箱为必填' : '打开开关后才需要填写',
      }),
    },
    {
      type: 'Select',
      name: 'role',
      label: '角色',
      nodeProps: {
        placeholder: '请选择角色',
        options: [
          { label: '管理员', value: 'admin' },
          { label: '编辑', value: 'editor' },
          { label: '访客', value: 'visitor' },
        ],
      },
    },
    {
      type: 'Input',
      name: 'adminCode',
      label: '管理员授权码',
      watch: ['role'],
      nodeProps: (form, watchValue) => ({
        placeholder: '请输入授权码',
        hidden: watchValue?.[0] !== 'admin',
      }),
      rules: (form, watchValue) => {
        if (watchValue?.[0] === 'admin') {
          return [{ required: true, message: '管理员必须填写授权码' }];
        }
        return [];
      },
    },
  ];

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 520 }}>
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
