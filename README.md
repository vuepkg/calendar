# @vuepkg/calendar

Vue 3 스케줄 캘린더 — Month / Week / Day / List 뷰, **추가 의존성 없음** (`vue` 단독 peerDependency).

emit-only 컴포넌트로 일정 범위(My/Company) 필터·CRUD는 부모 컴포넌트에서 처리하고, 캘린더에 필터링된 `schedules`를 prop으로 전달합니다.

## 설치

```bash
npm install @vuepkg/calendar
```

```ts
// main.ts — CSS 전역 임포트
import '@vuepkg/calendar/style.css'

// 컴포넌트·타입
import { ScheduleCalendar, useScheduleCalendarHost } from '@vuepkg/calendar'
import type { Schedule, CalendarView, ScheduleTypeOption } from '@vuepkg/calendar'
```

---

## 로컬 개발

```bash
npm install
cp .env.example .env.local   # 공공데이터포털 인증키 입력
npm run dev
```

공휴일 칩(연한 붉은 배경)을 표시하려면 `.env.local`에 `DATA_GO_KR_SERVICE_KEY`(**`VITE_` 접두사 없음** — [한국천문연구원\_특일 정보](https://www.data.go.kr/data/15012690/openapi.do) Decoding 키)를 설정하고 `:fetch-public-holidays="true"`를 명시적으로 전달하세요.

브라우저에서 `http://localhost:6565` 을 열면 `App.vue` 데모를 확인할 수 있습니다.

데모 `App.vue`는 mock 일정 확인을 위해 **Day 뷰 + 2026-04-22**로 고정합니다 (`useScheduleCalendarHost({ initialDate: … })`).  
단독 `ScheduleCalendar`·호스트 composable 기본 날짜는 **오늘** (`startOfDay(new Date())`)입니다.

호스트 레이아웃 시뮬레이션: `http://localhost:6565/?host=fixed-panel` (빌드 후 preview는 `npm run preview`)

## 스크립트

| 명령                          | 설명                                      |
| ----------------------------- | ----------------------------------------- |
| `npm run dev`                 | Vite 개발 서버                            |
| `npm run build`               | 타입체크 + 프로덕션 빌드                  |
| `npm run typecheck`           | `vue-tsc`만 실행 (빌드 없이)              |
| `npm run lint`                | ESLint (Vue + TypeScript)                 |
| `npm run lint:fix`            | ESLint 자동 수정                          |
| `npm run format`              | Prettier + ESLint로 전체 포맷 통일        |
| `npm run format:check`        | 포맷·린트 검사 (CI용)                     |
| `npm run preview`             | 빌드 결과 미리보기                        |
| `npm run build:lib`           | 라이브러리 빌드 (ES+CJS+d.ts, `dist/`)   |
| `npm run test`                | Vitest 단위 테스트 (205건)                |
| `npm run test:e2e`            | Playwright E2E 전체 (126건, 빌드 후 실행) |
| `npm run test:e2e:responsive` | 반응형 E2E만 (42건)                       |
| `npm run test:e2e:host`       | 호스트 import E2E만 (69건)                |
| `npm run test:e2e:ui`         | Playwright UI 모드                        |
| `npm run test:all`            | 단위 + 빌드 + E2E 일괄 실행               |

## 사용 예시

`ScheduleCalendar`는 **emit-only**입니다. 탭·네비·List 필터가 동작하려면 v-model과 이벤트 핸들러를 연결해야 합니다.

### Composable (권장)

[`useScheduleCalendarHost`](src/composables/useScheduleCalendarHost.ts)가 `App.vue`와 동일한 핸들러를 제공합니다. 공휴일 API는 `ScheduleCalendar` 내부(`fetch-public-holidays` 기본 `false`)이며, 사내 기념일은 `:holidays`로 병합합니다.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ScheduleCalendar,
  applyScheduleFilters,
  useScheduleCalendarHost,
  type Schedule,
} from '@/components/calendar'
import { mockCompanyHolidays } from '@/data/mockSchedules'

const allSchedules = ref<Schedule[]>([
  /* ... */
])

const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost({
    initialDate: new Date(2026, 3, 22),
  })

const schedules = computed(() =>
  applyScheduleFilters(allSchedules.value, {
    viewScope: viewScope.value,
    scheduleTypes: scheduleTypes.value,
    currentUserId: 'user-hong',
  }),
)
</script>

<template>
  <ScheduleCalendar
    v-model:view="view"
    v-model:date="date"
    v-model:list-filter-date="listFilterDate"
    v-model:view-scope="viewScope"
    v-model:schedule-types="scheduleTypes"
    :schedules="schedules"
    :holidays="mockCompanyHolidays"
    v-on="calendarListeners"
  />
</template>
```

### 수동 핸들러 (scope·CRUD 포함)

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ScheduleCalendar,
  filterSchedulesByScope,
  startOfDay,
  type CalendarDateSelectPayload,
  type CalendarNavigatePayload,
  type CalendarOverflowClickPayload,
  type CalendarScheduleClickPayload,
  type CalendarView,
  type CalendarViewChangePayload,
  type Schedule,
  type ViewScope,
} from '@/components/calendar'

const allSchedules = ref<Schedule[]>([
  /* ... */
])
const scope = ref<ViewScope>('company')
const view = ref<CalendarView>('day')
const date = ref(startOfDay(new Date(2026, 3, 22)))
const listFilterDate = ref<Date | null>(null)

const schedules = computed(() =>
  filterSchedulesByScope(allSchedules.value, scope.value, 'user-hong'),
)

function onViewChange({ view: nextView }: CalendarViewChangePayload) {
  view.value = nextView
  if (nextView !== 'list') {
    listFilterDate.value = null
  }
}

function onDateSelect({ date: nextDate, source }: CalendarDateSelectPayload) {
  date.value = startOfDay(nextDate)
  if (source === 'week-day-header') {
    view.value = 'day'
  }
}

// 선택: List 전환. 미구현 시 월간 +N은 팝오버만 표시
function onOverflowClick({ date: nextDate }: CalendarOverflowClickPayload) {
  const normalized = startOfDay(nextDate)
  date.value = normalized
  listFilterDate.value = normalized
  view.value = 'list'
}

function onNavigate({ date: nextDate }: CalendarNavigatePayload) {
  date.value = startOfDay(nextDate)
}

function onScheduleClick({ date: nextDate }: CalendarScheduleClickPayload) {
  if (nextDate) {
    date.value = startOfDay(nextDate)
  }
}

function onListFilterClear() {
  listFilterDate.value = null
}
</script>

<template>
  <ScheduleCalendar
    v-model:view="view"
    v-model:date="date"
    v-model:list-filter-date="listFilterDate"
    :schedules="schedules"
    @view-change="onViewChange"
    @date-select="onDateSelect"
    @overflow-click="onOverflowClick"
    @navigate="onNavigate"
    @schedule-click="onScheduleClick"
    @list-filter-clear="onListFilterClear"
  />
</template>
```

### 핸들러 체크리스트

| 이벤트              | 미연결 시                                   | 처리                                            |
| ------------------- | ------------------------------------------- | ----------------------------------------------- |
| `view-change`       | 탭 무반응                                   | `view = payload.view`                           |
| `date-select`       | 날짜 미반영                                 | `date` 갱신; `week-day-header`면 `view = 'day'` |
| `overflow-click`    | (기본) **팝오버만** — 핸들러 없어도 UI 동작 | List 전환은 `onOverflowClick` 선택 구현         |
| `navigate`          | ‹›·Today 무반응                             | `date = payload.date`                           |
| `list-filter-clear` | Clear 무반응                                | `listFilterDate = null`                         |
| `schedule-click`    | (선택)                                      | 상세·`date` 갱신 등                             |
| `time-slot-select`  | (선택)                                      | Week/Day 빈 셀 → `start`/`end` (일정 생성 등)   |

## Props / Emits

### Props

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| `schedules` | `Schedule[]` | `[]` | 표시할 일정 목록 |
| `holidays` | `Holiday[]` | `[]` | 기념일·공휴일 병합 목록 |
| `view` | `CalendarView` | `'month'` | 현재 뷰 (`'month'｜'week'｜'day'｜'list'`) |
| `date` | `Date` | 오늘 | 현재 기준 날짜 |
| `viewScope` | `ViewScope` | `'company'` | 일정 범위 필터 |
| `scheduleTypes` | `string[] \| null` | `null` | 활성 일정 타입 필터 |
| `listFilterDate` | `Date \| null` | `null` | List 뷰 날짜 필터 |
| `scheduleTypeOptions` | `ScheduleTypeOption[]` | 기본 2종 | 커스텀 일정 타입 정의 |
| `fetchPublicHolidays` | `boolean` | `false` | 한국 공공 API 공휴일 opt-in |
| `hideToolbar` | `boolean` | `false` | 툴바 숨김 (뷰 고정 임베딩용) |

### Emits

| 이벤트 | 페이로드 | 설명 |
| ------ | -------- | ---- |
| `view-change` | `{ view: CalendarView }` | 뷰 탭 전환 |
| `date-select` | `{ date: Date, source: string }` | 날짜 클릭 |
| `navigate` | `{ date: Date }` | ‹ › · Today 네비 |
| `overflow-click` | `{ date: Date }` | 월간 +N 클릭 |
| `schedule-click` | `{ schedule: Schedule, date?: Date }` | 일정 클릭 |
| `time-slot-select` | `{ start: Date, end: Date }` | Week/Day 빈 셀 클릭 (1시간 단위) |
| `list-filter-clear` | — | List 날짜 필터 해제 |
| `query-change` | `{ viewScope: ViewScope, scheduleTypes: string[] \| null }` | 범위·타입 필터 변경 |

> 전체 타입 정의 및 내부 구조는 [`docs/dev/architecture.md`](docs/dev/architecture.md) 참조.

---

## 다른 프로젝트에 이식하기

**→ [`docs/guide/integration.md`](docs/guide/integration.md)** — 파일 복사·alias·Minimal/Full·연동 예시

| 트랙        | 포함 뷰            | 추가 의존성            |
| ----------- | ------------------ | ---------------------- |
| **Minimal** | Month / Week / Day | 없음 (`vue` 단독)      |
| **Full**    | + List             | 없음 — 네이티브 `<table>` 구현으로 PrimeVue 불필요 |

API·내부 구조: [`docs/dev/architecture.md`](docs/dev/architecture.md)

## 주요 기능

- **4가지 뷰** — Month / Week / Day / List
- **월간 동적 레이아웃** — 6주 행이 부모 높이에 맞춰 균등 분할, 그리드 내부 세로 스크롤 없음
- **월간 `+N` 팝오버** — 숨긴 일정 목록 (임베디드 패널에서 크기·위치 자동 조정)
- **날짜 라벨** — Month·Week·List 상단 `YYYY-MM`, Day `YYYY-MM-DD`, Week/Day 헤더는 요일만
- **List 월 네비** — Month와 동일한 ‹ › 로 월 이동 (`navigate` → 부모 `date` 갱신)
- **공휴일·기념일** — `:fetch-public-holidays="true"` opt-in + `:holidays` 병합 → Month/Week/Day 붉은 칩
- **View Option / Schedule Type** — `v-model:view-scope`·`v-model:schedule-types` + `query-change`
- **Week/Day 시간 슬롯 선택** — 빈 그리드 셀 클릭 시 `time-slot-select`로 1시간 `start`/`end` 전달
- **월간 멀티데이 바** — 2일 이상 종일 일정 spanning bar (예: 4/27~28 해외 출장)
- **스크롤바 격리** — `.schedule-calendar` / `.month-overflow-popover`에만 얇은 스크롤바 적용
- **부모 연동 유틸** — `filterSchedulesByScope`, `upsertSchedule`, `startOfDay` 등 (`@/components/calendar` export)
- **번들 분리** — ListView lazy 로드 (PrimeVue 없음, 네이티브 테이블)
- **라이브러리 배포** — `npm run build:lib`으로 ES+CJS+d.ts 패키지 빌드 (`peerDependencies: vue`만)
- **타입 확장** — `Schedule.type: string` + `scheduleTypeOptions` prop으로 소비자 도메인 타입 등록 가능

## 문서

| 문서                                                           | 용도                                |
| -------------------------------------------------------------- | ----------------------------------- |
| [`docs/guide/integration.md`](docs/guide/integration.md)       | 다른 프로젝트 이식·npm 패키지 사용  |
| [`docs/dev/architecture.md`](docs/dev/architecture.md)         | API·내부 구조·테스트·개발 시작하기  |
| [`docs/dev/roadmap.md`](docs/dev/roadmap.md)                   | 기능 로드맵·컴포넌트 분리 백로그    |
| [`docs/dev/npm-publish-guide.md`](docs/dev/npm-publish-guide.md) | npm 배포 체크리스트               |
| [`CHANGELOG.md`](CHANGELOG.md)                                 | 버전별 변경 이력                    |

### Playwright UI로 동작 확인

```bash
npm run build && npm run test:e2e:ui
```

E2E 스펙을 UI에서 단계별 실행하면 탭·`+N` 팝오버·반응형·호스트 레이아웃을 눈으로 검증할 수 있습니다.

## 기술 스택

- Vue 3 + TypeScript + Vite 8
- 커스텀 HTML/CSS (전체 뷰 — PrimeVue 없음)
- Vitest · Playwright

## Path alias

`@/`는 `src/`에 매핑됩니다 (`vite.config.ts`, `tsconfig.app.json`).
