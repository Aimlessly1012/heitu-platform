---
title: Claude Code Skill
order: 0
toc: content
---

# Skill: heitu-formrender

HeiTu 提供了 Claude Code Skill，当对话中涉及 JSON 驱动表单时自动加载，为 AI 提供精确的 API 参考。

## 触发条件

当需要创建表单、配置联动、异步数据源、注册自定义控件时自动触发。

## Skill 文件位置

```text
packages/heitu/.claude/skills/heitu-formrender/SKILL.md
```

## 覆盖内容

### 19 种内置控件

| type | 组件 | type | 组件 |
|------|------|------|------|
| `Input` | Input | `Select` | Select |
| `Input.Textarea` | TextArea | `TreeSelect` | TreeSelect |
| `Input.Password` | Password | `Cascader` | Cascader |
| `InputNumber` | InputNumber | `AutoComplete` | AutoComplete |
| `Radio` | Radio.Group | `Switch` | Switch |
| `Checkbox` | Checkbox.Group | `Slider` | Slider |
| `DatePicker` | DatePicker | `Rate` | Rate |
| `RangePicker` | RangePicker | `TimePicker` | TimePicker |
| `Upload` | Upload | `Dragger` | Upload.Dragger |

### 核心能力

| 能力 | 说明 |
|------|------|
| **多列布局** | 二维数组自动计算 span |
| **Watch 联动** | `watch` + 函数式 `nodeProps`/`rules` |
| **watchClean** | 依赖变化时自动清空字段 |
| **Hidden 显隐** | `nodeProps.hidden` 条件显隐 |
| **Service 异步** | `nodeProps.service` 异步数据源，内置竞态保护 |
| **自定义控件** | `registerNode` 全局注册 / `Provider` 作用域注册 |
| **isSub 嵌套** | 子表单模式，共享 form 实例 |
| **Render 自定义** | `render` 函数完全自定义渲染 |
