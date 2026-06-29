# @vuepkg/calendar

Vue 3 schedule calendar — Month / Week / Day / List views, **zero extra dependencies** (`vue` peer only).

emit-only 컴포넌트로 일정 범위·CRUD는 부모 컴포넌트에서 처리하고, 캘린더에 필터링된 `schedules`를 prop으로 전달합니다.

## 주요 기능

- **4가지 뷰** — Month / Week / Day / List
- **월간 동적 레이아웃** — 6주 행이 부모 높이에 맞춰 균등 분할, 세로 스크롤 없음
- **월간 `+N` 팝오버** — 숨긴 일정 목록 (임베디드 패널 크기·위치 자동 조정)
- **멀티데이 spanning 바** — 2일 이상 종일 일정 바 표시
- **Week/Day 시간 슬롯 선택** — 빈 셀 클릭 시 `time-slot-select`로 1시간 `start`/`end` 전달
- **공휴일·기념일** — `:fetch-public-holidays="true"` opt-in + `:holidays` prop 병합
- **커스텀 일정 타입** — `scheduleTypeOptions` prop으로 도메인 타입·색상 등록
- **View / Scope 필터** — `v-model:view-scope`·`v-model:schedule-types` + `query-change` emit
- **TypeScript** — 완전한 타입 선언 포함 (d.ts)
- **추가 의존성 없음** — PrimeVue 불필요, `vue ^3.5.0`만 peerDependency

---

## 설치

```bash
npm install @vuepkg/calendar
```

```ts
// main.ts — CSS 전역 임포트 (필수)
import '@vuepkg/calendar/style.css'
```

---

## 사용 예시

### Composable 방식 (권장)

`useScheduleCalendarHost`가 뷰·날짜·필터 상태와 이벤트 핸들러를 한 번에 제공합니다.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ScheduleCalendar,
  applyScheduleFilters,
  useScheduleCalendarHost,
  type Schedule,
} from '@vuepkg/calendar'

const allSchedules = ref<Schedule[]>([
  {
    id: 's-001',
    title: '팀 미팅',
    type: 'team_schedule',
    participantId: 'user-001',
    participantName: '홍길동',
    start: new Date(2026, 5, 10, 10, 0),
    end: new Date(2026, 5, 10, 11, 0),
  },
])

const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost()

const schedules = computed(() =>
  applyScheduleFilters(allSchedules.value, {
    viewScope: viewScope.value,
    scheduleTypes: scheduleTypes.value,
    currentUserId: 'user-001',
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
    v-on="calendarListeners"
  />
</template>
```

### 커스텀 일정 타입 등록

```ts
import { SCHEDULE_TYPE_OPTIONS, type ScheduleTypeOption } from '@vuepkg/calendar'

const typeOptions: ScheduleTypeOption[] = [
  ...SCHEDULE_TYPE_OPTIONS,
  { type: 'project', label: '프로젝트', color: '#fff', backgroundColor: '#6366f1' },
  { type: 'leave', label: '휴가', color: '#fff', backgroundColor: '#f59e0b' },
]
```

```vue
<ScheduleCalendar :schedule-type-options="typeOptions" ... />
```

### 한국 공공 공휴일 API (opt-in)

```vue
<ScheduleCalendar
  :fetch-public-holidays="true"
  ...
/>
```

> 기본값 `false`. 활성화 시 내부적으로 `/api/spcde/getRestDeInfo` (same-origin BFF/proxy) 경로를 호출합니다. 서버에서 [공공데이터포털](https://www.data.go.kr/data/15012690/openapi.do) 인증키를 주입하는 BFF를 구성하거나, `VITE_SPCDE_API_URL` 환경변수로 API URL을 오버라이드하세요. 클라이언트에서 직접 호출할 경우 `usePublicHolidays({ serviceKey: '...' })`를 대신 사용하세요.

---

## Props

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| `schedules` | `Schedule[]` | `[]` | 표시할 일정 목록 |
| `holidays` | `Holiday[]` | `[]` | 기념일·공휴일 병합 목록 |
| `view` | `CalendarView` | `'month'` | 현재 뷰 (`'month'｜'week'｜'day'｜'list'`) |
| `date` | `Date` | 오늘 | 현재 기준 날짜 |
| `viewScope` | `ViewScope` | `'company'` | 일정 범위 필터 (`'my'｜'company'`) |
| `scheduleTypes` | `string[] \| null` | `null` | 활성 일정 타입 필터 |
| `listFilterDate` | `Date \| null` | `null` | List 뷰 날짜 필터 |
| `scheduleTypeOptions` | `ScheduleTypeOption[]` | 기본 3종 | 커스텀 일정 타입 정의 |
| `fetchPublicHolidays` | `boolean` | `false` | 한국 공공 API 공휴일 opt-in |
| `hideToolbar` | `boolean` | `false` | 툴바 숨김 (뷰 고정 임베딩용) |

## Emits

| 이벤트 | 페이로드 | 설명 |
| ------ | -------- | ---- |
| `view-change` | `{ view: CalendarView, previousView: CalendarView }` | 뷰 탭 전환 |
| `date-select` | `{ date: Date, source: 'month-cell' \| 'week-day-header' }` | 날짜 클릭 |
| `navigate` | `{ action: CalendarNavigateAction, date: Date }` | ‹ › · Today 네비 |
| `overflow-click` | `{ date: Date, hiddenCount: number, schedules: Schedule[], visibleSchedules: Schedule[] }` | 월간 +N 클릭 |
| `schedule-click` | `{ schedule: Schedule, source: ScheduleClickSource, date?: Date }` | 일정 클릭 |
| `time-slot-select` | `{ date: Date, start: Date, end: Date, source: TimeSlotSelectSource }` | Week/Day 빈 셀 클릭 (1시간 단위) |
| `list-filter-clear` | — | List 날짜 필터 해제 |
| `query-change` | `ScheduleQueryChangePayload` | 범위·타입·기간 필터 변경 (API 조회용) |

> **emit-only** 구조입니다. `view-change`·`navigate`·`date-select` 핸들러를 연결하지 않으면 탭·네비가 동작하지 않습니다. `useScheduleCalendarHost`를 사용하면 모든 핸들러가 자동으로 연결됩니다.

---

## TypeScript

```ts
import type {
  Schedule,
  Holiday,
  CalendarView,
  ViewScope,
  ScheduleTypeOption,
  CalendarScheduleClickPayload,
  CalendarTimeSlotSelectPayload,
} from '@vuepkg/calendar'
```

---

## 기술 스택

- Vue 3 + TypeScript
- 커스텀 HTML/CSS (PrimeVue 없음)
- Vitest · Playwright E2E

---

## Contributing

[github.com/vuepkg/calendar](https://github.com/vuepkg/calendar)

**요구 사항**: Node 20+, pnpm 9+

```bash
# 저장소 클론 후 의존성 설치
pnpm install

# 개발 서버 (packages/calendar)
pnpm --filter @vuepkg/calendar dev

# 전체 빌드
pnpm turbo run build:lib

# 단위 테스트
pnpm turbo run test

# 타입 체크
pnpm turbo run typecheck
```

이 모노레포는 pnpm workspace + Turborepo로 관리됩니다. `packages/core`에 범용 유틸이, `packages/calendar`에 캘린더 컴포넌트가 위치합니다.

---

## License

MIT © [vuepkg](https://github.com/vuepkg)
