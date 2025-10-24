import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({
    insertTypesEntry: true,
  })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@imengyu/js-request-transform',
      formats: ['es', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'index.es.js';
        return 'index.js';
      },
    },
    rollupOptions: {
      // 外部依赖，这些不会被打包到库中
      external: ['dayjs'],
      output: {
        // 为umd构建提供全局变量名
        globals: {
          dayjs: 'dayjs',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});