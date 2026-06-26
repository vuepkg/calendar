import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
})
