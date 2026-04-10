import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  reconnectLimit?: number;
  reconnectInterval?: number;
  manual?: boolean;
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
  onMessage?: (message: WebSocketEventMap['message']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
  /** 是否自动 JSON 序列化 / 反序列化 */
  json?: boolean;
  protocols?: string | string[];
}

const isBrowser = typeof window !== 'undefined' && typeof WebSocket !== 'undefined';

const useWebSocket = (url: string, options: Options = {}) => {
  const {
    reconnectLimit = 3,
    reconnectInterval = 3000,
    manual = false,
    protocols,
    json,
  } = options;

  const [readyState, setReadyState] = useState<number>(
    isBrowser ? WebSocket.CLOSED : 3,
  );
  const [latestMessage, setLatestMessage] = useState<
    WebSocketEventMap['message'] | null
  >(null);

  // 用 ref 保存回调，避免 stale closure 导致只认最初 render 的回调
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const websocketRef = useRef<WebSocket>(undefined);
  const reconnectTimesRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const manualCloseRef = useRef(false);
  const unmountedRef = useRef(false);

  const clearReconnect = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = undefined;
    }
  };

  const connect = useCallback(() => {
    if (!isBrowser || !url) return;

    // 清理旧连接，避免并发多连接
    clearReconnect();
    if (websocketRef.current) {
      websocketRef.current.onopen = null;
      websocketRef.current.onclose = null;
      websocketRef.current.onmessage = null;
      websocketRef.current.onerror = null;
      if (
        websocketRef.current.readyState === WebSocket.OPEN ||
        websocketRef.current.readyState === WebSocket.CONNECTING
      ) {
        websocketRef.current.close();
      }
    }

    manualCloseRef.current = false;
    setReadyState(WebSocket.CONNECTING);

    const ws = new WebSocket(url, protocols);
    websocketRef.current = ws;

    ws.onopen = (event) => {
      if (unmountedRef.current || websocketRef.current !== ws) return;
      reconnectTimesRef.current = 0;
      setReadyState(WebSocket.OPEN);
      optionsRef.current.onOpen?.(event);
    };

    ws.onclose = (event) => {
      if (websocketRef.current !== ws) return;
      setReadyState(WebSocket.CLOSED);
      optionsRef.current.onClose?.(event);

      if (
        !manualCloseRef.current &&
        !unmountedRef.current &&
        reconnectTimesRef.current < reconnectLimit
      ) {
        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimesRef.current += 1;
          connect();
        }, reconnectInterval);
      }
    };

    ws.onmessage = (event) => {
      if (websocketRef.current !== ws) return;
      let parsed: any = event;
      if (json) {
        try {
          parsed = { ...event, data: JSON.parse(event.data) };
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[useWebSocket] JSON parse failed:', e);
        }
      }
      setLatestMessage(parsed);
      optionsRef.current.onMessage?.(parsed);
    };

    ws.onerror = (event) => {
      if (websocketRef.current !== ws) return;
      optionsRef.current.onError?.(event);
    };
  }, [url, protocols, reconnectLimit, reconnectInterval, json]);

  const sendMessage = useCallback(
    (message: unknown) => {
      const ws = websocketRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        // eslint-disable-next-line no-console
        console.warn('[useWebSocket] socket not open, message dropped');
        return;
      }
      const payload: any = json
        ? JSON.stringify(message)
        : (message as string | ArrayBufferLike | Blob | ArrayBufferView);
      ws.send(payload);
    },
    [json],
  );

  const disconnect = useCallback(() => {
    manualCloseRef.current = true;
    clearReconnect();
    websocketRef.current?.close();
  }, []);

  useEffect(() => {
    unmountedRef.current = false;
    if (!manual) connect();
    return () => {
      unmountedRef.current = true;
      manualCloseRef.current = true;
      clearReconnect();
      const ws = websocketRef.current;
      if (ws) {
        ws.onopen = null;
        ws.onclose = null;
        ws.onmessage = null;
        ws.onerror = null;
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close();
        }
      }
    };
  }, [url, manual, connect]);

  return {
    readyState,
    sendMessage,
    connect,
    disconnect,
    webSocketIns: websocketRef.current,
    latestMessage,
  };
};

export default useWebSocket;
