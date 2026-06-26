import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, 'src'),
    },
  },
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      include: [
        'src/components/calendar/**',
        'src/composables/**',
        'src/types/**',
        'src/utils/**',
        'src/constants/**',
        'src/services/**',
      ],
      exclude: ['src/**/*.spec.ts', 'src/data/**', 'src/e2e-hosts/**'],
      // src/ 를 기준으로 상대경로를 계산해 dist/types/ 에 출력
      // 결과: dist/types/components/calendar/index.d.ts
      outDir: 'dist/types',
      entryRoot: 'src',
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(projectRoot, 'src/components/calendar/index.ts'),
      name: 'Vue3Calendar',
      fileName: (format) => (format === 'cjs' ? 'index.cjs' : 'index.js'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // 소비자 앱의 peerDependencies — 번들에 포함하지 않음
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css') ? 'style.css' : (assetInfo.name ?? 'asset'),
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
})
