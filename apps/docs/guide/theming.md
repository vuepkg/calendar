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

## Tailwind CSS 프로젝트에서 사용하기

Tailwind를 쓰는 앱과 **함께 사용할 수 있습니다.** shadcn-vue처럼 임의 요소에 `class="bg-blue-500 rounded-lg"`를 붙여 스타일을 바꾸는 방식 대신, `#event`/`#day-cell`/`#toolbar`/`#month-overflow-item` **scoped slot**으로 해당 영역의 마크업 자체를 Tailwind 클래스가 붙은 콘텐츠로 교체할 수 있습니다.

이 라이브러리의 커스터마이징 경로는 **CSS 변수(`--vp-*`)**, **`scheduleTypeOptions`**, 그리고 **scoped slot** 세 가지입니다. CSS 변수는 톤 조정에, slot은 마크업 자체를 Tailwind로 다시 그릴 때 씁니다.

### 무엇이 되고, 무엇이 안 되는가

| 시도 | 결과 |
| ---- | ---- |
| `<ScheduleCalendar class="m-4 shadow-xl" />` | 루트 컨테이너에 class가 합쳐짐. **margin·shadow** 등 라이브러리가 지정하지 않은 속성은 적용됨 |
| `<ScheduleCalendar class="rounded-2xl border-gray-200" />` | 라이브러리 `scoped` CSS가 `border-radius`·`border`를 이미 지정 → **충돌·무시될 수 있음** |
| 일정 칩·월간 셀·툴바에 Tailwind class | `#event`/`#day-cell`/`#toolbar` slot으로 **가능** — 소비자가 직접 Tailwind 마크업을 렌더 (§ [scoped slot](#scoped-slot으로-tailwind-마크업-직접-렌더)) |
| `scheduleTypeOptions`의 `backgroundColor` | **인라인 style**로 적용 → Tailwind `bg-*`보다 우선 |

### 권장: Tailwind 팔레트 → CSS 변수 연결

`@vuepkg/calendar/style.css`는 theme·ui 스타일을 포함합니다. import 순서는 보통 Tailwind → 캘린더 순입니다.

```css
/* app.css — Tailwind v4 예시 */
@import "tailwindcss";
@import "@vuepkg/calendar/style.css";

@theme {
  --color-brand: #16a34a;
  --color-brand-subtle: #dcfce7;
}

:root {
  --vp-color-primary: var(--color-brand);
  --vp-color-primary-subtle: var(--color-brand-subtle);
  --vp-calendar-radius: 0.75rem; /* rounded-xl에 맞춤 */
}
```

Tailwind v3를 쓰는 경우에도 동일한 원칙입니다. `:root`에서 `--vp-*`만 덮어쓰면 캘린더 전체 톤이 맞춰집니다.

### 일정 색상과 Tailwind

`scheduleTypeOptions`는 **hex/rgb 문자열**을 받습니다. Tailwind 색을 쓰려면 팔레트 값을 가져와 넣습니다.

```ts
// Tailwind 기본 blue-100 / blue-800 예시 (임의)
const scheduleTypeOptions = [
  { type: 'meeting', label: '회의', color: '#1e40af', backgroundColor: '#dbeafe' },
]
```

### 루트 wrapper 패턴

캘린더 **바깥** 레이아웃은 Tailwind로 자유롭게 꾸밀 수 있습니다.

```vue
<div class="h-screen p-4 flex flex-col">
  <ScheduleCalendar
    class="flex-1 min-h-0"
    :schedules="schedules"
    ...
  />
</div>
```

`ScheduleCalendar`에 넘긴 `class`는 루트 `.schedule-calendar`에 합쳐지지만, `height: 100%` 등 라이브러리 기본 레이아웃과 겹치는 속성은 주의하세요. **부모 높이 지정**은 여전히 필수입니다.

### scoped slot으로 Tailwind 마크업 직접 렌더

`ScheduleCalendar`는 `toolbar`/`day-cell`/`event`/`month-overflow-item` 4개 scoped slot을 제공합니다. 미사용 시 기존 마크업이 그대로 렌더되는 opt-in 방식이라, 필요한 영역만 Tailwind로 다시 그릴 수 있습니다.

```vue
<ScheduleCalendar v-model:view="view" v-model:date="date" :schedules="schedules">
  <template #event="{ schedule, source, typeStyle, onSelect }">
    <button
      type="button"
      class="w-full truncate rounded-md px-2 py-0.5 text-xs font-semibold text-left"
      :style="{ color: typeStyle.color, backgroundColor: typeStyle.backgroundColor }"
      @click="onSelect?.()"
    >
      {{ schedule.title }}
    </button>
  </template>
</ScheduleCalendar>
```

- `event` slot은 칩/바/시간 그리드 블록 6개 컨텍스트를 공용으로 커버합니다. `source`로 컨텍스트를 구분해 다르게 렌더할 수 있습니다.
- `week-timed`/`day-timed`(주간·일간 시간 그리드) 컨텍스트는 드래그 이동·리사이즈가 슬롯 바깥 wrapper에서 처리되므로 `onSelect`가 전달되지 않습니다 — 슬롯 콘텐츠는 순수 표시 전용입니다.
- `day-cell`은 월간 셀의 **내부 콘텐츠**만 교체합니다. 키보드 이동(roving tabindex)·`role="gridcell"`은 라이브러리가 계속 관리합니다.
- 전체 API·slot props 타입: [architecture.md § Scoped Slots](https://github.com/vuepkg/calendar/blob/main/docs/dev/architecture.md#scoped-slots-rev-a1-2026-07-02).

### 완전한 Tailwind UI가 필요할 때: headless

내부 요소마다 Tailwind 클래스를 쓰고 싶다면 [`@vuepkg/calendar/headless`](/api/use-calendar)로 로직만 가져와 **직접 마크업**을 구성하세요.

```ts
import { useCalendar, useScheduleCalendarHost } from '@vuepkg/calendar/headless'
```

`ScheduleCalendar` 스타일드 컴포넌트는 **빠른 통합**용, headless는 **디자인 시스템 완전 통제**용입니다.

### 로드맵 (문서·기능)

- **현재:** CSS 변수 + `scheduleTypeOptions` + scoped slot(`#toolbar`/`#day-cell`/`#event`/`#month-overflow-item`) + headless
- **예정:** List 행(`list-row`) 커스터마이즈 — `DataTable`의 `cell-*` slot 재노출. 상세는 [리뷰 백로그](https://github.com/vuepkg/calendar/blob/main/docs/vue3-reviewer-backlog.md) 참고.
