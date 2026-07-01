# Roadmap — @vuepkg/calendar

> 최종 갱신: 2026-07-01

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

---

## 기능 개선 백로그

### 🟢 난이도 낮음

#### [IMP-02] `weekdayLabels` prop — 요일 헤더 i18n

**현황**  
`MonthView.vue`에 `['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']`가 하드코딩.

**개선 방향**
- `ScheduleCalendar`에 `weekdayLabels?: string[]` prop 추가
- 미전달 시 영문 기본값 유지 (하위 호환)
- `WeekView`, `DayView` 헤더도 동일하게 적용 검토

**영향 파일**: `views/MonthView.vue`, `TimedGrid.vue`, `ScheduleCalendar.vue`

---

#### [IMP-03] 시간 그리드 시작/종료 시간 prop

**현황**  
`TIMED_VIEW_START_HOUR = 0`, `TIMED_VIEW_END_HOUR = 23` 상수로 고정.

**개선 방향**
- `startHour?: number`, `endHour?: number` prop 추가 (기본 0~23)
- `TimedGrid.vue`로 전달 후 그리드 높이·레이블 계산에 반영

**영향 파일**: `ScheduleCalendar.vue`, `TimedGrid.vue`, `constants/calendarView.ts`, `utils/timed.ts`

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

### 높은 우선순위 (필요 시 재개)

| ID | 후보 컴포넌트 | 대상 파일 | 예상 효과 |
| -- | ------------ | --------- | --------- |
| CMP-02 | `MonthDayCell` | `MonthView.vue` (~480줄) | 셀 UI·이벤트·`+N` 분리, 셀 단위 spec |
| CMP-03 | `MonthWeekSpanningBars` | `MonthView.vue` | 멀티데이 All Day 오버레이 분리 |
| CMP-04 | `TimedGridAllDaySection` | `TimedGrid.vue` (~612줄) | 공휴일 칩 + All Day spanning 분리 |
| CMP-05 | `TimedGridTimeBody` | `TimedGrid.vue` | 시간축 + 일정 블록 영역 분리 |

### 중간 우선순위

| ID | 후보 | 대상 | 비고 |
| -- | ---- | ---- | ---- |
| CMP-06 | `TimedEventBlock` | `TimedGrid.vue` | `%` 위치 스타일 + 칩 + 시간 라벨 |
| CMP-07 | `TimedGridHeader` | `TimedGrid.vue` | 요일·날짜 헤더 행 |
| CMP-08 | `CurrentTimeIndicator` | `TimedGrid.vue` | 현재 시각 선·badge |
| CMP-09 | `MonthWeekdayHeader` | `MonthView.vue` | P3-B `weekdayLabels` prop 수정 지점 단일화 |
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

| ID | 영역 | 우선순위 |
| -- | ---- | -------- |
| GAP-TS-01 | Week/Day `time-slot-select` Playwright E2E | 중 |
| GAP-01 | List 행 `schedule-click` E2E | 중 |
| GAP-REF-01 | `resolveCalendarNavigateDate` 단위 spec 보강 | 낮 |

---

## 운영·배포

| ID | 내용 | 상태 |
| -- | ---- | ---- |
| EXT-01 | 공휴일 API 실패 시 graceful degrade UI | 미착수 |
| EXT-02 | `fetch-public-holidays` + SSR/프록시 키 관리 가이드 | 미착수 |
| ~~NPM-01~~ | ~~LICENSE 파일 추가~~ | ✅ 완료 |
| ~~NPM-02~~ | ~~`fetchPublicHolidays` 기본값 `false`~~ | ✅ 완료 |

---

## 참고 문서

- [architecture.md](./architecture.md) — 컴포넌트 구조·API
- [staff-review-backlog.md](./staff-review-backlog.md) — Staff Review 추적 원장 (P0~P2, 에이전트 점검용)
- [npm-publish-guide.md](./npm-publish-guide.md) — 배포 전 체크리스트
- [CHANGELOG.md](../../CHANGELOG.md) — 변경 이력
