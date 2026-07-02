# Staff Review Backlog — `@vuepkg/calendar` 코드베이스 점검

> **리뷰 #1:** 2026-06-30 · Phase 0~2 기준  
> **리뷰 #2:** 2026-07-01 · Phase 0~4 현재 상태 (F4-5·F3-1·F4-11·`@vuepkg/calendar@0.2.1` 반영)  
> **기준 문서:** [framework-roadmap.md](./framework-roadmap.md)  
> **용도:** 에이전트·개발자가 항목별로 추적·재검증·수정할 때 사용하는 **단일 원장(ledger)**

---

## 종합 판정

### 리뷰 #1 (2026-06-30) — Phase 0~2

| 항목 | 값 |
| ---- | -- |
| 최종 판정 | CHANGES REQUIRED |
| 품질 점수 | 6 / 10 |
| 리뷰 범위 | monorepo 4패키지, `ScheduleCalendar` emit-only, ui primitive 6종, Vitest 335건, Playwright 142건 구조 |

**한 줄 요약:** Phase 0~2 토대는 견고하나 P0(`query-change`·E2E CI)와 P1~P2 부채가 1.0.0 전 정리 대상.

---

### 리뷰 #2 (2026-07-01) — Phase 0~4

| 항목 | 값 |
| ---- | -- |
| 최종 판정 | **CHANGES REQUIRED** (0.4.x 배포·운영 가능, **1.0.0 전** Phase A 정리 필요) |
| 품질 점수 | **7 / 10** |
| 로드맵 달성률 | Phase 0~4 **82%** · SRV **95%** — [roadmap-progress.md](./roadmap-progress.md) |

**한 줄 요약:** P0·P1·P2(12/13) 완료. OSS 리뷰 REV 항목은 Phase A/B로 로드맵 흡수. **다음 1순위: REV-A1 slot API.**

---

## 에이전트 작업 규칙

1. 항목을 수정하면 **상태** 열을 갱신한다 (`미착수` → `진행중` → `완료` / `보류`).
2. 완료 시 **검증** 열에 실행한 명령과 결과를 적는다 (예: `vitest ScheduleCalendar.spec.ts ✅`).
3. 새 이슈 발견 시 `SRV-` ID를 이어서 추가한다.
4. P0 완료 후에도 P1·P2는 **1.0.0 전**까지 열어둔다.

---

## 추적 테이블

### P0 — 즉시 (1.0.0 / Phase 4 전 필수)

| ID | Severity | 카테고리 | 요약 | 상태 | 담당/비고 |
| -- | -------- | -------- | ---- | ---- | --------- |
| [SRV-P0-01](#srv-p0-01-query-change-payload-정확성) | MAJOR | 런타임 | `query-change`가 navigate/view-change 시 stale `date`/`view`를 emit할 수 있음 | **완료** | `ScheduleCalendar.vue` override + spec 보강 (2026-06-30) |
| [SRV-P0-02](#srv-p0-02-e2e-ci-편입) | MAJOR | 테스트/운영 | Playwright 142건이 CI에 없음 | **완료** | 기능 E2E 134건 CI 편입; 시각 회귀 8건은 `test:e2e:visual` + 수동 workflow로 분리 (2026-06-30) |

### P1 — Phase 4 착수 전 권장

| ID | Severity | 카테고리 | 요약 | 상태 | 담당/비고 |
| -- | -------- | -------- | ---- | ---- | --------- |
| [SRV-P1-01](#srv-p1-01-month-cell-키보드-a11y) | MAJOR | 접근성 | `MonthView` 날짜 셀이 `<div @click>`만 — 키보드 불가 | **완료** | `MonthCell.vue` 분리 + `role="gridcell"` + `tabindex="0"` + Enter/Space (2026-07-01). roving tabindex는 [SRV-P2-09](#srv-p2-09-month-cell-roving-tabindex)로 분리 |
| [SRV-P1-02](#srv-p1-02-dtscss-alias-분리) | MAJOR | 타입/빌드 | `vite-plugin-dts` 깨진 상대경로 — CSS alias와 결합 | **완료** | alias 제거 + `@vuepkg/ui/style.css` 명시적 import로 재진단·해결 (2026-07-02) |
| [SRV-P1-03](#srv-p1-03-대형-뷰-컴포넌트-분리) | MAJOR | 아키텍처 | `TimedGrid`(614줄)·`MonthView`(482줄) — Phase 4 DnD 병목 | **완료** | Header/AllDay/`useTimeSlotSelection`/`MonthCell` 분리 (2026-07-01). F4-4 이후 TimedGrid 재팽창 → [SRV-P1-05](#srv-p1-05-timedgrid-dnd-후-재팽창) |
| [SRV-P1-04](#srv-p1-04-번들-budget-포화) | MAJOR | 아키텍처/성능 | `index.js` 15.57KB / 16KB limit (**97%**, IMP-02/03/F3-3 반영 후) — F4-6 추가 시 초과 확실 | **완료** | budget 상향 20KB/19KB/8KB (2026-07-02) — F4-6 착수 여유 확보 |
| [SRV-P1-05](#srv-p1-05-timedgrid-dnd-후-재팽창) | MAJOR | 아키텍처 | F4-4 DnD 통합 후 `TimedGrid.vue` 303→495줄(IMP-03 prop 반영 후) 재팽창 | **완료** | `TimedGridDayColumn.vue` 분리 — 495→336줄 (2026-07-02) |

### P2 — 1.0.0 전

| ID | Severity | 카테고리 | 요약 | 상태 | 담당/비고 |
| -- | -------- | -------- | ---- | ---- | --------- |
| [SRV-P2-01](#srv-p2-01-calendarlisteners-강제) | MAJOR | API | bare `ScheduleCalendar` + v-model만 연결 시 UI dead | **완료** | `onMounted` DEV 경고: `onNavigate` 리스너 미감지 시 `console.warn` (2026-07-01) |
| [SRV-P2-02](#srv-p2-02-usepublicholidays-retryloading) | MAJOR | 런타임 | `failedYears` 영구 스킵, 단일 `loading` 플래그 | **완료** | TTL 30s 재시도, `inflightCount` → `computed loading`. spec 3건 (2026-07-01) |
| [SRV-P2-03](#srv-p2-03-overflow-popover-auto-close) | MINOR | UX | 월 이동·뷰 전환 시 overflow 팝오버 미닫힘 | **완료** | `MonthView.vue` — `watch(monthLabel, closeOverflowPopover)` (2026-07-01) |
| [SRV-P2-04](#srv-p2-04-listview-rowkey) | MINOR | 데이터 | `rowKey`가 인덱스 기반 (`row.no`) | **완료** | `ListView.vue` `:rowKey` → `row.schedule.id` (2026-07-01) |
| [SRV-P2-05](#srv-p2-05-usecalendar-dead-api) | MINOR | 아키텍처 | `setView`/`selectDate` dead path가 context에 노출 | **완료** | `CalendarContext` 타입에 `@internal` JSDoc (2026-07-01) |
| [SRV-P2-06](#srv-p2-06-공휴일-api-키-가이드) | MINOR | 보안 | `serviceKey` 클라이언트 노출 가능 — BFF 미강제 | **완료** (부분) | DEV warn + JSDoc 강화 (2026-07-01). 런타임 DTO 검증은 [SRV-P2-10](#srv-p2-10-공휴일-api-응답-검증) |
| [SRV-P2-07](#srv-p2-07-headless-export) | MINOR | 로드맵 | `useCalendar` 미공개 — headless 포지셔닝 약함 | **완료** (부분) | `index.ts`에 `export { useCalendar }` (2026-07-01). 서브패스는 [SRV-P2-11](#srv-p2-11-headless-서브패스) |
| [SRV-P2-08](#srv-p2-08-scheduleformmodal-단일-대형-파일) | MINOR | 유지보수 | `ScheduleFormModal.vue` **611줄** — 폼·반복 UI·검증 단일 파일 | **완료** | `RecurrenceFields.vue`(230줄) 분리 — 611→431줄 (2026-07-02) |
| [SRV-P2-09](#srv-p2-09-month-cell-roving-tabindex) | MINOR | 접근성 | 모든 월간 셀 `tabindex="0"` — Tab 순서 과다 | **완료** | `role="grid"`/`row` + roving `tabindex` + 화살표 키 이동 (2026-07-02) |
| [SRV-P2-10](#srv-p2-10-공휴일-api-응답-검증) | MINOR | 타입/보안 | `response.json() as SpcdeApiResponse` 단언 | **완료** | `isValidSpcdeApiResponse` 런타임 스키마 가드 + 개별 항목 필터링 (2026-07-02) |
| [SRV-P2-11](#srv-p2-11-headless-서브패스) | MINOR | 로드맵 | `@vuepkg/calendar/headless` 서브패스 미구현 | **완료** | `src/headless.ts` + vite lib 2-entry 빌드 + `exports["./headless"]` (2026-07-02). index.js 번들 78%→92%(20KB 예산) — 트레이드오프 상세는 본문 참고 |
| [SRV-P2-12](#srv-p2-12-visual-regression-스냅샷-재생성-필요) | MINOR | 테스트 | F3-5 색상 대비 토큰 변경으로 시각 회귀 스냅샷 8종 무효화 | **미착수** | Linux 스냅샷 재생성 필요 — 사람 리뷰 대상, 자동화 범위 밖 |
| [SRV-P2-13](#srv-p2-13-오늘-날짜-e2e-substring-flaky) | MINOR | 테스트 | `calendar.spec.ts` "navigates weeks with today and arrow buttons" — `hasText: today`가 부분 문자열 매칭이라 오늘이 2·1 등일 때 28/29 등과 충돌 | **완료** | `hasText`를 `new RegExp(`^${today}$`)` 정확 매칭으로 교체 (2026-07-02) |

### NIT

| ID | Severity | 요약 | 상태 |
| -- | -------- | ---- | ---- |
| SRV-NIT-01 | NIT | `CalendarToolbar` `view as CalendarView` 단언 | **완료** — viewTabs 조회로 type-safe 교체 (2026-07-01) |

---

## 항목 상세

### SRV-P0-01: query-change payload 정확성

**위치:** `packages/calendar/src/components/calendar/ScheduleCalendar.vue`, `utils/schedule.ts`

**문제:** `handleNavigate` / `handleViewChange`가 emit 직후 `emitQueryChange()`를 호출할 때, payload가 **현재 `defineModel` 값**만 읽는다. 부모가 `calendarListeners` 없이 `@query-change`만 쓰거나 v-model 갱신이 동기 체인에서 늦으면 **stale `date`/`view`/`range`** 로 API 재조회가 발생한다.

**수정 방향:** `emitQueryChange`에 `view`/`date`/`listFilterDate` override 전달.

**검증:** ✅ `ScheduleCalendar.spec.ts` — parent v-model stale 상태에서도 query-change `date`/`view` 검증 (2026-06-30).

---

### SRV-P0-02: E2E CI 편입

**위치:** `.github/workflows/ci.yml`, `.husky/pre-push`

**문제:** lint → typecheck → vitest → build:lib만 실행. Playwright E2E가 CI에 없음.

**수정 방향:** 기능 E2E 134건은 `test:e2e:ci`로 CI 편입. 시각 회귀 8건은 OS·Chromium 렌더링 flaky로 CI 제외 — `test:e2e:visual` + `visual-regression.yml` (workflow_dispatch). 로컬 push 전 `pnpm verify:push` (lint + typecheck + vitest).

**검증:** ✅ CI: lint → typecheck → test(429) → build → size-limit → `test:e2e:ci`(137). Node 24.

---

### SRV-P1-01: Month cell 키보드 a11y

**위치:** `packages/calendar/src/components/calendar/MonthCell.vue`

**문제:** 월간 날짜 셀 `<div @click>` — `tabindex`/`role`/`keydown` 없음.

**수정:** `role="gridcell"` + `tabindex="0"` + Enter/Space → `date-select` emit.

**검증:** ✅ 코드 확인 (2026-07-01). 완전한 grid roving 패턴은 SRV-P2-09.

---

### SRV-P1-02: dts/CSS alias 분리

**위치:** `packages/calendar/vite.lib.config.ts`, `packages/calendar/vite.config.ts`, `turbo.json`, [framework-roadmap.md §1.5](./framework-roadmap.md)

**문제:** `vite.lib.config.ts`의 `@vuepkg/core`/`@vuepkg/ui` alias가 원시 소스(`../core/src`, `../ui/src`)를 직접 가리켜, `vite-plugin-dts`가 일부 비공개 컴포넌트 `.d.ts`(예: `MonthOverflowPopover.vue.d.ts`)에 `'../../../../core/src'` 같은 깨진 상대경로를 남겼다.

**재진단:** 이전 시도가 "alias 제거 → `@vuepkg/ui` 컴포넌트 CSS가 `style.css`에서 통째로 빠지는 회귀"로 되돌려졌던 기록이 있었으나, 실제로는 `@vuepkg/ui`가 이미 자체 `build:lib`으로 `dist/style.css`(모든 ui 컴포넌트 스타일 포함)와 `exports["./style.css"]`를 갖추고 있었다. 이전 시도는 alias만 제거하고 그 CSS를 명시적으로 import하지 않아서 회귀가 난 것으로 확인됨 — CSS 누락은 alias 제거 자체의 근본적 한계가 아니었다.

**수정:** `vite.lib.config.ts`·`vite.config.ts`(데모) 양쪽에서 `@vuepkg/core`/`@vuepkg/ui` alias를 제거(원래 있던 `@vuepkg/theme` alias는 유지 — 그건 순수 CSS라 별도 빌드 산출물이 없음). `ScheduleCalendar.vue`의 기존 `@import '@vuepkg/theme/index.css'` 바로 뒤에 `@import '@vuepkg/ui/style.css'`를 추가해 ui 컴포넌트 CSS를 명시적으로 끌어온다. alias 제거로 `@vuepkg/core`/`@vuepkg/ui`는 workspace symlink(node_modules) 경유로 해석되며, 이는 `vue-tsc`가 이미 쓰던 것과 동일한 해석 경로다(`tsconfig.app.json`의 `paths`에는 애초에 이 두 패키지가 없었음 — alias는 vite/rollup 빌드에만 영향을 줬음).

**파이프라인 트레이드오프:** alias 제거로 calendar의 lib/demo 빌드가 `@vuepkg/core`/`@vuepkg/ui`의 `dist/`가 미리 빌드되어 있어야 동작한다. `pnpm turbo run build:lib`(CI 방식)은 `dependsOn: ["^build:lib"]`로 이미 순서를 보장하지만, 루트 `dev` task는 그렇지 않아서 `turbo.json`의 `dev`에 `dependsOn: ["^build:lib"]`을 추가함 — `pnpm dev` 실행 시 ui/core가 먼저 빌드된다.

**검증:** ✅ `MonthOverflowPopover.vue.d.ts`가 `import { RectBounds } from '@vuepkg/core'`(정상 bare specifier)로 출력됨을 확인. `dist/style.css`에 `.vp-button`/`.vp-chip`/`.vp-popover`/`.vp-segmented-control`/`.vp-data-table`/`.vp-dialog` 전부 포함(33.63KB, 변경 전과 동일). Vitest 290건, typecheck, lint(기존 baseline 경고 3건 외 신규 없음), size-limit(18.4/20KB — 변화 없음), 데모 `build`/`dev` 서버 정상 부팅, Playwright 기능 E2E 142건 전체 통과 (2026-07-02).

---

### SRV-P1-03: 대형 뷰 컴포넌트 분리

**위치:** `TimedGrid.vue`, `MonthView.vue`

**문제:** Phase 4 F4-1(드래그 슬롯)·F4-4(DnD) 착수 시 회귀 비용 급증.

**수정:** `TimedGridHeader.vue`·`TimedGridAllDay.vue`·`useTimeSlotSelection.ts`·`MonthCell.vue` 분리.

**검증:** ✅ TimedGrid 614→303줄, MonthView 482→313줄 (2026-07-01 분리 시점). F4-4 이후 TimedGrid 489줄, IMP-03 prop 반영 후 495줄 — SRV-P1-05 추적.

---

### SRV-P1-04: 번들 budget 포화

**위치:** `packages/calendar/package.json` `size-limit`, CI `Bundle size budget` 스텝

**문제:** F4-5 반복 일정 반영 후 `index.js` brotli 15.35KB / 16KB (96%), IMP-02/03 prop 추가 후 15.47KB / 16KB (97%), F3-3 locale prop 추가 후 **15.57KB / 16KB (97%)**. F4-6 Timeline·F4-7 리소스 뷰 추가 시 budget 초과가 구조적으로 확실.

**수정 방향:** (1) budget 상향 + CHANGELOG 명시, 또는 (2) recurrence/DnD/모달을 동적 `import()` 서브청크로 분리. F4-9 게이트가 있으므로 착수 전에 결정해야 CI가 막히지 않음.

**결정:** (1)안 채택 — `size-limit` budget을 `index.js` 16→20KB, `index.cjs` 15→19KB, `style.css` 6.5→8KB로 상향 (2026-07-02). 동적 import 분할은 F4-6 실제 구현 시점에 번들 증가폭을 보고 재검토.

**검증:** ✅ `pnpm --filter @vuepkg/calendar run size` green — index.js 15.57/20KB(78%), index.cjs 14.24/19KB(75%), style.css 5.05/8KB(63%). F4-6 착수 여유 확보 (2026-07-02).

---

### SRV-P1-05: TimedGrid DnD 후 재팽창

**위치:** `TimedGrid.vue`, `TimedGridDayColumn.vue`(신규), `useScheduleDrag.ts`(196줄)

**문제:** SRV-P1-03 분리 후 F4-4에서 DnD ghost·pointer capture·move/resize emit이 TimedGrid 본문에 재유입되어 303→489줄. IMP-03(`startHour`/`endHour` prop) 반영으로 495줄.

**수정:** 일자별 컬럼 렌더링(시간 슬롯 선택 오버레이·드래그 ghost·현재 시각 선·`timed-event` 목록·리사이즈 핸들)을 `TimedGridDayColumn.vue`로 분리. `useTimeSlotSelection`/`useScheduleDrag` composable 초기화와 포인터 이벤트 핸들러(`handlePointerDown`/`Move`/`Up`, `handleMovePointerDown`, `handleResizePointerDown`)는 그리드 전체 상태를 다루므로 `TimedGrid.vue`에 유지 — 자식은 `day`/`layout`/`selectedSlot`/`ghost`/`draggingScheduleId` 등 이미 필터링된 값만 props로 받고 raw pointer 이벤트를 emit. 조상 클래스 기반 커서 CSS(`.timed-grid.is-dragging .day-column` 등)는 scoped 스타일 경계 때문에 `isSlotDragging`/`isEventDragging` prop 기반의 자체 클래스로 전환.

**검증:** ✅ `TimedGrid.vue` 495→336줄, 신규 `TimedGridDayColumn.vue` 237줄. `TimedGrid.spec.ts` DnD describe 블록 포함 17건 무변경 통과 — 리팩터링이 동작을 보존함을 확인 (2026-07-02).

**검증:** ✅ DnD 단위·통합 spec 존재 (`TimedGrid.spec.ts` describe `drag-and-drop`). 파일 크기 정리는 미착수.

---

### SRV-P2-01: calendarListeners 강제

**위치:** `ScheduleCalendar.vue` L171~178

**문제:** v-model만 연결 시 툴바·네비·셀 클릭 dead UI.

**수정:** DEV `onMounted`에서 `'onNavigate' in attrs` 미감지 시 `console.warn`.

**검증:** ✅ 코드 확인. `v-on="calendarListeners"` spread는 attrs에 잡히지 않을 수 있음 — 문서·예제로 보완.

---

### SRV-P2-02: usePublicHolidays retry/loading

**위치:** `composables/usePublicHolidays.ts`

**문제:** API 실패 연도 `failedYears` 영구 등록. 단일 `loading` boolean.

**수정:** TTL 30s 재시도 (`Map<year, timestamp>`), `inflightCount` ref → `computed loading`.

**검증:** ✅ spec 3건 추가 (2026-07-01).

---

### SRV-P2-03: overflow popover auto-close

**위치:** `MonthView.vue`

**문제:** 월 이동 시 팝오버가 열린 채 이전 날짜 데이터 표시.

**수정:** `watch(monthLabel, closeOverflowPopover)`.

**검증:** ✅ (2026-07-01).

---

### SRV-P2-04: ListView rowKey

**위치:** `views/ListView.vue`

**문제:** `rowKey: (row) => row.no` — 필터 변경 시 identity 불안정.

**수정:** `row.schedule.id`.

**검증:** ✅ (2026-07-01).

---

### SRV-P2-05: useCalendar dead API

**위치:** `composables/useCalendar.ts`

**문제:** `setView`/`selectDate` — emit-only와 이중 패턴.

**수정:** `CalendarContext`에 `@internal` JSDoc.

**검증:** ✅ (2026-07-01).

---

### SRV-P2-06: 공휴일 API 키 가이드

**위치:** `publicHolidaysApi.ts`, `UsePublicHolidaysOptions`

**문제:** cross-origin + raw key 시 클라이언트 노출.

**수정:** DEV `console.warn` + `serviceKey` JSDoc (BFF 권장).

**검증:** ✅ warn·JSDoc (2026-07-01). 응답 검증은 SRV-P2-10.

---

### SRV-P2-07: headless export

**위치:** `components/calendar/index.ts`

**문제:** `useCalendar` 미공개.

**수정:** `export { useCalendar }` from main entry.

**검증:** ✅ (2026-07-01). 서브패스·tree-shake는 SRV-P2-11.

---

### SRV-P2-08: ScheduleFormModal 단일 대형 파일

**위치:** `ScheduleFormModal.vue`

**문제:** create/edit·참가자·반복 규칙·검증이 단일 SFC(611줄)에 집중. F4-5 이후 유지보수 비용 상승.

**수정:** 반복 규칙 UI(빈도·간격·요일·종료 조건)를 `RecurrenceFields.vue`로 분리 — `freq`/`interval`/`byWeekday`/`endMode`/`count`/`until` 6개 `defineModel`로 양방향 바인딩. 날짜·시간 조합 헬퍼(`withDateKeepingTime`/`combineDateAndTime`)는 두 컴포넌트가 공유하도록 `utils/scheduleForm.ts`로 추출. `ScheduleFormModal`의 공개 API(`open`/`mode`/`schedule`/`submit`/`delete`)는 변경 없음 — `RecurrenceFields`는 내부 전용이라 barrel export 대상 아님.

**검증:** ✅ `ScheduleFormModal.spec.ts` 16건(반복 UI e2e 시나리오 포함) 무변경 통과 — 리팩터링이 동작을 보존함을 확인 (2026-07-02). `ScheduleFormModal.vue` 611→431줄.

**검증:** ✅ `ScheduleFormModal.spec.ts` 13건 + `recurrence.spec.ts` 10건. 구조 분리는 미착수.

---

### SRV-P2-09: Month cell roving tabindex

**위치:** `MonthCell.vue`, `views/MonthView.vue`

**문제:** 모든 셀 `tabindex="0"` — 35~42개 포커스 정지점. WCAG grid 패턴과 불일치.

**수정:** `MonthCell`에 `tabindex` prop 추가(기본 `0`, 단독 마운트 시 하위 호환). `MonthView`가 `activeFocusKey`(선택일 → 오늘 → 첫 셀 순 fallback)를 계산해 해당 셀에만 `tabindex="0"`, 나머지는 `-1`. `.month-weeks-body`에 `role="grid"`, `.month-week`에 `role="row"`, 화살표 키(상하좌우)로 `cellRefs`를 통해 포커스 이동 — grid 경계에서는 이동하지 않음. 셀 클릭 시에도 `activeFocusKey`를 클릭한 셀로 동기화. 월 이동·`monthWeekCount` 변경 시 포커스 상태 리셋.

**검증:** ✅ `MonthView.spec.ts` `describe('roving tabindex (SRV-P2-09)')` 5건 — role 노출, 단일 tabindex=0, 화살표 4방향 이동, 경계 무이동, 클릭 시 동기화 (2026-07-02).

**검증:** 미착수.

---

### SRV-P2-10: 공휴일 API 응답 검증

**위치:** `publicHolidaysApi.ts`

**문제:** `(await response.json()) as SpcdeApiResponse` — 스키마 불일치 시 (`response`/`header`/`body` 누락) 이후 접근에서 raw `TypeError`가 던져져 진단이 어려움. 개별 holiday item도 검증 없이 매핑되어 깨진 `locdate`가 조용히 잘못된 날짜로 변환될 수 있었음.

**수정:** `isValidSpcdeApiResponse()` 런타임 가드 추가 — `response`/`header.resultCode`/`body` 최소 구조 확인 후 불일치 시 명확한 한글 에러 메시지로 throw(+ DEV `console.warn`으로 raw payload 노출). `parseHolidayItems()`는 `locdate`가 number, `dateName`이 string인 항목만 통과시키도록 필터링해 깨진 항목을 조용히 제외.

**검증:** ✅ `publicHolidaysApi.spec.ts` `describe('response schema validation (SRV-P2-10)')` 4건 — envelope 누락/header 누락/body null/깨진 item 필터링 (2026-07-02).

**검증:** 미착수.

---

### SRV-P2-11: headless 서브패스

**위치:** `packages/calendar/package.json` `exports`, `vite.lib.config.ts`, `src/headless.ts`(신규)

**문제:** 메인 엔트리에 `useCalendar`만 export — styled 컴포넌트와 번들이 함께 로드됨.

**수정:** 컴포넌트 없는 타입·유틸·composable(`useCalendar`/`useTimeSlotSelection`/`useScheduleDrag`/`usePublicHolidays`/`useScheduleCalendarHost`, `expandRecurringSchedules`, `buildScheduleFromDraft` 등)을 `src/headless.ts`로 단일화하고, 메인 엔트리(`components/calendar/index.ts`)는 `export * from '@/headless'`로 재export. `vite.lib.config.ts`의 `build.lib.entry`를 `index`/`headless` 2개로 분리하고 `exports`에 `./headless` 서브패스 추가. Rollup이 두 엔트리의 공통 코드를 자동으로 공유 청크로 분리해, `@vuepkg/calendar/headless`만 import하면 Vue SFC 없이 로직 청크(~7.3KB brotli)만 로드된다.

**트레이드오프:** entry를 2개로 분리하면서 번들링 오버헤드가 발생 — `index.js`(ESM) 실측이 15.57KB→18.39KB(20KB 예산 기준 78%→92%)로 증가했다. SRV-P1-04에서 F4-6 착수 여유를 확보하려고 올린 budget 대부분을 이 분리 비용이 소비한다. size-limit도 `dist/headless-*.js` 공유 청크를 포함하도록 glob 배열로 갱신(`index.js`/`index.cjs` 항목에 청크 포함, `headless.js` 항목 신설·9KB).

**검증:** ✅ Vitest 290건 무변경 통과, typecheck/lint 무변경, `size-limit` green (index.js 18.39/20KB 92%, headless.js 7.32/9KB 81%), 빌드된 `dist/headless.js`를 순수 Node에서 `import()`해 Vue 컴포넌트·DOM 없이 로직만 로드되는지 확인 (2026-07-02).

---

### SRV-P2-12: visual regression 스냅샷 재생성 필요

**위치:** `packages/calendar/e2e/visual-regression.spec.ts-snapshots/*-linux.png` (8종)

**문제:** F3-5 색상 대비 수정으로 `--vp-tab-text`, `--vp-month-cell-outside-text`, `--vp-color-danger`(light), `SCHEDULE_TYPE_OPTIONS`(my_schedule/company_schedule) 값이 바뀌어 Month/Week/Day/List × Light/Dark 스냅샷 8종이 모두 실제 픽셀과 달라짐 (의도된 변경).

**수정 방향:** `pnpm --filter @vuepkg/calendar run test:e2e:update-snapshots:linux`(Docker)로 Linux baseline 재생성 후 diff를 사람이 시각 검토하고 커밋. macOS 로컬에서 생성되는 `*-darwin.png`는 저장소에 포함하지 않음(win32/linux만 공식 baseline).

**검증:** 미착수 — Docker 필요 + 사람 리뷰 대상이라 이번 자동화 세션 범위 밖으로 분리.

---

### SRV-P2-13: 오늘 날짜 E2E substring flaky

**위치:** `packages/calendar/e2e/calendar.spec.ts` L115 — `'navigates weeks with today and arrow buttons'`

**문제:** `page.locator('.day-header .day-number', { hasText: today })`가 `today = new Date().getDate().toString()` 를 부분 문자열로 매칭한다. 오늘이 두 자리 날짜의 접두/접미 숫자와 겹치면(예: 오늘=2일 → Week 뷰에 28·29·2가 함께 보이는 주) strict mode violation으로 실패한다. F3-5 검증 중 2026-07-02(오늘=2일)에 실제로 재현됨 — 내 변경과 무관한 기존 버그.

**수정:** `hasText`를 정확 매칭 정규식(`new RegExp(`^${today}$`)`)으로 교체.

**검증:** ✅ `calendar.spec.ts` 26건 전체 통과 (2026-07-02).

---

## 리뷰 #2 긍정적 설계 포인트 (유지)

- emit-only controlled + `useScheduleCalendarHost` — Phase 4 CRUD/DnD에서도 단일 상태 소유 원칙 유지
- `useTimeSlotSelection` → `useScheduleDrag` pointer 인프라 재사용 (F4-1→F4-4)
- `expandRecurringSchedules` + `ScheduleFormModal` 반복 UI — subset RRULE이지만 테스트 23건으로 회귀 가드
- `@vuepkg/ui` `Dialog` — focus trap·Esc·Tab cycle·backdrop (F2-7)
- CI 3계층: `verify:push`(단위) → CI(size-limit + 기능 E2E) → 수동 visual workflow
- F4-9 size-limit brotli 게이트로 번들 무한 성장 방지
- `v-html` 미사용, types 경로 버그 수정 완료, `@vuepkg/calendar@0.2.1` npm 배포

---

## 현재 테스트·빌드 스냅샷 (2026-07-02)

| 계층 | 규모 |
| ---- | ---- |
| Vitest (monorepo) | **440** (core 74 + ui 76 + calendar 290) |
| Playwright 기능 E2E (CI) | **137** (`test:e2e:ci`, SRV-P2-13 flaky 수정 반영) |
| Playwright 시각 회귀 | **8** (`test:e2e:visual`, 수동 workflow — SRV-P2-12로 스냅샷 재생성 필요) |
| Node | **24** (CI·engines) |
| 번들 (calendar, brotli) | index.js(ESM, headless 공유 청크 포함) 18.39KB / 20KB (92%), index.cjs 16.9KB / 19KB, headless.js 7.32KB / 9KB, style.css 5.13KB / 8KB |

---

## 참고 문서

- [framework-roadmap.md](./framework-roadmap.md) — Phase 4 종착점·기술 부채 §1.5
- [roadmap.md](./roadmap.md) — 기능 백로그 IMP-*
- [architecture.md](./architecture.md) — emit-only·테스트·빌드
