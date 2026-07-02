---
"@vuepkg/calendar": minor
---

Add `@vuepkg/calendar/headless` subpath export — import `useCalendar`, `useTimeSlotSelection`, `useScheduleDrag`, `usePublicHolidays`, `useScheduleCalendarHost`, schedule/recurrence utilities, and all public types without pulling in the `ScheduleCalendar`/`ScheduleFormModal` Vue components or their bundled logic. The main entry re-exports the same names, so existing imports from `@vuepkg/calendar` are unaffected.
