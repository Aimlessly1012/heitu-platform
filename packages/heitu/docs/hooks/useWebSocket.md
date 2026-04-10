---
group:
  title: Request
  order: 3

toc: content
order: 2
---

# useWebSocket

## 描述

WebSocket 连接管理 Hook,支持自动重连、手动控制、JSON 序列化。

## 演示

```tsx
import { useWebSocket } from 'heitu';
import React from 'react';

const styles = {
  card: { padding: 20, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: 480 },
  status: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, marginBottom: 16 },
  msg: { padding: '10px 14px', background: '#fff', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13, color: '#1E293B', marginBottom: 16, minHeight: 40, wordBreak: 'break-all' as const, fontFamily: 'monospace' },
  row: { display: 'flex', gap: 8 },
  btn: { padding: '8px 16px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  primary: { background: '#4F46E5', color: '#fff' },
  success: { background: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0' },
  danger: { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
};

const STATUS_MAP: Record<number, { label: string; bg: string; dotColor: string }> = {
  0: { label: 'Connecting', bg: '#FFFBEB', dotColor: '#F59E0B' },
  1: { label: 'Connected', bg: '#ECFDF5', dotColor: '#10B981' },
  2: { label: 'Closing', bg: '#FEF2F2', dotColor: '#F59E0B' },
  3: { label: 'Closed', bg: '#F1F5F9', dotColor: '#94A3B8' },
};

export default () => {
  const { readyState, sendMessage, connect, disconnect, latestMessage } =
    useWebSocket('wss://ws.postman-echo.com/raw', {
      json: true,
      reconnectLimit: 3,
    });

  const s = STATUS_MAP[readyState] || STATUS_MAP[3];

  return (
    <div style={styles.card}>
      <div style={{ ...styles.status, background: s.bg }}>
        <span style={{ ...styles.dot, background: s.dotColor }} />
        {s.label}
      </div>

      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Latest message</div>
      <div style={styles.msg}>
        {latestMessage ? JSON.stringify(latestMessage.data) : <span style={{ color: '#94A3B8' }}>No messages yet</span>}
      </div>

      <div style={styles.row}>
        <button
          style={{ ...styles.btn, ...styles.primary, opacity: readyState !== 1 ? 0.5 : 1 }}
          onClick={() => sendMessage({ text: 'hello', ts: Date.now() })}
          disabled={readyState !== 1}
        >
          Send Message
        </button>
        {readyState === 1 ? (
          <button style={{ ...styles.btn, ...styles.danger }} onClick={disconnect}>Disconnect</button>
        ) : (
          <button style={{ ...styles.btn, ...styles.success }} onClick={connect}>Connect</button>
        )}
      </div>
    </div>
  );
};
```

## API

### Options

| 参数              | 说明                | 类型                                              | 默认值 |
| ----------------- | ------------------- | ------------------------------------------------- | ------ |
| onOpen            | 连接建立时的回调    | `(event: WebSocketEventMap['open']) => void`      | -      |
| onClose           | 连接关闭时的回调    | `(event: WebSocketEventMap['close']) => void`     | -      |
| onMessage         | 收到消息时的回调    | `(message: WebSocketEventMap['message']) => void` | -      |
| onError           | 连接错误时的回调    | `(event: WebSocketEventMap['error']) => void`     | -      |
| protocols         | WebSocket 子协议    | `string \| string[]`                              | -      |
| reconnectLimit    | 重连次数限制        | `number`                                          | 3      |
| reconnectInterval | 重连间隔时间(ms)    | `number`                                          | 3000   |
| manual            | 是否手动控制连接    | `boolean`                                         | false  |
| json              | 是否自动序列化 JSON | `boolean`                                         | false  |

### 返回值

| 参数          | 说明               | 类型           |
| ------------- | ------------------ | -------------- |
| readyState    | 连接状态 (0-3)     | `number`       |
| sendMessage   | 发送消息           | `(msg) => void` |
| connect       | 手动连接           | `() => void`   |
| disconnect    | 断开连接           | `() => void`   |
| latestMessage | 最新收到的消息     | `MessageEvent` |
