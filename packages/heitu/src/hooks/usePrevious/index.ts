import { useLayoutEffect, useRef } from 'react';

/**
 * 返回上一次渲染时的值,首次渲染返回 undefined。
 */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default usePrevious;
