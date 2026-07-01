# @vuepkg/calendar

## 0.4.0

### Minor Changes

- e0d88f9: **F3-3** `locale?: string` prop — auto-localize Month view weekday headers and Week/Day day labels via `Intl.DateTimeFormat` (zero-dep, browser API based). Explicit `weekdayLabels` still takes precedence when provided. Defaults to the previous English behavior when `locale` is omitted (backward compatible).

### Patch Changes

- 7d7fa21: **Accessibility & maintenance fixes**

  - Month view date cells now use roving `tabindex` (single active cell + arrow-key navigation) instead of every cell being independently tabbable, matching the WCAG APG grid pattern (SRV-P2-09).
  - Public holiday fetch failures now show a dismissible alert banner instead of only logging to the console (EXT-01).
  - Public holiday API responses are now schema-validated at runtime with a clear error message instead of throwing a raw `TypeError` on malformed data (SRV-P2-10).
  - Raised several theme color-contrast tokens (`--vp-tab-text`, `--vp-month-cell-outside-text`, `--vp-color-danger`) and the default `my_schedule`/`company_schedule` chip colors to meet WCAG AA (4.5:1) — verified by an automated `@axe-core/playwright` accessibility scan across all views and the schedule form modal, now part of CI (F3-5).
  - Internal refactors with no public API change: extracted `RecurrenceFields.vue` from `ScheduleFormModal.vue` and `TimedGridDayColumn.vue` from `TimedGrid.vue` to keep both under ~350 lines (SRV-P2-08, SRV-P1-05). Raised the bundle size budget to give headroom for upcoming features (SRV-P1-04).

## 0.3.0

### Minor Changes

- a73729c: **IMP-02** `weekdayLabels?: string[]` prop — customize Month view weekday header labels (defaults to `['SUN', 'MON', ..., 'SAT']`, backward compatible)

  **IMP-03** `startHour?: number` / `endHour?: number` props — customize the Week/Day timed grid's visible hour range (defaults to `0`~`23`)

## 0.2.0

### Minor Changes

- fd3abd0: **F4-1** Drag time-slot selection in Week/Day timed grid (pointer event based, setPointerCapture)

  **F4-2** `monthWeekCount?: 2 | 3 | 6` prop — compact 2/3-week month view

  **F4-3** `ScheduleFormModal` — controlled create/edit/delete dialog component
  - `buildScheduleFromDraft`, `upsertSchedule`, `removeSchedule` helper exports

  **F4-4** Drag-and-drop event move and resize in Week/Day timed grid
  - `schedule-move` / `schedule-resize` emits with hour-snapping and ghost overlay
  - `onScheduleMove` / `onScheduleResize` options added to `useScheduleCalendarHost`

  **F4-5** Recurring events — daily/weekly/monthly/yearly with interval/count/until/exceptions
  - `RecurrenceRule` type, `expandRecurringSchedules()` utility
  - `ScheduleFormModal` recurrence section UI

  **Breaking**: `Schedule.type` widened from `ScheduleType` union to `string` (backward compatible values still work)

## 0.1.3

### Patch Changes

- Add SegmentedControl and Chip primitives (F2-2, F2-3) to @vuepkg/ui. SegmentedControl includes roving-tabindex arrow key navigation. CalendarToolbar, HolidayChip, and ScheduleEventChip now consume these primitives instead of duplicating markup/CSS.
- Updated dependencies
  - @vuepkg/ui@0.2.0

## 0.1.2

### Patch Changes

- Extract Button/IconButton navigation controls into a new @vuepkg/ui package (F2-1). CalendarPeriodNav and CalendarMonthNav now consume @vuepkg/ui instead of duplicating button CSS. Adds --vp-button-* component tokens to @vuepkg/theme.

## 0.1.1

### Patch Changes

- Updated dependencies
  - @vuepkg/core@0.1.1

## 0.1.0

### Minor Changes

- Phase 1: CSS variable theme system and dark mode support

### Patch Changes

- Updated dependencies
  - @vuepkg/core@0.1.0
