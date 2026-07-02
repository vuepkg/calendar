# 타입 레퍼런스

`@vuepkg/calendar`가 export하는 주요 TypeScript 타입을 정리합니다.

> 이 페이지는 수동으로 유지됩니다. `ScheduleCalendar`의 Props/v-model/Emits/Slots 표는 [schedule-calendar.md](./schedule-calendar.md)에서 소스 코드로부터 자동 생성됩니다(F3-2) — 이 페이지의 타입 정의가 실제 코드와 어긋나면 그쪽 표와 대조해 신고해 주세요.

## 도메인 타입

### Schedule

```ts
interface Schedule {
  id: string
  title: string
  type: string // 임의 문자열 — 기본 제공 리터럴은 ScheduleType 참고
  participantId?: string // HR형 일정 전용, My scope 필터 키
  participantName?: string // HR형 일정 전용, 칩·바 타이틀 표시
  start: Date
  end: Date
  remarks?: string // List Period 컬럼·부가 설명
  allDay?: boolean // true면 All Day 행·월간 바 레이아웃
  recurrence?: RecurrenceRule
  recurrenceId?: string // @internal — 전개된 가상 회차의 마스터 id
  isRecurrenceInstance?: boolean // @internal — 전개된 가상 회차 여부
  meta?: Record<string, unknown> // 소비자 도메인 데이터 — 참가자 대신 회의실·환자·예약 정보 등
}

// 기본 제공 일정 유형 리터럴 (편의용 — string이므로 확장 가능)
type ScheduleType = 'my_schedule' | 'team_schedule' | 'company_schedule'
```

### ScheduleDraft

`ScheduleFormModal`의 CRUD 폼이 사용하는 초안 구조입니다. `Schedule`의 부분집합이 아니라 별도 타입입니다 — 저장 시 `buildScheduleFromDraft`가 `Schedule`로 변환합니다.

```ts
interface ScheduleDraft {
  id?: string
  title: string
  type: string
  participantId: string // 폼은 참가자 선택을 필수로 요구합니다
  start: Date
  end: Date
  allDay: boolean
  recurrence?: RecurrenceRule
}
```

### Holiday

`@vuepkg/core`에서 재노출됩니다.

```ts
interface Holiday {
  id: string
  dateKey: string // 'YYYY-MM-DD'
  name: string
  kind: 'public' | 'company'
}

type HolidayKind = 'public' | 'company'
```

### Participant

```ts
interface Participant {
  id: string // Schedule.participantId와 연결
  name: string
}
```

### ScheduleTypeOption

```ts
interface ScheduleTypeOption {
  type: string // Schedule.type과 매핑되는 식별자 문자열
  label: string
  color: string
  backgroundColor: string
}
```

### RecurrenceRule

RRULE 서브셋입니다. `Schedule.start`가 반복 시작일(anchor)입니다.

```ts
interface RecurrenceRule {
  freq: RecurrenceFrequency
  interval?: number // 반복 간격 — 기본 1. freq:'weekly', interval:2 → 격주
  byWeekday?: number[] // freq:'weekly' 전용, 0=일요일~6=토요일
  count?: number // 종료 조건 — 총 발생 횟수
  until?: Date // 종료 조건 — 마지막 발생 가능일(포함)
  exceptions?: string[] // 삭제된 단일 회차 날짜('YYYY-MM-DD') — 해당 회차만 건너뜀
}

type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
```

---

## 뷰·필터 상태

```ts
type CalendarView = 'month' | 'week' | 'day' | 'list'

type MonthWeekCount = 2 | 3 | 6

type ViewScope = 'my' | 'company'
```

---

## Slot Props 타입 (REV-A1)

`ScheduleCalendar`의 `#toolbar`/`#day-cell`/`#event`/`#month-overflow-item` slot이 전달하는 props입니다. 슬롯별 교체 범위·사용 예시는 [schedule-calendar.md § Slots](./schedule-calendar.md#slots) 참고.

```ts
interface ToolbarSlotProps {
  currentView: CalendarView
  views: readonly CalendarView[]
  onSelect: (view: CalendarView) => void
}

interface DayCellSlotProps {
  cell: MonthWeekCell
  getTypeStyle: (type: string) => { color: string; backgroundColor: string }
  onScheduleClick: (schedule: Schedule) => void
  onOpenOverflow: (event: MouseEvent) => void
}

interface EventSlotProps {
  schedule: Schedule
  source: ScheduleClickSource
  typeStyle: { color: string; backgroundColor: string }
  compact?: boolean
  showParticipant?: boolean
  // week-timed/day-timed는 포인터 드래그 래퍼가 클릭을 처리하므로 없음
  onSelect?: () => void
}

interface MonthOverflowItemSlotProps {
  schedule: Schedule
  isHighlighted: boolean
  onSelect: () => void
}
```

---

## Emit Payload 타입

### CalendarNavigatePayload

```ts
interface CalendarNavigatePayload {
  action: CalendarNavigateAction
  date: Date // 이동 후 날짜
}

type CalendarNavigateAction =
  | 'today'
  | 'prev-day'
  | 'next-day'
  | 'prev-week'
  | 'next-week'
  | 'prev-month'
  | 'next-month'
```

### CalendarViewChangePayload

```ts
interface CalendarViewChangePayload {
  view: CalendarView
  previousView: CalendarView
}
```

### CalendarDateSelectPayload

```ts
interface CalendarDateSelectPayload {
  date: Date
  source: DateSelectSource
}

type DateSelectSource = 'month-cell' | 'week-day-header'
```

### CalendarScheduleClickPayload

```ts
interface CalendarScheduleClickPayload {
  schedule: Schedule
  source: ScheduleClickSource
  date?: Date // 월간 칩 등에서 선택일 동기화에 사용
}

type ScheduleClickSource =
  | 'month-chip'
  | 'month-all-day-bar'
  | 'week-all-day-bar'
  | 'day-all-day-bar'
  | 'week-timed'
  | 'day-timed'
  | 'list-row'
```

### CalendarOverflowClickPayload

```ts
interface CalendarOverflowClickPayload {
  date: Date
  hiddenCount: number
  schedules: Schedule[] // 해당 날짜 전체 일정
  visibleSchedules: Schedule[] // 셀에 이미 칩으로 보이던 일정
}
```

### CalendarTimeSlotSelectPayload

```ts
interface CalendarTimeSlotSelectPayload {
  date: Date // 슬롯이 속한 날짜(자정 기준)
  start: Date
  end: Date
  source: TimeSlotSelectSource
}

type TimeSlotSelectSource = 'week-timed-slot' | 'day-timed-slot'
```

### CalendarScheduleMovePayload

```ts
interface CalendarScheduleMovePayload {
  schedule: Schedule
  date: Date // 이동 후 날짜(자정 기준)
  newStart: Date
  newEnd: Date
}
```

### CalendarScheduleResizePayload

```ts
interface CalendarScheduleResizePayload {
  schedule: Schedule
  date: Date
  newEnd: Date
}
```

### ScheduleQueryChangePayload

`useScheduleCalendarHost`의 `onQueryChange`로 전달되는, API 재조회에 필요한 전체 컨텍스트입니다.

```ts
interface ScheduleQueryChangePayload {
  view: CalendarView
  date: Date
  viewScope: ViewScope
  scheduleTypes: string[] | null // null=전체 유형, []=유형 미선택(결과 없음)
  listFilterDate: Date | null
  range: ScheduleQueryDateRange
  trigger: ScheduleQueryTrigger
  action?: CalendarNavigateAction
}

type ScheduleQueryTrigger = 'init' | 'navigate' | 'view-change' | 'filter-change' | 'list-filter-clear'

interface ScheduleQueryDateRange {
  start: Date
  end: Date
}
```

---

## usePublicHolidays 옵션

```ts
interface UsePublicHolidaysOptions {
  fetchPublicHolidays?: MaybeRefOrGetter<boolean> // 기본 true — false면 companyHolidays만 사용
  serviceKey?: string // 프로덕션에서는 BFF/proxy 경유 권장, 클라이언트 직접 전달 시 DEV 경고
  companyHolidays?: MaybeRefOrGetter<Holiday[]> // API 결과와 병합할 사내 기념일
}
```

---

## useScheduleCalendarHost

```ts
interface UseScheduleCalendarHostOptions {
  initialView?: CalendarView // 기본 'month'
  initialDate?: Date
  initialListFilterDate?: Date | null
  initialViewScope?: ViewScope
  initialScheduleTypes?: string[] | null
  onScheduleClick?: (payload: CalendarScheduleClickPayload) => void
  onQueryChange?: (payload: ScheduleQueryChangePayload) => void
  onOverflowClick?: (payload: CalendarOverflowClickPayload) => void
  onTimeSlotSelect?: (payload: CalendarTimeSlotSelectPayload) => void
  onScheduleMove?: (payload: CalendarScheduleMovePayload) => void
  onScheduleResize?: (payload: CalendarScheduleResizePayload) => void
}

interface ScheduleCalendarHostContext {
  view: Ref<CalendarView>
  date: Ref<Date>
  listFilterDate: Ref<Date | null>
  viewScope: Ref<ViewScope>
  scheduleTypes: Ref<string[] | null>
  handlers: ScheduleCalendarHostHandlers
  calendarListeners: ScheduleCalendarHostListeners // v-on="calendarListeners"로 바인딩
}
```
