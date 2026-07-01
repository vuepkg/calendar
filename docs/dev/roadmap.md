# Roadmap — @vuepkg/calendar

> 최종 갱신: 2026-07-02 (F3-1, F4-11, IMP-02, IMP-03, F3-3, SRV-P1-04 완료 반영)

---

## 다음 개발 추천 (2026-07-02 기준)

> **현재 상태**: `@vuepkg/calendar@0.3.0` 배포 완료. F4-1~5 주요 기능, F3-1 문서 사이트, F4-11 자동 릴리즈, IMP-02/03/F3-3 소형 API, SRV-P1-04 번들 budget 상향까지 완료.

### 🥇 1순위 — F4-6 Timeline 뷰 (난이도 🔴, 예상 1주+)

**가장 큰 차별화 기능. 번들 budget 상향(SRV-P1-04, 2026-07-02)으로 착수 여유 확보.**

- **작업**: 다중 리소스(인원/장소) × 시간 타임라인 뷰. FullCalendar Premium 영역과 직접 겹침(§4.1 수익화 시사점 참고)
- `useTimeSlotSelection`(F4-1)·`useScheduleDrag`(F4-4)·`expandRecurringSchedules`(F4-5) 인프라 재사용 가능
- **영향 파일**: 신규 `TimelineView.vue`, `ScheduleCalendar.vue` 뷰 라우팅, `calendarView.ts` 상수
- 새 뷰 설계(리소스 데이터 모델, 레이아웃)가 필요한 대형 기능이라 별도 설계 논의 후 착수 권장

---

### 보너스 — F3-5 a11y 감사 (난이도 🟡, 독립 작업)

**언제든 독립적으로 착수 가능. axe 통과 배지로 신뢰도 향상.**

- **작업**: `axe-playwright` 통합 or `vitest-axe`로 전 컴포넌트 자동 접근성 점검
- README에 a11y 항목 이미 노출 중 → 실제 axe 통과 배지 추가 시 신뢰도 상승
- **영향 파일**: `e2e/accessibility.spec.ts` (신규), 필요 시 각 컴포넌트 `aria-*` 보완

---

**추천 착수 순서**: ~~`IMP-02/03`~~ (완료) → ~~`F3-3 i18n`~~ (완료) → ~~번들 budget 상향`~~ (완료) → `F4-6 Timeline` (설계 논의 필요)

---

## 완료 항목

| 항목 | 내용 | 완료일 |
| ---- | ---- | ------ |
| CalendarToolbar UI | SelectButton 비주얼 CSS 재현, `aria-pressed` 접근성 | 2026-06-16 |
| `hide-toolbar` prop | 뷰 고정 임베딩 지원 | 2026-06-16 |
| [IMP-08] PrimeVue 제거 | `ListView.vue` 네이티브 `<table>` 전환, `peerDependencies`에서 제거 | 2026-06-23 |
| [IMP-01 / P3-C] `ScheduleType` 소비자 주입 | `Schedule.type: string`, `scheduleTypeOptions` prop | 2026-06-23 |
| 라이브러리 패키징 | `vite.lib.config.ts`, `build:lib` 스크립트, ES+CJS+d.ts 출력 | 2026-06-23 |
| [Phase 0] Monorepo & Core 추출 | pnpm workspace + Turborepo, `@vuepkg/core` 분리, CI 파이프라인 | 2026-06-28 |
| [Phase 1] 디자인 토큰 & 테마 시스템 | `@vuepkg/theme` CSS 패키지, 전 컴포넌트 `--vp-*` 변수 적용, 다크 모드 | 2026-06-29 |
| [Phase 2] `@vuepkg/ui` Primitive 승격 (완료) | `Button`/`IconButton`/`SegmentedControl`/`Chip`/`Popover`/`DataTable` 추출, calendar 전체가 소비하도록 리팩토링 | 2026-06-30 |
| CI E2E · Git hooks | GitHub Actions Node 24, `test:e2e:ci`(134) CI 편입, 시각 회귀 수동 workflow, Husky `verify:push` | 2026-06-30 |
| [SRV-P0-01] `query-change` 정확성 | navigate/view-change 시 다음 date/view를 payload에 반영 | 2026-06-30 |
| [IMP-04 / F4-1] 드래그 시간 슬롯 범위 선택 | `useTimeSlotSelection` composable, pointer event 기반 | 2026-07-01 |
| [IMP-06 / F4-4] 드래그&드롭 이벤트 이동·리사이즈 | `useScheduleDrag` composable, `schedule-move`/`schedule-resize` emit | 2026-07-01 |
| [IMP-05 / F4-2] 2/3주 월간 뷰 변형 | `monthWeekCount?: 2\|3\|6` prop, 선택 날짜 기준 window + clamp | 2026-07-01 |
| [F3-1] VitePress 문서 사이트 + GitHub Pages 배포 | `apps/docs`, `docs.yml` GitHub Actions, Getting Started·API·Theming·CHANGELOG·릴리즈 가이드 | 2026-07-01 |
| [F4-11] Changesets 자동 릴리즈 | `release.yml` GitHub Actions, `@vuepkg/calendar@0.2.1` npm 자동 배포 | 2026-07-01 |
| [IMP-02] `weekdayLabels` prop | `MonthView` 요일 헤더 커스터마이즈, 미전달 시 영문 기본값(`SUN`~`SAT`) 유지 | 2026-07-01 |
| [IMP-03] `startHour`/`endHour` prop | Week/Day 시간 그리드 표시 범위 커스터마이즈, 기본 0~23 | 2026-07-01 |
| [F3-3] `locale` prop — i18n 자동 현지화 | `Intl.DateTimeFormat` 기반 요일 자동 현지화 (`formatWeekdayLabels`), `weekdayLabels` 수동 override 병행 지원 | 2026-07-01 |

---

## 기능 개선 백로그

### 🟢 난이도 낮음

#### [IMP-02] `weekdayLabels` prop — 요일 헤더 i18n — ✅ 완료 (2026-07-01)

`ScheduleCalendar`/`MonthView`에 `weekdayLabels?: string[]` prop 추가. 미전달 시 영문 기본값(`SUN`~`SAT`) 유지. `TimedGridHeader`는 이미 `Intl.DateTimeFormat` 기반 요일명을 사용 중이라 별도 변경 불필요.

**영향 파일**: `views/MonthView.vue`, `ScheduleCalendar.vue` · 테스트: `MonthView.spec.ts`, `ScheduleCalendar.spec.ts`

---

#### [IMP-03] 시간 그리드 시작/종료 시간 prop — ✅ 완료 (2026-07-01)

`ScheduleCalendar`/`WeekView`/`DayView`/`TimedGrid`에 `startHour?: number`, `endHour?: number` prop 추가 (기본 0~23). `utils/timed.ts`·`utils/schedule.ts`·`useTimeSlotSelection`·`useScheduleDrag`는 이미 `TimeGridRange` 파라미터를 받도록 설계되어 있어 `TimedGrid.vue`의 `timeRange` 객체 구성만 상수 → prop으로 교체.

**영향 파일**: `ScheduleCalendar.vue`, `views/WeekView.vue`, `views/DayView.vue`, `TimedGrid.vue` · 테스트: `TimedGrid.spec.ts`, `ScheduleCalendar.spec.ts`

---

### 🟡 난이도 중간

#### [IMP-04] 드래그로 시간 슬롯 범위 선택 — ✅ 완료 (2026-07-01, F4-1)

`useTimeSlotSelection` composable로 구현 완료. 상세는 [framework-roadmap.md](./framework-roadmap.md) F4-1 참고.

---

#### [IMP-05] 2-week / 3-week 월간 뷰 변형 — ✅ 완료 (2026-07-01, F4-2)

`monthWeekCount?: 2 | 3 | 6` prop 구현 완료. 상세는 [framework-roadmap.md](./framework-roadmap.md) F4-2 참고.

---

### 🔴 난이도 높음 (보류)

#### [IMP-06] 드래그&드롭 이벤트 이동·리사이즈 — ✅ 완료 (2026-07-01, F4-4)

`useScheduleDrag` composable로 구현 완료. 상세는 [framework-roadmap.md](./framework-roadmap.md) F4-4 참고.

#### [IMP-07] 타임존 지원 (제외)

`date.ts`, `utils/timed.ts` 전체가 로컬 `Date` 기반. 전환 비용 대비 ROI 낮음.

---

## 컴포넌트 분리 백로그

> CMP-01 `CalendarMonthNav` ✅ 완료 (2026-06-10)

> CMP-02 `MonthCell` ✅ 완료 (2026-07-01, SRV-P1-03) · CMP-04 `TimedGridAllDay` ✅ 완료 (2026-07-01, SRV-P1-03) · CMP-07 `TimedGridHeader` ✅ 완료 (2026-07-01, SRV-P1-03)

### 높은 우선순위 (필요 시 재개)

| ID | 후보 컴포넌트 | 대상 파일 | 예상 효과 |
| -- | ------------ | --------- | --------- |
| CMP-03 | `MonthWeekSpanningBars` | `MonthView.vue` | 멀티데이 All Day 오버레이 분리 |
| CMP-05 | `TimedGridTimeBody` | `TimedGrid.vue` (495줄) | 시간축 + 일정 블록 영역 분리 |

### 중간 우선순위

| ID | 후보 | 대상 | 비고 |
| -- | ---- | ---- | ---- |
| CMP-06 | `TimedEventBlock` | `TimedGrid.vue` | `%` 위치 스타일 + 칩 + 시간 라벨 |
| CMP-08 | `CurrentTimeIndicator` | `TimedGrid.vue` | 현재 시각 선·badge |
| CMP-09 | `MonthWeekdayHeader` | `MonthView.vue` | IMP-02 완료로 `weekdayLabels` prop 자체는 해소됨 — 남은 건 순수 마크업 분리 |
| CMP-10 | `ListFilterBar` | `ListView.vue` | 날짜 필터 바 UI |
| CMP-11 | `useMonthOverflowPopover` | `MonthView.vue` | 팝오버 state·앵커 계산 composable |

### 비권장

| ID | 이유 |
| -- | ---- |
| CMP-X1 Month/Week 공통 `AllDayBarSlot` | 그리드·CSS 컨텍스트 상이, 추상화 비용 > 이득 |
| CMP-X2 `ScheduleEventChip` + `AllDayBar` 통합 | 역할 다름 |
| CMP-X3 `WeekView`/`DayView` 추가 분리 | 이미 `TimedGrid` 래퍼 수준 (~75줄) |

---

## 테스트 커버리지 갭

| ID | 영역 | 우선순위 | 상태 |
| -- | ---- | -------- | ---- |
| GAP-TS-01 | Week/Day `time-slot-select` Playwright E2E | 중 | ✅ 완료 — `e2e/calendar.spec.ts` `describe('GAP-TS-01: ...')` |
| GAP-01 | List 행 `schedule-click` E2E | 중 | ✅ 완료 — `e2e/calendar.spec.ts` `'opens schedule form when a list row is clicked (GAP-01)'` |
| GAP-REF-01 | `resolveCalendarNavigateDate` 단위 spec 보강 | 낮 | ✅ 완료 — `utils/date.spec.ts` today/day/week/month 4건 |

---

## 운영·배포

| ID | 내용 | 상태 |
| -- | ---- | ---- |
| EXT-01 | 공휴일 API 실패 시 graceful degrade UI | 미착수 (DEV `console.warn`만 존재, 사용자 노출 UI 없음) |
| EXT-02 | `fetch-public-holidays` + SSR/프록시 키 관리 가이드 | ✅ 완료 — `apps/docs/guide/public-holidays.md`(BFF 프록시 패턴), `docs/guide/integration.md`(dev/preview proxy + 프로덕션 BFF 가이드) |
| ~~NPM-01~~ | ~~LICENSE 파일 추가~~ | ✅ 완료 |
| ~~NPM-02~~ | ~~`fetchPublicHolidays` 기본값 `false`~~ | ✅ 완료 |
| ~~NPM-03~~ | ~~Changesets 자동 릴리즈 + npm publish CI~~ | ✅ 완료 (2026-07-01) |
| ~~NPM-04~~ | ~~`homepage` → 문서 사이트 URL 반영~~ | ✅ 완료 (2026-07-01, `@vuepkg/calendar@0.2.1`) |

---

## 참고 문서

- [architecture.md](./architecture.md) — 컴포넌트 구조·API
- [staff-review-backlog.md](./staff-review-backlog.md) — Staff Review 추적 원장 (P0~P2, 에이전트 점검용)
- [npm-publish-guide.md](./npm-publish-guide.md) — 배포 전 체크리스트
- [CHANGELOG.md](../../CHANGELOG.md) — 변경 이력
