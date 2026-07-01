# 테마 커스터마이징

`@vuepkg/calendar`는 런타임 JS 없이 CSS 변수만으로 완전한 테마 커스터마이징을 지원합니다.

## 브랜드 컬러 변경

CSS 변수를 덮어쓰는 것만으로 전체 테마가 변경됩니다:

```css
/* 예: 초록 계열 브랜드 */
:root {
  --vp-color-primary: #16a34a;
  --vp-color-primary-hover: #15803d;
  --vp-color-primary-subtle: #dcfce7;
}
```

## 다크 모드

`prefers-color-scheme` 미디어 쿼리와 `.vp-dark` 클래스를 모두 지원합니다.

```html
<!-- 다크 모드 강제 적용 -->
<html class="vp-dark">
  ...
</html>
```

```ts
// 토글 구현 예시
const toggleDark = () => document.documentElement.classList.toggle('vp-dark')
```

## 주요 CSS 변수

### 색상 토큰

```css
:root {
  /* Semantic */
  --vp-color-primary: #2563eb;
  --vp-color-primary-hover: #1d4ed8;
  --vp-color-primary-subtle: #dbeafe;
  --vp-color-danger: #dc2626;
  --vp-color-danger-subtle: #fee2e2;

  /* 텍스트 */
  --vp-color-text: #111827;
  --vp-color-text-muted: #6b7280;

  /* 배경 */
  --vp-color-surface: #ffffff;
  --vp-color-surface-raised: #f9fafb;
}
```

### 캘린더 컴포넌트 토큰

```css
:root {
  --vp-calendar-bg: var(--vp-color-surface);
  --vp-calendar-border: var(--vp-color-border);
  --vp-calendar-radius: 12px;
  --vp-calendar-min-height: 500px;

  /* 그리드 */
  --vp-grid-line: #e5e7eb;
  --vp-grid-hour-stripe: #f3f4f6;

  /* 현재 시간 표시기 */
  --vp-current-time-color: #ef4444;

  /* 오늘 날짜 */
  --vp-today-badge-bg: var(--vp-color-primary);
  --vp-today-badge-text: #ffffff;
}
```

## 일정 유형 색상

`scheduleTypeOptions` prop으로 일정 유형별 색상을 정의합니다:

```vue
<script setup lang="ts">
import type { ScheduleTypeOption } from '@vuepkg/calendar'

const scheduleTypeOptions: ScheduleTypeOption[] = [
  {
    type: 'meeting',
    label: '회의',
    color: '#1565c0',           // 텍스트·테두리 색상
    backgroundColor: '#e3f2fd', // 배경 색상
  },
  {
    type: 'task',
    label: '업무',
    color: '#6a1b9a',
    backgroundColor: '#f3e5f5',
  },
]
</script>

<template>
  <ScheduleCalendar
    :schedules="schedules"
    :schedule-type-options="scheduleTypeOptions"
    ...
  />
</template>
```

기본값(`SCHEDULE_TYPE_OPTIONS`)을 extend할 수도 있습니다:

```ts
import { SCHEDULE_TYPE_OPTIONS } from '@vuepkg/calendar'

const scheduleTypeOptions = [
  ...SCHEDULE_TYPE_OPTIONS,
  { type: 'project', label: '프로젝트', color: '#0f766e', backgroundColor: '#ccfbf1' },
]
```
