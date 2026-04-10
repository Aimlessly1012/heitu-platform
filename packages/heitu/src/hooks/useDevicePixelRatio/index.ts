import { useEffect, useState } from 'react';
import type { UseDevicePixelRatio } from './interface';

const isBrowser = typeof window !== 'undefined';

/**
 * SSR-safe devicePixelRatio hook。
 * - SSR 初值为 1，客户端挂载后同步真实值
 * - 通过 matchMedia 监听 DPR 变化（拖到不同 DPI 屏幕、缩放页面）
 */
const useDevicePixelRatio: UseDevicePixelRatio = () => {
  const [pixelRatio, setPixelRatio] = useState<number>(() =>
    isBrowser ? window.devicePixelRatio || 1 : 1,
  );

  useEffect(() => {
    if (!isBrowser || typeof window.matchMedia !== 'function') return;

    let media: MediaQueryList | null = null;
    let cancelled = false;

    const update = () => {
      if (cancelled) return;
      const next = window.devicePixelRatio || 1;
      setPixelRatio(next);

      // 每次变化后旧 MediaQueryList 就过期了，需要重新绑定
      if (media) media.removeEventListener('change', update);
      media = window.matchMedia(`(resolution: ${next}dppx)`);
      media.addEventListener('change', update);
    };

    update();

    return () => {
      cancelled = true;
      if (media) media.removeEventListener('change', update);
    };
  }, []);

  return { pixelRatio } as const;
};

export default useDevicePixelRatio;
