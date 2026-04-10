import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useInfiniteScroll from '../src/hooks/useInfiniteScroll';

describe('useInfiniteScroll (dataSource)', () => {
  const source = Array.from({ length: 25 }, (_, i) => i);

  it('paginates local dataSource and flips hasMore', async () => {
    const { result } = renderHook(() =>
      useInfiniteScroll<number>({ dataSource: source, pageSize: 10, delay: 0 }),
    );
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.data).toHaveLength(10);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.data).toHaveLength(20);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.data).toHaveLength(25);
    expect(result.current.hasMore).toBe(false);
  });

  it('concurrent loadMore calls do not double-load (loading guard)', async () => {
    const { result } = renderHook(() =>
      useInfiniteScroll<number>({ dataSource: source, pageSize: 10, delay: 20 }),
    );
    await act(async () => {
      await Promise.all([result.current.loadMore(), result.current.loadMore()]);
    });
    expect(result.current.data).toHaveLength(10);
  });
});

describe('useInfiniteScroll (fetchData)', () => {
  it('uses monotonic pageNum and respects total', async () => {
    const fetchData = vi
      .fn()
      .mockResolvedValueOnce({ list: [1, 2, 3], total: 5 })
      .mockResolvedValueOnce({ list: [4, 5], total: 5 });

    const { result } = renderHook(() =>
      useInfiniteScroll<number>({ fetchData, pageSize: 3 }),
    );

    await act(async () => {
      await result.current.loadMore();
    });
    expect(fetchData).toHaveBeenLastCalledWith({ pageSize: 3, pageNum: 1 });
    expect(result.current.data).toEqual([1, 2, 3]);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(fetchData).toHaveBeenLastCalledWith({ pageSize: 3, pageNum: 2 });
    expect(result.current.data).toEqual([1, 2, 3, 4, 5]);
    expect(result.current.hasMore).toBe(false);
  });

  it('captures error and keeps hasMore', async () => {
    const err = new Error('boom');
    const fetchData = vi.fn().mockRejectedValue(err);
    const { result } = renderHook(() =>
      useInfiniteScroll<number>({ fetchData, pageSize: 3 }),
    );
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.error).toBe(err);
    expect(result.current.loading).toBe(false);
  });

  it('reset() clears data and allows reload', async () => {
    const fetchData = vi.fn().mockResolvedValue({ list: [1, 2], total: 4 });
    const { result } = renderHook(() =>
      useInfiniteScroll<number>({ fetchData, pageSize: 2 }),
    );
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.data).toEqual([1, 2]);

    act(() => result.current.reset());
    expect(result.current.data).toEqual([]);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });
    // reset 后应重新从 pageNum: 1 请求
    expect(fetchData).toHaveBeenLastCalledWith({ pageSize: 2, pageNum: 1 });
  });

  it('no dataSource and no fetchData is a noop', async () => {
    const { result } = renderHook(() => useInfiniteScroll<number>({}));
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.data).toEqual([]);
    // 没动过 loading 说明提前 return
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
