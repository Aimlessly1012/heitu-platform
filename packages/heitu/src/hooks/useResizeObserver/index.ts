import { defaultOptions } from 'heitu/utils/defaults';
import { useEffect } from 'react';

const useResizeObserver = (
  containerRef: any,
  cb: ResizeObserverCallback,
  options: ResizeObserverOptions = defaultOptions,
) => {
  useEffect(() => {
    const el = containerRef?.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ob = new ResizeObserver(cb);
    ob.observe(el, options);
    return () => {
      ob.disconnect();
    };
  }, [containerRef, cb, options]);
};

export default useResizeObserver;
