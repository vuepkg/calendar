import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  publicDir: false,
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
      // DataTable만 별도 entry — List 뷰(lazy)에서만 쓰이므로 진짜 code-split 이득이 있음.
      // 나머지 6종(Button/IconButton/Chip/Dialog/Popover/SegmentedControl)은 대부분 eager 경로에서만
      // 쓰여 분리해도 이득이 없고, 분리 시 공유 청크 압축 효율만 깨짐(2026-07-02 실측 확인, 롤백 이력 참고) — index.ts barrel에 그대로 둔다.
      entry: {
        index: path.resolve(projectRoot, 'src/index.ts'),
        DataTable: path.resolve(projectRoot, 'src/DataTable.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@vuepkg/core'],
      output: {
        exports: 'named',
        globals: { vue: 'Vue' },
        entryFileNames: (chunk) =>
          chunk.name === 'index' ? 'index.[format].js' : `[name].[format].js`,
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css') ? 'style.css' : (assetInfo.name ?? 'asset'),
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
})
