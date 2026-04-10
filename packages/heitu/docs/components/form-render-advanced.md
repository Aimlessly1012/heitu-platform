---
title: 自定义渲染
toc: content
order: 5
---

# FormRender 自定义渲染

## 自定义渲染 (Render)

通过 `render` 字段完全自定义表单项：

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button, Space } from 'antd';

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    { type: 'Input', name: 'name', label: '名称', nodeProps: { placeholder: '请输入' } },
    {
      name: 'custom',
      render: (form) => (
        <div style={{ padding: '12px 16px', background: '#EEF2FF', borderRadius: 8, border: '1px solid #C7D2FE', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#4F46E5', fontWeight: 500, marginBottom: 8 }}>
            自定义区域
          </div>
          <div style={{ fontSize: 12, color: '#64748B' }}>
            这里可以放任何 React 内容，同时拿到 form 实例操作表单数据。
          </div>
          <Space style={{ marginTop: 8 }}>
            <Button size="small" onClick={() => form?.setFieldsValue({ name: 'HeiTu' })}>
              Fill "HeiTu"
            </Button>
            <Button size="small" onClick={() => form?.resetFields()}>
              Reset
            </Button>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 520 }}>
      <FormRender form={form} config={config} />
    </div>
  );
};
```

## 嵌套子表单 (isSub)

`isSub: true` 时不会包裹 `<Form>` 标签，适合在父表单中嵌入子配置区域：

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button, Form } from 'antd';

export default () => {
  const [form] = Form.useForm();

  // 主表单配置
  const mainConfig = [
    { type: 'Input', name: 'projectName', label: '项目名称', nodeProps: { placeholder: '请输入' } },
  ];

  // 子表单配置 — 数据库连接
  const dbConfig = [
    [
      { type: 'Input', name: ['db', 'host'], label: 'Host', nodeProps: { placeholder: '127.0.0.1' } },
      { type: 'InputNumber', name: ['db', 'port'], label: 'Port', nodeProps: { placeholder: '3306', style: { width: '100%' } } },
    ],
    [
      { type: 'Input', name: ['db', 'user'], label: 'User', nodeProps: { placeholder: 'root' } },
      { type: 'Input.Password', name: ['db', 'password'], label: 'Password', nodeProps: { placeholder: '••••••' } },
    ],
  ];

  // 子表单配置 — Redis 连接
  const redisConfig = [
    [
      { type: 'Input', name: ['redis', 'host'], label: 'Host', nodeProps: { placeholder: '127.0.0.1' } },
      { type: 'InputNumber', name: ['redis', 'port'], label: 'Port', nodeProps: { placeholder: '6379', style: { width: '100%' } } },
    ],
  ];

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 600 }}>
      <Form form={form} layout="vertical" onFinish={(values) => alert(JSON.stringify(values, null, 2))}>
        <FormRender form={form} config={mainConfig} isSub />

        <div style={{ padding: 14, background: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#4F46E5', marginBottom: 8 }}>Database</div>
          <FormRender form={form} config={dbConfig} isSub />
        </div>

        <div style={{ padding: 14, background: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#10B981', marginBottom: 8 }}>Redis</div>
          <FormRender form={form} config={redisConfig} isSub />
        </div>

        <Button type="primary" htmlType="submit" style={{ borderRadius: 6 }}>
          Submit
        </Button>
      </Form>
    </div>
  );
};
```
