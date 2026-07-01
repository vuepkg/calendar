# Changelog

## [Unreleased]

### Added
- **F4-5** Recurring events — daily/weekly/monthly/yearly repetition
  - `Schedule.recurrence: RecurrenceRule` — `freq`/`interval`/`byWeekday`(weekly)/`count`/`until`/`exceptions`
  - `expandRecurringSchedules()` — pure function generating in-range occurrences; wired into `useCalendar`'s
    `schedules` computed via a view-derived visible range (month grid / week / day / list). Non-recurring
    schedules pass through unchanged
  - Generated occurrences are derived `Schedule` objects (`id: "${masterId}::YYYY-MM-DD"`, `recurrenceId`,
    `isRecurrenceInstance: true`) — never written back into the parent's array
  - `ScheduleFormModal` recurrence section — frequency, interval, weekly weekday picker, end condition
    (never / after N occurrences / until date)
  - `ScheduleEventChip` shows a ⟳ icon for recurring instances
  - **Scope**: v1 supports series-level edit/delete only (editing an occurrence edits the whole series).
    Per-occurrence exceptions exist in the data model (`recurrence.exceptions`) but aren't exposed in the UI yet
- **F4-3** `ScheduleFormModal` — optional schedule create/edit/delete form component
  - Controlled component: parent owns `open` state and applies `submit`/`delete` to its own `schedules`
  - `submit` emits a fully-built `Schedule` via `buildScheduleFromDraft` — pass straight to `upsertSchedule`
  - `delete` emits the target `scheduleId` — pass straight to `removeSchedule`
  - `Dialog` primitive added to `@vuepkg/ui` (F2-7) — Teleport, focus trap, Esc/backdrop close, focus restore
  - `--vp-dialog-*` component tokens added to `@vuepkg/theme`
- **F4-2** `monthWeekCount?: 2 | 3 | 6` prop on `ScheduleCalendar` — shows a reduced 2/3-week window
  (anchored to the `date` v-model's week, clamped to the grid) instead of the full 6-week month
  - `MonthWeekCount` type exported from `@vuepkg/calendar`
  - `sliceMonthCellsForWeekCount` internal util in `utils/month.ts`
  - Default `6` preserves existing full-month behavior — non-breaking
- **F4-4** Drag-and-drop event move and resize in Week/Day timed grid
  - `useScheduleDrag` composable — pointer-event based move/resize with hour-snapping and ghost overlay
  - `schedule-move` emit — `{ schedule, date, newStart, newEnd }` on confirmed drag move
  - `schedule-resize` emit — `{ schedule, date, newEnd }` on confirmed drag resize
  - `CalendarScheduleMovePayload` / `CalendarScheduleResizePayload` exported from `@vuepkg/calendar`
  - `onScheduleMove` / `onScheduleResize` options added to `useScheduleCalendarHost`
  - Resize handle (8px hit area) at bottom of each timed event
  - Ghost overlay shows new position during drag; origin event dims to 40% opacity
- `scheduleTypeOptions` prop on `ScheduleCalendar` — register custom schedule type colors/labels
- `build:lib` script — ES + CJS + TypeScript declaration file output (`vite.lib.config.ts`)
- Library packaging: `main`, `module`, `types`, `exports`, `files` fields in `package.json`

### Fixed
- **Timed event click silently broken in real browsers** — `.timed-event`'s `@pointerdown` calls
  `setPointerCapture` on `.day-column` for drag detection (F4-4). Once captured, the browser retargets
  the synthesized `click` event to `.day-column` itself, so the `@click` listener bound on `.timed-event`
  never received it — clicking an existing Week/Day event silently did nothing outside of unit tests
  (`@vue/test-utils`'s `.trigger('click')` dispatches directly at the element and never exercises real
  pointer-capture retargeting, so this was invisible to the existing suite). `schedule-click` is now
  emitted directly from the `pointerup` handler when no real move/resize occurred, instead of relying on
  a native `click` listener.

### Changed
- `Schedule.type` widened from `ScheduleType` union to `string` — consumers can use any type string
- `v-model:schedule-types` changed from `ScheduleType[] | null` to `string[] | null`
- `ListView.vue` replaced PrimeVue `DataTable` with native `<table>` — no PrimeVue dependency
- `peerDependencies` reduced to `vue` only (PrimeVue removed)
- PrimeVue initialization moved from `ListView` `onMounted` to `main.ts` (demo app only)

### Fixed
- `ScheduleType` remains as a convenience union type alias for backward compatibility

---

## [0.0.1] — 2026-06-16

### Added
- `hide-toolbar` prop on `ScheduleCalendar` — hide view-switch toolbar for embedded use
- `scheduleTypeOptions` prop design (implemented in next release)
- `npm-publish-guide.md` — library distribution checklist

### Changed
- `CalendarToolbar` redesigned to match PrimeVue SelectButton visuals (CSS-only, no PrimeVue dependency)
- `+N` overflow button width changed to `fit-content`

---

## [0.0.0] — 2026-06-10 ~ 11

Initial development milestone. Core calendar implemented and stabilized.

### Added
- `ScheduleCalendar` component with Month / Week / Day / List views
- `useScheduleCalendarHost` composable — v-model refs + recommended emit handlers
- `useCalendar` — derived state (monthCells, weekDays, listRows, getTypeStyle)
- `usePublicHolidays` — Korean public holiday API with per-year cache
- `CalendarMonthNav` component — shared month navigation for Month/List views
- `MonthOverflowPopover` — `+N` overflow popover with bounds-based positioning
- `AllDayBar`, `ScheduleEventChip`, `HolidayChip` — shared UI components
- Multi-day spanning bar layout for all-day events
- `time-slot-select` emit — Week/Day empty cell click → 1-hour `start`/`end`
- `query-change` emit — triggers on init, navigate, view-change, filter-change
- Vitest 205 unit/component tests, Playwright 126 E2E tests

### Fixed
- **DEF-SEC-01** `VITE_DATA_GO_KR_SERVICE_KEY` removed from client bundle; dev/preview proxy injects key server-side only
- **DEF-RT-01** `usePublicHolidays` stale update after unmount — `AbortController` + `onScopeDispose`
- **DEF-RT-02** Failed year retry storm — `failedYears` Set blocks re-fetch
- **P1-A** Hardcoded initial date removed — defaults to `new Date()` (today)
- **P1-B** Vue reactivity hack (`void .length`) replaced with explicit `mergeHolidays` computed dependency
- **P2-A** List view Period column showed `schedule.remarks` — fixed to `formatPeriod(start, end)`
- `useScheduleCalendarHost` default `initialView` unified to `'month'`

### Refactored
- Types centralized in `src/types/` (T-1)
- File count reduced from 41 → 30 source files (F-6 consolidation)
- `utils/navigate.ts` merged into `utils/date.ts`
- `constants/scheduleTypes.ts` merged into `constants/calendarView.ts`
- `utils/timed/currentTime.ts` + `timeSlot.ts` merged into `utils/timed/grid.ts`
