# useScheduleCalendarHost

`ScheduleCalendar`의 emit-only 아키텍처를 위한 핵심 composable입니다. 뷰 상태를 소비자가 소유하고 컴포넌트와 연결합니다.

## 시그니처

```ts
function useScheduleCalendarHost(
  options?: UseScheduleCalendarHostOptions
): ScheduleCalendarHostContext
```

## 옵션 (UseScheduleCalendarHostOptions)

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `initialView` | `CalendarView` | `'month'` | 초기 뷰 |
| `initialDate` | `Date` | 오늘 | 초기 날짜 |
| `initialListFilterDate` | `Date \| null` | `null` | List 뷰 필터 초기값 |
| `initialViewScope` | `ViewScope` | `'company'` | View Option 초기값 |
| `initialScheduleTypes` | `string[] \| null` | `null` | 일정 유형 필터 초기값 |
| `onQueryChange` | `(payload) => void` | — | API 조회 트리거 |
| `onScheduleClick` | `(payload) => void` | — | 일정 클릭 — 미지정 시 `payload.date`로 날짜 이동 |
| `onOverflowClick` | `(payload) => void` | — | `+N` 클릭 — 미지정 시 팝오버만 표시 |
| `onTimeSlotSelect` | `(payload) => void` | — | 빈 셀 클릭 (일정 생성 UX) |
| `onScheduleMove` | `(payload) => void` | — | DnD 이동 완료 |
| `onScheduleResize` | `(payload) => void` | — | DnD 리사이즈 완료 |

## 반환값 (ScheduleCalendarHostContext)

| 키 | 타입 | 설명 |
|----|------|------|
| `view` | `Ref<CalendarView>` | 현재 뷰 (`v-model:view`와 바인딩) |
| `date` | `Ref<Date>` | 선택 날짜 (`v-model:date`와 바인딩) |
| `listFilterDate` | `Ref<Date \| null>` | List 뷰 필터 날짜 |
| `viewScope` | `Ref<ViewScope>` | View Option |
| `scheduleTypes` | `Ref<string[] \| null>` | 일정 유형 필터 |
| `calendarListeners` | `ScheduleCalendarHostListeners` | `v-bind`로 spread할 이벤트 핸들러 묶음 |
| `handlers` | `ScheduleCalendarHostHandlers` | 개별 핸들러 (필요시 직접 연결) |

## 사용 예

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useScheduleCalendarHost } from '@vuepkg/calendar'
import type { Schedule } from '@vuepkg/calendar'

const schedules = ref<Schedule[]>([])

const { view, date, viewScope, calendarListeners } = useScheduleCalendarHost({
  initialView: 'week',

  onQueryChange({ view, range, viewScope, scheduleTypes }) {
    // range.start ~ range.end 기간으로 API 호출
    fetchSchedules({ start: range.start, end: range.end, viewScope, scheduleTypes })
      .then((data) => { schedules.value = data })
  },

  onScheduleMove({ schedule, newStart, newEnd }) {
    schedules.value = schedules.value.map((s) =>
      s.id === schedule.id ? { ...s, start: newStart, end: newEnd } : s,
    )
  },

  onScheduleResize({ schedule, newEnd }) {
    schedules.value = schedules.value.map((s) =>
      s.id === schedule.id ? { ...s, end: newEnd } : s,
    )
  },
})
</script>

<template>
  <ScheduleCalendar
    v-model:view="view"
    v-model:date="date"
    v-model:view-scope="viewScope"
    :schedules="schedules"
    v-bind="calendarListeners"
  />
</template>
```

## 내장 동작

`useScheduleCalendarHost`는 다음 동작을 자동으로 처리합니다:

| 이벤트 | 기본 동작 |
|--------|-----------|
| `navigate` | `date.value` 갱신 |
| `view-change` | `view.value` 갱신; List→비List 전환 시 `listFilterDate` 초기화 |
| `date-select` | `date.value` 갱신; week-day-header 클릭 시 `view.value = 'day'` |
| `list-filter-clear` | `listFilterDate.value = null` |
| `schedule-click` | `onScheduleClick` 미지정 시 `payload.date`로 날짜 이동 |
