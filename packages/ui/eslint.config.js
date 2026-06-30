import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  vueTsConfigs.recommended,
  {
    name: 'ui/files-to-lint',
    files: ['**/*.{ts,mts,vue}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    name: 'ui/files-to-ignore',
    ignores: ['dist/**', 'node_modules/**'],
  },
)
