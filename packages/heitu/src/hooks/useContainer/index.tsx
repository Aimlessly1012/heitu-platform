import React, { createContext, useContext, useMemo } from 'react';

// 容器创建函数
function createContainer<Value, Props = void>(
  useHook: (props: Props) => Value
) {
  // 创建 Context
  const Context = createContext<Value | null>(null);

  // Provider 组件
  function Provider({
    initialState,
    children,
    ...props
  }: {
    initialState?: Partial<Value>;
    children: React.ReactNode;
  } & Props) {
    // 调用 hook 获取状态和方法
    const value = useHook(props as Props);

    // 合并初始状态,依赖变化时才产生新引用,避免无谓的 consumer 重渲染
    const mergedValue = useMemo(
      () => ({ ...value, ...initialState }) as Value,
      [value, initialState],
    );

    return <Context.Provider value={mergedValue}>{children}</Context.Provider>;
  }

  // 自定义 hook，用于获取容器状态
  function useContainer(): Value {
    const value = useContext(Context);
    if (value === null) {
      throw new Error('Component must be wrapped with <Provider>');
    }
    return value;
  }

  // 高阶组件，用于包装类组件
  function withContainer<P extends object>(
    WrappedComponent: React.ComponentType<P & { container: Value }>
  ) {
    return function WithContainer(props: P) {
      const container = useContainer();
      return <WrappedComponent {...props} container={container} />;
    };
  }

  return {
    Provider,
    useContainer,
    withContainer,
    Context,
  };
}

export default createContainer; 