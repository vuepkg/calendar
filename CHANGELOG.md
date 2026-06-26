# Changelog

## [Unreleased]

### Added
- `scheduleTypeOptions` prop on `ScheduleCalendar` — register custom schedule type colors/labels
- `build:lib` script — ES + CJS + TypeScript declaration file output (`vite.lib.config.ts`)
- Library packaging: `main`, `module`, `types`, `exports`, `files` fields in `package.json`

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
