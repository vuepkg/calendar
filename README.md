# @vuepkg/calendar

[![npm](https://img.shields.io/npm/v/@vuepkg/calendar)](https://www.npmjs.com/package/@vuepkg/calendar)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@vuepkg/calendar)](https://bundlephobia.com/package/@vuepkg/calendar)

Vue 3 schedule calendar — Month / Week / Day / List views, **zero extra dependencies** (`vue` peer only).

Tailwind/shadcn friendly — customize part of the UI with scoped slots, or skip styled components entirely and use logic-only [`@vuepkg/calendar/headless`](#headless-subpath) to render everything yourself.

**[⚡️ Try it on StackBlitz Playground](https://stackblitz.com/github/vuepkg/calendar/tree/main/examples/stackblitz-demo)**

**Supported browsers**: latest Chrome / Firefox / Safari / Edge (evergreen browsers) — IE is not supported

## Features

- **4 views** — Month / Week / Day / List
- **Dynamic month layout** — 6 week rows split evenly to fill the parent's height
- **Month `+N` popover** — list of overflowing schedules
- **Multi-day spanning bars** — all-day bars for events spanning 2+ days
- **Week/Day time slot selection** — click an empty cell to get a 1-hour `start`/`end`
- **Recurring events** — daily/weekly (by weekday)/monthly/yearly, with count/until conditions. Built into `ScheduleFormModal`
- **Holidays & anniversaries** — company-anniversary prop + opt-in Korean public holiday API
- **Custom schedule types** — register domain types/colors via `scheduleTypeOptions`
- **TypeScript** — full type declarations included

---

## Suitable for

- **Admin Dashboard** — schedule management panel for internal tools
- **Booking / Reservation** — time-slot assignment UI for booking systems
- **Company Groupware** — team schedule sharing calendar
- **Task Management** — deadline-driven task tracking

---

## Comparison with other libraries

| Feature | `@vuepkg/calendar` | FullCalendar | vue-cal |
| ---- | :---: | :---: | :---: |
| Vue 3 Composition API native | ✅ | ⚠️ framework adapter (`@fullcalendar/vue3`) | ⚠️ props/emit-centric |
| TypeScript | ✅ | ✅ | ✅ |
| Zero dependency | ✅ (`vue` peer only) | ⚠️ core + multiple plugins | ✅ |
| Headless (logic without components) | ✅ [`/headless`](#headless-subpath) | ⚠️ | ❌ |
| Slot customization | ✅ `toolbar`/`day-cell`/`event`/`month-overflow-item` | ⚠️ | ✅ |
| Drag & drop move/resize | ✅ | ✅ | ✅ |
| Recurring events | ✅ free | ✅ RRule plugin, free | ❌ |
| Timeline / Resource view | 🚧 planned ([F4-6](./docs/dev/roadmap.md)) | ✅ **paid Premium** | ❌ |
| Bundle size | 22.38KB (brotli, [size-limit](https://bundlephobia.com/package/@vuepkg/calendar) CI gate) | core + plugin combo — compare directly on [bundlephobia](https://bundlephobia.com/package/@fullcalendar/core) | compare directly on [bundlephobia](https://bundlephobia.com/package/vue-cal) |

> FullCalendar Premium boundaries verified against the official [pricing](https://fullcalendar.io/pricing) and [premium docs](https://fullcalendar.io/docs/premium) as of 2026-07-02. Check each library's official docs for the latest terms. Our own bundle size is measured including the eagerly-loaded shared UI chunk (previously undercounted — see [roadmap.md](./docs/dev/roadmap.md)).

---

## Installation

```bash
npm install @vuepkg/calendar
```

```ts
// main.ts — global CSS import (required)
import '@vuepkg/calendar/style.css'
```

---

## Quick start

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
    title: 'Team Meeting',
    type: 'team_schedule',
    participantId: 'user-1',
    participantName: 'Jane Doe',
    start: new Date(2026, 5, 15, 10, 0),
    end:   new Date(2026, 5, 15, 11, 0),
  },
])

const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost()
</script>

<template>
  <!-- Parent must have a height — the calendar fills 100% -->
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

> **New here?** If `useScheduleCalendarHost` and `v-on="calendarListeners"` look unfamiliar, walk through the [Getting Started guide](https://vuepkg.github.io/calendar/guide/getting-started.html) for a step-by-step explanation.

---

## Fetching schedules from an API

`query-change` fires whenever the view or date changes. Wire it up to your API call with `onQueryChange`:

```ts
const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost({
    onQueryChange: async (payload) => {
      schedules.value = await fetchSchedules(payload.range.start, payload.range.end)
    },
  })
```

---

## Wiring up create/edit

`ScheduleFormModal` is an optional component that provides a create/edit/delete form for schedules. Like `ScheduleCalendar`, it's controlled — the parent always owns the modal's open state and the `schedules` update.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ScheduleCalendar,
  ScheduleFormModal,
  useScheduleCalendarHost,
  upsertSchedule,
  removeSchedule,
  type Schedule,
  type Participant,
} from '@vuepkg/calendar'

const schedules = ref<Schedule[]>([/* ... */])
const participants: Participant[] = [{ id: 'user-1', name: 'Jane Doe' }]

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const activeSchedule = ref<Schedule | null>(null)
const initialStart = ref<Date>()
const initialEnd = ref<Date>()

const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost({
    onTimeSlotSelect(payload) {
      // Click on an empty Week/Day cell — open in create mode
      modalMode.value = 'create'
      activeSchedule.value = null
      initialStart.value = payload.start
      initialEnd.value = payload.end
      modalOpen.value = true
    },
    onScheduleClick(payload) {
      // Click a schedule chip — open in edit mode.
      // If a recurring instance was clicked, look up the master by recurrenceId
      // to open the whole series.
      const masterId = payload.schedule.recurrenceId ?? payload.schedule.id
      modalMode.value = 'edit'
      activeSchedule.value = schedules.value.find((s) => s.id === masterId) ?? payload.schedule
      modalOpen.value = true
    },
  })

function handleSubmit(schedule: Schedule) {
  schedules.value = upsertSchedule(schedules.value, schedule)
  modalOpen.value = false
}

function handleDelete(scheduleId: string) {
  schedules.value = removeSchedule(schedules.value, scheduleId)
  modalOpen.value = false
}
</script>

<template>
  <ScheduleCalendar
    :schedules="schedules"
    v-model:view="view"
    v-model:date="date"
    v-model:list-filter-date="listFilterDate"
    v-model:view-scope="viewScope"
    v-model:schedule-types="scheduleTypes"
    v-on="calendarListeners"
  />

  <ScheduleFormModal
    :open="modalOpen"
    :mode="modalMode"
    :schedule="activeSchedule"
    :initial-start="initialStart"
    :initial-end="initialEnd"
    :participants="participants"
    :existing-schedules="schedules"
    @close="modalOpen = false"
    @submit="handleSubmit"
    @delete="handleDelete"
  />
</template>
```

If `ScheduleFormModal`'s form UI doesn't fit your needs, you can use the data helpers directly and build your own dialog:

```ts
import { upsertSchedule, removeSchedule, buildScheduleFromDraft } from '@vuepkg/calendar'

schedules.value = upsertSchedule(
  schedules.value,
  buildScheduleFromDraft(draft, participants, schedules.value),
)
schedules.value = removeSchedule(schedules.value, targetId)
```

### `ScheduleFormModal` Props / Emits

| Prop | Type | Description |
| ---- | ---- | ---- |
| `open` | `boolean` | Whether the modal is visible |
| `mode` | `'create' \| 'edit'` | Create/edit mode |
| `schedule` | `Schedule \| null` | Target being edited in edit mode |
| `initialStart` / `initialEnd` | `Date` | Initial time for create mode — pass the `time-slot-select` payload |
| `participants` | `Participant[]` | Participant options + name lookup |
| `existingSchedules` | `Schedule[]` | Used to avoid ID collisions in create mode (default `[]`) |
| `scheduleTypeOptions` | `ScheduleTypeOption[]` | Type options (defaults to `SCHEDULE_TYPE_OPTIONS`) |

| Event | Payload | Description |
| ------ | -------- | ---- |
| `close` | — | Cancel, Esc, or backdrop click |
| `submit` | `Schedule` | Completed schedule from `buildScheduleFromDraft` — pass straight to `upsertSchedule` |
| `delete` | `string` (scheduleId) | Delete button in edit mode — pass straight to `removeSchedule` |

---

## Recurring events

Setting a `RecurrenceRule` on `Schedule.recurrence` makes the calendar automatically generate individual occurrences within the currently displayed period. The parent only needs to manage a single master schedule — expansion is handled internally by `ScheduleCalendar`.

```ts
import type { Schedule } from '@vuepkg/calendar'

const schedule: Schedule = {
  id: 's-standup',
  title: 'Weekly Standup',
  type: 'team_schedule',
  participantId: 'user-1',
  participantName: 'Jane Doe',
  start: new Date(2026, 3, 6, 9, 0),
  end: new Date(2026, 3, 6, 9, 30),
  recurrence: {
    freq: 'weekly', // 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: 1, // default 1. weekly + interval 2 → every other week
    byWeekday: [1, 3, 5], // weekly only, 0=Sun ~ 6=Sat
    count: 20, // count or until, not both — omit both for an open-ended series
  },
}
```

- Each occurrence rendered on screen is a derived `Schedule` object with `id: "${masterId}::YYYY-MM-DD"`, `recurrenceId: masterId`, and `isRecurrenceInstance: true`. It is not added to the original array.
- If the `schedule` in an event payload (`schedule-click`/`schedule-move`/`schedule-resize`, etc.) is an occurrence, look up the master via `recurrenceId` to apply changes to the whole series (editing/deleting a single occurrence is not yet supported — out of scope for v1).
- `ScheduleFormModal` provides a form for no-repeat/daily/weekly/monthly/yearly selection, weekday (weekly), and no-end/count/until conditions.
- Recurring schedule chips show a ⟳ icon at the start.

> **Known limitations**: this is a self-implemented RRULE subset and is not compatible with the full iCal spec (no BYSETPOS support, month-end anchor rollover, etc.) — details: [Recurring Events guide § Known Limitations](https://vuepkg.github.io/calendar/guide/recurring-events.html#known-limitations)

---

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------ | ---- |
| `schedules` | `Schedule[]` | `[]` | Schedules to display |
| `holidays` | `Holiday[]` | `[]` | Anniversaries/holidays list |
| `view` | `CalendarView` | `'month'` | Current view (`'month'｜'week'｜'day'｜'list'`) |
| `date` | `Date` | today | Current reference date |
| `viewScope` | `ViewScope` | `'company'` | Schedule scope filter (`'my'｜'company'`) |
| `scheduleTypes` | `string[] \| null` | `null` | Active schedule type filter (`null` = all) |
| `listFilterDate` | `Date \| null` | `null` | Date filter for the List view |
| `scheduleTypeOptions` | `ScheduleTypeOption[]` | 3 defaults | Custom schedule type definitions |
| `fetchPublicHolidays` | `boolean` | `false` | Opt-in to the Korean public holiday API |
| `publicHolidayServiceKey` | `string` | — | Korean open-data portal auth key (omit when using a proxy/BFF) |
| `hideToolbar` | `boolean` | `false` | Hide the toolbar (for fixed-view embedding) |
| `monthWeekCount` | `2 \| 3 \| 6` | `6` | Number of weeks shown in the month view — `2`/`3` gives a compact view anchored to the selected date |
| `weekdayLabels` | `string[]` | `['SUN', ..., 'SAT']` | Weekday header labels for the month view (7 items, Sun–Sat) |
| `startHour` | `number` | `0` | Week/Day time grid start hour (0–23) |
| `endHour` | `number` | `23` | Week/Day time grid end hour (0–23) |
| `locale` | `string` | — | `Intl.DateTimeFormat` locale (e.g. `'ko-KR'`). Auto-localizes the month weekday header and Week/Day weekday labels. `weekdayLabels` takes precedence |

> Full Props/v-model/Emits/Slots table (auto-generated, F3-2): [docs site API reference](https://vuepkg.github.io/calendar/api/schedule-calendar.html)

## Emits

| Event | Payload | Description |
| ------ | -------- | ---- |
| `view-change` | `CalendarViewChangePayload` | View tab switch |
| `date-select` | `CalendarDateSelectPayload` | Date click |
| `navigate` | `CalendarNavigatePayload` | ‹ › · Today navigation |
| `schedule-click` | `CalendarScheduleClickPayload` | Schedule click |
| `time-slot-select` | `CalendarTimeSlotSelectPayload` | Empty Week/Day cell click (1-hour granularity) |
| `schedule-move` | `CalendarScheduleMovePayload` | Week/Day drag-move confirmed |
| `schedule-resize` | `CalendarScheduleResizePayload` | Week/Day drag-resize confirmed |
| `overflow-click` | `CalendarOverflowClickPayload` | Month `+N` click |
| `list-filter-clear` | — | List date filter cleared |
| `query-change` | `ScheduleQueryChangePayload` | Range/filter change (for API queries) |

> `useScheduleCalendarHost` wires up all of the events above automatically. Just add `v-on="calendarListeners"`.

## Slots

`ScheduleCalendar` provides 4 scoped slots — a non-breaking addition, since the default markup renders as-is when unused.

| Slot | Props | Description |
| ---- | ----- | ---- |
| `toolbar` | `{ currentView, views, onSelect }` | Replace the entire view-switching UI |
| `day-cell` | `{ cell, getTypeStyle, onScheduleClick, onOpenOverflow }` | Replace month cell content (the `role="gridcell"` shell is kept) |
| `event` | `{ schedule, source, typeStyle, compact?, showParticipant?, onSelect? }` | Replace chip / all-day bar / time grid block content |
| `month-overflow-item` | `{ schedule, isHighlighted, onSelect }` | Replace month `+N` popover item content |

```vue
<ScheduleCalendar v-model:view="view" v-model:date="date" :schedules="schedules">
  <template #event="{ schedule, typeStyle, onSelect }">
    <button class="my-chip" :style="typeStyle" @click="onSelect?.()">{{ schedule.title }}</button>
  </template>
</ScheduleCalendar>
```

Details: [architecture.md § Scoped Slots](./docs/dev/architecture.md#scoped-slots-rev-a1-2026-07-02)

---

## Theming · Tailwind

- **Default:** import `@vuepkg/calendar/style.css`, then theme via CSS variables (`--vp-*`) — [docs site theming guide](https://vuepkg.github.io/calendar/guide/theming.html)
- **Tailwind:** use the [`#event`/`#day-cell`/`#toolbar`/`#month-overflow-item` scoped slots](#slots) to directly replace that area's markup with Tailwind content (List rows not yet supported). To render the entire markup yourself, use [`@vuepkg/calendar/headless`](#headless-subpath) — [Tailwind section](https://vuepkg.github.io/calendar/guide/theming.html#tailwind-css-프로젝트에서-사용하기)
- **Roadmap & progress:** [docs/dev/roadmap.md](./docs/dev/roadmap.md)

---

## Headless subpath

If you need composables/types/schedule CRUD utilities without the `ScheduleCalendar`/`ScheduleFormModal` Vue components, use `@vuepkg/calendar/headless`. Useful when you want to reuse only the calendar logic on top of your own custom UI, without importing any styled components.

```ts
import {
  useCalendar,
  useTimeSlotSelection,
  useScheduleDrag,
  usePublicHolidays,
  expandRecurringSchedules,
  buildScheduleFromDraft,
} from '@vuepkg/calendar/headless'
```

---

## Custom schedule types

```ts
import { SCHEDULE_TYPE_OPTIONS, type ScheduleTypeOption } from '@vuepkg/calendar'

const typeOptions: ScheduleTypeOption[] = [
  ...SCHEDULE_TYPE_OPTIONS,
  { type: 'project', label: 'Project', color: '#fff', backgroundColor: '#6366f1' },
  { type: 'leave',   label: 'Leave',   color: '#fff', backgroundColor: '#f59e0b' },
]
```

```vue
<ScheduleCalendar :schedule-type-options="typeOptions" ... />
```

---

## Accessibility (a11y)

- **View tabs** — `role="group"` + `aria-pressed` expose the current view state, arrow-key navigation (roving tabindex)
- **Month cells** — `role="grid"`/`row`/`gridcell`, only one active cell has `tabindex="0"` (roving tabindex) + arrow-key movement, `Enter`/`Space` activation
- **Popover** — focus trap, `Esc` to close, click-outside to close, restores focus to the trigger on close
- **Data table (List view)** — row `Enter`/`Space` activation, `aria-label`
- **Keyboard focus** — `:focus-visible` outline on every interactive element
- **Automated verification** — `@axe-core/playwright` scans the Month/Week/Day/List views and the schedule form modal on every push in CI (`e2e/accessibility.spec.ts`)

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

## Tech stack

- Vue 3 + TypeScript
- Custom HTML/CSS
- Vitest · Playwright E2E

---

## Contributing

[github.com/vuepkg/calendar](https://github.com/vuepkg/calendar) · see [CONTRIBUTING.md](./CONTRIBUTING.md) for the detailed process and RFC workflow

**Requirements**: Node 24+ (matches GitHub Actions CI), pnpm 9+

```bash
pnpm install                          # install deps + register the Husky pre-push hook
pnpm --filter @vuepkg/calendar dev    # dev server
pnpm verify:push                      # pre-push checks (lint + typecheck + vitest)
pnpm turbo run build:lib              # full build
pnpm test:e2e:ci                      # functional E2E (same as CI, 142 tests)
pnpm test:e2e:visual                  # visual regression (when UI/CSS changes, 8 tests)
```

See [docs/dev/architecture.md](docs/dev/architecture.md) §10 for the full test-layer and CI policy.

---

## License

MIT © [vuepkg](https://github.com/vuepkg)
