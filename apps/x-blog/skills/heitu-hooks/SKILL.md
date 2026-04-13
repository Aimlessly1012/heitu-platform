---
name: heitu-hooks
description: 使用 heitu 包的 React Hooks 编写代码。当需要使用 useAsyncFn、useWebSocket、usePolling、useLocalStorage 等 hooks 时触发
allowed-tools: Read Bash Edit Write
---

# Heitu Hooks 开发指南

使用 `heitu/hooks` 包中的 React Hooks 编写代码时，遵循以下规范。

## 安装与导入

```ts
import { useAsyncFn, useWebSocket, usePolling } from 'heitu/hooks'
// 或从根路径
import { useAsyncFn } from 'heitu'
```

**可选 peer 依赖：**
- `axios` → useHtAxios
- `js-cookie` → useCookie

## 完整 API 参考

### useAsyncFn — 异步函数状态管理

```ts
const [state, callback] = useAsyncFn(asyncFn, deps?, initialState?)
// state: { loading, error?, value? }
// callback: 调用后触发 asyncFn，自动管理 loading/error/value
```

**示例：**
```tsx
const [state, fetchUser] = useAsyncFn(async (id: string) => {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}, [])

useEffect(() => { fetchUser('123') }, [])
if (state.loading) return <Spin />
if (state.error) return <Alert message={state.error.message} />
return <div>{state.value?.name}</div>
```

### useCancelAsyncFn — 可取消异步请求

```ts
const [state, run] = useCancelAsyncFn(async (ctx) => {
  // ctx.signal: AbortSignal，传给 fetch
  // ctx.cancelInterceptor: 手动取消
  return fetch('/api/data', { signal: ctx.signal })
}, deps)
```

### createContainer — 共享状态容器

```ts
const { Provider, useContainer } = createContainer(() => {
  const [count, setCount] = useState(0)
  return { count, setCount }
})
// 父组件包裹 <Provider>，子组件用 useContainer() 获取状态
```

### useCookie — Cookie 读写

```ts
const [value, setValue, refresh] = useCookie('token', options?, defaultValue?)
// setValue('abc') 或 setValue(prev => prev + '1')
// refresh() 重新从 cookie 读取
```
> 需要安装 `js-cookie`

### useCountDown — 倒计时

```ts
const [seconds, start, stop] = useCountDown()
start(60) // 开始 60 秒倒计时
stop()     // 手动停止
```

### useDeepCompareEffect — 深比较 Effect

```ts
useDeepCompareEffect(() => {
  // 当 deps 深层值变化时才触发，而非引用变化
}, [complexObject])
```

### useDevicePixelRatio — 设备像素比

```ts
const { pixelRatio } = useDevicePixelRatio()
// 响应式监听 DPI 变化，SSR 安全
```

### useElementSize — 元素尺寸

```ts
const ref = useRef<HTMLDivElement>(null)
const { width, height } = useElementSize(ref)
```

### useHtAxios — Axios 封装

```ts
const { get, post, put, del } = useHtAxios({
  config: { baseURL: '/api', timeout: 5000 },
  requestInterceptorsCallback: (config) => { /* 加 token */ return config },
  responseInterceptorOnSuccessCallback: (res) => res,
  responseInterceptorOnErrorCallback: (err) => Promise.reject(err),
})
const data = await get<Params, Result>('/users', { page: 1 })
```
> 需要安装 `axios`

### useImageLoad — 图片预加载

```ts
const [current, allImages, successImages, isLoading] = useImageLoad({
  imgList: ['a.png', 'b.png', 'c.png']
})
// 顺序加载图片，跟踪成功/失败状态
```

### useInfiniteScroll — 无限滚动

```ts
const { data, loading, hasMore, loadMore, reset } = useInfiniteScroll({
  pageSize: 20,
  fetchData: async ({ pageSize, pageNum }) => {
    const res = await fetch(`/api/list?page=${pageNum}&size=${pageSize}`)
    return res.json() // { total: number, list: T[] }
  },
  resetDeps: [searchKeyword], // 依赖变化时自动重置
})
```

### useInView — 视口检测

```ts
const [ref, inView] = useInView({ threshold: 0.5 }, triggerOnce?)
// <div ref={ref}>{inView ? '可见' : '不可见'}</div>
```

### useLocalStorage — 本地存储

```ts
const [value, setValue, remove] = useLocalStorage<User>('user', defaultUser)
// 支持跨 tab 同步、自定义序列化
```

### usePolling — 轮询

```ts
const { data, loading, error, start, stop } = usePolling(
  () => fetch('/api/status').then(r => r.json()),
  {
    interval: 3000,
    manual: false,     // 自动开始
    retryTimes: 3,     // 失败重试次数
    retryInterval: 1000,
    onSuccess: (data) => console.log(data),
    onError: (err) => console.error(err),
  }
)
```

### usePrevious — 上一次值

```ts
const prevCount = usePrevious(count)
```

### useResizeObserver — 尺寸观察

```ts
const ref = useRef<HTMLDivElement>(null)
useResizeObserver(ref, (entries) => {
  const { width, height } = entries[0].contentRect
})
```

### useSessionStorage — 会话存储

```ts
const [value, setValue, remove] = useSessionStorage<T>('key', initialValue, raw?)
```

### useWebSocket — WebSocket 连接

```ts
const { readyState, sendMessage, connect, disconnect, latestMessage } = useWebSocket(
  'wss://api.example.com/ws',
  {
    reconnectLimit: 3,
    reconnectInterval: 3000,
    manual: false,
    json: true,           // 自动 JSON 序列化/反序列化
    onOpen: (e) => {},
    onMessage: (msg) => {},
    onClose: (e) => {},
    onError: (e) => {},
  }
)
sendMessage({ type: 'ping' }) // json: true 时自动 stringify
```

### useWindowSize — 窗口尺寸

```ts
const { width, height } = useWindowSize()
```

## 编码规范

1. **导入路径**：优先 `heitu/hooks` 子路径导入，支持 tree-shaking
2. **可选依赖**：使用 `useHtAxios` 前确保安装 `axios`，使用 `useCookie` 前确保安装 `js-cookie`
3. **清理**：hooks 内部已处理组件卸载清理，无需手动清理
4. **TypeScript**：所有 hooks 都支持泛型，请传入正确的类型参数
5. **SSR 安全**：`useWindowSize`、`useLocalStorage`、`useDevicePixelRatio` 等已处理 SSR 场景
