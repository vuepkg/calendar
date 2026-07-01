import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@vuepkg/calendar',
  description:
    'Vue 3 Modern Calendar Engine — zero dependencies, controlled/emit-only, CSS-variable theming.',
  lang: 'ko',

  base: '/vue3-calendar/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/vue3-calendar/favicon.svg' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: '@vuepkg/calendar' }],
    [
      'meta',
      {
        name: 'og:description',
        content: 'Vue 3 Modern Calendar Engine — zero dependencies, CSS-variable theming.',
      },
    ],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '가이드', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'API', link: '/api/schedule-calendar', activeMatch: '/api/' },
      { text: 'CHANGELOG', link: '/changelog' },
      {
        text: '0.1.3',
        items: [
          {
            text: 'npm',
            link: 'https://www.npmjs.com/package/@vuepkg/calendar',
          },
          {
            text: 'GitHub',
            link: 'https://github.com/Seongwon-developer/vue3-calendar',
          },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '시작하기',
          items: [
            { text: '소개', link: '/guide/introduction' },
            { text: '설치 및 설정', link: '/guide/getting-started' },
          ],
        },
        {
          text: '핵심 개념',
          items: [
            { text: 'Emit-only 아키텍처', link: '/guide/emit-only' },
            { text: '테마 커스터마이징', link: '/guide/theming' },
          ],
        },
        {
          text: '기능 가이드',
          items: [
            { text: '일정 CRUD 모달', link: '/guide/schedule-crud' },
            { text: '드래그 앤 드롭', link: '/guide/drag-and-drop' },
            { text: '반복 일정', link: '/guide/recurring-events' },
            { text: '공휴일 연동', link: '/guide/public-holidays' },
            { text: '2/3주 월간 뷰', link: '/guide/month-week-count' },
          ],
        },
        {
          text: '마이그레이션',
          items: [{ text: '0.0.x → 0.1.x', link: '/guide/migration' }],
        },
      ],
      '/api/': [
        {
          text: '컴포넌트',
          items: [
            { text: 'ScheduleCalendar', link: '/api/schedule-calendar' },
            { text: 'ScheduleFormModal', link: '/api/schedule-form-modal' },
          ],
        },
        {
          text: 'Composable',
          items: [
            { text: 'useScheduleCalendarHost', link: '/api/use-schedule-calendar-host' },
            { text: 'useCalendar', link: '/api/use-calendar' },
            { text: 'usePublicHolidays', link: '/api/use-public-holidays' },
          ],
        },
        {
          text: '타입',
          items: [{ text: '타입 레퍼런스', link: '/api/types' }],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Seongwon-developer/vue3-calendar' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@vuepkg/calendar' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 vuepkg',
    },

    editLink: {
      pattern:
        'https://github.com/Seongwon-developer/vue3-calendar/edit/main/apps/docs/:path',
      text: 'GitHub에서 이 페이지 수정',
    },

    search: {
      provider: 'local',
    },

    outline: {
      label: '이 페이지',
    },

    docFooter: {
      prev: '이전',
      next: '다음',
    },

    lastUpdated: {
      text: '최종 수정',
    },
  },

  vite: {
    resolve: {
      alias: [
        {
          find: '@vuepkg/calendar/style.css',
          replacement: fileURLToPath(
            new URL('../../../packages/calendar/src/style.css', import.meta.url),
          ),
        },
        {
          find: '@vuepkg/calendar',
          replacement: fileURLToPath(
            new URL(
              '../../../packages/calendar/src/components/calendar/index.ts',
              import.meta.url,
            ),
          ),
        },
        {
          find: '@vuepkg/theme',
          replacement: fileURLToPath(
            new URL('../../../packages/theme', import.meta.url),
          ),
        },
        {
          find: '@',
          replacement: fileURLToPath(
            new URL('../../../packages/calendar/src', import.meta.url),
          ),
        },
      ],
    },
  },
})
