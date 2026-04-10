import { useEffect, useState } from 'react';
import type { UseWindowSize } from './interface';

const isBrowser = typeof window !== 'undefined';

/**
 * SSR-safe window size hook。
 * - SSR 环境返回 { width: 0, height: 0 }
 * - 客户端首帧通过 useEffect 同步真实尺寸
 */
const useWindowSize: UseWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>(
    () =>
      isBrowser
        ? { width: window.innerWidth, height: window.innerHeight }
        : { width: 0, height: 0 },
  );

  useEffect(() => {
    if (!isBrowser) return;
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    // 挂载时同步一次，避免 hydration 后错过首帧尺寸
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { width: windowSize.width, height: windowSize.height };
};

export default useWindowSize;
