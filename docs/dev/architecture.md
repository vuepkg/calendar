# @vuepkg/calendar 아키텍처 · API 문서

이식 가능한 스케줄 캘린더 컴포넌트의 내부 구조, API, 뷰별 동작, 유틸리티 상세를 정리한 문서입니다.

| 항목      | 내용                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| 스택      | Vue 3 (Composition API) + TypeScript + Vite 8                                     |
| 빌드      | pnpm workspace + Turborepo (모노레포)                                             |
| UI        | 커스텀 HTML/CSS — PrimeVue 의존성 없음 (List 뷰 포함 전체 네이티브 구현)          |
| 테스트    | Vitest 3.x (calendar 290건 + ui 76건 + core 74건 = 440건), Playwright E2E 150건 (기능 142 + 시각 회귀 8) |
| CI        | GitHub Actions **Node 24** — lint → typecheck → vitest → build → `test:e2e:ci`(142, F3-5 `accessibility.spec.ts` 포함). 시각 회귀 8건은 [visual-regression.yml](../../.github/workflows/visual-regression.yml) 수동 실행 |
| Git hooks | Husky `pre-push` → `pnpm verify:push` (lint + typecheck + vitest) |
| 진입점    | `ScheduleCalendar.vue`                                                            |
| 상태 모델 | **emit-only** — 뷰·날짜 변경은 소비 측 (`v-model` + 핸들러)에서 처리              |

---

## 1. 디렉터리 구조

### 1.0 모노레포 루트 구조 (Phase 0~)

```
vue3-calendar/                   # monorepo 루트 (pnpm workspace)
├── packages/
│   ├── core/                    # @vuepkg/core — 범용 유틸·composable·타입
│   │   └── src/
│   │       ├── utils/date.ts          # 범용 날짜 유틸 (resolveCalendarNavigateDate 제외)
│   │       ├── utils/holiday.ts       # groupHolidaysByDateKey 등
│   │       ├── utils/popover.ts       # 팝오버 위치·flip 계산 (resolvePopoverBounds 등, F2-4 이관)
│   │       ├── types/holiday.ts       # Holiday / HolidayKind 타입
│   │       ├── types/popover.ts       # RectBounds / PopoverLayoutInput·Result (F2-4 이관)
│   │       ├── composables/
│   │       │   └── useControllableState.ts  # controlled/uncontrolled 패턴
│   │       └── index.ts               # barrel
│   ├── theme/                   # @vuepkg/theme — 순수 CSS 디자인 토큰 (JS 0)
│   │   ├── base.css                   # 라이트 테마 (primitive/semantic/component 3계층)
│   │   ├── dark.css                   # 다크 오버라이드 (prefers-color-scheme + .vp-dark)
│   │   └── index.css                  # 진입점
│   ├── ui/                      # @vuepkg/ui — 범용 Vue 3 primitive (Phase 2)
│   │   └── src/
│   │       ├── Button.vue              # 텍스트 버튼
│   │       ├── IconButton.vue          # 정사각형 아이콘 버튼 (‹ ›)
│   │       ├── SegmentedControl.vue    # 단일 선택 토글 그룹 (화살표 키 roving tabindex)
│   │       ├── Chip.vue                # 라벨·태그 셸 (정적/클릭형 공용)
│   │       ├── Popover.vue             # Teleport·backdrop·focus trap·Esc 포함 위치 지정 패널 (F2-4)
│   │       ├── DataTable.vue           # 제네릭 테이블 셸 — 페이지네이션·반응형 컬럼 숨김 (F2-5)
│   │       └── index.ts                # barrel
│   └── calendar/                # @vuepkg/calendar — 배포 패키지
│       └── src/
│           ├── (기존 src/ 내용 — 아래 §1.1 참고)
├── tooling/tsconfig/            # 공유 tsconfig 프리셋
├── .changeset/                  # 멀티패키지 버저닝 (changesets)
├── .github/workflows/ci.yml     # turbo run lint test build:lib
├── pnpm-workspace.yaml
├── turbo.json
└── package.json                 # private workspace root
```

### 의존성 방향 (단방향)

```
@vuepkg/core  ←  @vuepkg/ui  ←  @vuepkg/calendar
```

`@vuepkg/core`·`@vuepkg/ui`는 calendar에 번들링됩니다. 소비자는 `@vuepkg/calendar`만 설치하면 됩니다.

### 1.1 packages/calendar/src/ 내부 구조

```
packages/calendar/src/
├── App.vue                      # 데모 앱 (v-model + 이벤트 핸들러)
├── components/calendar/
│   ├── ScheduleCalendar.vue     # 메인 컨테이너 (emit-only)
│   ├── CalendarToolbar.vue      # Month/Week/Day/List 탭 (@vuepkg/ui SegmentedControl 소비)
│   ├── CalendarMonthNav.vue     # ‹ YYYY-MM › (Month/List 공통, @vuepkg/ui IconButton 소비)
│   ├── CalendarPeriodNav.vue    # Today + ‹ › (Week/Day, @vuepkg/ui Button/IconButton 소비)
│   ├── TimedGrid.vue            # Week/Day 공통 그리드 (336줄, 시간축 + composable 오케스트레이션)
│   ├── TimedGridHeader.vue      # Week/Day 요일·날짜 헤더 행 (SRV-P1-03 분리)
│   ├── TimedGridAllDay.vue      # 공휴일 칩 + All Day spanning 바 (SRV-P1-03 분리)
│   ├── TimedGridDayColumn.vue   # 일자별 컬럼 — 시간 슬롯 선택·드래그 ghost·현재 시각 선·일정 블록 (SRV-P1-05 분리)
│   ├── MonthCell.vue            # 월간 날짜 셀 (키보드 a11y — role=gridcell, SRV-P1-01/P1-03 분리)
│   ├── HolidayChip.vue          # 공휴일·기념일 붉은 칩 (@vuepkg/ui Chip 소비)
│   ├── AllDayBar.vue            # 종일/멀티데이 spanning 바
│   ├── ScheduleEventChip.vue    # 일정 칩 (클릭 emit, @vuepkg/ui Chip 소비)
│   ├── ScheduleFormModal.vue    # 일정 생성/수정 모달 (431줄 — @vuepkg/ui Dialog 소비, F4-3/F4-5)
│   ├── RecurrenceFields.vue     # 반복 규칙 UI(빈도·간격·요일·종료조건) — SRV-P2-08 분리
│   ├── MonthOverflowPopover.vue # +N 팝오버 (@vuepkg/ui Popover 소비)
│   ├── views/
│   │   ├── MonthView.vue        # weekdayLabels/monthWeekCount prop (IMP-02, F4-2)
│   │   ├── WeekView.vue         # startHour/endHour prop 전달 (IMP-03)
│   │   ├── DayView.vue          # startHour/endHour prop 전달 (IMP-03)
│   │   └── ListView.vue         # async (defineAsyncComponent), @vuepkg/ui DataTable 소비
│   └── index.ts                 # 컴포넌트(Vue SFC) + `export * from '@/headless'` (재export)
├── headless.ts                  # 헤드리스 서브패스(`@vuepkg/calendar/headless`) 단일 출처 — composable·유틸·타입만, Vue SFC 없음 (SRV-P2-11)
├── composables/
│   ├── useCalendar.ts           # 파생 데이터·표시 상태 (내부)
│   ├── usePublicHolidays.ts     # 공공데이터포털 공휴일 조회·연도 캐시, TTL 재시도 (SRV-P2-02)
│   ├── useScheduleCalendarHost.ts  # emit-only 부모 연동 composable
│   ├── useMonthMeasuredCellHeight.ts  # 월간 셀 동적 높이 측정
│   ├── useTimeSlotSelection.ts  # Week/Day 드래그 시간 슬롯 선택 (F4-1)
│   └── useScheduleDrag.ts       # Week/Day 이벤트 이동·리사이즈 DnD (F4-4)
├── constants/
│   └── calendarView.ts          # TIMED_VIEW_*, MONTH_CELL_*, SCHEDULE_TYPE_OPTIONS 통합
├── data/
│   └── mockSchedules.ts         # mockSchedules + mockCompanyHolidays (데모용)
├── services/
│   └── publicHolidaysApi.ts     # SpcdeInfoService/getRestDeInfo
├── styles/
│   └── calendarScroll.css
├── types/
│   ├── index.ts                 # 공개 barrel
│   ├── schedule.ts              # Schedule, Holiday(→@vuepkg/core re-export), ScheduleDraft …
│   ├── calendarEvents.ts        # emit payload
│   ├── e2e.ts                   # HostLayoutId (E2E 전용)
│   └── layout.ts                # Month/Timed/AllDay·overflow 레이아웃 타입
└── utils/
    ├── date.ts                  # @vuepkg/core re-export + resolveCalendarNavigateDate
    ├── holiday.ts               # @vuepkg/core re-export
    ├── schedule.ts              # filter · query · crud · layout · TimeGridRange 계산
    ├── month.ts                 # barLayout · cell · overflow
    ├── timed.ts                 # allDay · currentTime · timeSlot 통합
    ├── recurrence.ts            # expandRecurringSchedules — RRULE 서브셋 회차 전개 (F4-5)
    └── scheduleForm.ts          # withDateKeepingTime · combineDateAndTime — ScheduleFormModal/RecurrenceFields 공유 (SRV-P2-08)
```

---

## 2. 아키텍처

### 2.1 이벤트 흐름

```
[사용자 클릭]
    ↓
MonthView / WeekView / DayView / ListView / CalendarToolbar
    ↓ (내부 emit)
ScheduleCalendar.handleXxx()
    ↓ (외부 emit — 상태 변경 없음)
App.vue 핸들러
    ↓
v-model:view / date / listFilterDate 갱신 + schedules prop
    ↓
useCalendar → 뷰 리렌더
```

### 2.2 번들 최적화

- **ListView lazy import** — `defineAsyncComponent`로 List 탭 진입 시 로드 (PrimeVue 없이 순수 Vue)
- **manualChunks** — `list-view` 청크 분리 (데모 앱 빌드 기준, 라이브러리 빌드는 별도 설정)

---

## 3. `ScheduleCalendar.vue` API

### Props

| Prop                      | 타입         | 필수 | 설명                                                                              |
| ------------------------- | ------------ | ---- | --------------------------------------------------------------------------------- |
| `schedules`               | `Schedule[]` | ✅   | 표시할 일정 목록 (부모가 scope·CRUD 반영 후 전달)                                 |
| `holidays`                | `Holiday[]`  | —    | 사내 기념일 등 (공공 API와 병합)                                                  |
| `fetch-public-holidays`   | `boolean`    | —    | 공공 API 자동 조회. 기본 `false` — opt-in                                         |
| `public-holiday-service-key` | `string`  | —    | 공공데이터포털 인증키. proxy/BFF 사용 시 생략                                     |
| `hide-toolbar`            | `boolean`    | —    | `true`이면 뷰 전환 툴바 숨김. 부모가 `v-model:view`로 뷰를 직접 제어할 때 사용   |
| `schedule-type-options`   | `ScheduleTypeOption[]` | — | 일정 유형 목록 (색상·라벨). 기본값 `SCHEDULE_TYPE_OPTIONS` (3종). 커스텀 타입 추가 시 사용 |
| `month-week-count`        | `2 \| 3 \| 6` | `6` | 월간 뷰 표시 주 수 — `2`\|`3`이면 선택 날짜 기준 축소 뷰 (F4-2) |
| `weekday-labels`          | `string[]`   | `['SUN'...'SAT']` | 월간 뷰 요일 헤더 라벨, 일~토 순서 7개 (IMP-02) |
| `start-hour`              | `number`     | `0`  | Week/Day 시간 그리드 시작 시각 0~23 (IMP-03) |
| `end-hour`                | `number`     | `23` | Week/Day 시간 그리드 종료 시각 0~23 (IMP-03) |
| `locale`                  | `string`     | —    | `Intl.DateTimeFormat` locale — 월간 요일 헤더·Week/Day 요일 라벨 자동 현지화. `weekdayLabels` 명시 시 그 값이 우선 (F3-3) |

### v-model

| Model                      | 타입                     | 기본값       | 설명                               |
| -------------------------- | ------------------------ | ------------ | ---------------------------------- |
| `v-model:view`             | `CalendarView`           | `'month'`    | 현재 뷰                            |
| `v-model:date`             | `Date`                   | `new Date()` | 현재 선택 날짜 (오늘)              |
| `v-model:list-filter-date` | `Date \| null`           | `null`       | List 뷰 날짜 필터                  |
| `v-model:view-scope`       | `ViewScope`              | `'company'`  | My / Company 필터                  |
| `v-model:schedule-types`   | `string[] \| null`       | `null`       | Schedule Type 필터 (`null` = 전체). 커스텀 타입 문자열 사용 가능 |

### Emits

| 이벤트              | Payload                                              | 발생 시점                           |
| ------------------- | ---------------------------------------------------- | ----------------------------------- |
| `view-change`       | `{ view, previousView }`                             | 탭 클릭                             |
| `date-select`       | `{ date, source }`                                   | 월간 셀, Week 날짜 헤더 클릭        |
| `overflow-click`    | `{ date, hiddenCount, schedules, visibleSchedules }` | 월간 `+N` 클릭                      |
| `schedule-click`    | `{ schedule, source, date? }`                        | 칩·All Day·시간 일정·List 행        |
| `navigate`          | `{ action, date }`                                   | Today·‹› (월/주/일)                 |
| `list-filter-clear` | —                                                    | List 필터 바 Clear                  |
| `query-change`      | `ScheduleQueryChangePayload`                         | init·navigate·view-change·필터 변경 |
| `time-slot-select`  | `{ date, start, end, source }`                       | Week/Day 시간 그리드 빈 셀 클릭 (F4-1) |
| `schedule-move`     | `CalendarScheduleMovePayload`                        | Week/Day 이벤트 드래그 이동 확정 (F4-4) |
| `schedule-resize`   | `CalendarScheduleResizePayload`                      | Week/Day 이벤트 드래그 리사이즈(end 시각) 확정 (F4-4) |

**`source` / `action` 값**

| 분류                      | 값                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `date-select` source      | `month-cell` \| `week-day-header`                                                                                           |
| `schedule-click` source   | `month-chip` \| `month-all-day-bar` \| `week-all-day-bar` \| `day-all-day-bar` \| `week-timed` \| `day-timed` \| `list-row` |
| `time-slot-select` source | `week-timed-slot` \| `day-timed-slot`                                                                                       |
| `navigate` action         | `today` \| `prev-day` \| `next-day` \| `prev-week` \| `next-week` \| `prev-month` \| `next-month`                           |

---

## 4. Composable API

### `useCalendar`

| API                                                     | 설명                                     |
| ------------------------------------------------------- | ---------------------------------------- |
| `state.selectedDate` / `currentView` / `listFilterDate` | v-model 연동 상태                        |
| `monthCells`                                            | 월간 42칸 + 일정·공휴일·hiddenCount      |
| `weekDays`                                              | 선택일 기준 7일                          |
| `listRows`                                              | List 테이블 행 (Period = `formatPeriod`) |
| `monthLabel`                                            | `YYYY-MM`                                |
| `getTypeStyle(type)`                                    | 일정 유형별 색상                         |
| `holidays`                                              | prop 그대로 노출 (Week/Day 전달용)       |

### `useScheduleCalendarHost`

부모 연동 진입점. v-model ref + 권장 emit 핸들러를 반환합니다.

```ts
const {
  view,
  date,
  listFilterDate,
  viewScope,
  scheduleTypes,
  calendarListeners, // v-on="calendarListeners"로 바인딩
} = useScheduleCalendarHost({
  initialView: 'month',
  onQueryChange(payload) {
    /* API 조회 */
  },
  onScheduleClick(payload) {
    /* 상세 모달 등 */
  },
  onTimeSlotSelect(payload) {
    /* 일정 생성 — payload.start / payload.end */
  },
})
```

### `usePublicHolidays`

| API                        | 설명                                           |
| -------------------------- | ---------------------------------------------- |
| `publicHolidays`           | 로드된 공휴일 ref                              |
| `loading` / `error`        | 비동기 상태                                    |
| `ensureYearsForDate(date)` | 해당 연도 + 경계 연도 공휴일 확보 (1회만 요청) |

---

## 5. 뷰별 동작

### 5.0 네비게이션 컴포넌트

| 컴포넌트            | 사용 뷰     | 역할                                      |
| ------------------- | ----------- | ----------------------------------------- |
| `CalendarMonthNav`  | Month, List | `‹ YYYY-MM ›` 월 이동 (`@prev` / `@next`) |
| `CalendarPeriodNav` | Week, Day   | Today + `‹ ›` + 기간 라벨                 |

List 뷰는 `CalendarMonthNav` 사용 전 필터가 있으면 `list-filter-clear`를 먼저 emit합니다.

### 5.1 Month (월간)

- 6주×7열 그리드, **부모 높이에 맞춰 균등 분할** (`useMonthMeasuredCellHeight`)
- 상단 `CalendarMonthNav` → `navigate` (`prev-month` / `next-month`)
- 멀티데이 종일 → 주 단위 오버레이 spanning 바 (`AllDayBar`)
- 단일일 종일 + 시간 → 셀 내 칩 리스트
- overflow: 가용 높이 계산 후 `+N` 표시 → `MonthOverflowPopover`
- 공휴일 칩: 공휴일 1건당 칩 슬롯 1개 감소

| 동작             | emit                                     |
| ---------------- | ---------------------------------------- |
| 셀 클릭          | `date-select` (`month-cell`)             |
| `+N` 클릭        | `overflow-click`                         |
| 칩 클릭          | `schedule-click` (`month-chip`)          |
| spanning 바 클릭 | `schedule-click` (`month-all-day-bar`)   |
| `‹` `›`          | `navigate` (`prev-month` / `next-month`) |

### 5.2 Week (주간)

- `CalendarPeriodNav` + `TimedGrid` (7일)
- All Day 영역 상단에 `HolidayChip`
- 겹치는 시간 일정 → 컬럼 분할 (`assignColumns`)
- 헤더 클릭 → `date-select` (`week-day-header`) → 부모가 Day 뷰로 전환 가능
- 빈 시간 셀 클릭 → `time-slot-select` (`week-timed-slot`) — 1시간 단위 `start`/`end`

### 5.3 Day (일간)

- `TimedGrid` single-day 모드
- 파란 현재 시각 선 (`show-current-time`)
- 분 단위 배치 (09:35~12:25 등, 정시 스냅 없음)
- 빈 시간 셀 클릭 → `time-slot-select` (`day-timed-slot`)

### 5.4 List (목록)

- 네이티브 `<table>` (lazy load — PrimeVue 불필요)
- 상단 월 네비 (`‹ YYYY-MM ›`)
- 컬럼: No, Title, Type, Participant, Period
- `listFilterDate` 없음 → 해당 월 전체 / 있음 → 해당 일만 + 필터 바
- 페이지네이션: 10건/페이지, `listRows` 변경 시 첫 페이지 복귀
- 행 클릭 → `schedule-click` (`list-row`), 키보드 `Enter`/`Space` 지원
- 반응형: ≤768px Period·Type 컬럼 숨김, ≤480px Participant 숨김

---

## 6. 유틸리티 함수

### `date.ts` (`@vuepkg/core/utils/date` + calendar re-export)

범용 날짜 유틸은 `packages/core/src/utils/date.ts`에 정의되고, calendar의 `src/utils/date.ts`가 re-export합니다.

| 함수 | 위치 | 역할 |
| ---- | ---- | ---- |
| `startOfDay` / `endOfDay`     | core | 00:00:00 / 23:59:59.999 정규화     |
| `isSameDay` / `isSameMonth`   | core | 동일 날·월 비교                    |
| `addDays` / `addMonths`       | core | 날짜 이동                          |
| `toDateKey`                   | core | `YYYY-MM-DD` 문자열 키             |
| `formatMonthLabel`            | core | `YYYY-MM`                          |
| `formatDayViewDate`           | core | `YYYY-MM-DD`                       |
| `formatPeriod`                | core | List Period 컬럼 (`start~end`)     |
| `getMonthGridDays`            | core | 6주×7열 = 42칸 `Date[]`            |
| `getWeekDays`                 | core | 선택일 기준 7일 `Date[]`           |
| `clampDateToRange`            | core | 그리드 표시 구간 경계로 자름       |
| `resolveCalendarNavigateDate` | calendar | `navigate` action → 이동 후 `Date` (CalendarNavigateAction 의존) |

### `schedule.ts` — layout

- `layoutTimedSchedules` — 겹침 감지 후 `top`/`height`/`left`/`width` (%) 계산
- `getSchedulesForDay` — 해당 날짜 교차 일정
- `getTimedGridHeight(range)` — `TimeGridRange`(`startHour`/`endHour`/`hourHeightPx`) 기반 그리드 총 높이(px). 전 함수가 `TimeGridRange` 파라미터를 받아 기본값(0~23시)을 오버라이드할 수 있음 (IMP-03 `startHour`/`endHour` prop이 이 위에서 동작)
- 최소 블록 높이: 15분

### `schedule.ts` — filter/query/crud

| 함수                          | 역할                   |
| ----------------------------- | ---------------------- |
| `filterSchedulesByScope`      | My/Company 필터        |
| `applyScheduleFilters`        | scope + type 복합 필터 |
| `filterSchedulesForListDate`  | List 날짜 필터         |
| `filterSchedulesForListMonth` | List 월 필터           |
| `buildScheduleFromDraft` / `upsertSchedule` / `removeSchedule` | `ScheduleFormModal` CRUD 헬퍼 (F4-3) |

### `month.ts` — barLayout/cell/overflow

- 주 단위 spanning (`span > 1`만 오버레이)
- `chipVisible`, `hiddenScheduleCount` per cell
- 공휴일 수만큼 `maxChipSlots` 감소
- `sliceMonthCellsForWeekCount` — `monthWeekCount`(2\|3\|6) 기준 표시 주 윈도우 계산 (F4-2)

### `timed.ts` — allDay/currentTime/timeSlot

| 함수                        | 역할                                   |
| --------------------------- | -------------------------------------- |
| `getCurrentTimeIndicator`   | Week/Day 현재 시각 선 위치·라벨 (startHour/endHour 파라미터화) |
| `isToday`                   | 오늘 여부                              |
| `resolveTimeSlotFromOffset` | 빈 셀 클릭 Y좌표 → `TimeGridRange` 기준 `start`/`end` |
| `getTimeSlotSelectionStyle` | 선택 슬롯 하이라이트 `%` 스타일        |
| `layoutWeekAllDayBars` / `getAllDayRowCount` | Week All Day 바 겹침 배치 |

### `recurrence.ts` (F4-5)

- `expandRecurringSchedules(schedules, range)` — `RecurrenceRule`(daily/weekly/monthly/yearly, interval/count/until/exceptions 서브셋)을 표시 기간 내 개별 회차 `Schedule[]`로 전개
- 전개된 가상 회차에는 `recurrenceId`(마스터 참조)가 붙음 — `@internal` 표시 필드

---

## 7. 타입 정의

**규칙**: 공개 interface/type은 `src/types/`에만 정의합니다. composable·utils·service는 import만 합니다.

| 파일                | 주요 타입                                                            |
| ------------------- | -------------------------------------------------------------------- |
| `schedule.ts`       | `Schedule`, `RecurrenceRule`, `Participant`, `Holiday`, `UseCalendarOptions`, `MonthWeekCount`, `ScheduleDraft` |
| `composable.ts`     | `CalendarContext`, `UsePublicHolidaysOptions`                        |
| `calendarEvents.ts` | emit payload (`CalendarTimeSlotSelectPayload` 등)                    |
| `query.ts`          | `ScheduleQueryChangePayload`, `BuildScheduleQueryChangePayloadInput` |
| `layout.ts`         | `MonthDayCell`, `TimedLayoutItem` (`RectBounds`는 F2-4부터 `@vuepkg/core`에서 재노출) |
| `host.ts`           | `UseScheduleCalendarHostOptions`                                     |
| `api.ts`            | `FetchPublicHolidaysOptions`                                         |
| `e2e.ts`            | `HostLayoutId` (E2E·이식 제외)                                       |

```ts
interface Schedule {
  id: string
  title: string
  type: string // 임의 문자열 — 기본 제공 리터럴은 ScheduleType 참고
  participantId: string
  participantName: string
  start: Date
  end: Date
  remarks?: string // 부가 설명
  allDay?: boolean // true면 All Day 행·월간 바 레이아웃
  recurrence?: RecurrenceRule // 반복 규칙 — expandRecurringSchedules가 표시 기간 내 회차 생성 (F4-5)
  recurrenceId?: string // @internal — 전개된 가상 회차의 마스터 id (시리즈 전체 수정/삭제 시 사용)
  isRecurrenceInstance?: boolean // @internal — 전개된 가상 회차 여부
}

// 기본 제공 일정 유형 리터럴 (편의용 — string이므로 확장 가능)
type ScheduleType = 'my_schedule' | 'team_schedule' | 'company_schedule'

// 반복 규칙 (F4-5) — daily/weekly/monthly/yearly 서브셋 RRULE
interface RecurrenceRule {
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval?: number
  byWeekday?: number[] // weekly에서 사용, 0=일요일
  count?: number
  until?: Date
  exceptions?: string[] // 삭제된 단일 회차 날짜 (`YYYY-MM-DD`) — 해당 회차만 건너뜀
}

// 소비자 커스텀 타입 등록
interface ScheduleTypeOption {
  type: string        // Schedule.type과 매핑
  label: string
  color: string
  backgroundColor: string
}

interface Holiday {
  id: string
  dateKey: string // 'YYYY-MM-DD'
  name: string
  kind: 'public' | 'company'
}

type CalendarView = 'month' | 'week' | 'day' | 'list'
type ViewScope = 'my' | 'company'
```

---

## 8. 상수 (`constants/calendarView.ts`)

| 상수                        | 값        | 설명                     |
| --------------------------- | --------- | ------------------------ |
| `TIMED_VIEW_START_HOUR`     | 0         | 시간 그리드 시작 (00:00) |
| `TIMED_VIEW_END_HOUR`       | 23        | 종료 (23:00)             |
| `TIMED_VIEW_HOUR_HEIGHT_PX` | 48        | 1시간 행 높이            |
| `MONTH_CELL_CHIP_HEIGHT_PX` | 18        | 월간 칩 높이             |
| `HOLIDAY_CHIP_BACKGROUND`   | `#ffebee` | 공휴일 칩 배경           |
| `HOLIDAY_CHIP_COLOR`        | `#c62828` | 공휴일 칩 텍스트         |

`CALENDAR_START_HOUR`, `CALENDAR_END_HOUR`, `HOUR_HEIGHT_PX`는 `calendarView.ts` re-export 별칭입니다. `TimedGrid`/`WeekView`/`DayView`의 `startHour`/`endHour` prop 기본값으로 쓰이며, 소비자가 prop으로 오버라이드하면 이 상수는 무시됩니다 (IMP-03).

---

## 9. 공휴일 API

| 항목       | 내용                                                          |
| ---------- | ------------------------------------------------------------- |
| API        | 공공데이터포털 — 한국천문연구원 특일 정보                     |
| 엔드포인트 | `SpcdeInfoService/getRestDeInfo`                              |
| 구현       | `src/services/publicHolidaysApi.ts`                           |
| Composable | `usePublicHolidays` — 연도별 캐시, `ensureYearsForDate(date)` |
| 인증키     | `.env.local` → `DATA_GO_KR_SERVICE_KEY` (Decoding 키, `VITE_` 접두사 없음 — 번들 미포함) |
| 개발 CORS  | `vite.config.ts` — `/api/spcde` 프록시 → `apis.data.go.kr`    |

---

## 10. 테스트 구조

### 단위·컴포넌트 (Vitest — calendar 290건 + ui 76건 + core 74건 = 440건)

| 스펙                              | 검증                                                |
| --------------------------------- | --------------------------------------------------- |
| `CalendarMonthNav.spec.ts`        | Month/List 공통 월 네비 label·prev/next emit        |
| `ScheduleCalendar.spec.ts`        | emit-only, `time-slot-select`, API+`:holidays` 병합, `monthWeekCount`/`weekdayLabels`/`startHour`/`endHour` 전달 (37건) |
| `MonthView.spec.ts`               | 칩·spanning bar·공휴일·`+N` 팝오버, `monthWeekCount`, `weekdayLabels` (IMP-02) |
| `MonthOverflowPopover.spec.ts`    | 임베디드 bounds 기반 max 크기                       |
| `TimedGrid.spec.ts`               | 공휴일 칩, `time-slot-select`, DnD 이동/리사이즈(F4-4), `startHour`/`endHour` 범위 (IMP-03) |
| `ScheduleFormModal.spec.ts`       | create/edit/delete, 반복 규칙 UI (F4-3, 16건)       |
| `ListView.spec.ts`                | 월 네비, Clear                                      |
| `useCalendar.spec.ts`             | 파생 데이터, `formatPeriod` Period 컬럼             |
| `usePublicHolidays.spec.ts`       | 연도 캐시 TTL 재시도, `loading` computed (SRV-P2-02) |
| `useScheduleCalendarHost.spec.ts` | 핸들러·`time-slot-select`·`onScheduleMove`/`onScheduleResize` |
| `schedule.spec.ts`                | 겹침 컬럼 분할·필터·CRUD 헬퍼 (26건)                |
| `month.spec.ts`                   | spanning·공휴일 슬롯·week-count 윈도우 (25건)       |
| `timed.spec.ts`                   | 현재 시각·time-slot offset·하이라이트 스타일 (14건) |
| `recurrence.spec.ts`              | `expandRecurringSchedules` RRULE 서브셋 (F4-5, 13건) |
| `constants/timedView.spec.ts`     | `calendarView.ts` 상수 (파일명 레거시)              |

`resolveCalendarNavigateDate`는 `utils/date.spec.ts`에 today/day/week/month 4건 전용 spec으로 검증합니다 (GAP-REF-01).
팝오버 bounds·flip 계산 테스트는 F2-4에서 `@vuepkg/core`의 `popover.spec.ts`로 이관됐습니다.

**`@vuepkg/ui` (Phase 2 primitive, 76건)**

| 스펙                       | 검증                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| `Button.spec.ts`           | weight·type prop, attribute fallthrough(class/disabled), click    |
| `IconButton.spec.ts`       | ariaLabel·size·type prop, click                                   |
| `SegmentedControl.spec.ts` | role=group, aria-pressed, roving tabindex, 화살표/Home/End 키보드 |
| `Chip.spec.ts`             | clickable role/keyboard, color/backgroundColor 인라인 오버라이드  |
| `Popover.spec.ts`          | role=dialog, backdrop/Esc close, Tab/Shift+Tab focus trap, 닫힘 시 focus 복원, 위치 스타일 적용 |
| `DataTable.spec.ts`        | 헤더·셀 슬롯 렌더링, hideBelow 클래스, empty 메시지, row-click(클릭/Enter/Space), 페이지네이션(controlled/uncontrolled), ariaLabel |
| `Dialog.spec.ts`           | focus trap·Esc·Tab cycle·backdrop (F2-7, `ScheduleFormModal` 기반) |

**`@vuepkg/core` (74건)** — `utils/date.spec.ts`(45, F3-3 locale 4건 포함) · `utils/holiday.spec.ts`(14) · `composables/useControllableState.spec.ts`(10) · `utils/popover.spec.ts`(5, F2-4 이관)

### E2E (Playwright — 150건 = 기능 142 + 시각 회귀 8)

| 스펙                                | CI (`test:e2e:ci`) |
| ----------------------------------- | -------------------- |
| `calendar.spec.ts`                  | ✅ (GAP-01, GAP-TS-01 포함) |
| `calendar-responsive.spec.ts`       | ✅                    |
| `calendar-host-integration.spec.ts` | ✅                    |
| `accessibility.spec.ts` (F3-5, `@axe-core/playwright`) | ✅            |
| `visual-regression.spec.ts`         | ❌ (수동·별도 workflow) |

**테스트 계층 정책**

| 계층 | 명령 | 언제 |
| ---- | ---- | ---- |
| 단위·컴포넌트 | `pnpm test` (Vitest 429건) | **CI** + Husky `pre-push` (`verify:push`) |
| 기능 E2E | `pnpm test:e2e:ci` (142건) | **CI** — push/PR마다 |
| 시각 회귀 E2E | `pnpm test:e2e:visual` (8건) | **CI 제외** — UI/CSS 변경 시 로컬 또는 GitHub Actions `Visual Regression` workflow 수동 실행 |

시각 회귀를 push마다 CI에 넣지 않는 이유: (1) Chromium·폰트 렌더링이 runner마다 달라 픽셀 단위 flaky, (2) 전체 E2E 대비 시간 대비 신호가 낮음, (3) Windows 개발자는 `*-win32` / CI는 `*-linux` baseline이 분리됨.

**시각 회귀 스냅샷** (UI 변경 시에만):

```bash
pnpm test:e2e:visual                                    # 로컬 검증 (Windows → win32 baseline)
pnpm --filter @vuepkg/calendar run test:e2e:update-snapshots:linux  # Linux baseline 갱신 (Docker)
```

GitHub: Actions → **Visual Regression** → Run workflow.

**Husky `pre-push`**: `pnpm verify:push` (= lint + typecheck + vitest). E2E·시각 회귀는 포함하지 않음 — 느리고 OS 의존적이기 때문. UI PR 전에는 `test:e2e:visual`을 수동 실행한다.

```bash
pnpm test              # Vitest
pnpm test:e2e:ci       # 기능 E2E (CI와 동일)
pnpm test:e2e:visual   # 시각 회귀만
pnpm test:e2e          # E2E 전체 (142 + 8)
```

---

## 11. 로컬 개발 시작하기

> **요구사항**: Node 24+ (CI 기준), pnpm 9+. `npm i -g pnpm`으로 설치.

```bash
# 저장소 루트에서 (core + theme + ui + calendar 동시 설치)
pnpm install   # Husky pre-push 훅 자동 등록 (prepare 스크립트)
cp packages/calendar/.env.example packages/calendar/.env.local  # 공휴일 API 키 (선택)
pnpm dev           # packages/calendar dev 서버 — http://localhost:6565
```

### 주요 명령

| 명령 | 용도 |
| ---- | ---- |
| `pnpm verify:push` | push 전 로컬 검증 (lint + typecheck + vitest) — Husky `pre-push`와 동일 |
| `pnpm turbo run typecheck` | 전체 타입 검사 |
| `pnpm turbo run test` | Vitest 단위 테스트 — calendar 290건 + ui 76건 + core 74건 |
| `pnpm turbo run build:lib` | core + ui + calendar 라이브러리 빌드 |
| `pnpm test:e2e:ci` | Playwright 기능 E2E 142건 (CI와 동일) |
| `pnpm test:e2e:visual` | Playwright 시각 회귀 8건 (UI/CSS 변경 시) |
| `pnpm test:e2e` | E2E 전체 145건 |

#### 단일 패키지 작업 시 (빠른 반복)

```bash
pnpm --filter @vuepkg/calendar run test
pnpm --filter @vuepkg/calendar run typecheck
pnpm --filter @vuepkg/core run build:lib
```

### Path alias

| alias | 해석 경로 | 적용 범위 |
| ----- | --------- | --------- |
| `@/` | `packages/calendar/src/` | calendar 내부 — dev/test/lib 빌드 전체 |
| `@vuepkg/core` / `@vuepkg/ui` | `packages/core/src/` / `packages/ui/src/` (원시 소스, dev·test 전용) | `vitest.config.ts`에만 존재 — 빌드 없이 즉시 테스트하기 위함 |
| `@vuepkg/theme` | `packages/theme/` (순수 CSS, 별도 빌드 불필요) | dev/test/lib 빌드 전체 |

> **SRV-P1-02 (2026-07-02)**: `vite.lib.config.ts`(라이브러리 빌드)와 `vite.config.ts`(데모 앱)는 `@vuepkg/core`/`@vuepkg/ui` alias가 **없다** — workspace symlink(node_modules) 경유로 실제 `dist/`를 참조한다. `vue-tsc`가 원래 쓰던 것과 동일한 해석 경로라 dts가 깨끗해진다. 단, 이 두 빌드는 `packages/core/dist`·`packages/ui/dist`가 미리 존재해야 하며, `pnpm turbo run build:lib`/`dev`(둘 다 `turbo.json`에서 `dependsOn: ["^build:lib"]`)가 순서를 보장한다. `@vuepkg/ui`의 컴포넌트 CSS(`dist/style.css`)는 alias로 자동 추출되지 않으므로 `ScheduleCalendar.vue`가 `@import '@vuepkg/ui/style.css'`로 명시적으로 가져온다.

### 빌드 엔트리 (SRV-P2-11, 2026-07-02)

`vite.lib.config.ts`의 `build.lib.entry`는 두 개다: `index`(`src/components/calendar/index.ts`, Vue SFC 포함) / `headless`(`src/headless.ts`, composable·유틸·타입만). Rollup이 두 엔트리의 공통 코드를 공유 청크(`dist/headless-*.js`)로 자동 분리하므로, `@vuepkg/calendar/headless`만 import하면 스타일드 컴포넌트 없이 로직 청크만 로드된다. `src/headless.ts`가 export의 단일 출처이고 메인 엔트리는 `export * from '@/headless'`로 재export — 새 headless-eligible export를 추가할 때는 `headless.ts`에만 추가하면 된다. `vite.lib.config.ts`의 `dts({ include })` 배열에 `src/headless.ts`를 반드시 포함해야 `dist/headless.d.ts`가 생성된다(빠뜨리면 조용히 타입 없는 subpath가 된다).

### 수정 위치 가이드

| 작업 | 수정 파일 |
| ---- | --------- |
| 일정 칩 UI | `packages/calendar/src/components/calendar/ScheduleEventChip.vue` |
| 새 뷰 타입 추가 | `CalendarView` 타입 → `CalendarToolbar.vue` 탭 → `ScheduleCalendar.vue` |
| 범용 날짜 유틸 | `packages/core/src/utils/date.ts` |
| 공휴일 관련 타입·유틸 | `packages/core/src/types/holiday.ts`, `packages/core/src/utils/holiday.ts` |
| 커스텀 일정 유형 | `scheduleTypeOptions` prop (색상·라벨 매핑) |

---

## 12. 향후 개선

상세·우선순위: [`roadmap.md`](roadmap.md)

| 영역   | 핵심 항목                                                               |
| ------ | ----------------------------------------------------------------------- |
| API    | Timeline/리소스 뷰 (F4-6, 유일한 미착수 로드맵 최우선순위) — `locale`(F3-3)/`weekdayLabels`(IMP-02)/`startHour`·`endHour`(IMP-03)는 완료 |
| UX     | 번들 budget 상향 완료(SRV-P1-04, 20/19/8KB) — `@vuepkg/calendar/headless` 도입(SRV-P2-11)으로 index.js 예산 소진율이 78%→92%로 늘어 F4-6은 번들 크기에 각별히 주의 필요 |
| 테스트 | 시각 회귀 스냅샷 8종 재생성 필요(SRV-P2-12, F3-5 색상 변경 후속) — a11y 자동 점검(F3-5)·roving tabindex(SRV-P2-09)·flaky E2E 수정(SRV-P2-13)은 완료 |
| 운영   | `@vuepkg/calendar/headless` 서브패스(SRV-P2-11) 완료 — 공휴일 API 실패 UI(EXT-01)·프록시 가이드도 완료 |
