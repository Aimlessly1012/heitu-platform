---
group:
  title: 画布
  order: 1

toc: content
order: 1
---

# Stage

## 描述

Stage 是 HeiTu Canvas 的根容器,负责创建画布、管理子图形和事件分发。所有图形(Rect / Circle / Line / Text / Custom / Group)都需要添加到 Stage 中才能渲染。

## 基础用法

<code src="./demo/stageDemo"></code>

## 带图形的 Stage

<code src="./demo/stageDemo1"></code>

## API

### buildContentDOM(config)

| 参数            | 说明                  | 类型          | 默认值 |
| --------------- | --------------------- | ------------- | ------ |
| container       | 挂载的 DOM 容器       | `HTMLElement`  | -      |
| width           | 画布宽度(px)          | `number`       | -      |
| height          | 画布高度(px)          | `number`       | -      |
| backgroundColor | 画布背景色            | `string`       | -      |

### 实例方法

| 方法            | 说明                         | 类型                              |
| --------------- | ---------------------------- | --------------------------------- |
| add             | 添加子图形                   | `(...children: Shape[]) => Stage` |
| destroy         | 销毁画布,清理事件和 DOM     | `() => void`                      |
| batchDraw       | 手动触发重绘                 | `(stage: Stage) => void`          |
| _resizeDOM      | 响应容器尺寸变化,配合 useResizeObserver 使用 | `() => void`          |
