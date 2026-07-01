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
| 최종 판정 | **CHANGES REQUIRED** (0.2.x 배포·운영은 가능, **1.0.0 / F4-6 착수 전** 정리 필요) |
| 품질 점수 | **7 / 10** |
| 리뷰 커버리지 | **심층:** `ScheduleCalendar`·`useCalendar`·`useScheduleDrag`·`recurrence`·`ScheduleFormModal`·`Dialog`·CI/Husky·size-limit · **스캔:** VitePress docs·Changesets·playground 데모 |

**한 줄 요약:** P0·대부분 P1/P2·Phase 4 핵심(F4-1~5, F4-9~11, F3-1)이 완료되어 엔진 토대가 실제 제품 수준으로 올라왔다. 남은 리스크는 **번들 budget 96% 포화**, **TimedGrid DnD 후 재팽창**, **dts alias 부채(SRV-P1-02)** 3축이며 F4-6(Timeline) 착수 전 반드시 해소·완화해야 한다.

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
| [SRV-P1-02](#srv-p1-02-dtscss-alias-분리) | MAJOR | 타입/빌드 | `vite-plugin-dts` 깨진 상대경로 — CSS alias와 결합 | **미착수** | [framework-roadmap.md §1.5](./framework-roadmap.md) BLOCKED — F3-2 전 설계 필요 |
| [SRV-P1-03](#srv-p1-03-대형-뷰-컴포넌트-분리) | MAJOR | 아키텍처 | `TimedGrid`(614줄)·`MonthView`(482줄) — Phase 4 DnD 병목 | **완료** | Header/AllDay/`useTimeSlotSelection`/`MonthCell` 분리 (2026-07-01). F4-4 이후 TimedGrid 재팽창 → [SRV-P1-05](#srv-p1-05-timedgrid-dnd-후-재팽창) |
| [SRV-P1-04](#srv-p1-04-번들-budget-포화) | MAJOR | 아키텍처/성능 | `index.js` 15.35KB / 16KB limit (**96%**) — F4-6 추가 시 초과 확실 | **미착수** | F4-6 착수 전 budget 상향(예: 20KB) 또는 동적 import 분할 결정 필요 |
| [SRV-P1-05](#srv-p1-05-timedgrid-dnd-후-재팽창) | MAJOR | 아키텍처 | F4-4 DnD 통합 후 `TimedGrid.vue` 303→**489줄** 재팽창 | **미착수** | `useScheduleDrag`를 TimedGrid 본문에서 추가 오케스트레이션 레이어로 분리 검토 |

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
| [SRV-P2-08](#srv-p2-08-scheduleformmodal-단일-대형-파일) | MINOR | 유지보수 | `ScheduleFormModal.vue` **611줄** — 폼·반복 UI·검증 단일 파일 | **미착수** | recurrence 섹션·폼 필드 컴포넌트 분리 검토 |
| [SRV-P2-09](#srv-p2-09-month-cell-roving-tabindex) | MINOR | 접근성 | 모든 월간 셀 `tabindex="0"` — Tab 순서 과다 | **미착수** | `role="grid"` + roving `tabindex` 패턴 |
| [SRV-P2-10](#srv-p2-10-공휴일-api-응답-검증) | MINOR | 타입/보안 | `response.json() as SpcdeApiResponse` 단언 | **미착수** | 경량 스키마 검증 또는 실패 시 빈 배열 + warn |
| [SRV-P2-11](#srv-p2-11-headless-서브패스) | MINOR | 로드맵 | `@vuepkg/calendar/headless` 서브패스 미구현 | **미착수** | Phase 3 F3-2와 연계 — tree-shake·번들 분리에도 유리 |

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

**검증:** ✅ CI: lint → typecheck → test(393) → build → size-limit → `test:e2e:ci`. Node 24.

---

### SRV-P1-01: Month cell 키보드 a11y

**위치:** `packages/calendar/src/components/calendar/MonthCell.vue`

**문제:** 월간 날짜 셀 `<div @click>` — `tabindex`/`role`/`keydown` 없음.

**수정:** `role="gridcell"` + `tabindex="0"` + Enter/Space → `date-select` emit.

**검증:** ✅ 코드 확인 (2026-07-01). 완전한 grid roving 패턴은 SRV-P2-09.

---

### SRV-P1-02: dts/CSS alias 분리

**위치:** `packages/calendar/vite.lib.config.ts`, [framework-roadmap.md §1.5](./framework-roadmap.md)

**문제:** alias 제거 시 ui CSS가 `style.css`에서 빠짐. dts에 `'../../../../core/src'` 누수.

**수정 방향:** ui CSS 주입용 별도 vite/postcss 단계 설계 후 alias 분리.

**검증:** 미착수. 공개 엔트리 타입 그래프 밖이라 0.2.x 소비자 영향 낮음.

---

### SRV-P1-03: 대형 뷰 컴포넌트 분리

**위치:** `TimedGrid.vue`, `MonthView.vue`

**문제:** Phase 4 F4-1(드래그 슬롯)·F4-4(DnD) 착수 시 회귀 비용 급증.

**수정:** `TimedGridHeader.vue`·`TimedGridAllDay.vue`·`useTimeSlotSelection.ts`·`MonthCell.vue` 분리.

**검증:** ✅ TimedGrid 614→303줄, MonthView 482→313줄 (2026-07-01 분리 시점). F4-4 이후 TimedGrid 489줄 — SRV-P1-05 추적.

---

### SRV-P1-04: 번들 budget 포화

**위치:** `packages/calendar/package.json` `size-limit`, CI `Bundle size budget` 스텝

**문제:** F4-5 반복 일정 반영 후 `index.js` brotli **15.35KB / 16KB (96%)**. F4-6 Timeline·F4-7 리소스 뷰 추가 시 budget 초과가 구조적으로 확실.

**수정 방향:** (1) budget 상향 + CHANGELOG 명시, 또는 (2) recurrence/DnD/모달을 동적 `import()` 서브청크로 분리. F4-9 게이트가 있으므로 착수 전에 결정해야 CI가 막히지 않음.

**검증:** 미착수. `pnpm --filter @vuepkg/calendar run size` 현재 green.

---

### SRV-P1-05: TimedGrid DnD 후 재팽창

**위치:** `TimedGrid.vue`(489줄), `useScheduleDrag.ts`(196줄)

**문제:** SRV-P1-03 분리 후 F4-4에서 DnD ghost·pointer capture·move/resize emit이 TimedGrid 본문에 재유입되어 303→489줄.

**수정 방향:** `useScheduleDrag` 오케스트레이션을 `TimedGridDragLayer.vue` 또는 composable+slot 패턴으로 격리. `TimedGrid.spec.ts` DnD describe 블록 유지.

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

**위치:** `ScheduleFormModal.vue` (611줄)

**문제:** create/edit·참가자·반복 규칙·검증이 단일 SFC에 집중. F4-5 이후 유지보수 비용 상승.

**수정 방향:** `RecurrenceFields.vue` 등 섹션 컴포넌트 분리. 공개 API(`open`/`mode`/`submit`)는 유지.

**검증:** ✅ `ScheduleFormModal.spec.ts` 13건 + `recurrence.spec.ts` 10건. 구조 분리는 미착수.

---

### SRV-P2-09: Month cell roving tabindex

**위치:** `MonthCell.vue` L61~62

**문제:** 모든 셀 `tabindex="0"` — 35~42개 포커스 정지점. WCAG grid 패턴과 불일치.

**수정 방향:** `MonthView` 루트 `role="grid"`, 단일 활성 셀만 `tabindex="0"`, 화살표 키 이동.

**검증:** 미착수.

---

### SRV-P2-10: 공휴일 API 응답 검증

**위치:** `publicHolidaysApi.ts` L125

**문제:** `(await response.json()) as SpcdeApiResponse` — 스키마 불일치 시 런타임 throw 가능.

**수정 방향:** 최소 필드 검증 후 실패 시 `[]` + DEV warn.

**검증:** 미착수.

---

### SRV-P2-11: headless 서브패스

**위치:** `packages/calendar/package.json` `exports`

**문제:** 메인 엔트리에 `useCalendar`만 export — styled 컴포넌트와 번들이 함께 로드됨.

**수정 방향:** `@vuepkg/calendar/headless` 서브패스 + F3-2 문서 연계.

**검증:** 미착수.

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

## 현재 테스트·빌드 스냅샷 (2026-07-01)

| 계층 | 규모 |
| ---- | ---- |
| Vitest (monorepo) | **393** (core 70 + ui 76 + calendar 247) |
| Playwright 기능 E2E (CI) | **134** (`test:e2e:ci`) |
| Playwright 시각 회귀 | **8** (`test:e2e:visual`, 수동 workflow) |
| Node | **24** (CI·engines) |
| 번들 (calendar, brotli) | index.js 15.35KB / 16KB, style.css 5.04KB / 6.5KB |

---

## 참고 문서

- [framework-roadmap.md](./framework-roadmap.md) — Phase 4 종착점·기술 부채 §1.5
- [roadmap.md](./roadmap.md) — 기능 백로그 IMP-*
- [architecture.md](./architecture.md) — emit-only·테스트·빌드
