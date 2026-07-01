---
"@vuepkg/calendar": minor
---

**F4-1** Drag time-slot selection in Week/Day timed grid (pointer event based, setPointerCapture)

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
