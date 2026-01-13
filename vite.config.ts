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