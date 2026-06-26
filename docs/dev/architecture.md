# @vuepkg/calendar 아키텍처 · API 문서

이식 가능한 스케줄 캘린더 컴포넌트의 내부 구조, API, 뷰별 동작, 유틸리티 상세를 정리한 문서입니다.

| 항목      | 내용                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| 스택      | Vue 3 (Composition API) + TypeScript + Vite 8                                     |
| UI        | 커스텀 HTML/CSS — PrimeVue 의존성 없음 (List 뷰 포함 전체 네이티브 구현)          |
| 테스트    | Vitest 3.2.4 (단위 205건), Playwright E2E 126건 (기능 15 + 반응형 42 + 호스트 69) |
| 진입점    | `ScheduleCalendar.vue`                                                            |
| 상태 모델 | **emit-only** — 뷰·날짜 변경은 소비 측 (`v-model` + 핸들러)에서 처리              |

---

## 1. 디렉터리 구조

```
src/
├── App.vue                      # 데모 앱 (v-model + 이벤트 핸들러)
├── components/calendar/
│   ├── ScheduleCalendar.vue     # 메인 컨테이너 (emit-only)
│   ├── CalendarToolbar.vue      # Month/Week/Day/List 탭
│   ├── CalendarMonthNav.vue     # ‹ YYYY-MM › (Month/List 공통)
│   ├── CalendarPeriodNav.vue    # Today + ‹ › (Week/Day)
│   ├── TimedGrid.vue            # Week/Day 공통 그리드 (공휴일 칩 포함)
│   ├── HolidayChip.vue          # 공휴일·기념일 붉은 칩
│   ├── AllDayBar.vue            # 종일/멀티데이 spanning 바
│   ├── ScheduleEventChip.vue    # 일정 칩 (클릭 emit)
│   ├── MonthOverflowPopover.vue # +N 팝오버
│   ├── views/
│   │   ├── MonthView.vue
│   │   ├── WeekView.vue
│   │   ├── DayView.vue
│   │   └── ListView.vue         # async (defineAsyncComponent), 네이티브 <table>
│   └── index.ts                 # 컴포넌트·타입·유틸 barrel export
├── composables/
│   ├── useCalendar.ts           # 파생 데이터·표시 상태 (내부)
│   ├── usePublicHolidays.ts     # 공공데이터포털 공휴일 조회·연도 캐시
│   ├── useScheduleCalendarHost.ts  # emit-only 부모 연동 composable
│   └── useMonthMeasuredCellHeight.ts  # 월간 셀 동적 높이 측정
├── constants/
│   └── calendarView.ts          # TIMED_VIEW_*, MONTH_CELL_*, SCHEDULE_TYPE_OPTIONS 통합
├── data/
│   └── mockSchedules.ts         # mockSchedules + mockCompanyHolidays (데모·이식 제외 가능)
├── services/
│   └── publicHolidaysApi.ts     # SpcdeInfoService/getRestDeInfo
├── styles/
│   └── calendarScroll.css
├── types/
│   ├── index.ts                 # 공개 barrel
│   ├── schedule.ts              # Schedule, Holiday, ScheduleDraft, UseCalendarOptions …
│   ├── calendarEvents.ts        # emit payload
│   ├── composable.ts            # CalendarContext, UsePublicHolidaysOptions …
│   ├── api.ts                   # FetchPublicHolidaysOptions
│   ├── e2e.ts                   # HostLayoutId (E2E 전용)
│   ├── host.ts                  # useScheduleCalendarHost 타입
│   ├── query.ts                 # ScheduleQueryChangePayload, BuildScheduleQueryChangePayloadInput
│   └── layout.ts                # Month/Timed/AllDay·overflow 레이아웃 타입 (통합)
└── utils/
    ├── date.ts                  # 날짜 유틸 + resolveCalendarNavigateDate
    ├── holiday.ts
    ├── schedule/  filter · query · crud · layout
    ├── month/     barLayout · cell · overflow
    └── timed/     allDay · grid   # grid = currentTime + timeSlot 통합
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
| `time-slot-select`  | `{ date, start, end, source }`                       | Week/Day 시간 그리드 빈 셀 클릭     |

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

### `date.ts`

| 함수                          | 역할                               |
| ----------------------------- | ---------------------------------- |
| `startOfDay` / `endOfDay`     | 00:00:00 / 23:59:59.999 정규화     |
| `isSameDay` / `isSameMonth`   | 동일 날·월 비교                    |
| `addDays` / `addMonths`       | 날짜 이동                          |
| `toDateKey`                   | `YYYY-MM-DD` 문자열 키             |
| `formatMonthLabel`            | `YYYY-MM`                          |
| `formatDayViewDate`           | `YYYY-MM-DD`                       |
| `formatPeriod`                | List Period 컬럼 (`start~end`)     |
| `getMonthGridDays`            | 6주×7열 = 42칸 `Date[]`            |
| `getWeekDays`                 | 선택일 기준 7일 `Date[]`           |
| `clampDateToRange`            | 그리드 표시 구간 경계로 자름       |
| `resolveCalendarNavigateDate` | `navigate` action → 이동 후 `Date` |

### `schedule/layout.ts`

- `layoutTimedSchedules` — 겹침 감지 후 `top`/`height`/`left`/`width` (%) 계산
- `getSchedulesForDay` — 해당 날짜 교차 일정
- 최소 블록 높이: 15분

### `schedule/filter.ts`

| 함수                          | 역할                   |
| ----------------------------- | ---------------------- |
| `filterSchedulesByScope`      | My/Company 필터        |
| `applyScheduleFilters`        | scope + type 복합 필터 |
| `filterSchedulesForListDate`  | List 날짜 필터         |
| `filterSchedulesForListMonth` | List 월 필터           |

### `month/barLayout.ts`

- 주 단위 spanning (`span > 1`만 오버레이)
- `chipVisible`, `hiddenScheduleCount` per cell
- 공휴일 수만큼 `maxChipSlots` 감소

### `timed/grid.ts`

| 함수                        | 역할                                   |
| --------------------------- | -------------------------------------- |
| `getCurrentTimeIndicator`   | Week/Day 현재 시각 선 위치·라벨        |
| `isToday`                   | 오늘 여부                              |
| `resolveTimeSlotFromOffset` | 빈 셀 클릭 Y좌표 → 1시간 `start`/`end` |
| `getTimeSlotSelectionStyle` | 선택 슬롯 하이라이트 `%` 스타일        |

---

## 7. 타입 정의

**규칙**: 공개 interface/type은 `src/types/`에만 정의합니다. composable·utils·service는 import만 합니다.

| 파일                | 주요 타입                                                            |
| ------------------- | -------------------------------------------------------------------- |
| `schedule.ts`       | `Schedule`, `Holiday`, `UseCalendarOptions`                          |
| `composable.ts`     | `CalendarContext`, `UsePublicHolidaysOptions`                        |
| `calendarEvents.ts` | emit payload (`CalendarTimeSlotSelectPayload` 등)                    |
| `query.ts`          | `ScheduleQueryChangePayload`, `BuildScheduleQueryChangePayloadInput` |
| `layout.ts`         | `MonthDayCell`, `TimedLayoutItem`, `RectBounds`, overflow 레이아웃   |
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
}

// 기본 제공 일정 유형 리터럴 (편의용 — string이므로 확장 가능)
type ScheduleType = 'my_schedule' | 'team_schedule' | 'company_schedule'

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

`CALENDAR_START_HOUR`, `CALENDAR_END_HOUR`, `HOUR_HEIGHT_PX`는 `calendarView.ts` re-export 별칭입니다.

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

### 단위·컴포넌트 (Vitest 205건)

| 스펙                              | 검증                                                |
| --------------------------------- | --------------------------------------------------- |
| `CalendarMonthNav.spec.ts`        | Month/List 공통 월 네비 label·prev/next emit        |
| `ScheduleCalendar.spec.ts`        | emit-only, `time-slot-select`, API+`:holidays` 병합 |
| `MonthView.spec.ts`               | 칩·spanning bar·공휴일·`+N` 팝오버                  |
| `MonthOverflowPopover.spec.ts`    | 임베디드 bounds 기반 max 크기                       |
| `TimedGrid.spec.ts`               | 공휴일 칩, `time-slot-select`                       |
| `ListView.spec.ts`                | 월 네비, Clear                                      |
| `useCalendar.spec.ts`             | 파생 데이터, `formatPeriod` Period 컬럼             |
| `usePublicHolidays.spec.ts`       | 연도 캐시, `fetchPublicHolidays: false`             |
| `useScheduleCalendarHost.spec.ts` | 핸들러·`time-slot-select`                           |
| `schedule/layout.spec.ts`         | 겹침 컬럼 분할                                      |
| `month/barLayout.spec.ts`         | spanning·공휴일 슬롯                                |
| `month/overflow-layout.spec.ts`   | bounds·flip                                         |
| `timed/grid.spec.ts`              | 현재 시각·time-slot offset·하이라이트 스타일 (7건)  |
| `constants/timedView.spec.ts`     | `calendarView.ts` 상수 (파일명 레거시)              |

`resolveCalendarNavigateDate`는 `ScheduleCalendar.spec`·`schedule/query.spec`에서 간접 검증합니다.

### E2E (Playwright 126건)

| 스펙                                | 건수 |
| ----------------------------------- | ---- |
| `calendar.spec.ts`                  | 15   |
| `calendar-responsive.spec.ts`       | 42   |
| `calendar-host-integration.spec.ts` | 69   |

```bash
npm run test          # Vitest
npm run test:e2e      # E2E 전체
npm run test:all      # 단위 + 빌드 + E2E
```

---

## 11. 로컬 개발 시작하기

```bash
npm install
cp .env.example .env.local   # 공공데이터포털 공휴일 API 키 (선택)
npm run dev                  # http://localhost:6565
```

### 주요 명령

| 명령 | 용도 |
| ---- | ---- |
| `npm run typecheck` | 타입 검사 (가장 빠른 안전망) |
| `npm run test` | Vitest 단위 테스트 205건 |
| `npm run test:e2e` | Playwright E2E 126건 |
| `npm run test:all` | 단위 + 빌드 + E2E (PR 전 권장) |
| `npm run build:lib` | 라이브러리 패키지 빌드 (`dist/`) |

### Path alias

`@/` → `src/` (`vite.config.ts`, `tsconfig.app.json`)

### 수정 위치 가이드

| 작업 | 수정 파일 |
| ---- | --------- |
| 일정 칩 UI | `ScheduleEventChip.vue` + `MonthView.vue` CSS |
| 새 뷰 타입 추가 | `CalendarView` 타입 → `CalendarToolbar.vue` 탭 → `ScheduleCalendar.vue` |
| 새 필터 추가 | `ScheduleCalendar.vue` v-model → `buildScheduleQueryChangePayload` 확장 |
| 커스텀 일정 유형 | `scheduleTypeOptions` prop (색상·라벨 매핑) |

---

## 12. 향후 개선

상세·우선순위: [`roadmap.md`](roadmap.md)

| 영역   | 핵심 항목                                                               |
| ------ | ----------------------------------------------------------------------- |
| API    | `weekdayLabels` i18n prop (IMP-02), 시간 그리드 `startHour`/`endHour` (IMP-03) |
| UX     | 드래그 시간 슬롯 범위 선택 (IMP-04)                                     |
| 테스트 | List·time-slot E2E, `resolveCalendarNavigateDate` 단위 spec             |
| 운영   | 공휴일 API 실패 UX, 배포 시 인증키·프록시 가이드                         |
