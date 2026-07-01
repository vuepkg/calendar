---
layout: home

hero:
  name: "@vuepkg/calendar"
  text: "Vue 3 Modern Calendar Engine"
  tagline: "zero-dependency · controlled/emit-only · CSS-variable 테마 · DnD · 반복 일정"
  actions:
    - theme: brand
      text: 시작하기
      link: /guide/getting-started
    - theme: alt
      text: API 레퍼런스
      link: /api/schedule-calendar
    - theme: alt
      text: GitHub
      link: https://github.com/Seongwon-developer/vue3-calendar

features:
  - icon: 📅
    title: 4가지 뷰
    details: Month / Week / Day / List 뷰를 내장. 탭 전환 또는 v-model:view로 외부 제어.
  - icon: 🎯
    title: Emit-only 아키텍처
    details: 컴포넌트는 상태를 소유하지 않습니다. 모든 인터랙션은 emit으로 부모에게 위임 — 서버 저장·낙관적 업데이트 패턴에 완벽 적합.
  - icon: 🎨
    title: CSS Variable 테마
    details: 런타임 JS 테마 엔진 없이 CSS 변수만으로 완전한 커스터마이징. Dark mode 포함. 번들 비용 0.
  - icon: 🔄
    title: 드래그 앤 드롭
    details: Week/Day 그리드에서 이벤트 이동·리사이즈. hour-snapping + ghost overlay. setPointerCapture 기반 순수 pointer event.
  - icon: 🔁
    title: 반복 일정
    details: daily/weekly/monthly/yearly + interval/count/until/exceptions. useCalendar가 뷰 범위 내에서 자동 펼침.
  - icon: 📦
    title: Zero Dependencies
    details: vue peer 외 런타임 의존성 0. 번들 사이즈 ~15KB (brotli). FullCalendar 대비 1/7 크기.
---

## 라이브 데모

<ClientOnly>
  <CalendarDemo />
</ClientOnly>

## 빠른 시작

```bash
npm install @vuepkg/calendar
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ScheduleCalendar, useScheduleCalendarHost } from '@vuepkg/calendar'
import '@vuepkg/calendar/style.css'
import type { Schedule } from '@vuepkg/calendar'

const schedules = ref<Schedule[]>([])
const { view, date, calendarListeners } = useScheduleCalendarHost({
  onQueryChange(payload) {
    // payload.range로 API 호출 후 schedules 갱신
  },
})
</script>

<template>
  <ScheduleCalendar
    v-model:view="view"
    v-model:date="date"
    :schedules="schedules"
    v-bind="calendarListeners"
  />
</template>
```
