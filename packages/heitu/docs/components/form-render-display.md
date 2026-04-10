---
title: 显隐与布局
toc: content
order: 4
---

# FormRender 显隐与布局

## 条件显隐 (Hidden)

通过 `nodeProps.hidden` 控制表单项的显示与隐藏。配合 `watch` 监听其他字段，可以实现动态条件显隐 — 当 `hidden: true` 时，整个表单项（包括 label）都不会渲染到 DOM 中：

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button } from 'antd';

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    {
      type: 'Select',
      name: 'userType',
      label: '用户类型',
      rules: [{ required: true, message: '请选择用户类型' }],
      nodeProps: {
        placeholder: '选择后显示不同的表单项',
        options: [
          { label: '个人用户', value: 'personal' },
          { label: '企业用户', value: 'enterprise' },
          { label: '开发者', value: 'developer' },
        ],
      },
    },
    {
      type: 'Input',
      name: 'realName',
      label: '真实姓名',
      watch: ['userType'],
      rules: (form, watchValue) =>
        watchValue?.[0] === 'personal'
          ? [{ required: true, message: '个人用户请填写真实姓名' }]
          : [],
      nodeProps: (form, watchValue) => ({
        placeholder: '请输入真实姓名',
        hidden: watchValue?.[0] !== 'personal',
      }),
    },
    {
      type: 'Input',
      name: 'companyName',
      label: '公司名称',
      watch: ['userType'],
      rules: (form, watchValue) =>
        watchValue?.[0] === 'enterprise'
          ? [{ required: true, message: '企业用户请填写公司名称' }]
          : [],
      nodeProps: (form, watchValue) => ({
        placeholder: '请输入公司名称',
        hidden: watchValue?.[0] !== 'enterprise',
      }),
    },
    {
      type: 'Input',
      name: 'taxId',
      label: '税号',
      watch: ['userType'],
      nodeProps: (form, watchValue) => ({
        placeholder: '请输入统一社会信用代码',
        hidden: watchValue?.[0] !== 'enterprise',
      }),
    },
    {
      type: 'Input',
      name: 'githubUrl',
      label: 'GitHub',
      watch: ['userType'],
      nodeProps: (form, watchValue) => ({
        placeholder: 'https://github.com/username',
        hidden: watchValue?.[0] !== 'developer',
      }),
    },
    {
      type: 'Select',
      name: 'techStack',
      label: '技术栈',
      watch: ['userType'],
      nodeProps: (form, watchValue) => ({
        placeholder: '请选择技术栈',
        mode: 'multiple',
        hidden: watchValue?.[0] !== 'developer',
        options: [
          { label: 'React', value: 'react' },
          { label: 'Vue', value: 'vue' },
          { label: 'Node.js', value: 'nodejs' },
          { label: 'Go', value: 'go' },
          { label: 'Rust', value: 'rust' },
        ],
      }),
    },
    {
      type: 'Input.Textarea',
      name: 'bio',
      label: '简介',
      watch: ['userType'],
      nodeProps: (form, watchValue) => ({
        placeholder: watchValue?.[0] === 'enterprise' ? '公司简介...' : '个人简介...',
        rows: 3,
        hidden: !watchValue?.[0],
      }),
    },
  ];

  return (
    <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 520 }}>
      <div style={{ marginBottom: 12, padding: '8px 12px', background: '#FFFBEB', borderRadius: 6, border: '1px solid #FDE68A', fontSize: 12, color: '#D97706' }}>
        选择不同用户类型会显示不同的表单字段：个人 → 姓名 / 企业 → 公司+税号 / 开发者 → GitHub+技术栈
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

## 分割线 (Divider)

除了旧的 `type: 'Line'` 语法外，新增 `divider: true` 专属配置，支持标题位置：

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button } from 'antd';

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    { type: 'Input', name: 'name', label: '姓名', nodeProps: { placeholder: '请输入' } },
    { type: 'Input', name: 'phone', label: '电话', nodeProps: { placeholder: '请输入' } },
    { divider: true, label: '账号信息', titlePlacement: 'left' },
    { type: 'Input', name: 'username', label: '用户名', nodeProps: { placeholder: '请输入' } },
    { type: 'Input.Password', name: 'password', label: '密码', nodeProps: { placeholder: '请输入' } },
    { divider: true, label: '偏好设置' },
    [
      { type: 'Switch', name: 'darkMode', label: '深色模式', itemProps: { valuePropName: 'checked' } },
      { type: 'Select', name: 'lang', label: '语言', nodeProps: { placeholder: '请选择', options: [{ label: '中文', value: 'zh' }, { label: 'English', value: 'en' }] } },
    ],
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

## 新增内置控件

展示新增的 6 种内置控件：`Input.Password`、`Input.Search`、`TimePicker`、`TreeSelect`、`Cascader`、`AutoComplete`：

```tsx
import React from 'react';
import { FormRender } from 'heitu';
import { Button } from 'antd';

export default () => {
  const [form] = FormRender.useForm();

  const config = [
    [
      {
        type: 'Input.Password',
        name: 'password',
        label: 'Input.Password 密码',
        nodeProps: { placeholder: '请输入密码' },
      },
      {
        type: 'Input.Search',
        name: 'search',
        label: 'Input.Search 搜索',
        nodeProps: { placeholder: '搜索...', enterButton: true },
      },
    ],
    {
      type: 'TimePicker',
      name: 'time',
      label: 'TimePicker 时间',
      nodeProps: { style: { width: '100%' }, placeholder: '选择时间' },
    },
    {
      type: 'TreeSelect',
      name: 'department',
      label: 'TreeSelect 树选择',
      nodeProps: {
        placeholder: '请选择部门',
        treeData: [
          {
            title: '技术部',
            value: 'tech',
            children: [
              { title: '前端组', value: 'frontend' },
              { title: '后端组', value: 'backend' },
              { title: '测试组', value: 'qa' },
            ],
          },
          {
            title: '产品部',
            value: 'product',
            children: [
              { title: '设计组', value: 'design' },
              { title: '运营组', value: 'operation' },
            ],
          },
        ],
      },
    },
    {
      type: 'Cascader',
      name: 'area',
      label: 'Cascader 级联选择',
      nodeProps: {
        placeholder: '请选择地区',
        options: [
          {
            value: 'zhejiang',
            label: '浙江',
            children: [
              {
                value: 'hangzhou',
                label: '杭州',
                children: [
                  { value: 'xihu', label: '西湖区' },
                  { value: 'binjiang', label: '滨江区' },
                ],
              },
            ],
          },
          {
            value: 'jiangsu',
            label: '江苏',
            children: [
              {
                value: 'nanjing',
                label: '南京',
                children: [
                  { value: 'xuanwu', label: '玄武区' },
                  { value: 'jianye', label: '建邺区' },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: 'AutoComplete',
      name: 'email',
      label: 'AutoComplete 自动补全',
      nodeProps: {
        placeholder: '输入邮箱',
        options: [
          { value: '@gmail.com' },
          { value: '@163.com' },
          { value: '@qq.com' },
          { value: '@outlook.com' },
        ],
        filterOption: (input, option) =>
          (option?.value ?? '').toLowerCase().includes(input.toLowerCase()),
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
