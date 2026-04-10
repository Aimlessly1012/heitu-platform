# heitu

[![NPM version](https://img.shields.io/npm/v/heitu.svg?style=flat)](https://npmjs.org/package/heitu)
[![NPM downloads](http://img.shields.io/npm/dm/heitu.svg?style=flat)](https://npmjs.org/package/heitu)

React utility library — hooks, canvas engine & form renderer.

## Install

```bash
npm install heitu
# or
pnpm add heitu
```

## Modules

### Hooks

20+ React Hooks for async, storage, DOM observation, WebSocket, polling, etc.

```ts
import { useAsyncFn, useCookie, useCountDown } from 'heitu/hooks'

// or import from root
import { useAsyncFn } from 'heitu'
```

| Hook | Description |
|------|-------------|
| `useAsyncFn` | Async function with loading/error state |
| `useCancelAsyncFn` | Cancellable async function |
| `useCookie` | Cookie read/write (requires `js-cookie`) |
| `useCountDown` | Countdown timer |
| `useDeepCompareEffect` | Deep-compare version of useEffect |
| `useDevicePixelRatio` | Track device pixel ratio |
| `useElementSize` | Observe element dimensions |
| `useImageLoad` | Image loading state |
| `useInfiniteScroll` | Infinite scroll with pagination |
| `useInView` | IntersectionObserver hook |
| `useLocalStorage` | localStorage with React state |
| `usePolling` | Interval polling with start/stop |
| `usePrevious` | Previous value of a state |
| `useResizeObserver` | ResizeObserver hook |
| `useSessionStorage` | sessionStorage with React state |
| `useWebSocket` | WebSocket connection management |
| `useWindowSize` | Track window dimensions |
| `useHtAxios` | Axios wrapper (requires `axios`) |
| `createContainer` | Shared state container |

### Canvas

Lightweight Canvas 2D engine with shapes, groups, animation, drag & events.

```ts
import { Stage, Rect, Circle, Text, Line, Group, Custom, Animate } from 'heitu/canvas'

const stage = new Stage({ el: '#canvas' })
stage.add(new Rect({ x: 10, y: 10, width: 100, height: 60, bindDrag: true }))
stage.bindEvent()
```

### Components

JSON Schema-driven form renderer based on Ant Design Form.

```tsx
import { FormRender } from 'heitu/components'

const config = [
  { type: 'Input', name: 'username', label: 'Username' },
  { type: 'Select', name: 'role', label: 'Role', nodeProps: {
    options: [{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }]
  }},
]

export default () => {
  const [form] = FormRender.useForm()
  return <FormRender form={form} config={config} onFinish={console.log} />
}
```

**Features:** watch linking, async service, conditional visibility, custom components (global register + scoped Provider), dividers, nested sub-forms, 19 built-in controls.

> Requires `antd >= 5.0.0` as peer dependency.

## Peer Dependencies

| Package | Required | Used by |
|---------|----------|---------|
| `react` / `react-dom` | Yes | All |
| `antd` | Optional | `heitu/components` |
| `axios` | Optional | `useHtAxios` |
| `js-cookie` | Optional | `useCookie` |
| `urijs` | Optional | URL utilities |

## Development

```bash
pnpm install        # install dependencies
pnpm dev            # start dev server (dumi)
pnpm build          # build library
pnpm test           # run tests
pnpm docs:build     # build docs site
```

## License

MIT
