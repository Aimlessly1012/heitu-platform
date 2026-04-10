# Changelog

## 1.0.8

### Components

- **FormRender**: Migrated into heitu package
  - 19 built-in controls (Input, Select, DatePicker, TimePicker, TreeSelect, Cascader, AutoComplete, etc.)
  - `watch` field linking with debounce (300ms)
  - `watchClean` auto-clear on dependency change
  - `service` async data source with race condition protection
  - `onError` callback for service failures
  - `hidden` conditional visibility via nodeProps
  - `divider` section breaks with title & orientation
  - `render` custom rendering with form instance access
  - `isSub` nested sub-form mode (no `<Form>` wrapper)
  - `registerNode` / `registerNodes` global component registration
  - `FormRender.Provider` scoped component registration with context isolation
  - Dynamic `rules`, `nodeProps`, `itemProps` as functions of watch values
  - Multi-column layout with `columnCount` and 2D config arrays

### Bug Fixes

- Fixed `filter(Boolean)` swallowing falsy watch values (0, false, "")
- Replaced `JSON.stringify` deps with `useDeepCompareMemo` (lodash-es isEqual)
- Added `fetchIdRef` counter to prevent async race conditions
- Implemented `watchClean` (was declared but never functional)
- Fixed Fragment receiving extra props warning
- Fixed `hidden` prop leaking to DOM elements
- Optimized `React.memo` — deep compare only config, shallow compare rest

### Architecture

- Switched from `lodash` to `lodash-es` for tree-shaking
- Added `antd` as optional peer dependency
- Two-tier component registry: global `registerNode` + scoped `Provider`
- Context API (`FormRenderContext`) for component resolution

## 1.0.7

- Hooks & Canvas improvements

## 1.0.0 - 1.0.6

- Initial releases with hooks and canvas modules
