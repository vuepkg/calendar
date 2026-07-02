---
"@vuepkg/calendar": minor
---

Generalize the `Schedule` type for non-HR domains (REV-A2): `participantId` and `participantName` are now optional, and a new `meta?: Record<string, unknown>` field lets consumers attach domain data (room bookings, patient info, reservation refs, ...) without a participant. `filterSchedulesByScope('my', ...)` excludes participant-less schedules instead of throwing; chip/bar tooltips and the List view's Participant column gracefully omit participant text when absent instead of rendering the literal string `"undefined"`. `ScheduleDraft`/`ScheduleFormModal` (the built-in CRUD form) are unchanged and still require selecting a participant — this only widens the `Schedule` display/read model.
