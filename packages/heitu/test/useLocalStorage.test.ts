import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import useLocalStorage from '../src/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns initialValue when storage is empty and writes it', () => {
    const { result } = renderHook(() => useLocalStorage<string>('k', 'hello'));
    expect(result.current[0]).toBe('hello');
    expect(window.localStorage.getItem('k')).toBe(JSON.stringify('hello'));
  });

  it('reads pre-existing value from storage', () => {
    window.localStorage.setItem('k', JSON.stringify({ a: 1 }));
    const { result } = renderHook(() => useLocalStorage<{ a: number }>('k'));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it('set() with value persists and updates state', () => {
    const { result } = renderHook(() => useLocalStorage<number>('k', 0));
    act(() => result.current[1](42));
    expect(result.current[0]).toBe(42);
    expect(window.localStorage.getItem('k')).toBe('42');
  });

  it('set() with updater function reads previous state', () => {
    const { result } = renderHook(() => useLocalStorage<number>('k', 1));
    act(() => result.current[1]((prev) => (prev ?? 0) + 10));
    expect(result.current[0]).toBe(11);
  });

  it('remove() clears storage and state', () => {
    const { result } = renderHook(() => useLocalStorage<string>('k', 'v'));
    act(() => result.current[2]());
    expect(result.current[0]).toBeUndefined();
    expect(window.localStorage.getItem('k')).toBeNull();
  });

  it('set(undefined) is a no-op', () => {
    const { result } = renderHook(() => useLocalStorage<number>('k', 1));
    act(() => result.current[1](undefined));
    expect(result.current[0]).toBe(1);
  });

  it('cross-tab storage event syncs state', () => {
    const { result } = renderHook(() => useLocalStorage<string>('k', 'a'));
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'k',
          newValue: JSON.stringify('b'),
          storageArea: window.localStorage,
        }),
      );
    });
    expect(result.current[0]).toBe('b');
  });

  it('throws on empty key', () => {
    expect(() => renderHook(() => useLocalStorage<string>(''))).toThrow();
  });
});
