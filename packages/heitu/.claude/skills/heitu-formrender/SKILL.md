---
name: heitu-formrender
description: 使用 heitu 包的 FormRender 组件编写 JSON 驱动表单。当需要创建表单、配置联动、异步数据源、注册自定义控件时触发
allowed-tools: Read Bash Edit Write
---

# Heitu FormRender 开发指南

使用 `heitu/components` 中的 FormRender 组件，通过 JSON 配置驱动表单渲染。

## 安装与导入

```ts
import { FormRender } from 'heitu/components'
// 或
import { FormRender } from 'heitu'
```

> 需要安装 peer 依赖：`antd >= 5.0.0`

## 基础用法

```tsx
const [form] = FormRender.useForm()

const config = [
  { type: 'Input', name: 'username', label: '用户名', nodeProps: { placeholder: '请输入' } },
  { type: 'Select', name: 'role', label: '角色', nodeProps: {
    options: [{ label: '管理员', value: 'admin' }, { label: '用户', value: 'user' }]
  }},
]

<FormRender form={form} config={config} onFinish={(values) => console.log(values)}>
  <Button type="primary" htmlType="submit">提交</Button>
</FormRender>
```

## Config 配置项

### IItem — 表单项

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | `string \| React.ComponentType` | 控件类型，内置字符串或自定义组件 |
| `name` | `string \| (string\|number)[]` | 字段名，支持嵌套路径 `['db', 'host']` |
| `label` | `ReactNode` | 标签 |
| `rules` | `Rule[] \| (form, watchValue) => Rule[]` | 校验规则，支持动态函数 |
| `nodeProps` | `INodeProps \| (form, watchValue) => INodeProps` | 控件 props，支持动态函数 |
| `itemProps` | `FormItemProps \| (form, watchValue) => FormItemProps` | Form.Item props，支持动态函数 |
| `watch` | `string[]` | 监听的字段名数组 |
| `watchClean` | `boolean` | watch 值变化时自动清空当前字段 |
| `render` | `(form, data, watchValue) => ReactElement` | 完全自定义渲染 |
| `span` | `number` | 栅格占比（1-24） |

### INodeProps — 控件 Props

| 字段 | 类型 | 说明 |
|------|------|------|
| `hidden` | `boolean` | 隐藏整个表单项（不渲染到 DOM） |
| `disabled` | `boolean` | 禁用 |
| `service` | `(form, watchValue) => Promise<any>` | 异步获取数据（自动管理 loading） |
| `transformData` | `(data) => {label, value}[]` | 转换 service 返回数据 |
| `onError` | `(error, fieldName) => void` | service 失败回调 |
| `...其他` | `any` | 透传给控件的原生 props（placeholder, options 等） |

### IDividerItem — 分割线

```ts
{ divider: true, label: '分区标题', titlePlacement: 'left' }
// titlePlacement: 'left' | 'center' | 'right' | 'start' | 'end'
```

### 旧语法兼容

```ts
{ type: 'Line', label: '分割线标题' }  // 等价于 divider: true
```

## 19 种内置控件

| type 字符串 | 对应 antd 组件 |
|-------------|---------------|
| `Input` | Input |
| `Input.Textarea` | Input.TextArea |
| `Input.Password` | Input.Password |
| `Input.Search` | Input.Search |
| `InputNumber` | InputNumber |
| `Select` | Select |
| `TreeSelect` | TreeSelect |
| `Cascader` | Cascader |
| `AutoComplete` | AutoComplete |
| `Switch` | Switch |
| `Slider` | Slider |
| `Rate` | Rate |
| `Radio` | Radio.Group |
| `Checkbox` | Checkbox.Group |
| `DatePicker` | DatePicker |
| `RangePicker` | DatePicker.RangePicker |
| `TimePicker` | TimePicker |
| `Upload` | Upload |
| `Dragger` | Upload.Dragger |

## 多列布局

```ts
// 二维数组 = 一行多列，自动计算 span
const config = [
  { type: 'Input', name: 'name', label: '姓名' },
  [
    { type: 'Input', name: 'phone', label: '电话' },
    { type: 'Input', name: 'email', label: '邮箱' },
  ],
  [
    { type: 'Select', name: 'city', label: '城市' },
    { type: 'Select', name: 'district', label: '区县' },
    { type: 'Input', name: 'address', label: '地址' },
  ],
]
// 第 2 行：2 列各占 12
// 第 3 行：3 列各占 8
```

## Watch 字段联动

```ts
{
  type: 'Input',
  name: 'title',
  label: '标题',
  watch: ['category'],
  nodeProps: (form, watchValue) => {
    // watchValue[0] 对应 watch[0] 即 category 的值
    const category = watchValue?.[0]
    return { placeholder: category === 'article' ? '文章标题' : '请输入' }
  },
}
```

**watchValue 规则：**
- `watchValue` 始终是数组，顺序对应 `watch` 数组
- falsy 值（0, false, ""）不会被过滤，是合法值
- `rules`、`nodeProps`、`itemProps` 均支持函数形式

## watchClean 级联清空

```ts
{
  type: 'Select',
  name: 'city',
  watch: ['province'],
  watchClean: true,  // 省份变化时自动清空城市
  nodeProps: (form, watchValue) => ({
    options: cityMap[watchValue?.[0]] || [],
    disabled: !watchValue?.[0],
  }),
}
```

## Hidden 条件显隐

```ts
{
  type: 'Input',
  name: 'companyName',
  label: '公司名称',
  watch: ['userType'],
  nodeProps: (form, watchValue) => ({
    hidden: watchValue?.[0] !== 'enterprise',  // 非企业用户时隐藏
    placeholder: '请输入公司名称',
  }),
  rules: (form, watchValue) =>
    watchValue?.[0] === 'enterprise'
      ? [{ required: true, message: '请填写公司名称' }]
      : [],
}
```

## Service 异步数据源

```ts
{
  type: 'Select',
  name: 'city',
  watch: ['province'],
  nodeProps: {
    service: async (form, watchValue) => {
      const province = watchValue?.[0]
      if (!province) return []
      return await fetchCities(province)
    },
    transformData: (data) => data || [],
    onError: (err) => message.error(err.message),
  },
}
// service 自动管理 loading/disabled 状态
// 内置竞态保护：快速切换时只保留最新请求结果
```

## Render 自定义渲染

```ts
{
  name: 'custom',
  render: (form) => (
    <div>
      <Button onClick={() => form?.setFieldsValue({ name: 'HeiTu' })}>
        填充数据
      </Button>
    </div>
  ),
}
```

## isSub 嵌套子表单

```tsx
<Form form={form} layout="vertical">
  <FormRender form={form} config={mainConfig} isSub />
  <div style={{ padding: 16, border: '1px solid #eee' }}>
    <FormRender form={form} config={dbConfig} isSub />
  </div>
  <Button htmlType="submit">提交</Button>
</Form>
// isSub 模式不会包裹 <Form> 标签，共享父级 form 实例
```

## 注册自定义控件

### 方式 1：全局注册

```ts
// 注册后所有 FormRender 实例都可使用
FormRender.registerNode('ColorPicker', ColorPickerComponent)
FormRender.registerNodes({ RichEditor, CodeEditor })

// 使用
{ type: 'ColorPicker', name: 'color', label: '颜色' }
```

### 方式 2：Provider 作用域注册

```tsx
<FormRender.Provider components={{ PriceRange, TagInput }}>
  <FormRender form={form} config={config} />
</FormRender.Provider>
// 仅 Provider 内的 FormRender 可使用这些控件
// 支持嵌套，子 Provider 继承父 Provider 的控件
```

### 自定义控件规范

```tsx
// 控件需要接受 value + onChange
const MyControl = ({ value, onChange, ...rest }) => {
  return <input value={value || ''} onChange={e => onChange?.(e.target.value)} />
}
```

## FormRender Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `config` | `(IConfigItem \| IConfigItem[])[]` | — | 表单配置数组 |
| `form` | `FormInstance` | 内部创建 | antd Form 实例 |
| `layout` | `'vertical' \| 'horizontal' \| 'inline'` | `'vertical'` | 布局方式 |
| `gutter` | `[number, number]` | `[10, 0]` | 栅格间距 |
| `isSub` | `boolean` | `false` | 子表单模式 |
| `onFinish` | `(values) => void` | — | 提交回调 |
| `children` | `ReactNode` | — | 额外内容（提交按钮等） |

## 静态方法

| 方法 | 说明 |
|------|------|
| `FormRender.useForm()` | 创建 form 实例（antd Form.useForm） |
| `FormRender.useWatch(name, form)` | 监听字段值（antd Form.useWatch） |
| `FormRender.registerNode(name, comp)` | 全局注册控件 |
| `FormRender.registerNodes(map)` | 批量注册控件 |
| `FormRender.Provider` | 作用域控件注入组件 |

## 编码规范

1. **config 不可变**：config 数组使用深比较优化，避免每次 render 创建新数组
2. **动态 props 用函数**：需要根据其他字段联动时，`nodeProps` / `rules` / `itemProps` 传函数
3. **watch 数组稳定**：`watch: ['field1', 'field2']` 数组引用保持稳定
4. **hidden vs disabled**：`hidden` 完全移除 DOM，`disabled` 保留但不可交互
5. **service 竞态安全**：内置 fetchIdRef 保护，无需手动处理
6. **Switch 组件**：使用 Switch 时需加 `itemProps: { valuePropName: 'checked' }`
