import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  publicDir: false,
  resolve: {
    alias: {
      '@vuepkg/core': path.resolve(projectRoot, '../core/src'),
    },
  },
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      include: ['src/**'],
      exclude: ['src/**/*.spec.ts', 'src/dev/**'],
      outDir: 'dist',
      entryRoot: 'src',
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(projectRoot, 'src/index.ts'),
      name: 'VuepkgUi',
      fileName: (format) => (format === 'cjs' ? 'index.cjs.js' : 'index.esm.js'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@vuepkg/core'],
      output: {
        exports: 'named',
        globals: { vue: 'Vue' },
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css') ? 'style.css' : (assetInfo.name ?? 'asset'),
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
})
