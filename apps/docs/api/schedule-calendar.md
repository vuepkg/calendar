# ScheduleCalendar

메인 캘린더 컴포넌트입니다. Month / Week / Day / List 뷰를 포함합니다.

## Props

| prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `schedules` | `Schedule[]` | — | **필수.** 표시할 일정 목록 |
| `holidays` | `Holiday[]` | `[]` | 사내 기념일 (공공 API 결과와 병합) |
| `fetchPublicHolidays` | `boolean` | `false` | 공공데이터포털 공휴일 자동 조회 |
| `publicHolidayServiceKey` | `string` | — | 공공 API 인증키 (BFF 사용 시 생략 권장) |
| `hideToolbar` | `boolean` | `false` | 뷰 전환 툴바 숨김 |
| `scheduleTypeOptions` | `ScheduleTypeOption[]` | 기본 3종 | 일정 유형별 라벨·색상 (`type`/`label`/`color`/`backgroundColor`) |
| `monthWeekCount` | `2 \| 3 \| 6` | `6` | 월간 뷰 표시 주 수 |

## v-model

| v-model | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `v-model:view` | `CalendarView` | `'month'` | 현재 뷰 |
| `v-model:date` | `Date` | 오늘 | 선택 날짜 |
| `v-model:listFilterDate` | `Date \| null` | `null` | List 뷰 필터 날짜 |
| `v-model:viewScope` | `ViewScope` | `'company'` | View Option (My / Company) |
| `v-model:scheduleTypes` | `string[] \| null` | `null` | 일정 유형 필터 (`null`=전체) |

## Emits

| emit | payload | 설명 |
|------|---------|------|
| `navigate` | `CalendarNavigatePayload` | 이전/다음/오늘 버튼 클릭 |
| `view-change` | `CalendarViewChangePayload` | 뷰 탭 전환 |
| `date-select` | `CalendarDateSelectPayload` | 날짜 헤더 클릭 (월→일 뷰 이동 등) |
| `schedule-click` | `CalendarScheduleClickPayload` | 일정 클릭 |
| `overflow-click` | `CalendarOverflowClickPayload` | `+N` 버튼 클릭 |
| `time-slot-select` | `CalendarTimeSlotSelectPayload` | Week/Day 빈 셀 클릭 |
| `schedule-move` | `CalendarScheduleMovePayload` | DnD 이동 완료 |
| `schedule-resize` | `CalendarScheduleResizePayload` | DnD 리사이즈 완료 |
| `query-change` | `ScheduleQueryChangePayload` | 뷰/날짜/필터 변경 → API 재조회 트리거 |
| `list-filter-clear` | — | List 뷰 날짜 필터 초기화 |

## CalendarView 타입

```ts
type CalendarView = 'month' | 'week' | 'day' | 'list'
```

## 사용 예

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ScheduleCalendar, useScheduleCalendarHost } from '@vuepkg/calendar'
import type { Schedule } from '@vuepkg/calendar'

const schedules = ref<Schedule[]>([])
const { view, date, calendarListeners } = useScheduleCalendarHost({
  onQueryChange({ range }) {
    // API 호출: range.start ~ range.end 범위 일정 조회
  },
})
</script>

<template>
  <div style="height: 700px;">
    <ScheduleCalendar
      v-model:view="view"
      v-model:date="date"
      :schedules="schedules"
      v-bind="calendarListeners"
    />
  </div>
</template>
```
