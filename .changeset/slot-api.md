---
"@vuepkg/calendar": minor
---

Add scoped slot API — `toolbar`, `day-cell`, `event`, `month-overflow-item` (REV-A1). All four slots are non-breaking: when unused, `ScheduleCalendar` renders exactly the same markup as before. `event` covers month chips, month/week/day all-day bars, and week/day timed blocks (source values reuse the existing `ScheduleClickSource` union). Click/DnD/keyboard interaction wrappers always stay owned by the library — slots only replace the presentational content inside them, so custom `event`/`day-cell` content doesn't affect drag-and-drop or roving-tabindex keyboard navigation. See `docs/dev/rfc/REV-A1-slot-api.md` for the design rationale and `docs/dev/architecture.md#scoped-slots-rev-a1-2026-07-02` for the slot props reference.
