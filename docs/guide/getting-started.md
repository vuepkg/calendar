# 시작하기

처음 `@vuepkg/calendar`를 사용하는 개발자를 위한 단계별 가이드입니다.

---

## 1단계: 설치

```bash
npm install @vuepkg/calendar
```

`main.ts`에 CSS를 한 번 전역 임포트합니다:

```ts
// main.ts
import { createApp } from 'vue'
import '@vuepkg/calendar/style.css'   // ← 이 줄이 없으면 스타일이 적용되지 않습니다
import App from './App.vue'

createApp(App).mount('#app')
```

---

## 2단계: 캘린더 표시하기

아래가 동작하는 최소 코드입니다:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ScheduleCalendar,
  useScheduleCalendarHost,
  type Schedule,
} from '@vuepkg/calendar'

// 표시할 일정 목록
const schedules = ref<Schedule[]>([
  {
    id: '1',
    title: '팀 회의',
    type: 'team_schedule',
    participantId: 'user-1',
    participantName: '홍길동',
    start: new Date(2026, 5, 15, 10, 0),  // 2026-06-15 10:00
    end:   new Date(2026, 5, 15, 11, 0),  // 2026-06-15 11:00
  },
])

// 뷰·날짜·이벤트 핸들러를 한 번에 관리하는 composable
const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost()
</script>

<template>
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

> **레이아웃 필수**: 캘린더는 부모 컨테이너를 100% 채웁니다. 부모에 `height`를 지정하지 않으면 높이가 0이 됩니다.

---

## 3단계: 핵심 개념 이해 — 왜 이렇게 작성해야 하나?

### 캘린더는 "표시만" 합니다

`ScheduleCalendar`는 **emit-only** 컴포넌트입니다. 뷰 탭을 클릭하거나 날짜를 이동해도 **캘린더 자신은 상태를 바꾸지 않습니다.** 대신 이벤트(emit)를 발생시키고, 부모가 그 이벤트를 받아 `v-model`을 업데이트해야 화면이 바뀝니다.

```
사용자 클릭
    ↓
ScheduleCalendar  →  emit('view-change', { view: 'week' })  →  부모
                                                                  ↓
ScheduleCalendar  ←  view prop 업데이트  ←──────────────────  v-model 갱신
```

이 구조 덕분에 **부모가 모든 상태를 소유**하고 캘린더는 순수하게 UI 역할만 합니다. 서버 상태와 동기화하거나 URL에 상태를 저장하기 쉬워집니다.

### `useScheduleCalendarHost`가 하는 일

v-model 5개 + 이벤트 8개를 직접 연결하면 코드가 길어집니다. `useScheduleCalendarHost`는 이것을 한 번에 처리해 줍니다:

```ts
const {
  view,             // Ref<CalendarView>  — 현재 뷰
  date,             // Ref<Date>          — 현재 날짜
  listFilterDate,   // Ref<Date | null>   — List 뷰 날짜 필터
  viewScope,        // Ref<ViewScope>     — 'my' | 'company'
  scheduleTypes,    // Ref<string[] | null>
  calendarListeners // 이벤트 핸들러 객체 → v-on="calendarListeners"
} = useScheduleCalendarHost()
```

`v-on="calendarListeners"`는 Vue의 이벤트 핸들러 spread 문법입니다. 캘린더가 발생시키는 모든 이벤트(`view-change`, `navigate`, `date-select` 등)를 자동으로 연결합니다.

---

## 4단계: API에서 일정 가져오기

뷰나 날짜가 바뀔 때마다 `query-change` 이벤트가 발생합니다. `onQueryChange` 옵션으로 API 호출 로직을 연결하세요:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ScheduleCalendar,
  useScheduleCalendarHost,
  type Schedule,
  type ScheduleQueryChangePayload,
} from '@vuepkg/calendar'

const schedules = ref<Schedule[]>([])

const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost({
    onQueryChange: async (payload: ScheduleQueryChangePayload) => {
      // payload.range.start ~ payload.range.end 범위로 API 호출
      const data = await fetchSchedules({
        from: payload.range.start,
        to:   payload.range.end,
      })
      schedules.value = data
    },
  })

async function fetchSchedules({ from, to }: { from: Date; to: Date }): Promise<Schedule[]> {
  const res = await fetch(`/api/schedules?from=${from.toISOString()}&to=${to.toISOString()}`)
  return res.json()
}
</script>

<template>
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

`query-change`는 다음 시점에 발생합니다:

| 시점 | `payload.trigger` |
| ---- | ---- |
| 컴포넌트 마운트 시 최초 1회 | `'init'` |
| ‹ › · Today 네비 | `'navigate'` |
| 뷰 탭 전환 | `'view-change'` |
| viewScope · scheduleTypes 필터 변경 | `'filter-change'` |
| List 날짜 필터 해제 | `'list-filter-clear'` |

`trigger === 'init'`일 때는 컴포넌트가 처음 로드되는 시점이므로, 이 한 번의 호출로 초기 데이터를 가져옵니다.

---

## 5단계: 일정 추가 / 수정 연결

### 빈 시간 슬롯 클릭 → 일정 생성

Week·Day 뷰에서 빈 영역을 클릭하면 `time-slot-select` 이벤트가 발생합니다:

```ts
const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost({
    onTimeSlotSelect(payload) {
      // payload.start, payload.end — 클릭한 1시간 슬롯
      openCreateDialog({
        start: payload.start,
        end:   payload.end,
      })
    },
  })
```

### 일정 클릭 → 상세/수정

```ts
useScheduleCalendarHost({
  onScheduleClick(payload) {
    // payload.schedule — 클릭한 일정
    openEditDialog(payload.schedule)
  },
})
```

### 일정 CRUD 헬퍼

```ts
import {
  upsertSchedule,
  removeSchedule,
  buildScheduleFromDraft,
  createScheduleId,
  type ScheduleDraft,
} from '@vuepkg/calendar'

const allSchedules = ref<Schedule[]>([])

// 새 일정 추가
function handleCreate(draft: ScheduleDraft) {
  const newSchedule = buildScheduleFromDraft({ ...draft, id: createScheduleId() })
  allSchedules.value = upsertSchedule(allSchedules.value, newSchedule)
}

// 기존 일정 수정
function handleUpdate(draft: ScheduleDraft & { id: string }) {
  const updated = buildScheduleFromDraft(draft)
  allSchedules.value = upsertSchedule(allSchedules.value, updated)
}

// 일정 삭제
function handleDelete(id: string) {
  allSchedules.value = removeSchedule(allSchedules.value, id)
}
```

---

## 6단계: 커스터마이징

### 커스텀 일정 타입 추가

기본 제공 타입(`my_schedule`, `team_schedule`, `company_schedule`) 외에 도메인 타입을 추가하려면 `SCHEDULE_TYPE_OPTIONS`를 spread해서 전달합니다:

```ts
import { SCHEDULE_TYPE_OPTIONS, type ScheduleTypeOption } from '@vuepkg/calendar'

const scheduleTypeOptions: ScheduleTypeOption[] = [
  ...SCHEDULE_TYPE_OPTIONS,
  { type: 'project',  label: '프로젝트', color: '#fff', backgroundColor: '#6366f1' },
  { type: 'leave',    label: '휴가',     color: '#fff', backgroundColor: '#f59e0b' },
]
```

```vue
<ScheduleCalendar :schedule-type-options="scheduleTypeOptions" ... />
```

### 공휴일·기념일

**사내 기념일만** (가장 단순):
```vue
<ScheduleCalendar :holidays="companyHolidays" ... />
```

**한국 공공 API + 사내 기념일 병합** (opt-in):
```vue
<ScheduleCalendar :fetch-public-holidays="true" :holidays="companyHolidays" ... />
```

공공 API를 사용하려면 same-origin 프록시 또는 BFF가 필요합니다. 자세한 설정은 [통합 가이드](./integration.md)를 참고하세요.

### 뷰 고정 임베딩

특정 뷰만 표시하고 툴바를 숨기려면:

```vue
<ScheduleCalendar
  :hide-toolbar="true"
  v-model:view="fixedView"
  ...
/>
```

### 테마 커스터마이징

모든 색상·크기·간격은 CSS 변수(`--vp-*`)로 정의되어 있습니다. `:root`에서 원하는 값만 덮어쓰세요:

```css
:root {
  --vp-color-primary: #7c3aed;       /* 강조 색상 */
  --vp-today-badge-bg: #7c3aed;      /* 오늘 뱃지 */
  --vp-holiday-chip-bg: #fef3c7;     /* 공휴일 칩 배경 */
  --vp-holiday-chip-color: #92400e;  /* 공휴일 칩 텍스트 */
}
```

다크 모드는 시스템 설정(`prefers-color-scheme: dark`) 자동 반영 또는 `.vp-dark` 클래스로 수동 전환할 수 있습니다.

토큰 전체 목록과 다크 모드 설정법은 [테마 커스터마이징 가이드](./theming.md)를 참고하세요.

---

## 전체 예시 (실전 패턴)

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ScheduleCalendar,
  SCHEDULE_TYPE_OPTIONS,
  applyScheduleFilters,
  useScheduleCalendarHost,
  upsertSchedule,
  removeSchedule,
  type Schedule,
  type ScheduleTypeOption,
} from '@vuepkg/calendar'

// 커스텀 타입
const scheduleTypeOptions: ScheduleTypeOption[] = [
  ...SCHEDULE_TYPE_OPTIONS,
  { type: 'project', label: '프로젝트', color: '#fff', backgroundColor: '#6366f1' },
]

const CURRENT_USER_ID = 'user-001'
const allSchedules = ref<Schedule[]>([])

const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost({
    onQueryChange: async (payload) => {
      const data = await fetch(
        `/api/schedules?from=${payload.range.start.toISOString()}&to=${payload.range.end.toISOString()}`
      ).then((r) => r.json())
      allSchedules.value = data
    },
    onTimeSlotSelect(payload) {
      // 일정 생성 다이얼로그 열기
      console.log('create at', payload.start, '~', payload.end)
    },
    onScheduleClick(payload) {
      // 일정 상세/수정 다이얼로그 열기
      console.log('clicked', payload.schedule)
    },
  })

// viewScope · scheduleTypes 필터를 클라이언트에서 적용
const filteredSchedules = computed(() =>
  applyScheduleFilters(allSchedules.value, {
    viewScope: viewScope.value,
    scheduleTypes: scheduleTypes.value,
    currentUserId: CURRENT_USER_ID,
  }),
)
</script>

<template>
  <div style="height: 100vh; display: flex; flex-direction: column;">
    <ScheduleCalendar
      :schedules="filteredSchedules"
      :schedule-type-options="scheduleTypeOptions"
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

---

## 다음 단계

| 문서 | 내용 |
| ---- | ---- |
| [통합 가이드](./integration.md) | 소스 복사 이식, 공휴일 프록시 설정 |
| [테마 커스터마이징](./theming.md) | CSS 변수 토큰 전체 목록, 다크 모드 설정 |
| [API 레퍼런스](../dev/architecture.md) | 전체 Props · Emits · 타입 정의 |
| [배포 가이드](../dev/npm-publish-guide.md) | npm 배포 체크리스트 |
