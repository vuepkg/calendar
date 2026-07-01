---
"@vuepkg/calendar": minor
---

**F3-3** `locale?: string` prop — auto-localize Month view weekday headers and Week/Day day labels via `Intl.DateTimeFormat` (zero-dep, browser API based). Explicit `weekdayLabels` still takes precedence when provided. Defaults to the previous English behavior when `locale` is omitted (backward compatible).
