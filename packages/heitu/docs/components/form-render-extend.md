---
title: 控件注册
toc: content
order: 6
---

# FormRender 控件注册

## 注册自定义控件

两种方式注册自定义控件，注册后可在 `type` 中直接用字符串引用：

### 方式一：全局注册（registerNode）

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button, Tag } from 'antd';

// 自定义控件：颜色标签选择器
const ColorPicker = ({ value, onChange }: { value?: string; onChange?: (v: string) => void }) => {
  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'];
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {colors.map((c) => (
        <Tag
          key={c}
          color={c}
          onClick={() => onChange?.(c)}
          style={{
            cursor: 'pointer',
            border: value === c ? '2px solid #1E293B' : '2px solid transparent',
            borderRadius: 6,
            padding: '4px 12px',
          }}
        >
          {value === c ? 'Selected' : ' '}
        </Tag>
      ))}
    </div>
  );
};

// 全局注册 — 之后所有 FormRender 都可以用 type: 'ColorPicker'
FormRender.registerNode('ColorPicker', ColorPicker);

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    { type: 'Input', name: 'name', label: '主题名称', nodeProps: { placeholder: '请输入' } },
    { type: 'ColorPicker', name: 'color', label: '主题色', rules: [{ required: true, message: '请选择颜色' }] },
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

### 方式二：Provider 注入（作用域隔离）

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button, InputNumber, Space } from 'antd';

// 自定义控件：价格区间输入
const PriceRange = ({ value = {}, onChange }: any) => (
  <Space>
    <InputNumber
      placeholder="最低价"
      value={value.min}
      onChange={(v) => onChange?.({ ...value, min: v })}
      style={{ width: 120 }}
    />
    <span style={{ color: '#94A3B8' }}>—</span>
    <InputNumber
      placeholder="最高价"
      value={value.max}
      onChange={(v) => onChange?.({ ...value, max: v })}
      style={{ width: 120 }}
    />
  </Space>
);

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    { type: 'Input', name: 'product', label: '商品名称', nodeProps: { placeholder: '请输入' } },
    { type: 'PriceRange', name: 'price', label: '价格区间' },
  ];

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 520 }}>
      <FormRender.Provider components={{ PriceRange }}>
        <FormRender
          form={form}
          config={config}
          onFinish={(values) => alert(JSON.stringify(values, null, 2))}
        >
          <Button type="primary" htmlType="submit" style={{ borderRadius: 6 }}>
            Submit
          </Button>
        </FormRender>
      </FormRender.Provider>
    </div>
  );
};
```
