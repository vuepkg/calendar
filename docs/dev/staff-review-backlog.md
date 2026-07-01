# Staff Review Backlog — Phase 0~2 코드베이스 점검

> **원본 리뷰:** 2026-06-30 · Frontend Staff Review Guardian  
> **기준 문서:** [framework-roadmap.md](./framework-roadmap.md) (Calendar Engine 방향 전환 직후)  
> **용도:** 에이전트·개발자가 항목별로 추적·재검증·수정할 때 사용하는 **단일 원장(ledger)**

---

## 종합 판정 (2026-06-30)

| 항목 | 값 |
| ---- | -- |
| 최종 판정 | CHANGES REQUIRED (0.x 토대는 양호, 1.0.0 / Phase 4 전 정리 필요) |
| 품질 점수 | 6 / 10 |
| 리뷰 범위 | Phase 0~2 완료분 — monorepo 4패키지, `ScheduleCalendar` emit-only, ui primitive 6종, Vitest 335건, Playwright 142건 구조 |

**한 줄 요약:** Phase 0~2는 로드맵 의도대로 견고한 토대를 만들었다. P0(`query-change`·기능 E2E CI)는 완료. P1~P2(월간 셀 a11y, dts 부채, 대형 뷰 분리 등)는 Phase 4 착수 전에 정리해야 한다.

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
| [SRV-P1-01](#srv-p1-01-month-cell-키보드-a11y) | MAJOR | 접근성 | `MonthView` 날짜 셀이 `<div @click>`만 — 키보드 불가 | **완료** | `MonthCell.vue` 분리와 함께 `role="gridcell"` + `tabindex="0"` + `@keydown.enter/space` 추가 (2026-07-01) |
| [SRV-P1-02](#srv-p1-02-dtscss-alias-분리) | MAJOR | 타입/빌드 | `vite-plugin-dts` 깨진 상대경로 — CSS alias와 결합 | 미착수 | [framework-roadmap.md §1.5](./framework-roadmap.md) BLOCKED |
| [SRV-P1-03](#srv-p1-03-대형-뷰-컴포넌트-분리) | MAJOR | 아키텍처 | `TimedGrid`(614줄)·`MonthView`(482줄) — Phase 4 DnD 병목 | **완료** | `TimedGridHeader.vue`·`TimedGridAllDay.vue` 분리 + `useTimeSlotSelection.ts` composable 추출 + `MonthCell.vue` 분리. TimedGrid 614→303줄, MonthView 482→257줄 (2026-07-01) |

### P2 — 1.0.0 전

| ID | Severity | 카테고리 | 요약 | 상태 | 담당/비고 |
| -- | -------- | -------- | ---- | ---- | --------- |
| [SRV-P2-01](#srv-p2-01-calendarlisteners-강제) | MAJOR | API | bare `ScheduleCalendar` + v-model만 연결 시 UI dead | **완료** | `onMounted` DEV 경고: `onNavigate` 리스너 미감지 시 `console.warn` (2026-07-01) |
| [SRV-P2-02](#srv-p2-02-usepublicholidays-retryloading) | MAJOR | 런타임 | `failedYears` 영구 스킵, 단일 `loading` 플래그 | **완료** | TTL 30 s 재시도 (`Map<year, timestamp>`), `inflightCount` ref → `computed loading`. spec 3건 추가 (2026-07-01) |
| [SRV-P2-03](#srv-p2-03-overflow-popover-auto-close) | MINOR | UX | 월 이동·뷰 전환 시 overflow 팝오버 미닫힘 | **완료** | `MonthView.vue` — `watch(monthLabel, closeOverflowPopover)` 추가 (2026-07-01) |
| [SRV-P2-04](#srv-p2-04-listview-rowkey) | MINOR | 데이터 | `rowKey`가 인덱스 기반 (`row.no`) | **완료** | `ListView.vue` `:rowKey` → `row.schedule.id` (2026-07-01) |
| [SRV-P2-05](#srv-p2-05-usecalendar-dead-api) | MINOR | 아키텍처 | `setView`/`selectDate` dead path가 context에 노출 | **완료** | `CalendarContext` 타입에 `@internal` JSDoc 추가 (2026-07-01) |
| [SRV-P2-06](#srv-p2-06-공휴일-api-키-가이드) | MINOR | 보안 | `serviceKey` 클라이언트 노출 가능 — BFF 미강제 | **완료** | `fetchPublicHolidays` DEV warn + `UsePublicHolidaysOptions.serviceKey` JSDoc 강화 (2026-07-01) |
| [SRV-P2-07](#srv-p2-07-headless-export) | MINOR | 로드맵 | `useCalendar` 미공개 — headless 포지셔닝 약함 | **완료** | `index.ts`에 `export { useCalendar }` 추가 (2026-07-01) |

### NIT

| ID | Severity | 요약 | 상태 |
| -- | -------- | ---- | ---- |
| SRV-NIT-01 | NIT | `CalendarToolbar` `view as CalendarView` 단언 | **완료** — viewTabs 조회로 type-safe 교체 (2026-07-01) |

---

## 항목 상세

### SRV-P0-01: query-change payload 정확성

**위치:** `packages/calendar/src/components/calendar/ScheduleCalendar.vue`, `utils/schedule.ts`

**문제:** `handleNavigate` / `handleViewChange`가 emit 직후 `emitQueryChange()`를 호출할 때, payload가 **현재 `defineModel` 값**만 읽는다. 부모가 `calendarListeners` 없이 `@query-change`만 쓰거나 v-model 갱신이 동기 체인에서 늦으면 **stale `date`/`view`/`range`** 로 API 재조회가 발생한다.

**수정 방향:** `emitQueryChange`에 `view`/`date`/`listFilterDate` override 전달. navigate는 `resolveCalendarNavigateDate` 결과, view-change는 `nextView`, list-filter-clear는 `null`.

**검증:** `ScheduleCalendar.spec.ts` — parent v-model stale 상태에서도 query-change `date`/`view` 검증. ✅ 2026-06-30 vitest 201 passed.

---

### SRV-P0-02: E2E CI 편입

**위치:** `.github/workflows/ci.yml`

**문제:** lint → typecheck → vitest → build:lib만 실행. Playwright E2E가 CI에 없음.

**수정 방향 (2026-06-30 갱신):** 기능 E2E 134건은 `test:e2e:ci`로 CI에 편입. 시각 회귀 8건은 OS·Chromium 렌더링 flaky로 **CI에서 제외** — `test:e2e:visual` + `.github/workflows/visual-regression.yml` (workflow_dispatch)로 수동 실행.

**검증:** push/PR CI green (`test:e2e:ci`). UI 변경 시 `test:e2e:visual` 수동.

---

### SRV-P1-01: Month cell 키보드 a11y

**위치:** `packages/calendar/src/components/calendar/views/MonthView.vue` L160~172

**문제:** 월간 날짜 셀 `<div @click>` — `tabindex`/`role`/`keydown` 없음. 로드맵 §0.3 a11y by default와 불일치.

**수정 방향:** `role="gridcell"` + roving tabindex, 또는 날짜 영역 `<button>`. `TimedGrid` day header Enter/Space 패턴 참고.

---

### SRV-P1-02: dts/CSS alias 분리

**위치:** `packages/calendar/vite.lib.config.ts`, [framework-roadmap.md §1.5](./framework-roadmap.md)

**문제:** alias 제거 시 ui CSS가 `style.css`에서 빠짐. dts에 `'../../../../core/src'` 누수.

**수정 방향:** ui CSS 주입용 별도 vite/postcss 단계 설계 후 alias 분리.

---

### SRV-P1-03: 대형 뷰 컴포넌트 분리

**위치:** `TimedGrid.vue`(614줄), `MonthView.vue`(482줄)

**문제:** Phase 4 F4-1(드래그 슬롯)·F4-4(DnD) 착수 시 회귀 비용 급증.

**수정 방향:** pointer 인프라 composable 분리, spanning bar 레이어 컴포넌트화.

---

### SRV-P2-01: calendarListeners 강제

**위치:** `useScheduleCalendarHost.ts`, 공개 API

**문제:** v-model만 연결 시 툴바·네비·셀 클릭 dead UI.

**수정 방향:** `useScheduleCalendarHost` 공식 경로 문서화, dev-mode 경고 또는 compound component.

---

### SRV-P2-02: usePublicHolidays retry/loading

**위치:** `packages/calendar/src/composables/usePublicHolidays.ts`

**문제:** API 실패 연도 `failedYears` 영구 등록. 단일 `loading` boolean.

**수정 방향:** retry/TTL, `inflightYears.size` 기반 loading.

---

### SRV-P2-03: overflow popover auto-close

**위치:** `MonthView.vue` `overflowPopover`

**문제:** 월 이동·뷰 전환 시 팝오버가 열린 채 이전 날짜 데이터 표시.

**수정 방향:** `monthCells` 또는 currentDate watch에서 `closeOverflowPopover`.

---

### SRV-P2-04: ListView rowKey

**위치:** `views/ListView.vue`

**문제:** `rowKey: (row) => row.no` — 필터 변경 시 identity 불안정.

**수정 방향:** `row.schedule.id` 또는 복합 키.

---

### SRV-P2-05: useCalendar dead API

**위치:** `composables/useCalendar.ts`

**문제:** `setView`/`selectDate`/`clearListFilter` — 프로덕션 미사용, emit-only와 이중 패턴.

**수정 방향:** `CalendarContext`에서 제거 또는 `@internal` 모듈화.

---

### SRV-P2-06: 공휴일 API 키 가이드

**위치:** `publicHolidaysApi.ts`, `publicHolidayServiceKey` prop

**문제:** cross-origin + raw key 시 클라이언트 노출. 응답 `as SpcdeApiResponse` 단언.

**수정 방향:** BFF 필수 JSDoc, prod warn, 선택적 런타임 검증.

---

### SRV-P2-07: headless export

**위치:** `components/calendar/index.ts`

**문제:** `useCalendar` 미공개. 로드맵 §0.3 Headless-friendly ⚠️.

**수정 방향:** Phase 3 `@vuepkg/calendar/headless` 서브패스.

---

## 긍정적 설계 포인트 (유지)

- emit-only controlled 패턴 + `useScheduleCalendarHost` 일관성
- Phase 2 ui primitive 승격 품질 (Popover focus trap, DataTable generic)
- `fetchPublicHolidays` 기본 `false`, AbortController cleanup
- `v-html` 미사용, types 경로 버그 수정 완료
- Vitest 335 + E2E 호스트 임베딩 5종 시나리오

---

## 참고 문서

- [framework-roadmap.md](./framework-roadmap.md) — Phase 4 종착점·기술 부채 §1.5
- [roadmap.md](./roadmap.md) — 기능 백로그 IMP-*
- [architecture.md](./architecture.md) — emit-only·테스트·빌드
