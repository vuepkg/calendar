---
"@vuepkg/calendar": patch
---

**Accessibility & maintenance fixes**

- Month view date cells now use roving `tabindex` (single active cell + arrow-key navigation) instead of every cell being independently tabbable, matching the WCAG APG grid pattern (SRV-P2-09).
- Public holiday fetch failures now show a dismissible alert banner instead of only logging to the console (EXT-01).
- Public holiday API responses are now schema-validated at runtime with a clear error message instead of throwing a raw `TypeError` on malformed data (SRV-P2-10).
- Raised several theme color-contrast tokens (`--vp-tab-text`, `--vp-month-cell-outside-text`, `--vp-color-danger`) and the default `my_schedule`/`company_schedule` chip colors to meet WCAG AA (4.5:1) — verified by an automated `@axe-core/playwright` accessibility scan across all views and the schedule form modal, now part of CI (F3-5).
- Internal refactors with no public API change: extracted `RecurrenceFields.vue` from `ScheduleFormModal.vue` and `TimedGridDayColumn.vue` from `TimedGrid.vue` to keep both under ~350 lines (SRV-P2-08, SRV-P1-05). Raised the bundle size budget to give headroom for upcoming features (SRV-P1-04).
