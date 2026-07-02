---
"@vuepkg/calendar": patch
---

Fix broken relative import paths (e.g. `'../../../../core/src'`) that `vite-plugin-dts` left in some internal component `.d.ts` files. The library build now resolves `@vuepkg/core`/`@vuepkg/ui` through their real built packages instead of aliasing raw source, so generated types use clean package imports (e.g. `import { RectBounds } from '@vuepkg/core'`). No change to the public API or bundled CSS.
