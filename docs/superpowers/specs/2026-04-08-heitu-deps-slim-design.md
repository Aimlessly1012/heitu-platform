# heitu 依赖瘦身与子入口拆包 (Spec #1)

日期：2026-04-08
范围：`packages/heitu`
版本影响：`1.0.8` → `2.0.0`（破坏性）

## 目标

让 `heitu` 核心包零运行时依赖，将与外部库强耦合的 hook 拆成可选子入口；同时清理死依赖与错位的 `@types/*`。

## 现状问题

1. **死依赖**：`mockjs`、`fflate`、`unstated-next`、`uuid`、`qs` 列在 dependencies，src 中无任何引用。
2. **`@types/*` 错位**：`@types/js-cookie`、`@types/lodash-es`、`@types/qs`、`@types/urijs`、`@types/uuid` 全部错误地放在 dependencies。
3. **缺 externals**：`.fatherrc.ts` 仅声明 `esm: { output: 'dist' }`，未配 externals。
4. **强耦合**：`useHtAxios` 把 `axios`、`urijs` 强行带入核心包；`useCookie` 把 `js-cookie` 强行带入核心包。任何用户即便不用这些 hook，也必须安装它们。

## 架构

```
heitu              → canvas + 纯 hooks（零运行时依赖）
heitu/axios        → useHtAxios（peerDep: axios, urijs）
heitu/cookie       → useCookie（peerDep: js-cookie）
```

## 改动清单

### 1. `package.json`

**删除 dependencies**（死依赖）：
- `mockjs`、`fflate`、`unstated-next`、`uuid`、`qs`

**移到 devDependencies**：
- `@types/js-cookie`、`@types/lodash-es`、`@types/qs`、`@types/urijs`、`@types/uuid`
- 其中 `@types/qs`、`@types/uuid` 在依赖删除后可一并删除

**移到 peerDependencies**：
- `axios`（用户使用 `heitu/axios` 时必须安装）
- `urijs`
- `js-cookie`

**保留在 dependencies**：
- `lodash-es`（暂留，#2 子项目处理）

**新增 `exports` 字段**：
```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js"
  },
  "./axios": {
    "types": "./dist/axios.d.ts",
    "import": "./dist/axios.js"
  },
  "./cookie": {
    "types": "./dist/cookie.d.ts",
    "import": "./dist/cookie.js"
  }
}
```

**版本号**：`2.0.0`

### 2. `.fatherrc.ts`

```ts
import { defineConfig } from 'father';

export default defineConfig({
  esm: { input: 'src', output: 'dist' },
});
```

father 4.x 在 `esm` 模式下会自动按 src 目录扫描所有 `.ts` 文件输出，多入口天然支持。需在落地时实测 `src/axios.ts`、`src/cookie.ts` 是否正确生成 `dist/axios.js`、`dist/cookie.js`。如未生成，则改为显式 entry 列表。

外部依赖隔离通过 `package.json` 的 `peerDependencies` + 不打包源依赖即可（father esm 默认不打包 node_modules）。

### 3. 源码

**`src/index.ts`**（删掉 useHtAxios 与 useCookie 的 re-export）：
```ts
export * from './canvas';
export * from './hooks';
```

**`src/hooks/index.ts`**：移除 `useHtAxios`、`useCookie` 的 re-export。

**新增 `src/axios.ts`**：
```ts
export * from './hooks/useHtAxios';
```

**新增 `src/cookie.ts`**：
```ts
export * from './hooks/useCookie';
```

`src/hooks/useHtAxios/`、`src/hooks/useCookie/` 文件本身不动。

### 4. 文档

**README** 顶部加迁移段落：

> ### Migrating from 1.x to 2.0
>
> `useHtAxios` 与 `useCookie` 已拆为子入口：
>
> ```diff
> - import { useHtAxios, useCookie } from 'heitu';
> + import { useHtAxios } from 'heitu/axios';
> + import { useCookie } from 'heitu/cookie';
> ```
>
> 同时需要手动安装对应 peer 依赖：
> ```bash
> npm i axios urijs       # for heitu/axios
> npm i js-cookie         # for heitu/cookie
> ```

## 验证清单

- [ ] `npm run build` 成功，`dist/` 下有 `index.js`、`axios.js`、`cookie.js` 及对应 `.d.ts`
- [ ] `dist/index.js` 不含 axios/urijs/js-cookie 代码
- [ ] 在一个空白 React 项目里 `import { ... } from 'heitu'` 不需要安装 axios/urijs/js-cookie
- [ ] `import { useHtAxios } from 'heitu/axios'` 可用
- [ ] `import { useCookie } from 'heitu/cookie'` 可用
- [ ] `npm run lint` 通过

## 不在本 spec 范围

- 去 `lodash-es`（留给 #2 代码审查子项目）
- canvas/hook 性能优化（#3）
- API 设计与类型完善（#4）
- 文档站点结构（#5）
- E2E 测试（#6）
