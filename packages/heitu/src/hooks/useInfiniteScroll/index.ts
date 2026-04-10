import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollProps<T> {
  /** 本地数据源（与 fetchData 二选一） */
  dataSource?: T[];
  /** 本地数据源分页的模拟延迟 */
  delay?: number;
  /** 每页数据条数 */
  pageSize?: number;
  /** 远程数据源 */
  fetchData?: (params: { pageSize: number; pageNum: number }) => Promise<{
    total?: number;
    list?: T[];
  }>;
  /** 依赖项变化时自动重置并重新加载 */
  resetDeps?: ReadonlyArray<unknown>;
}

interface UseInfiniteScrollResult<T> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  loading: boolean;
  hasMore: boolean;
  error: unknown;
  loadMore: () => Promise<void>;
  reset: () => void;
}

/**
 * 无限滚动 Hook
 */
export default function useInfiniteScroll<T = any>({
  dataSource,
  delay = 100,
  pageSize = 10,
  fetchData,
  resetDeps = [],
}: UseInfiniteScrollProps<T>): UseInfiniteScrollResult<T> {
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<unknown>(null);

  // 用 ref 兜住最新状态，避免并发 loadMore 时读到过期 data
  const dataRef = useRef<T[]>(data);
  dataRef.current = data;
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  hasMoreRef.current = hasMore;
  const pageNumRef = useRef(0);
  const reqIdRef = useRef(0);

  const reset = useCallback(() => {
    reqIdRef.current += 1;
    pageNumRef.current = 0;
    dataRef.current = [];
    loadingRef.current = false;
    setData([]);
    setLoading(false);
    setHasMore(true);
    setError(null);
  }, []);

  const loadMore = useCallback(async () => {
    if (!dataSource?.length && !fetchData) return;
    if (!hasMoreRef.current || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    const currentReqId = reqIdRef.current;
    const nextPageNum = pageNumRef.current + 1;

    try {
      if (dataSource) {
        const list: T[] = await new Promise((resolve) => {
          setTimeout(() => {
            const start = dataRef.current.length;
            resolve(dataSource.slice(start, start + pageSize));
          }, delay);
        });
        if (currentReqId !== reqIdRef.current) return;
        pageNumRef.current = nextPageNum;
        setData((prev) => {
          const next = prev.concat(list);
          setHasMore(next.length < dataSource.length);
          return next;
        });
      } else if (fetchData) {
        const { list = [], total = 0 } = await fetchData({
          pageSize,
          pageNum: nextPageNum,
        });
        if (currentReqId !== reqIdRef.current) return;
        pageNumRef.current = nextPageNum;
        setData((prev) => {
          const next = prev.concat(list);
          setHasMore(list.length > 0 && next.length < total);
          return next;
        });
      }
    } catch (e) {
      if (currentReqId === reqIdRef.current) setError(e);
    } finally {
      if (currentReqId === reqIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [dataSource, fetchData, pageSize, delay]);

  // 依赖项变化时自动重置
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  return { data, setData, loading, hasMore, error, loadMore, reset };
}
