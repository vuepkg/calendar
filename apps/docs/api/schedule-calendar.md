# ScheduleCalendar

메인 캘린더 컴포넌트입니다. Month / Week / Day / List 뷰를 포함합니다.

<!--@include: ./_generated/schedule-calendar-api.md-->

> 이 표는 `ScheduleCalendar.vue`의 타입에서 [`vue-component-meta`](https://github.com/vuejs/language-tools/tree/master/packages/component-meta)로 자동 생성됩니다(F3-2) — prop/emit/slot을 추가·변경했는데 이 표가 갱신되지 않는 문서 drift를 CI가 차단합니다. 직접 수정하지 말고 `pnpm --filter @vuepkg/calendar run docs:api`로 재생성하세요.

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
