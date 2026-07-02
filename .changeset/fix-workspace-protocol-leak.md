---
"@vuepkg/calendar": patch
---

Fix `npm install @vuepkg/calendar` failing with `EUNSUPPORTEDPROTOCOL` for every external consumer. `@vuepkg/core` and `@vuepkg/ui` were listed in `dependencies` as `workspace:*`, a pnpm-only protocol that got published as-is to the npm registry — and both packages are `private` and were never published themselves, so there was nothing valid to resolve even if the protocol were understood. Both are fully bundled into `dist/index.js`/`dist/headless.js` at build time (only `vue` is external) and were never real runtime dependencies of consumers, so this moves them to `devDependencies`, where pnpm workspace linking still works locally but downstream installs correctly ignore them. Verified by packing the tarball and installing it in a clean, isolated directory.

This has affected every published version since 0.2.0 (2026-06-28, when the monorepo split was introduced) — it went unnoticed because all local development, testing, and CI ran inside the pnpm workspace, where `workspace:*` always resolves fine.
