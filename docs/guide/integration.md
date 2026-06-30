# ScheduleCalendar 이식 가이드

다른 Vue 3 프로젝트에 `ScheduleCalendar`를 연동하는 방법을 정리한 문서입니다.

| 문서                                            | 용도                                  |
| ----------------------------------------------- | ------------------------------------- |
| **본 문서**                                     | 범용 이식·연동 실무 가이드            |
| [`dev/architecture.md`](../dev/architecture.md) | API 상세·내부 구조·개발 시작하기      |
| [`dev/npm-publish-guide.md`](../dev/npm-publish-guide.md) | 배포 체크리스트              |

> **권장 연동 방법**: `npm install @vuepkg/calendar` (패키지 설치). 소스 복사는 캘린더를 직접 수정해야 하는 경우에만 사용하세요.

---

## 1. 핵심 개념

### 1.1 아키텍처

```
[부모 페이지]
  ├─ schedules prop (필터·CRUD 반영 후 전달)
  ├─ holidays prop (사내 기념일 등, 선택)
  ├─ v-model:view / date / list-filter-date / view-scope / schedule-types
  └─ emit 핸들러 (또는 useScheduleCalendarHost)
        ↓
[ScheduleCalendar]  ← emit-only, 상태를 직접 바꾸지 않음
  ├─ CalendarMonthNav (Month/List 공통 `‹ YYYY-MM ›`)
  ├─ MonthView (+ MonthOverflowPopover, `+N` 팝오버)
  ├─ WeekView / DayView  (CalendarPeriodNav + TimedGrid, 공휴일 칩)
  └─ ListView (lazy, 네이티브 <table> — PrimeVue 불필요)
```

- **캘린더는 표시만** 합니다. 탭·날짜·List 필터 변경은 **부모**가 `v-model`과 핸들러로 처리합니다.
- **My/Company 필터·일정 추가/수정 UI는 없습니다.** 부모가 `schedules`를 갱신합니다.
- **일정 HTTP는 캘린더가 호출하지 않습니다.**
- **공휴일**: 기본값 `false` (opt-in). 공공 API를 사용하려면 `:fetch-public-holidays="true"`를 명시적으로 전달하세요. 사내 기념일은 `:holidays`로 병합.

### 1.2 트랙 선택

| 트랙        | 포함 뷰            | 추가 의존성 | 권장 대상                    |
| ----------- | ------------------ | ----------- | ---------------------------- |
| **Minimal** | Month · Week · Day | 없음        | 대시보드 · 임베디드 캘린더   |
| **Full**    | + List             | 없음        | 일정 목록 · 필터 · 테이블 UI |

`vue` 하나만 peerDependency입니다. List 뷰가 필요 없으면 **Minimal**만 이식하세요.

---

## 2. 이식 체크리스트

> **소스 위치**: Phase 0(monorepo 전환) 이후 소스는 `packages/calendar/src/`에 있습니다.  
> **`@vuepkg/core` 필요**: `utils/date.ts`와 `utils/holiday.ts`가 `@vuepkg/core`를 re-export하므로,  
> 소스 복사 시 대상 프로젝트에서 `npm install @vuepkg/core`를 실행하거나 core 소스(`packages/core/src/`)도 함께 복사해야 합니다.

### 2.1 공통 (Minimal · Full)

| #   | 복사 대상 (소스: `packages/calendar/src/`)      | 비고                                                         |
| --- | ----------------------------------------------- | ------------------------------------------------------------ |
| 1   | `components/calendar/`                          | 전체                                                         |
| 2   | `composables/useCalendar.ts`                    | 내부 파생 데이터                                             |
| 3a  | `composables/useScheduleCalendarHost.ts`        | 부모 연동 composable (권장)                                  |
| 3b  | `composables/usePublicHolidays.ts`              | `ScheduleCalendar` 내부 공휴일 API (필수)                    |
| 3c  | `composables/useMonthMeasuredCellHeight.ts`     | 월간 셀 높이 측정 (MonthView 필수)                           |
| 4   | `services/publicHolidaysApi.ts`                 | 공공데이터포털 API                                           |
| 5   | `types/` **4모듈**                              | `index.ts` barrel + `schedule`·`calendarEvents`·`layout` (`e2e.ts` 제외) |
| 6   | `constants/calendarView.ts`                     | 상수·`SCHEDULE_TYPE_OPTIONS` 단일 파일                       |
| 7   | `utils/` **5파일**                              | `date.ts`, `holiday.ts`, `schedule.ts`, `month.ts`, `timed.ts` (`.spec.ts` 제외) |
| 8   | `styles/calendarScroll.css`                     | `ScheduleCalendar.vue`가 side-effect import                  |

**복사 제외 (데모·E2E 전용)**

| 경로                         | 이유                                      |
| ---------------------------- | ----------------------------------------- |
| `src/e2e-hosts/`             | Playwright 호스트 레이아웃 시뮬레이션     |
| `src/data/mockSchedules.ts`  | 데모 mock — 실서비스는 API 데이터 사용    |
| `src/App.vue`, `src/main.ts` | 데모 앱 진입점                            |
| `src/types/e2e.ts`           | E2E 전용 `HostLayoutId` — 프로덕션 불필요 (`@/types` barrel 미export) |

**이식 소스 파일 수**: **30개** (Minimal·Full 공통 — Tier 1+2 compact 완료, `packages/calendar/src/` 기준)

| 영역                    | 파일 수 |
| ----------------------- | ------- |
| `components/calendar/`  | 14      |
| `composables/`          | 4       |
| `types/` (e2e 제외)     | 4       |
| `utils/` (spec 제외)    | 5       |
| `constants/`            | 1       |
| `services/`             | 1       |
| `styles/`               | 1       |
| **합계**                | **30**  |

**`types/` 필수 구조**

```
types/
├── index.ts              # 공개 barrel
├── schedule.ts           # Schedule, Holiday(→@vuepkg/core re-export), CalendarContext …
├── calendarEvents.ts     # emit·query-change·useScheduleCalendarHost 계약
└── layout.ts             # Month/Timed/AllDay·overflow 레이아웃 타입
```

| 모듈                | 주요 타입                                                                 |
| ------------------- | ------------------------------------------------------------------------- |
| `schedule.ts`       | `Schedule`, `Holiday`·`HolidayKind` (→`@vuepkg/core` re-export), `CalendarContext`, `UsePublicHolidaysOptions` |
| `calendarEvents.ts` | `ScheduleQueryChangePayload`, `UseScheduleCalendarHostOptions`, emit payload |
| `layout.ts`         | `MonthDayCell`, `TimedLayoutItem` 등 (`RectBounds`는 `@vuepkg/core` re-export, F2-4) |

**`utils/` 필수 구조**

```
utils/
├── date.ts               # @vuepkg/core/utils/date re-export + resolveCalendarNavigateDate
├── holiday.ts            # @vuepkg/core/utils/holiday re-export
├── schedule.ts           # filter · query · crud · layout (단일 모듈)
├── month.ts              # barLayout · cell · overflow
└── timed.ts              # allDay + grid (currentTime + timeSlot 통합)
```

> `date.ts`와 `holiday.ts`는 `@vuepkg/core`에서 re-export합니다. 소스 복사 시 대상 프로젝트에 `@vuepkg/core`를 설치해야 합니다.

**`types/`·`utils/` 누락이 가장 흔한 이식 실패 원인입니다.**

### 2.2 이식 파일 전체 목록 (30)

복사 후 아래 목록과 일치하는지 확인하세요. (`.spec.ts`·E2E·데모 제외)  
소스 기준 경로: `packages/calendar/src/`

```
packages/calendar/src/
├── components/calendar/          (14)
│   ├── ScheduleCalendar.vue
│   ├── CalendarToolbar.vue
│   ├── CalendarMonthNav.vue
│   ├── CalendarPeriodNav.vue
│   ├── TimedGrid.vue
│   ├── AllDayBar.vue
│   ├── HolidayChip.vue
│   ├── ScheduleEventChip.vue
│   ├── MonthOverflowPopover.vue
│   ├── index.ts
│   └── views/
│       ├── MonthView.vue
│       ├── WeekView.vue
│       ├── DayView.vue
│       └── ListView.vue          ← Full 트랙 (네이티브 table, PrimeVue 불필요)
├── composables/                  (4)
│   ├── useCalendar.ts
│   ├── useScheduleCalendarHost.ts
│   ├── usePublicHolidays.ts
│   └── useMonthMeasuredCellHeight.ts
├── types/                        (4 — e2e.ts 제외)
│   ├── index.ts
│   ├── schedule.ts
│   ├── calendarEvents.ts
│   └── layout.ts
├── utils/                        (5)
│   ├── date.ts               ← @vuepkg/core re-export
│   ├── holiday.ts            ← @vuepkg/core re-export
│   ├── schedule.ts
│   ├── month.ts
│   └── timed.ts
├── constants/calendarView.ts     (1)
├── services/publicHolidaysApi.ts   (1)
└── styles/calendarScroll.css     (1)
```

**구버전(41파일)에서 갱신할 import 경로**

| 삭제·변경됨 | 대체 |
| ----------- | ---- |
| `@/types/api`, `@/types/composable` | `@/types` 또는 `@/types/schedule` |
| `@/types/query`, `@/types/host` | `@/types/calendarEvents` |
| `@/utils/schedule/*` | `@/utils/schedule` |
| `@/utils/month/*` | `@/utils/month` |
| `@/utils/timed/*` | `@/utils/timed` |
| `@/plugins/listPrimeVue` | 삭제 — PrimeVue 제거로 불필요 |
| `HostLayoutId` (`@/types` barrel) | `@/types/e2e` 직접 import (E2E 전용) |

### 2.3 Full (List 추가 시)

추가 의존성 없음 — `ListView.vue`는 네이티브 `<table>`로 구현되어 PrimeVue가 필요하지 않습니다.

`ScheduleCalendar.vue`가 `defineAsyncComponent`로 lazy import합니다. 별도 설정 불필요.

---

## 3. 단계별 이식

### Step 1 — 파일 복사

`packages/calendar/src/`에서 아래 구조로 복사합니다:

```
your-app/src/
├── components/calendar/     ← 14파일 (ScheduleCalendar, views/, index.ts …)
├── composables/             ← useCalendar, useScheduleCalendarHost, usePublicHolidays, useMonthMeasuredCellHeight
├── services/publicHolidaysApi.ts
├── types/                   ← index.ts, schedule.ts, calendarEvents.ts, layout.ts
├── constants/calendarView.ts
├── utils/                   ← date.ts, holiday.ts, schedule.ts, month.ts, timed.ts
├── data/mockSchedules.ts    ← 데모용 (mockCompanyHolidays 포함, 선택)
└── styles/calendarScroll.css
```

`@vuepkg/core` 설치 (date.ts, holiday.ts가 의존):

```bash
npm install @vuepkg/core
# 또는
pnpm add @vuepkg/core
```

### Step 2 — Path alias (`@/`)

**`vite.config.ts`**

```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(root, 'src') },
  },
})
```

**`tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

**공휴일 API 프록시** (기본 `fetch-public-holidays: true`일 때 필요)

```ts
const spcdeProxy = {
  '/api/spcde': {
    target: 'http://apis.data.go.kr',
    changeOrigin: true,
    rewrite: (path: string) =>
      path.replace(/^\/api\/spcde/, '/B090041/openapi/service/SpcdeInfoService'),
  },
} as const

export default defineConfig({
  server: { proxy: spcdeProxy },
  preview: { proxy: spcdeProxy },
})
```

`.env.local`에 `DATA_GO_KR_SERVICE_KEY` (Decoding 키, **`VITE_` 접두사 없음**) 설정. dev/preview proxy가 서버에서만 키를 주입합니다. Production static 배포 시 `VITE_SPCDE_API_URL`로 BFF URL을 지정하거나 `:fetch-public-holidays="false"`를 사용하세요.

### Step 3 — 스타일

`calendarScroll.css`는 `ScheduleCalendar.vue`가 자동 import합니다. 호스트 `main.ts`에 별도 추가 불필요.

**테마(CSS 변수)**: 캘린더의 모든 색상·크기·간격은 `--vp-*` CSS 변수로 정의됩니다. `@vuepkg/theme` 토큰이 `style.css`에 번들링되므로 별도 설치 없이 바로 커스터마이징할 수 있습니다:

```css
/* 브랜드 색상 오버라이드 (호스트 global CSS) */
:root {
  --vp-color-primary: #0f7f3b;
  --vp-today-badge-bg: #0f7f3b;
}
```

다크 모드는 시스템 설정(`prefers-color-scheme: dark`) 자동 반영 또는 `document.documentElement.classList.toggle('vp-dark')`로 수동 전환합니다. 전체 토큰 목록은 [테마 커스터마이징 가이드](./theming.md)를 참고하세요.

**호스트 전역 스크롤바 충돌 방지**: 캘린더 스타일은 `.schedule-calendar` 스코프로 한정됩니다.

### Step 4 — 레이아웃 (중요)

캘린더는 **부모 컨테이너를 100% 채웁니다.** 반드시 아래 패턴을 적용하세요.

```css
/* 필수 — 이게 없으면 Month 내부 세로 스크롤 발생 */
.calendar-wrapper {
  flex: 1;
  min-height: 0;
  /* height: 600px; — 고정 높이로도 가능 */
}
```

```vue
<div class="page-layout" style="display:flex; flex-direction:column; height:100vh;">
  <header>...</header>
  <div class="calendar-wrapper">
    <ScheduleCalendar ... />
  </div>
</div>
```

### Step 5 — 연동 (useScheduleCalendarHost)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ScheduleCalendar, useScheduleCalendarHost } from '@/components/calendar'
import type { ScheduleQueryChangePayload } from '@/types'

const allSchedules = ref([
  /* API에서 받은 일정 */
])

const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost({
    initialView: 'month',
    onQueryChange(payload: ScheduleQueryChangePayload) {
      // API 조회: payload.dateRange.start ~ end
    },
    onTimeSlotSelect(payload) {
      // Week/Day 빈 시간 셀 클릭 — payload.start / payload.end (1시간 단위)
    },
  })
</script>

<template>
  <ScheduleCalendar
    v-model:view="view"
    v-model:date="date"
    v-model:list-filter-date="listFilterDate"
    v-model:view-scope="viewScope"
    v-model:schedule-types="scheduleTypes"
    :schedules="allSchedules"
    v-on="calendarListeners"
  />
</template>
```

### Step 6 — 공휴일 연동

**공휴일 API 사용 (opt-in)**: `:fetch-public-holidays="true"` + `.env.local` 키 설정.

```vue
<!-- 공휴일 API + 사내 기념일 병합 -->
<ScheduleCalendar :fetch-public-holidays="true" :holidays="companyHolidays" ... />
```

**공휴일 없이 사용 (기본)**: `:holidays`만 전달하거나 생략.

```vue
<ScheduleCalendar :holidays="companyHolidays" ... />
```

---

## 4. 검증

소스 복사 후 대상 프로젝트에서:

```bash
# 타입 체크
npm run typecheck   # 또는 pnpm typecheck

# 단위 테스트
npm run test        # 또는 pnpm test
```

이 모노레포 자체를 검증할 때:

```bash
pnpm turbo run typecheck   # 전체 패키지 타입 체크
pnpm turbo run test        # 전체 단위 테스트
pnpm turbo run build:lib   # 라이브러리 빌드 검증
```

---

## 5. 향후 개선 (참고)

| 문서                                              | 내용                                        |
| ------------------------------------------------- | ------------------------------------------- |
| [`roadmap.md`](../dev/roadmap.md)                 | 기능 로드맵·컴포넌트 분리 백로그            |
| [`npm-publish-guide.md`](../dev/npm-publish-guide.md) | npm 배포 체크리스트                     |

| 영역     | 요약                                                                   |
| -------- | ---------------------------------------------------------------------- |
| **CMP**  | ✅ `CalendarMonthNav` (Month/List) — 나머지 `MonthDayCell` 등은 백로그 |
| **F-6**  | ✅ Tier 1+2 완료 — 이식 소스 **41 → 30** (`types`·`utils` flatten)     |
| **P3-C** | ✅ `Schedule.type: string` + `scheduleTypeOptions` prop 완료           |
| **IMP-08** | ✅ ListView PrimeVue → 네이티브 `<table>` 전환 완료                  |
| **P3-B** | 요일 i18n(`weekdayLabels`) — 미완료                                    |
| **QA**   | List·time-slot E2E, `resolveCalendarNavigateDate` 단위 spec            |
| **운영** | 공휴일 API 실패 UX, 배포 시 `VITE_*` 키·프록시 가이드                  |

**이식 시 `components/calendar/` 필수 파일** (발췌): `ScheduleCalendar.vue`, `CalendarToolbar.vue`, `CalendarMonthNav.vue`, `CalendarPeriodNav.vue`, `TimedGrid.vue`, `views/*`, `ScheduleEventChip.vue`, `AllDayBar.vue`, `HolidayChip.vue`, `MonthOverflowPopover.vue`, `index.ts`.

타입 import는 `@/types` barrel 또는 `@/types/schedule`·`@/types/calendarEvents` 등 모듈 직접 경로를 사용합니다. (`HostLayoutId` 등 E2E 타입은 `@/types/e2e`만 사용 — barrel 미포함)

유틸 import: `@/utils/schedule`, `@/utils/month`, `@/utils/timed` (하위 폴더 없음). `resolveCalendarNavigateDate`·`startOfDay`는 `@/utils/date`에서 export됩니다.

`@/components/calendar` barrel에서 `useScheduleCalendarHost`, `filterSchedulesByScope`, `upsertSchedule` 등도 re-export됩니다.

