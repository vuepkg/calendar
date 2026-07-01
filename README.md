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

```ts
useScheduleCalendarHost({
  onTimeSlotSelect(payload) {
    // Week/Day 빈 셀 클릭 — 일정 생성 다이얼로그
    openCreateDialog({ start: payload.start, end: payload.end })
  },
  onScheduleClick(payload) {
    // 일정 칩 클릭 — 상세/수정 다이얼로그
    openEditDialog(payload.schedule)
  },
})
```

```ts
import { upsertSchedule, removeSchedule, buildScheduleFromDraft, createScheduleId } from '@vuepkg/calendar'

schedules.value = upsertSchedule(schedules.value, buildScheduleFromDraft({ id: createScheduleId(), ...draft }))
schedules.value = removeSchedule(schedules.value, targetId)
```

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
- **월간 셀** — `role="grid"`, 날짜 `aria-label`
- **팝오버** — focus trap, `Esc` 닫기, 외부 클릭 닫기, 닫힘 시 트리거로 focus 복원
- **데이터 테이블(List 뷰)** — 행 `Enter`/`Space` 활성화, `aria-label`
- **키보드 포커스** — 모든 인터랙티브 요소에 `:focus-visible` 아웃라인

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
