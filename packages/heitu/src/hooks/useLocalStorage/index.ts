import { isBrowser } from 'heitu/utils/is';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

type ParserOptions<T> =
  | { raw: true }
  | {
      raw: false;
      serializer: (value: T) => string;
      deserializer: (value: string) => T;
    };

type Setter<T> = Dispatch<SetStateAction<T | undefined>>;
type Remover = () => void;

const getSerializer = <T,>(options?: ParserOptions<T>) =>
  options
    ? options.raw
      ? (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v))
      : options.serializer
    : JSON.stringify;

const getDeserializer = <T,>(options?: ParserOptions<T>) =>
  options ? (options.raw ? (v: string) => v as unknown as T : options.deserializer) : JSON.parse;

/**
 * SSR-safe useLocalStorage。
 * - 不在顶层条件 return（遵守 Rules of Hooks）
 * - 默认监听 storage 事件实现跨标签页同步
 */
const useLocalStorage = <T>(
  key: string,
  initialValue?: T,
  options?: ParserOptions<T>,
): [T | undefined, Setter<T>, Remover] => {
  if (!key) {
    throw new Error('useLocalStorage: key may not be falsy');
  }

  const serializerRef = useRef(getSerializer<T>(options));
  const deserializerRef = useRef(getDeserializer<T>(options));
  serializerRef.current = getSerializer<T>(options);
  deserializerRef.current = getDeserializer<T>(options);

  const read = useCallback((): T | undefined => {
    if (!isBrowser) return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) return deserializerRef.current(raw) as T;
      if (initialValue !== undefined) {
        window.localStorage.setItem(key, serializerRef.current(initialValue) as string);
      }
      return initialValue;
    } catch {
      return initialValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [state, setState] = useState<T | undefined>(read);

  // key 变化时重新读取
  useEffect(() => {
    setState(read());
  }, [key, read]);

  const set: Setter<T> = useCallback(
    (valOrFunc) => {
      setState((prev) => {
        const newState =
          typeof valOrFunc === 'function'
            ? (valOrFunc as (p: T | undefined) => T | undefined)(prev)
            : valOrFunc;
        if (newState === undefined) return prev;
        try {
          if (isBrowser) {
            window.localStorage.setItem(
              key,
              serializerRef.current(newState) as string,
            );
          }
        } catch {
          /* private mode / quota */
        }
        return newState;
      });
    },
    [key],
  );

  const remove: Remover = useCallback(() => {
    try {
      if (isBrowser) window.localStorage.removeItem(key);
    } catch {
      /* noop */
    }
    setState(undefined);
  }, [key]);

  // 跨标签页同步
  useEffect(() => {
    if (!isBrowser) return;
    const handler = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== window.localStorage) return;
      if (e.newValue === null) {
        setState(undefined);
        return;
      }
      try {
        setState(deserializerRef.current(e.newValue) as T);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  return [state, set, remove];
};

export default useLocalStorage;
