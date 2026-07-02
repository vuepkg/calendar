# @vuepkg/calendar

[![npm](https://img.shields.io/npm/v/@vuepkg/calendar)](https://www.npmjs.com/package/@vuepkg/calendar)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@vuepkg/calendar)](https://bundlephobia.com/package/@vuepkg/calendar)

Vue 3 schedule calendar — Month / Week / Day / List views, **zero extra dependencies** (`vue` peer only).

**지원 브라우저**: 최신 Chrome / Firefox / Safari / Edge (Evergreen browsers) — IE 미지원

## 주요 기능

- **4가지 뷰** — Month / Week / Day / List
- **월간 동적 레이아웃** — 6주 행이 부모 높이에 맞춰 균등 분할
- **월간 `+N` 팝오버** — 숨긴 일정 목록
- **멀티데이 spanning 바** — 2일 이상 종일 일정 바 표시
- **Week/Day 시간 슬롯 선택** — 빈 셀 클릭 시 1시간 `start`/`end` 전달
- **반복 일정** — 매일/매주(요일 지정)/매월/매년, 횟수·종료일 조건. `ScheduleFormModal`에 내장
- **공휴일·기념일** — 사내 기념일 prop + 한국 공공 API opt-in
- **커스텀 일정 타입** — `scheduleTypeOptions`로 도메인 타입·색상 등록
- **TypeScript** — 완전한 타입 선언 포함

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

## 빠른 시작

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ScheduleCalendar,
  useScheduleCalendarHost,
  type Schedule,
} from '@vuepkg/calendar'

const schedules = ref<Schedule[]>([
  {
    id: '1',
    title: '팀 회의',
    type: 'team_schedule',
    participantId: 'user-1',
    participantName: '홍길동',
    start: new Date(2026, 5, 15, 10, 0),
    end:   new Date(2026, 5, 15, 11, 0),
  },
])

const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost()
</script>

<template>
  <!-- 부모에 height 지정 필수 — 캘린더가 100% 채움 -->
  <div style="height: 100vh; display: flex; flex-direction: column;">
    <ScheduleCalendar
      :schedules="schedules"
      v-model:view="view"
      v-model:date="date"
      v-model:list-filter-date="listFilterDate"
      v-model:view-scope="viewScope"
      v-model:schedule-types="scheduleTypes"
      v-on="calendarListeners"
    />
  </div>
</template>
```

> **초보자 팁**: `useScheduleCalendarHost`와 `v-on="calendarListeners"`가 낯설다면 [시작하기 가이드](./docs/guide/getting-started.md)에서 단계별 설명을 확인하세요.

---

## API에서 일정 가져오기

뷰·날짜가 바뀔 때마다 `query-change`가 발생합니다. `onQueryChange`로 API 호출을 연결합니다:

```ts
const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost({
    onQueryChange: async (payload) => {
      schedules.value = await fetchSchedules(payload.range.start, payload.range.end)
    },
  })
```

---

## 일정 생성·수정 연결

`ScheduleFormModal`은 일정 생성/수정/삭제 폼을 제공하는 선택적 컴포넌트입니다. `ScheduleCalendar`와 마찬가지로 controlled — 모달의 열림 상태와 `schedules` 갱신은 항상 부모가 소유합니다.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ScheduleCalendar,
  ScheduleFormModal,
  useScheduleCalendarHost,
  upsertSchedule,
  removeSchedule,
  type Schedule,
  type Participant,
} from '@vuepkg/calendar'

const schedules = ref<Schedule[]>([/* ... */])
const participants: Participant[] = [{ id: 'user-1', name: '홍길동' }]

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const activeSchedule = ref<Schedule | null>(null)
const initialStart = ref<Date>()
const initialEnd = ref<Date>()

const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost({
    onTimeSlotSelect(payload) {
      // Week/Day 빈 셀 클릭 — 생성 모드로 오픈
      modalMode.value = 'create'
      activeSchedule.value = null
      initialStart.value = payload.start
      initialEnd.value = payload.end
      modalOpen.value = true
    },
    onScheduleClick(payload) {
      // 일정 칩 클릭 — 수정 모드로 오픈.
      // 반복 일정 회차를 클릭했다면 recurrenceId로 마스터 일정을 찾아 시리즈 전체를 연다.
      const masterId = payload.schedule.recurrenceId ?? payload.schedule.id
      modalMode.value = 'edit'
      activeSchedule.value = schedules.value.find((s) => s.id === masterId) ?? payload.schedule
      modalOpen.value = true
    },
  })

function handleSubmit(schedule: Schedule) {
  schedules.value = upsertSchedule(schedules.value, schedule)
  modalOpen.value = false
}

function handleDelete(scheduleId: string) {
  schedules.value = removeSchedule(schedules.value, scheduleId)
  modalOpen.value = false
}
</script>

<template>
  <ScheduleCalendar
    :schedules="schedules"
    v-model:view="view"
    v-model:date="date"
    v-model:list-filter-date="listFilterDate"
    v-model:view-scope="viewScope"
    v-model:schedule-types="scheduleTypes"
    v-on="calendarListeners"
  />

  <ScheduleFormModal
    :open="modalOpen"
    :mode="modalMode"
    :schedule="activeSchedule"
    :initial-start="initialStart"
    :initial-end="initialEnd"
    :participants="participants"
    :existing-schedules="schedules"
    @close="modalOpen = false"
    @submit="handleSubmit"
    @delete="handleDelete"
  />
</template>
```

`ScheduleFormModal`이 원하는 폼 UI와 다르다면 데이터 헬퍼만 가져다 직접 다이얼로그를 구성할 수 있습니다:

```ts
import { upsertSchedule, removeSchedule, buildScheduleFromDraft } from '@vuepkg/calendar'

schedules.value = upsertSchedule(
  schedules.value,
  buildScheduleFromDraft(draft, participants, schedules.value),
)
schedules.value = removeSchedule(schedules.value, targetId)
```

### `ScheduleFormModal` Props / Emits

| Prop | 타입 | 설명 |
| ---- | ---- | ---- |
| `open` | `boolean` | 모달 표시 여부 |
| `mode` | `'create' \| 'edit'` | 생성/수정 모드 |
| `schedule` | `Schedule \| null` | edit 모드 수정 대상 |
| `initialStart` / `initialEnd` | `Date` | create 모드 초기 시간 — `time-slot-select` payload 전달 |
| `participants` | `Participant[]` | 참가자 선택지 + 이름 조회 |
| `existingSchedules` | `Schedule[]` | create 모드 ID 충돌 방지용 (기본 `[]`) |
| `scheduleTypeOptions` | `ScheduleTypeOption[]` | 유형 선택지 (기본 `SCHEDULE_TYPE_OPTIONS`) |

| 이벤트 | 페이로드 | 설명 |
| ------ | -------- | ---- |
| `close` | — | 취소·Esc·배경 클릭 |
| `submit` | `Schedule` | `buildScheduleFromDraft`로 완성된 일정 — `upsertSchedule`에 바로 전달 |
| `delete` | `string` (scheduleId) | edit 모드 삭제 버튼 — `removeSchedule`에 바로 전달 |

---

## 반복 일정

`Schedule.recurrence`에 `RecurrenceRule`을 지정하면 캘린더가 표시 중인 기간 내에서 자동으로 개별 회차를 생성합니다. 부모는 마스터 일정 한 건만 관리하면 됩니다 — 반복 펼침은 `ScheduleCalendar` 내부에서 처리됩니다.

```ts
import type { Schedule } from '@vuepkg/calendar'

const schedule: Schedule = {
  id: 's-standup',
  title: '주간 스탠드업',
  type: 'team_schedule',
  participantId: 'user-1',
  participantName: '홍길동',
  start: new Date(2026, 3, 6, 9, 0),
  end: new Date(2026, 3, 6, 9, 30),
  recurrence: {
    freq: 'weekly', // 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: 1, // 기본 1. weekly + interval 2 → 격주
    byWeekday: [1, 3, 5], // weekly 전용, 0=일 ~ 6=토
    count: 20, // count 또는 until 중 하나 — 둘 다 없으면 열려있는 반복
  },
}
```

- 화면에 렌더링되는 각 회차는 `id: "${마스터id}::YYYY-MM-DD"`, `recurrenceId: 마스터id`, `isRecurrenceInstance: true`를 가진 파생 `Schedule` 객체입니다. 원본 배열에는 추가되지 않습니다.
- `schedule-click`/`schedule-move`/`schedule-resize` 등 이벤트 payload의 `schedule`이 회차인 경우, `recurrenceId`로 마스터를 찾아 시리즈 전체에 반영하세요 (단일 회차만 수정/삭제하는 기능은 아직 없습니다 — v1 범위 밖).
- `ScheduleFormModal`은 반복 없음/매일/매주/매월/매년 선택, 요일(weekly), 종료 없음/횟수/종료일 조건을 폼으로 제공합니다.
- 반복 일정 칩에는 시작 부분에 ⟳ 아이콘이 표시됩니다.

---

## Props

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| `schedules` | `Schedule[]` | `[]` | 표시할 일정 목록 |
| `holidays` | `Holiday[]` | `[]` | 기념일·공휴일 목록 |
| `view` | `CalendarView` | `'month'` | 현재 뷰 (`'month'｜'week'｜'day'｜'list'`) |
| `date` | `Date` | 오늘 | 현재 기준 날짜 |
| `viewScope` | `ViewScope` | `'company'` | 일정 범위 필터 (`'my'｜'company'`) |
| `scheduleTypes` | `string[] \| null` | `null` | 활성 일정 타입 필터 (`null`=전체) |
| `listFilterDate` | `Date \| null` | `null` | List 뷰 날짜 필터 |
| `scheduleTypeOptions` | `ScheduleTypeOption[]` | 기본 3종 | 커스텀 일정 타입 정의 |
| `fetchPublicHolidays` | `boolean` | `false` | 한국 공공 API 공휴일 opt-in |
| `hideToolbar` | `boolean` | `false` | 툴바 숨김 (뷰 고정 임베딩용) |
| `weekdayLabels` | `string[]` | `['SUN', ..., 'SAT']` | 월간 뷰 요일 헤더 라벨 (일~토 순서 7개) |
| `startHour` | `number` | `0` | Week/Day 시간 그리드 시작 시각 (0~23) |
| `endHour` | `number` | `23` | Week/Day 시간 그리드 종료 시각 (0~23) |
| `locale` | `string` | — | `Intl.DateTimeFormat` locale (예: `'ko-KR'`). 월간 요일 헤더·Week/Day 요일 라벨 자동 현지화. `weekdayLabels`가 우선 |

## Emits

| 이벤트 | 페이로드 | 설명 |
| ------ | -------- | ---- |
| `view-change` | `CalendarViewChangePayload` | 뷰 탭 전환 |
| `date-select` | `CalendarDateSelectPayload` | 날짜 클릭 |
| `navigate` | `CalendarNavigatePayload` | ‹ › · Today 네비 |
| `schedule-click` | `CalendarScheduleClickPayload` | 일정 클릭 |
| `time-slot-select` | `CalendarTimeSlotSelectPayload` | Week/Day 빈 셀 클릭 (1시간 단위) |
| `overflow-click` | `CalendarOverflowClickPayload` | 월간 +N 클릭 |
| `list-filter-clear` | — | List 날짜 필터 해제 |
| `query-change` | `ScheduleQueryChangePayload` | 범위·필터 변경 (API 조회용) |

> `useScheduleCalendarHost`를 사용하면 위 이벤트가 자동으로 연결됩니다. `v-on="calendarListeners"`만 추가하면 됩니다.

---

## 테마 · Tailwind

- **기본:** `import '@vuepkg/calendar/style.css'` 후 CSS 변수(`--vp-*`)로 테마 — [문서 사이트 테마 가이드](https://vuepkg.github.io/calendar/guide/theming.html)
- **Tailwind:** 유틸리티 class를 컴포넌트에 직접 붙여 내부 UI를 바꾸는 방식은 **미지원**. CSS 변수 연동 또는 [`@vuepkg/calendar/headless`](#headless-서브패스) 사용 — [Tailwind §](https://vuepkg.github.io/calendar/guide/theming.html#tailwind-css-프로젝트에서-사용하기)
- **로드맵·달성률:** [docs/dev/roadmap.md](./docs/dev/roadmap.md)

---

## Headless 서브패스

`ScheduleCalendar`/`ScheduleFormModal` Vue 컴포넌트 없이 composable·타입·일정 CRUD 유틸만 필요하다면 `@vuepkg/calendar/headless`를 사용하세요. 스타일드 컴포넌트를 전혀 import하지 않아 커스텀 UI 위에 캘린더 로직만 재사용하고 싶을 때 유용합니다.

```ts
import {
  useCalendar,
  useTimeSlotSelection,
  useScheduleDrag,
  usePublicHolidays,
  expandRecurringSchedules,
  buildScheduleFromDraft,
} from '@vuepkg/calendar/headless'
```

---

## 커스텀 일정 타입

```ts
import { SCHEDULE_TYPE_OPTIONS, type ScheduleTypeOption } from '@vuepkg/calendar'

const typeOptions: ScheduleTypeOption[] = [
  ...SCHEDULE_TYPE_OPTIONS,
  { type: 'project', label: '프로젝트', color: '#fff', backgroundColor: '#6366f1' },
  { type: 'leave',   label: '휴가',     color: '#fff', backgroundColor: '#f59e0b' },
]
```

```vue
<ScheduleCalendar :schedule-type-options="typeOptions" ... />
```

---

## 접근성 (a11y)

- **뷰 탭** — `role="group"` + `aria-pressed`로 현재 뷰 상태 노출, 화살표 키 네비게이션(roving tabindex)
- **월간 셀** — `role="grid"`/`row`/`gridcell`, 단일 활성 셀만 `tabindex="0"`(roving tabindex) + 화살표 키 이동, `Enter`/`Space` 활성화
- **팝오버** — focus trap, `Esc` 닫기, 외부 클릭 닫기, 닫힘 시 트리거로 focus 복원
- **데이터 테이블(List 뷰)** — 행 `Enter`/`Space` 활성화, `aria-label`
- **키보드 포커스** — 모든 인터랙티브 요소에 `:focus-visible` 아웃라인
- **자동 검증** — `@axe-core/playwright`로 Month/Week/Day/List 뷰 + 일정 폼 모달을 CI에서 매 push마다 스캔 (`e2e/accessibility.spec.ts`)

---

## TypeScript

```ts
import type {
  Schedule,
  Holiday,
  CalendarView,
  ViewScope,
  ScheduleTypeOption,
  ScheduleQueryChangePayload,
  CalendarScheduleClickPayload,
  CalendarTimeSlotSelectPayload,
} from '@vuepkg/calendar'
```

---

## 기술 스택

- Vue 3 + TypeScript
- 커스텀 HTML/CSS
- Vitest · Playwright E2E

---

## Contributing

[github.com/vuepkg/calendar](https://github.com/vuepkg/calendar) · 상세 절차·RFC 프로세스는 [CONTRIBUTING.md](./CONTRIBUTING.md) 참고

**요구 사항**: Node 24+ (GitHub Actions CI 기준), pnpm 9+

```bash
pnpm install                          # 의존성 설치 + Husky pre-push 훅 등록
pnpm --filter @vuepkg/calendar dev    # 개발 서버
pnpm verify:push                      # push 전 검증 (lint + typecheck + vitest)
pnpm turbo run build:lib              # 전체 빌드
pnpm test:e2e:ci                      # 기능 E2E (CI와 동일, 134건)
pnpm test:e2e:visual                  # 시각 회귀 (UI/CSS 변경 시, 8건)
```

자세한 테스트 계층·CI 정책은 [docs/dev/architecture.md](docs/dev/architecture.md) §10 참고.

---

## License

MIT © [vuepkg](https://github.com/vuepkg)
