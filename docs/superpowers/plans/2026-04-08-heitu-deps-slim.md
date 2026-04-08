# heitu Deps Slim & Subpath Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `heitu` 核心包零运行时强依赖，把 `useHtAxios`、`useCookie` 拆为 `heitu/axios`、`heitu/cookie` 子入口，并清理死依赖与错位的 `@types/*`。

**Architecture:** 在 `src/` 下新增两个入口文件 `axios.ts`、`cookie.ts`，从 `src/hooks/index.ts` 移除对应 re-export；father 4 的 `esm` 模式按 `src` 目录扫描产出多入口；`package.json` 用 `exports` 字段映射子路径，把 `axios`、`urijs`、`js-cookie` 改为 peerDependencies。

**Tech Stack:** TypeScript, React, father 4, dumi, npm

参考 spec：`docs/superpowers/specs/2026-04-08-heitu-deps-slim-design.md`

---

### Task 1: 删死依赖与整理 @types

**Files:**
- Modify: `packages/heitu/package.json`

- [ ] **Step 1: 编辑 package.json，删除 dependencies 中的死包**

打开 `packages/heitu/package.json`，从 `dependencies` 中删除以下条目：
- `"mockjs": "^1.1.0"`
- `"fflate": "^0.8.2"`
- `"unstated-next": "^1.1.0"`
- `"uuid": "^10.0.0"`
- `"qs": "^6.13.0"`
- `"@types/qs": "^6.9.15"`
- `"@types/uuid": "^10.0.0"`

把以下条目从 `dependencies` 移到 `devDependencies`：
- `"@types/js-cookie": "^3.0.6"`
- `"@types/lodash-es": "^4.17.12"`
- `"@types/urijs": "^1.19.25"`

- [ ] **Step 2: 验证 src 不再引用被删的包**

Run: `cd packages/heitu && grep -rE "from ['\"](mockjs|fflate|unstated-next|uuid|qs)['\"]" src`
Expected: 无输出

- [ ] **Step 3: 重新安装依赖**

Run: `cd packages/heitu && npm install`
Expected: 安装成功，无错误

- [ ] **Step 4: Lint 验证**

Run: `cd packages/heitu && npm run lint`
Expected: 通过

- [ ] **Step 5: Commit**

```bash
git add packages/heitu/package.json packages/heitu/yarn.lock packages/heitu/package-lock.json 2>/dev/null
git commit -m "chore(heitu): drop unused deps and move @types to devDependencies"
```

---

### Task 2: 把 axios/urijs/js-cookie 改为 peerDependencies

**Files:**
- Modify: `packages/heitu/package.json`

- [ ] **Step 1: 编辑 package.json**

从 `dependencies` 删除：
- `"axios": "^1.7.7"`
- `"urijs": "^1.19.11"`
- `"js-cookie": "^3.0.5"`

在 `peerDependencies` 中新增（与现有 react peerDeps 并列）：

```json
"peerDependencies": {
  "react": ">=16.9.0",
  "react-dom": ">=16.9.0",
  "axios": ">=1.0.0",
  "urijs": ">=1.19.0",
  "js-cookie": ">=3.0.0"
},
"peerDependenciesMeta": {
  "axios": { "optional": true },
  "urijs": { "optional": true },
  "js-cookie": { "optional": true }
}
```

- [ ] **Step 2: 安装并验证**

Run: `cd packages/heitu && npm install`
Expected: 成功；axios/urijs/js-cookie 仍可作为 transitive devDep 解析（dumi 站点需要时本地用 npm 装一份）

- [ ] **Step 3: 临时把它们装到 devDependencies 以便 dumi/类型解析**

Run: `cd packages/heitu && npm i -D axios urijs js-cookie`
Expected: 安装成功

- [ ] **Step 4: Lint 验证**

Run: `cd packages/heitu && npm run lint`
Expected: 通过

- [ ] **Step 5: Commit**

```bash
git add packages/heitu/package.json packages/heitu/package-lock.json packages/heitu/yarn.lock 2>/dev/null
git commit -m "chore(heitu): move axios/urijs/js-cookie to peerDependencies"
```

---

### Task 3: 从 hooks/index.ts 移除 useHtAxios 与 useCookie

**Files:**
- Modify: `packages/heitu/src/hooks/index.ts`

- [ ] **Step 1: 编辑 hooks/index.ts**

删除以下两行：
```ts
export { default as useCookie } from './useCookie';
export { default as useHtAxios } from './useHtAxios';
```

修改后的完整文件：
```ts
export { default as useAsyncFn } from './useAsyncFn';
export { default as useCancelAsyncFn } from './useCancelAsyncFn';
export { default as createContainer } from './useContainer';
export { default as useCountDown } from './useCountDown';
export { default as useDeepCompareEffect } from './useDeepCompareEffect';
export { default as useDevicePixelRatio } from './useDevicePixelRatio';
export { default as useElementSize } from './useElementSize';
export { default as useImageLoad } from './useImageLoad';
export { default as useInfiniteScroll } from './useInfiniteScroll';
export { default as useInView } from './useInView';
export { default as useLocalStorage } from './useLocalStorage';
export { default as usePolling } from './usePolling';
export { default as usePrevious } from './usePrevious';
export { default as useResizeObserver } from './useResizeObserver';
export { default as useSessionStorage } from './useSessionStorage';
export { default as useWebSocket } from './useWebSocket';
export { default as useWindowSize } from './useWindowSize';
```

- [ ] **Step 2: Lint 验证**

Run: `cd packages/heitu && npm run lint`
Expected: 通过

(不提交，下一 Task 一起提交)

---

### Task 4: 新增 axios 与 cookie 子入口文件

**Files:**
- Create: `packages/heitu/src/axios.ts`
- Create: `packages/heitu/src/cookie.ts`

- [ ] **Step 1: 创建 src/axios.ts**

```ts
export { default as useHtAxios } from './hooks/useHtAxios';
```

- [ ] **Step 2: 创建 src/cookie.ts**

```ts
export { default as useCookie } from './hooks/useCookie';
```

- [ ] **Step 3: Lint 验证**

Run: `cd packages/heitu && npm run lint`
Expected: 通过

- [ ] **Step 4: Commit (合并 Task 3+4)**

```bash
git add packages/heitu/src/hooks/index.ts packages/heitu/src/axios.ts packages/heitu/src/cookie.ts
git commit -m "feat(heitu)!: split useHtAxios and useCookie into subpath entries

BREAKING CHANGE: useHtAxios and useCookie are no longer exported from
the package root. Import them from 'heitu/axios' and 'heitu/cookie'."
```

---

### Task 5: 配置 father 多入口构建

**Files:**
- Modify: `packages/heitu/.fatherrc.ts`

- [ ] **Step 1: 编辑 .fatherrc.ts**

```ts
import { defineConfig } from 'father';

export default defineConfig({
  esm: { input: 'src', output: 'dist' },
});
```

- [ ] **Step 2: 构建并验证产物**

Run: `cd packages/heitu && npm run build`
Expected: 构建成功

Run: `ls packages/heitu/dist | grep -E "^(index|axios|cookie)\\.js$"`
Expected: 三个文件都存在

- [ ] **Step 3: 验证 dist/index.js 不含 axios/urijs/js-cookie 代码**

Run: `grep -lE "axios|urijs|js-cookie" packages/heitu/dist/index.js`
Expected: 无输出（核心入口未引入这些包）

Run: `grep -l "axios" packages/heitu/dist/axios.js`
Expected: dist/axios.js（说明 axios 入口正确引用了 axios import 语句）

- [ ] **Step 4: 若 dist 中缺 axios.js / cookie.js，回退方案**

如果 Step 2 没有产生 `dist/axios.js` 或 `dist/cookie.js`，说明 father esm input 模式未把根级新文件作为入口。改用 platform option：编辑 `.fatherrc.ts` 加 `platform: 'browser'`，并确保 `src/axios.ts`、`src/cookie.ts` 在 `src` 根而非子目录。再次 `npm run build` 验证。

- [ ] **Step 5: Commit**

```bash
git add packages/heitu/.fatherrc.ts
git commit -m "build(heitu): enable multi-entry esm build via father input"
```

---

### Task 6: package.json 加 exports 字段并 bump 版本

**Files:**
- Modify: `packages/heitu/package.json`

- [ ] **Step 1: 编辑 package.json**

把 `version` 改为 `"2.0.0"`。

在 `types` 字段后新增 `exports`：

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
  },
  "./package.json": "./package.json"
}
```

- [ ] **Step 2: 重新构建**

Run: `cd packages/heitu && npm run build`
Expected: 成功，`dist/index.d.ts`、`dist/axios.d.ts`、`dist/cookie.d.ts` 都存在

Run: `ls packages/heitu/dist | grep -E "(index|axios|cookie)\\.d\\.ts$"`
Expected: 三个 .d.ts 文件

- [ ] **Step 3: 在临时目录验证子入口可解析**

```bash
cd /tmp && mkdir heitu-verify && cd heitu-verify
npm init -y
npm i /Users/peco/Documents/Peco/MyApp/heitu-platform/packages/heitu axios urijs js-cookie react react-dom
node -e "console.log(Object.keys(require('heitu')))"
```
Expected: 输出 hooks/canvas 导出列表，且不含 useHtAxios、useCookie

```bash
node -e "console.log(Object.keys(require('heitu/axios')))"
```
Expected: 输出 `[ 'useHtAxios' ]`

```bash
node -e "console.log(Object.keys(require('heitu/cookie')))"
```
Expected: 输出 `[ 'useCookie' ]`

- [ ] **Step 4: 清理验证目录**

Run: `rm -rf /tmp/heitu-verify`

- [ ] **Step 5: Commit**

```bash
git add packages/heitu/package.json
git commit -m "feat(heitu)!: bump to 2.0.0 with exports map for subpath entries"
```

---

### Task 7: README 加迁移说明

**Files:**
- Modify: `packages/heitu/README.md`

- [ ] **Step 1: 在 README 顶部 (title 之后) 插入迁移段落**

```markdown
## Migrating from 1.x to 2.0

`useHtAxios` 与 `useCookie` 已拆为子入口：

\`\`\`diff
- import { useHtAxios, useCookie } from 'heitu';
+ import { useHtAxios } from 'heitu/axios';
+ import { useCookie } from 'heitu/cookie';
\`\`\`

同时需要手动安装对应 peer 依赖：

\`\`\`bash
npm i axios urijs       # for heitu/axios
npm i js-cookie         # for heitu/cookie
\`\`\`
```

(注意：上面的反斜杠 \` 在实际写入文件时去掉，使用真实的三反引号代码块。)

- [ ] **Step 2: Commit**

```bash
git add packages/heitu/README.md
git commit -m "docs(heitu): add 1.x to 2.0 migration guide"
```

---

### Task 8: 最终全量验证

- [ ] **Step 1: 干净 install**

Run: `cd packages/heitu && rm -rf node_modules dist && npm install`
Expected: 成功

- [ ] **Step 2: Lint**

Run: `cd packages/heitu && npm run lint`
Expected: 通过

- [ ] **Step 3: Build**

Run: `cd packages/heitu && npm run build`
Expected: 成功，dist 含 index/axios/cookie 的 .js 与 .d.ts

- [ ] **Step 4: 检查 package.json 最终状态**

Run: `cd packages/heitu && cat package.json`
Expected:
- `version` = `"2.0.0"`
- `dependencies` 不含 mockjs/fflate/unstated-next/uuid/qs/axios/urijs/js-cookie
- `peerDependencies` 含 axios/urijs/js-cookie
- 顶层有 `exports` 字段

- [ ] **Step 5: 最终 commit（如有遗漏）**

```bash
git status
# 若有未提交的变化（如 lockfile）
git add -u
git commit -m "chore(heitu): finalize deps slim & subpath split"
```

---

## 完成标准

- [ ] `dist/index.js`、`dist/axios.js`、`dist/cookie.js` 都存在
- [ ] `dist/index.js` 不含 axios/urijs/js-cookie 代码
- [ ] `package.json` version = 2.0.0
- [ ] `package.json` 含 `exports` 映射三个入口
- [ ] axios/urijs/js-cookie 在 `peerDependencies`
- [ ] 5 个死依赖已删
- [ ] README 含迁移说明
- [ ] `npm run lint` 通过
