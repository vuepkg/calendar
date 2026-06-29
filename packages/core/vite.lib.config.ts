import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  publicDir: false,
  plugins: [
    dts({
      tsconfigPath: './tsconfig.app.json',
      include: ['src/**'],
      exclude: ['src/**/*.spec.ts'],
      outDir: 'dist',
      entryRoot: 'src',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(projectRoot, 'src/index.ts'),
        'utils/date': path.resolve(projectRoot, 'src/utils/date.ts'),
        'utils/holiday': path.resolve(projectRoot, 'src/utils/holiday.ts'),
        'composables/useControllableState': path.resolve(
          projectRoot,
          'src/composables/useControllableState.ts',
        ),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: { vue: 'Vue' },
        entryFileNames: (chunk) =>
          chunk.name === 'index' ? 'index.[format].js' : `[name].[format].js`,
      },
    },
    sourcemap: true,
  },
})
