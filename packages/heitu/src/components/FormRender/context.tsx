import React, { createContext, useContext, useMemo } from 'react';
import { defaultNodeMap } from './config';

/** 控件注册表上下文 */
interface IFormRenderContextValue {
  nodeMap: Map<string, React.ComponentType<any>>;
}

const FormRenderContext = createContext<IFormRenderContextValue>({
  nodeMap: defaultNodeMap,
});

export interface IFormRenderProviderProps {
  /** 额外注册的自定义控件映射，会与内置控件合并（同名覆盖） */
  components?: Record<string, React.ComponentType<any>>;
  children: React.ReactNode;
}

/**
 * FormRender.Provider — 全局注册自定义控件
 *
 * @example
 * ```tsx
 * import { FormRender } from 'heitu';
 * import MyEditor from './MyEditor';
 *
 * <FormRender.Provider components={{ RichEditor: MyEditor }}>
 *   <FormRender config={[{ type: 'RichEditor', name: 'content', label: '内容' }]} />
 * </FormRender.Provider>
 * ```
 */
export const FormRenderProvider: React.FC<IFormRenderProviderProps> = ({
  components,
  children,
}) => {
  const parentCtx = useContext(FormRenderContext);

  const mergedNodeMap = useMemo(() => {
    if (!components || Object.keys(components).length === 0) {
      return parentCtx.nodeMap;
    }
    // 合并：parent + 自定义（支持嵌套 Provider）
    const merged = new Map(parentCtx.nodeMap);
    Object.entries(components).forEach(([key, comp]) => {
      merged.set(key, comp);
    });
    return merged;
  }, [parentCtx.nodeMap, components]);

  return (
    <FormRenderContext.Provider value={{ nodeMap: mergedNodeMap }}>
      {children}
    </FormRenderContext.Provider>
  );
};

/**
 * 获取当前控件注册表（内置 + 用户注册）
 */
export const useNodeMap = (): Map<string, React.ComponentType<any>> => {
  const ctx = useContext(FormRenderContext);
  return ctx.nodeMap;
};
