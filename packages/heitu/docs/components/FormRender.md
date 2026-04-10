---
title: FormRender
toc: content
order: 1
---

# FormRender

## 描述

基于 Ant Design Form 的 JSON Schema 驱动表单渲染器。通过配置数组声明式生成表单，支持：

- 内置 19 种常用控件 (Input / Select / DatePicker / TreeSelect / Cascader 等)
- 一维数组 = 每行一项，二维数组 = 一行多项栅格布局
- 自定义控件注册 — `registerNode` 全局注册 / `Provider` 作用域注入
- 字段联动 (watch) — 监听其他字段变化后动态更新
- 级联清空 (watchClean) — 联动字段变化后自动清空当前值
- 异步数据源 (service) — 自动管理 loading 状态 + onError 错误回调
- 条件显隐 (hidden) — 动态控制表单项渲染
- 动态规则 / 动态 props — rules、itemProps、nodeProps 均可传函数
- 自定义渲染 (render) — 完全自由的渲染逻辑
- 分割线 (divider) — 语义化分割线配置，支持标题位置
- 嵌套子表单 (isSub) — 不再包裹 Form 标签

## 基础用法

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button } from 'antd';

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    {
      type: 'Input',
      name: 'username',
      label: '用户名',
      rules: [{ required: true, message: '请输入用户名' }],
      nodeProps: { placeholder: '请输入用户名' },
    },
    {
      type: 'Input',
      name: 'email',
      label: '邮箱',
      rules: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '请输入有效的邮箱地址' },
      ],
      nodeProps: { placeholder: 'example@mail.com' },
    },
    {
      type: 'Input.Textarea',
      name: 'bio',
      label: '个人简介',
      nodeProps: { placeholder: '介绍一下自己...', rows: 3 },
    },
  ];

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 520 }}>
      <FormRender
        form={form}
        config={config}
        onFinish={(values) => {
          alert(JSON.stringify(values, null, 2));
        }}
      >
        <Button type="primary" htmlType="submit" style={{ borderRadius: 6 }}>
          Submit
        </Button>
      </FormRender>
    </div>
  );
};
```

## 多列布局

使用二维数组实现一行多列：

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button } from 'antd';

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    [
      {
        type: 'Input',
        name: 'firstName',
        label: '姓',
        rules: [{ required: true, message: '必填' }],
        nodeProps: { placeholder: '姓' },
      },
      {
        type: 'Input',
        name: 'lastName',
        label: '名',
        rules: [{ required: true, message: '必填' }],
        nodeProps: { placeholder: '名' },
      },
    ],
    [
      {
        type: 'Select',
        name: 'gender',
        label: '性别',
        nodeProps: {
          placeholder: '请选择',
          options: [
            { label: '男', value: 'male' },
            { label: '女', value: 'female' },
          ],
        },
      },
      {
        type: 'DatePicker',
        name: 'birthday',
        label: '出生日期',
        nodeProps: { style: { width: '100%' } },
      },
    ],
    {
      type: 'Input.Textarea',
      name: 'address',
      label: '地址',
      nodeProps: { placeholder: '详细地址', rows: 2 },
    },
  ];

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 600 }}>
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

## 丰富控件

展示所有内置控件类型：

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button } from 'antd';

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    { type: 'Input', name: 'text', label: 'Input 输入框', nodeProps: { placeholder: '请输入' } },
    { type: 'InputNumber', name: 'number', label: 'InputNumber 数字', nodeProps: { placeholder: '请输入数字', style: { width: '100%' } } },
    {
      type: 'Select', name: 'select', label: 'Select 选择器',
      nodeProps: {
        placeholder: '请选择',
        options: [
          { label: 'React', value: 'react' },
          { label: 'Vue', value: 'vue' },
          { label: 'Angular', value: 'angular' },
        ],
      },
    },
    { type: 'Line', label: '更多控件' },
    [
      { type: 'Switch', name: 'switch', label: 'Switch 开关', itemProps: { valuePropName: 'checked' } },
      { type: 'Rate', name: 'rate', label: 'Rate 评分' },
    ],
    {
      type: 'Slider', name: 'slider', label: 'Slider 滑动条',
      nodeProps: { min: 0, max: 100 },
    },
    {
      type: 'Radio', name: 'radio', label: 'Radio 单选',
      nodeProps: {
        options: [
          { label: '选项 A', value: 'a' },
          { label: '选项 B', value: 'b' },
          { label: '选项 C', value: 'c' },
        ],
      },
    },
    {
      type: 'Checkbox', name: 'checkbox', label: 'Checkbox 多选',
      nodeProps: {
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
          { label: 'Cherry', value: 'cherry' },
        ],
      },
    },
  ];

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 600 }}>
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

## API

### FormRender Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| config | 表单配置数组 | `(IConfigItem \| IConfigItem[])[]` | - |
| form | Form 实例 | `FormInstance` | 内部创建 |
| layout | 布局方式 | `'horizontal' \| 'vertical' \| 'inline'` | `'vertical'` |
| gutter | 栅格间距 | `[number, number]` | `[10, 0]` |
| isSub | 是否嵌套子表单 | `boolean` | `false` |
| children | 额外内容 (如提交按钮) | `React.ReactNode` | - |
| ...others | 支持所有 Ant Design Form Props | `FormProps` | - |

### IItem 配置项

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 控件类型 | `string \| React.ComponentType` | - |
| name | 字段 key | `string \| (string \| number)[]` | - |
| label | 字段标签 | `React.ReactNode` | - |
| rules | 校验规则 | `Rule[] \| (form, watchValue) => Rule[]` | `[]` |
| nodeProps | 控件 props | `INodeProps \| (form, watchValue) => INodeProps` | `{}` |
| itemProps | Form.Item props | `FormItemProps \| (form, watchValue) => FormItemProps` | `{}` |
| watch | 监听的字段名数组 | `string[]` | `[]` |
| watchClean | 监听变更后清除当前字段 | `boolean` | `false` |
| render | 自定义渲染函数 | `(form, data, watchValue) => ReactElement` | - |
| span | 栅格占位 (1-24) | `number` | `24` |

### IDividerItem 分割线配置

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| divider | 标记为分割线 | `true` | - (必填) |
| label | 分割线标题 | `React.ReactNode` | - |
| orientation | 标题位置 | `'left' \| 'center' \| 'right'` | `'center'` |

### INodeProps 控件 Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| hidden | 隐藏整个表单项 | `boolean` | `false` |
| disabled | 禁用控件 | `boolean` | `false` |
| service | 异步数据获取 | `(form, watchValue) => Promise<unknown>` | - |
| transformData | 数据转换 | `(data) => { label, value }[]` | - |
| onError | 异步请求失败回调 | `(error: Error, fieldName?) => void` | - |
| ...rest | 透传给控件的其他 props | `any` | - |

### 内置控件类型

| type 字符串 | 对应组件 |
| --- | --- |
| `Input` | `antd Input` |
| `Input.Textarea` | `antd Input.TextArea` |
| `Input.Password` | `antd Input.Password` |
| `Input.Search` | `antd Input.Search` |
| `InputNumber` | `antd InputNumber` |
| `Select` | `antd Select` |
| `TreeSelect` | `antd TreeSelect` |
| `Cascader` | `antd Cascader` |
| `AutoComplete` | `antd AutoComplete` |
| `Switch` | `antd Switch` |
| `Slider` | `antd Slider` |
| `Rate` | `antd Rate` |
| `Radio` | `antd Radio.Group` |
| `Checkbox` | `antd Checkbox.Group` |
| `DatePicker` | `antd DatePicker` |
| `RangePicker` | `antd DatePicker.RangePicker` |
| `TimePicker` | `antd TimePicker` |
| `Upload` | `antd Upload` |
| `Dragger` | `antd Upload.Dragger` |
| `Line` | `antd Divider` (兼容旧语法) |

### 静态方法

| 方法 | 说明 | 类型 |
| --- | --- | --- |
| FormRender.useForm | 创建 Form 实例 | `typeof Form.useForm` |
| FormRender.useWatch | 监听表单字段值 | `typeof Form.useWatch` |
| FormRender.registerNode | 全局注册单个自定义控件 | `(typeName: string, component: ComponentType) => void` |
| FormRender.registerNodes | 全局批量注册自定义控件 | `(nodes: Record<string, ComponentType>) => void` |
| FormRender.Provider | Context 方式注入自定义控件（作用域隔离） | `React.FC<{ components: Record<string, ComponentType> }>` |
