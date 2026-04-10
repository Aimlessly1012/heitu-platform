import { defineConfig } from 'father';

// https://github.com/umijs/father/blob/master/docs/config.md
// bundless 模式：逐文件转译，import 语句保持原样，无需配置 externals。
// peerDependencies 和 dependencies 中的包不会被打包进产物。
export default defineConfig({
  esm: {
    output: 'dist/esm',
  },
  cjs: {
    output: 'dist',
  },
});
