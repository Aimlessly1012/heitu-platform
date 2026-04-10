import type { FormInstance, FormItemProps, FormProps, Rule } from 'antd/es/form';
import type React from 'react';

/** 监听数据类型 — watch 返回值始终是数组 */
export type IWatchValue = unknown[];

/** 控件 props */
export interface INodeProps {
  /** 数据转换 */
  transformData?: <T = unknown>(
    data: T,
  ) => { label: string; value: string | number }[];
  /** 禁用状态 */
  disabled?: boolean;
  /** 是否隐藏单个表单项（hidden 为 true 时整个表单项不渲染） */
  hidden?: boolean;
  /** 异步数据获取 */
  service?: (form?: FormInstance, watchValue?: IWatchValue) => Promise<unknown>;
  /** 异步请求失败回调 */
  onError?: (error: Error, fieldName?: string | Array<string | number>) => void;
  [key: string]: unknown;
}

/** 分割线配置 */
export interface IDividerItem {
  /** 标记为分割线 */
  divider: true;
  /** 分割线标题 */
  label?: React.ReactNode;
  /** 标题位置 */
  titlePlacement?: 'left' | 'center' | 'right' | 'start' | 'end';
}

/** 单个表单项配置 */
export interface IItem {
  /** 控件类型：内置字符串 或 自定义 React 组件 */
  type?:
    | React.ComponentType<{ loading?: boolean; disabled?: boolean }>
    | string
    | 'Line';
  /** 字段表单 key */
  name?: string | Array<string | number>;
  /** 字段名称 */
  label?: React.ReactNode;
  /** 表单规则 */
  rules?: Rule[] | ((form?: FormInstance, watchValue?: IWatchValue) => Rule[]);
  /** 包裹控件 props */
  itemProps?:
    | (FormItemProps & Record<string, unknown>)
    | ((
        form?: FormInstance,
        watchValue?: IWatchValue,
      ) => FormItemProps & Record<string, unknown>);
  /** 控件 props */
  nodeProps?:
    | INodeProps
    | ((form?: FormInstance, watchValue?: IWatchValue) => INodeProps);
  /** 监听的字段 */
  watch?: string[];
  /** 监听字段变更后是否清除当前字段数据（默认 false） */
  watchClean?: boolean;
  /** 自定义渲染 */
  render?: (
    form?: FormInstance,
    data?: IItem,
    watchValue?: IWatchValue,
  ) => React.ReactElement;
  /** 栅格 */
  span?: number;
}

/** 配置项：表单项 或 分割线 */
export type IConfigItem = IItem | IDividerItem;

/** FormRender 组件 Props */
export interface IFormRenderProps extends FormProps {
  /** 表单配置：一维数组 = 每行一项，二维数组 = 一行多项，支持分割线 */
  config: (IConfigItem | IConfigItem[])[];
  /** 栅格间距 */
  gutter?: [number, number];
  /** form 实例 */
  form?: FormInstance;
  /** 是否是嵌套子表单（不再包裹 Form 标签） */
  isSub?: boolean;
  /** 额外内容 */
  extra?: React.ReactNode;
}

/** ItemRender Props */
export interface IItemRenderProps {
  data: IItem;
  form?: FormInstance;
  span: number;
}
