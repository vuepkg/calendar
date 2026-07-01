# 2/3주 월간 뷰

`monthWeekCount` prop으로 월간 뷰에 표시할 주 수를 조정합니다.

## 사용

```vue
<template>
  <!-- 기본: 전체 월 (6주) -->
  <ScheduleCalendar :month-week-count="6" ... />

  <!-- 선택 날짜 기준 2주만 표시 -->
  <ScheduleCalendar :month-week-count="2" ... />

  <!-- 선택 날짜 기준 3주만 표시 -->
  <ScheduleCalendar :month-week-count="3" ... />
</template>
```

## 동작 방식

- **기본 (6)**: 해당 월 전체 주를 표시 (일반 월간 달력)
- **2 / 3**: 현재 선택 날짜(`v-model:date`)가 포함된 주를 시작으로, 지정한 주 수만큼 표시
  - 날짜 이동 시 선택 날짜 기준으로 window가 이동됨
  - 말월 clamp 처리 (주 수가 월 경계를 넘어가면 마지막 가능한 주까지만)

## MonthWeekCount 타입

```ts
type MonthWeekCount = 2 | 3 | 6
```

## 사용 예 — 기간별 대시보드

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { MonthWeekCount } from '@vuepkg/calendar'

const weekCount = ref<MonthWeekCount>(2)
</script>

<template>
  <div>
    <label>기간 선택:</label>
    <select v-model="weekCount">
      <option :value="2">2주</option>
      <option :value="3">3주</option>
      <option :value="6">전체 월</option>
    </select>

    <ScheduleCalendar
      :month-week-count="weekCount"
      ...
    />
  </div>
</template>
```
