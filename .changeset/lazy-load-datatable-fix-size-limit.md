---
"@vuepkg/calendar": patch
"@vuepkg/core": patch
"@vuepkg/theme": patch
"@vuepkg/ui": patch
"@vuepkg/docs": patch
---

perf(calendar): lazy-load DataTable and fix a size-limit measurement gap

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
