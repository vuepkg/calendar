# @vuepkg/calendar

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
