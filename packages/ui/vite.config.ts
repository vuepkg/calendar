import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// 데모/E2E 전용 빌드 설정. build:lib(vite.lib.config.ts)과 출력 경로를 분리해
// 퍼블리시되는 dist/를 덮어쓰지 않는다.
export default defineConfig({
  resolve: {
    alias: {
      '@vuepkg/core': path.resolve(projectRoot, '../core/src'),
      '@vuepkg/theme': path.resolve(projectRoot, '../theme'),
    },
  },
  plugins: [vue()],
  build: {
    outDir: 'e2e-dist',
  },
})
