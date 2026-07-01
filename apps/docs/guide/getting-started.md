# 설치 및 설정

## 요구 사항

- Vue 3.5+
- Node 18+

## 설치

::: code-group

```sh [npm]
npm install @vuepkg/calendar
```

```sh [pnpm]
pnpm add @vuepkg/calendar
```

```sh [yarn]
yarn add @vuepkg/calendar
```

:::

## 기본 세팅

### 1. 스타일 import

전역 스타일을 한 번만 import합니다.

```ts
// main.ts
import '@vuepkg/calendar/style.css'
```

### 2. 컴포넌트 등록 (선택)

전역 등록 없이 SFC 안에서 직접 import해도 됩니다.

```ts
// main.ts (전역 등록이 필요한 경우)
import { createApp } from 'vue'
import { ScheduleCalendar } from '@vuepkg/calendar'

const app = createApp(App)
app.component('ScheduleCalendar', ScheduleCalendar)
```

### 3. 최소 구성

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ScheduleCalendar, useScheduleCalendarHost } from '@vuepkg/calendar'
import type { Schedule } from '@vuepkg/calendar'

const schedules = ref<Schedule[]>([
  {
    id: '1',
    title: '팀 회의',
    type: 'my_schedule',
    participantId: 'user-1',
    participantName: '홍길동',
    start: new Date(2026, 6, 10, 10, 0),
    end: new Date(2026, 6, 10, 11, 0),
  },
])

const { view, date, calendarListeners } = useScheduleCalendarHost({
  onQueryChange(payload) {
    console.log('조회 기간:', payload.range)
    // 여기서 API 호출 후 schedules 업데이트
  },
})
</script>

<template>
  <div style="height: 600px;">
    <ScheduleCalendar
      v-model:view="view"
      v-model:date="date"
      :schedules="schedules"
      v-bind="calendarListeners"
    />
  </div>
</template>
```

::: tip 높이 설정
`ScheduleCalendar`는 부모 컨테이너의 100% 높이를 채웁니다. 부모에 명시적 높이가 없으면 컴포넌트가 보이지 않을 수 있습니다.
:::

## Schedule 타입

```ts
interface Schedule {
  id: string
  title: string
  type: string           // scheduleTypeOptions의 type과 매핑
  participantId: string
  participantName: string
  start: Date
  end: Date
  allDay?: boolean
  remarks?: string
  recurrence?: RecurrenceRule  // 반복 일정
}
```

## useScheduleCalendarHost

`useScheduleCalendarHost`는 emit-only 아키텍처의 핵심 composable입니다. 뷰 상태(view, date 등)를 소비자가 소유하면서 컴포넌트와 연결합니다.

```ts
const {
  view,          // Ref<CalendarView>
  date,          // Ref<Date>
  calendarListeners, // v-bind로 ScheduleCalendar에 spread
} = useScheduleCalendarHost({
  initialView: 'month',
  initialDate: new Date(),
  onQueryChange(payload) { /* API 호출 */ },
  onScheduleClick(payload) { /* 일정 클릭 처리 */ },
  onTimeSlotSelect(payload) { /* 빈 셀 클릭 → 일정 생성 */ },
  onScheduleMove(payload) { /* DnD 이동 → 일정 시간 갱신 */ },
  onScheduleResize(payload) { /* DnD 리사이즈 → 일정 종료 시간 갱신 */ },
})
```

자세한 내용은 [useScheduleCalendarHost API](/api/use-schedule-calendar-host)를 참조하세요.
