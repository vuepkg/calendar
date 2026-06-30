#!/usr/bin/env bash
# CI(ubuntu)와 동일한 chromium-linux 스냅샷을 갱신한다.
# Docker + Playwright 공식 이미지 사용. 호스트 node_modules는 anonymous volume으로 보호.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
IMAGE="mcr.microsoft.com/playwright:v1.61.1-jammy"

docker run --rm \
  -v "${ROOT}:/work" \
  -v cal-nm-root:/work/node_modules \
  -v cal-nm-cal:/work/packages/calendar/node_modules \
  -v cal-nm-core:/work/packages/core/node_modules \
  -v cal-nm-ui:/work/packages/ui/node_modules \
  -v cal-nm-theme:/work/packages/theme/node_modules \
  -w /work/packages/calendar \
  -e CI=true \
  "${IMAGE}" \
  bash -lc "
    corepack enable
    cd /work && pnpm install --frozen-lockfile
    pnpm --filter @vuepkg/calendar run build
    cd /work/packages/calendar
    ./node_modules/.bin/playwright test e2e/visual-regression.spec.ts --update-snapshots
  "

echo "Linux snapshots updated under e2e/visual-regression.spec.ts-snapshots/"
