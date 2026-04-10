import { Col, Divider, Form } from 'antd';
import { isEqual, isFunction, isString, omit } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNodeMap } from './context';
import type { IItemRenderProps } from './interface';

const uWatch = Form.useWatch;

/**
 * 深比较 hook：仅当 value 深层变化时返回新引用，否则保持旧引用
 * 替代 JSON.stringify 比较方案，避免循环引用崩溃和性能问题
 */
function useDeepCompareMemo<T>(value: T): T {
  const ref = useRef<T>(value);
  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
}

const ItemRender: React.FC<IItemRenderProps> = (props) => {
  const nodeMap = useNodeMap();

  const {
    data: {
      type,
      label,
      render,
      name,
      watch = [],
      watchClean = false,
      rules = [],
      itemProps = {},
      nodeProps = {},
    } = {},
    form,
    span,
  } = props;

  // 截流后的监听字段
  const [debouncedWatchValue, setDebouncedWatchValue] = useState<unknown[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // 竞态保护：请求计数器
  const fetchIdRef = useRef(0);

  // 监听字段变化
  // Bug fix: 不再用 filter(Boolean)，0 / false / "" 都是合法表单值
  const watchValue = watch?.map((item) => uWatch(item, form));

  // 稳定化 watchValue 引用（深比较）
  const stableWatchValue = useDeepCompareMemo(watchValue);

  // 异步获取数据
  const [asyncState, setAsyncState] = useState<{
    value: unknown;
    loading: boolean;
    error: Error | null;
  }>({ value: undefined, loading: false, error: null });

  const onFetchData = useCallback(
    async (wv: unknown[]) => {
      const resolvedNodeProps = isFunction(nodeProps)
        ? nodeProps(form, wv)
        : nodeProps;
      if (isFunction(resolvedNodeProps?.service)) {
        // 竞态保护：记录当前请求 ID
        const currentFetchId = ++fetchIdRef.current;
        setAsyncState((s) => ({ ...s, loading: true, error: null }));
        try {
          const result = await resolvedNodeProps.service(form, wv);
          // 只有最新的请求才更新状态
          if (currentFetchId === fetchIdRef.current) {
            setAsyncState({ value: result, loading: false, error: null });
          }
        } catch (err) {
          if (currentFetchId === fetchIdRef.current) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.warn(`[FormRender] service error for field "${String(name)}":`, error);
            setAsyncState((s) => ({ ...s, loading: false, error }));
            // 支持 onError 回调
            if (isFunction(resolvedNodeProps?.onError)) {
              resolvedNodeProps.onError(error, name);
            }
          }
        }
      }
    },
    [form, nodeProps, name],
  );

  // 截流 watch 数据 + watchClean 实现
  useEffect(() => {
    if (watch?.length) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDebouncedWatchValue(stableWatchValue);
        onFetchData(stableWatchValue);

        // watchClean: 监听字段变更后清除当前字段数据
        if (watchClean && name && form) {
          form.resetFields(Array.isArray(name) ? [name] : [name]);
        }
      }, 300);
    }
    return () => clearTimeout(timerRef.current);
  }, [stableWatchValue, onFetchData, watch?.length, watchClean, name, form]);

  // 稳定化 debouncedWatchValue
  const stableDebouncedWatchValue = useDeepCompareMemo(debouncedWatchValue);

  // 函数式获取控件数据
  const newNodeProps = useMemo(() => {
    if (isFunction(nodeProps)) {
      return nodeProps(form, stableDebouncedWatchValue);
    }
    return nodeProps;
  }, [nodeProps, stableDebouncedWatchValue, form]);

  // 函数式获取表单项数据
  const newItemProps = useMemo(() => {
    if (isFunction(itemProps)) {
      return itemProps(form, stableDebouncedWatchValue);
    }
    return itemProps;
  }, [itemProps, stableDebouncedWatchValue, form]);

  // 函数式获取规则数据
  const newRules = useMemo(() => {
    if (isFunction(rules)) {
      return rules(form, stableDebouncedWatchValue);
    }
    return rules;
  }, [rules, stableDebouncedWatchValue, form]);

  // 自定义渲染
  if (render) {
    return render(form, props.data, stableDebouncedWatchValue);
  }

  let Node: React.ComponentType<any> | null = (type as React.ComponentType<any>) || null;

  // 内置组件
  if (isString(type)) {
    switch (type) {
      case 'Line':
        return <Divider>{label}</Divider>;
      default:
        Node = nodeMap.get(type) || null;
        break;
    }
  }

  // 拷贝一份 nodeProps 用于处理
  const finalNodeProps = { ...newNodeProps };

  // 请求服务处理
  if (isFunction(finalNodeProps.service)) {
    finalNodeProps.options = isFunction(finalNodeProps.transformData)
      ? finalNodeProps.transformData(asyncState.value)
      : asyncState.value;
  } else {
    finalNodeProps.options = isFunction(finalNodeProps.transformData)
      ? finalNodeProps.transformData(finalNodeProps.options)
      : finalNodeProps.options;
  }

  // 容错处理
  if (!Node || finalNodeProps.hidden) {
    return null;
  }

  const extraProps: Record<string, unknown> = {};
  if (asyncState.loading) {
    extraProps.loading = true;
  }
  if (asyncState.loading || finalNodeProps.disabled) {
    extraProps.disabled = true;
  }

  return (
    <Col span={span}>
      <Form.Item
        colon={false}
        label={label}
        name={name}
        rules={newRules}
        {...newItemProps}
      >
        <Node
          key={String(stableDebouncedWatchValue)}
          {...omit(finalNodeProps, ['transformData', 'service', 'disabled', 'hidden', 'onError'])}
          {...extraProps}
        />
      </Form.Item>
    </Col>
  );
};

export default ItemRender;
