# @vuepkg/calendar

## 0.6.3

### Patch Changes

- 04c6ced: perf(calendar): lazy-load DataTable and fix a size-limit measurement gap

  - `@vuepkg/ui`: `DataTable` is no longer re-exported from the barrel — it now
    has its own build entry and subpath (`@vuepkg/ui/DataTable`), so only
    calendar's lazy-loaded List view pulls it in. Declared `sideEffects` for
    CSS.
  - `@vuepkg/calendar`: `ListView.vue` now imports `DataTable` from the new
    subpath (the shared eager UI chunk drops from ~15.2KB to ~12.7KB, `index.js`
    itself unchanged). Added a `loadingComponent`/`errorComponent` to the async
    List view instead of a blank screen on slow networks or chunk-load
    failures. Corrected the `size-limit` glob, which never counted the
    eagerly-loaded shared UI chunk (every previously reported bundle-size
    figure was undercounting) — the true measured size is 22.38KB/20.39KB
    brotli, and the budget was realigned to 24KB/22KB to match.
  - `@vuepkg/core`: declared `sideEffects: false` (no behavior change).
  - `@vuepkg/theme`, `@vuepkg/docs`: no functional changes — bumped for
    release-pipeline consistency.

## 0.6.2

### Patch Changes

- 42a6763: Fix `npm install @vuepkg/calendar` failing with `EUNSUPPORTEDPROTOCOL` for every external consumer. `@vuepkg/core` and `@vuepkg/ui` were listed in `dependencies` as `workspace:*`, a pnpm-only protocol that got published as-is to the npm registry — and both packages are `private` and were never published themselves, so there was nothing valid to resolve even if the protocol were understood. Both are fully bundled into `dist/index.js`/`dist/headless.js` at build time (only `vue` is external) and were never real runtime dependencies of consumers, so this moves them to `devDependencies`, where pnpm workspace linking still works locally but downstream installs correctly ignore them. Verified by packing the tarball and installing it in a clean, isolated directory.

  This has affected every published version since 0.2.0 (2026-06-28, when the monorepo split was introduced) — it went unnoticed because all local development, testing, and CI ran inside the pnpm workspace, where `workspace:*` always resolves fine.

## 0.6.1

### Patch Changes

- 6cd00a3: chore: verify release pipeline end-to-end (version bump, npm publish, docs redeploy). No functional changes to any package.
- Updated dependencies [6cd00a3]
  - @vuepkg/core@0.1.2
  - @vuepkg/ui@0.2.1

## 0.6.0

### Minor Changes

- 80e9cf5: Generalize the `Schedule` type for non-HR domains (REV-A2): `participantId` and `participantName` are now optional, and a new `meta?: Record<string, unknown>` field lets consumers attach domain data (room bookings, patient info, reservation refs, ...) without a participant. `filterSchedulesByScope('my', ...)` excludes participant-less schedules instead of throwing; chip/bar tooltips and the List view's Participant column gracefully omit participant text when absent instead of rendering the literal string `"undefined"`. `ScheduleDraft`/`ScheduleFormModal` (the built-in CRUD form) are unchanged and still require selecting a participant — this only widens the `Schedule` display/read model.
- 80e9cf5: Add scoped slot API — `toolbar`, `day-cell`, `event`, `month-overflow-item` (REV-A1). All four slots are non-breaking: when unused, `ScheduleCalendar` renders exactly the same markup as before. `event` covers month chips, month/week/day all-day bars, and week/day timed blocks (source values reuse the existing `ScheduleClickSource` union). Click/DnD/keyboard interaction wrappers always stay owned by the library — slots only replace the presentational content inside them, so custom `event`/`day-cell` content doesn't affect drag-and-drop or roving-tabindex keyboard navigation. See `docs/dev/rfc/REV-A1-slot-api.md` for the design rationale and `docs/dev/architecture.md#scoped-slots-rev-a1-2026-07-02` for the slot props reference.

## 0.5.0

### Minor Changes

- 7b4493f: Add `@vuepkg/calendar/headless` subpath export — import `useCalendar`, `useTimeSlotSelection`, `useScheduleDrag`, `usePublicHolidays`, `useScheduleCalendarHost`, schedule/recurrence utilities, and all public types without pulling in the `ScheduleCalendar`/`ScheduleFormModal` Vue components or their bundled logic. The main entry re-exports the same names, so existing imports from `@vuepkg/calendar` are unaffected.

### Patch Changes

- 01f7963: Fix broken relative import paths (e.g. `'../../../../core/src'`) that `vite-plugin-dts` left in some internal component `.d.ts` files. The library build now resolves `@vuepkg/core`/`@vuepkg/ui` through their real built packages instead of aliasing raw source, so generated types use clean package imports (e.g. `import { RectBounds } from '@vuepkg/core'`). No change to the public API or bundled CSS.

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
