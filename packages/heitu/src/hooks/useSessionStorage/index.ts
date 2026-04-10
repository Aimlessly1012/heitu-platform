import { isBrowser } from 'heitu/utils/is';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

type Setter<T> = Dispatch<SetStateAction<T | undefined>>;

/**
 * SSR-safe useSessionStorage。
 * - 始终调用 hook（遵守 Rules of Hooks）
 * - 只在 set 时写入，避免原实现每次 render 都落盘
 * - key 变更时重新读取
 */
const useSessionStorage = <T>(
  key: string,
  initialValue?: T,
  raw?: boolean,
): [T | undefined, Setter<T>, () => void] => {
  if (!key) throw new Error('useSessionStorage: key may not be falsy');

  const rawRef = useRef(raw);
  rawRef.current = raw;

  const read = useCallback((): T | undefined => {
    if (!isBrowser) return initialValue;
    try {
      const v = window.sessionStorage.getItem(key);
      if (v === null) {
        if (initialValue !== undefined) {
          window.sessionStorage.setItem(
            key,
            rawRef.current ? String(initialValue) : JSON.stringify(initialValue),
          );
        }
        return initialValue;
      }
      return rawRef.current ? (v as unknown as T) : (JSON.parse(v) as T);
    } catch {
      return initialValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [state, setState] = useState<T | undefined>(read);

  useEffect(() => {
    setState(read());
  }, [key, read]);

  const set: Setter<T> = useCallback(
    (valOrFunc) => {
      setState((prev) => {
        const next =
          typeof valOrFunc === 'function'
            ? (valOrFunc as (p: T | undefined) => T | undefined)(prev)
            : valOrFunc;
        if (next === undefined) return prev;
        try {
          if (isBrowser) {
            window.sessionStorage.setItem(
              key,
              rawRef.current ? String(next) : JSON.stringify(next),
            );
          }
        } catch {
          /* quota / private mode */
        }
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    try {
      if (isBrowser) window.sessionStorage.removeItem(key);
    } catch {
      /* noop */
    }
    setState(undefined);
  }, [key]);

  return [state, set, remove];
};

export default useSessionStorage;
