import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useWebSocket from '../src/hooks/useWebSocket';

// 简单的 MockWebSocket，支持手动触发 open/message/close/error
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  static instances: MockWebSocket[] = [];

  url: string;
  protocols?: string | string[];
  readyState = MockWebSocket.CONNECTING;
  onopen: ((e: any) => void) | null = null;
  onclose: ((e: any) => void) | null = null;
  onmessage: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  sent: any[] = [];

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
    MockWebSocket.instances.push(this);
  }

  send(data: any) {
    this.sent.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code: 1000, reason: '', wasClean: true });
  }

  // helpers
  _open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.({});
  }
  _message(data: any) {
    this.onmessage?.({ data });
  }
  _errorClose() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code: 1006, reason: 'abnormal', wasClean: false });
  }
}

beforeEach(() => {
  MockWebSocket.instances = [];
  (globalThis as any).WebSocket = MockWebSocket;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useWebSocket', () => {
  it('auto-connects and transitions readyState on open', () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() =>
      useWebSocket('ws://x', { onOpen }),
    );
    expect(MockWebSocket.instances).toHaveLength(1);
    act(() => MockWebSocket.instances[0]._open());
    expect(result.current.readyState).toBe(MockWebSocket.OPEN);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('json option parses incoming messages and serializes sends', () => {
    const onMessage = vi.fn();
    const { result } = renderHook(() =>
      useWebSocket('ws://x', { json: true, onMessage }),
    );
    act(() => MockWebSocket.instances[0]._open());
    expect(result.current.readyState).toBe(MockWebSocket.OPEN);

    act(() => MockWebSocket.instances[0]._message('{"hello":"world"}'));
    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage.mock.calls[0][0].data).toEqual({ hello: 'world' });

    act(() => result.current.sendMessage({ a: 1 }));
    expect(MockWebSocket.instances[0].sent).toEqual(['{"a":1}']);
  });

  it('uses latest callback (no stale closure)', () => {
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useWebSocket('ws://x', { onMessage: cb }),
      { initialProps: { cb: spy1 } },
    );
    act(() => MockWebSocket.instances[0]._open());
    expect(result.current.readyState).toBe(MockWebSocket.OPEN);

    rerender({ cb: spy2 });
    act(() => MockWebSocket.instances[0]._message('hi'));
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalledTimes(1);
  });

  it('reconnects up to reconnectLimit on abnormal close', () => {
    renderHook(() =>
      useWebSocket('ws://x', { reconnectLimit: 2, reconnectInterval: 1000 }),
    );
    expect(MockWebSocket.instances).toHaveLength(1);

    act(() => MockWebSocket.instances[0]._errorClose());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(MockWebSocket.instances).toHaveLength(2);

    act(() => MockWebSocket.instances[1]._errorClose());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(MockWebSocket.instances).toHaveLength(3);

    // 达到上限后不再重连
    act(() => MockWebSocket.instances[2]._errorClose());
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(MockWebSocket.instances).toHaveLength(3);
  });

  it('disconnect() prevents reconnect', () => {
    const { result } = renderHook(() =>
      useWebSocket('ws://x', { reconnectLimit: 5, reconnectInterval: 1000 }),
    );
    act(() => MockWebSocket.instances[0]._open());
    act(() => result.current.disconnect());
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it('unmount cancels pending reconnect', () => {
    const { unmount } = renderHook(() =>
      useWebSocket('ws://x', { reconnectLimit: 5, reconnectInterval: 1000 }),
    );
    act(() => MockWebSocket.instances[0]._errorClose());
    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it('sendMessage before open is dropped with warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useWebSocket('ws://x'));
    act(() => result.current.sendMessage('hello'));
    expect(MockWebSocket.instances[0].sent).toEqual([]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
