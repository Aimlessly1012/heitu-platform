import { Form } from 'antd';
import React from 'react';
import { defaultNodeMap } from './config';
import { FormRenderProvider } from './context';
import FormRender from './FormRender';

type IFormRenderType = typeof FormRender;

interface IExportFormRender extends IFormRenderType {
  useForm: typeof Form.useForm;
  useWatch: typeof Form.useWatch;
  /** 全局注册自定义控件（在 Provider 外也生效） */
  registerNode: (typeName: string, component: React.ComponentType<any>) => void;
  /** 批量注册自定义控件 */
  registerNodes: (nodes: Record<string, React.ComponentType<any>>) => void;
  /** 通过 Context 注入自定义控件映射（支持嵌套） */
  Provider: typeof FormRenderProvider;
}

const ExportFormRender: IExportFormRender = FormRender as IExportFormRender;

// 静态方法
ExportFormRender.useForm = Form.useForm;
ExportFormRender.useWatch = Form.useWatch;

// 全局注册自定义控件（直接修改默认 nodeMap，无需 Provider）
ExportFormRender.registerNode = (typeName: string, component: React.ComponentType<any>) => {
  defaultNodeMap.set(typeName, component);
};

ExportFormRender.registerNodes = (nodes: Record<string, React.ComponentType<any>>) => {
  Object.entries(nodes).forEach(([key, comp]) => {
    defaultNodeMap.set(key, comp);
  });
};

// Provider 方式注册（Context 方式，支持作用域隔离和嵌套）
ExportFormRender.Provider = FormRenderProvider;

export default ExportFormRender;
export type {
  IConfigItem,
  IDividerItem,
  IFormRenderProps,
  IItem,
  INodeProps,
  IWatchValue,
} from './interface';
