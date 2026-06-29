import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  vueTsConfigs.recommended,
  {
    name: 'core/files-to-lint',
    files: ['**/*.{ts,mts}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    name: 'core/files-to-ignore',
    ignores: ['dist/**', 'node_modules/**'],
  },
)
