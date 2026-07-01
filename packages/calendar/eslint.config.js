import prettierConfig from '@vue/eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      // vue-tsc(Volar)는 aria-*/data-* 속성을 컴포넌트 prop으로 카멜케이스 변환하지 않으므로
      // ariaLabel prop은 하이픈 표기 강제에서 제외한다.
      'vue/attribute-hyphenation': ['warn', 'always', { ignore: ['ariaLabel'] }],
      'vue/html-self-closing': [
        'warn',
        {
          html: { void: 'never', normal: 'always', component: 'always' },
          svg: 'always',
          math: 'always',
        },
      ],
    },
  },
  prettierConfig,
  {
    name: 'app/files-to-ignore',
    ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
)
