# @vuepkg/docs

## 0.0.8

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

- Updated dependencies [04c6ced]
  - @vuepkg/calendar@0.6.3

## 0.0.7

### Patch Changes

- Updated dependencies [42a6763]
  - @vuepkg/calendar@0.6.2

## 0.0.6

### Patch Changes

- 6cd00a3: chore: verify release pipeline end-to-end (version bump, npm publish, docs redeploy). No functional changes to any package.
- Updated dependencies [6cd00a3]
  - @vuepkg/calendar@0.6.1

## 0.0.5

### Patch Changes

- Updated dependencies [80e9cf5]
- Updated dependencies [80e9cf5]
  - @vuepkg/calendar@0.6.0

## 0.0.4

### Patch Changes

- Updated dependencies [01f7963]
- Updated dependencies [7b4493f]
  - @vuepkg/calendar@0.5.0

## 0.0.3

### Patch Changes

- Updated dependencies [7d7fa21]
- Updated dependencies [e0d88f9]
  - @vuepkg/calendar@0.4.0

## 0.0.2

### Patch Changes

- Updated dependencies [a73729c]
  - @vuepkg/calendar@0.3.0

## 0.0.1

### Patch Changes

- Updated dependencies [fd3abd0]
  - @vuepkg/calendar@0.2.0
