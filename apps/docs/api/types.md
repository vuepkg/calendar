# 타입 레퍼런스

`@vuepkg/calendar`가 export하는 모든 TypeScript 타입을 정리합니다.

## 도메인 타입

### Schedule

```ts
interface Schedule {
  id: string
  title: string
  start: Date
  end: Date
  type: string
  participantId?: string
  participantName?: string
  recurrence?: RecurrenceRule
  description?: string
  location?: string
  color?: string
}
```

### ScheduleDraft

일정 생성·수정 폼 데이터 구조입니다. `id`를 포함하지 않습니다.

```ts
type ScheduleDraft = Omit<Schedule, 'id'>
```

### Holiday

```ts
interface Holiday {
  date: Date
  name: string
  kind?: HolidayKind
}

type HolidayKind = 'public' | 'company'
```

### Participant

```ts
interface Participant {
  id: string
  name: string
  avatarUrl?: string
}
```

### ScheduleTypeOption

```ts
interface ScheduleTypeOption {
  type: string
  label: string
  color: string
  backgroundColor: string
}
```

### RecurrenceRule

```ts
interface RecurrenceRule {
  frequency: RecurrenceFrequency
  interval?: number         // 기본 1
  until?: Date              // 종료일 (until 또는 count 중 하나)
  count?: number            // 반복 횟수
  byWeekDay?: number[]      // 0=일, 1=월, ... 6=토
}

type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
```

---

## 뷰·필터 상태

```ts
type CalendarView = 'month' | 'week' | 'day' | 'list'

type MonthWeekCount = 2 | 3 | 6

type ViewScope = 'company' | 'my'
```

---

## Emit Payload 타입

### CalendarNavigatePayload

```ts
interface CalendarNavigatePayload {
  action: CalendarNavigateAction
  date: Date
}

type CalendarNavigateAction = 'prev' | 'next' | 'today'
```

### CalendarViewChangePayload

```ts
interface CalendarViewChangePayload {
  from: CalendarView
  to: CalendarView
}
```

### CalendarDateSelectPayload

```ts
interface CalendarDateSelectPayload {
  date: Date
  source: DateSelectSource
}

type DateSelectSource =
  | 'month-cell'
  | 'week-day-header'
  | 'day-header'
  | 'mini-calendar'
```

### CalendarScheduleClickPayload

```ts
interface CalendarScheduleClickPayload {
  schedule: Schedule
  date: Date
  source: ScheduleClickSource
}

type ScheduleClickSource = 'month' | 'week' | 'day' | 'list'
```

### CalendarOverflowClickPayload

```ts
interface CalendarOverflowClickPayload {
  date: Date
  schedules: Schedule[]
}
```

### CalendarTimeSlotSelectPayload

```ts
interface CalendarTimeSlotSelectPayload {
  start: Date
  end: Date
  source: TimeSlotSelectSource
}

type TimeSlotSelectSource = 'week' | 'day'
```

### CalendarScheduleMovePayload

```ts
interface CalendarScheduleMovePayload {
  schedule: Schedule   // 원본 (수정 전)
  newStart: Date
  newEnd: Date
}
```

### CalendarScheduleResizePayload

```ts
interface CalendarScheduleResizePayload {
  schedule: Schedule   // 원본 (수정 전)
  newEnd: Date
}
```

### ScheduleQueryChangePayload

```ts
interface ScheduleQueryChangePayload {
  view: CalendarView
  range: ScheduleQueryDateRange
  viewScope: ViewScope
  scheduleTypes: string[] | null
}

interface ScheduleQueryDateRange {
  start: Date
  end: Date
}
```

---

## usePublicHolidays 옵션

```ts
interface UsePublicHolidaysOptions {
  year: MaybeRefOrGetter<number>
  month: MaybeRefOrGetter<number>
  serviceKey?: string
  proxyUrl?: string
}
```

---

## useScheduleCalendarHost

```ts
interface UseScheduleCalendarHostOptions {
  initialView?: CalendarView
  initialDate?: Date
  initialListFilterDate?: Date | null
  initialViewScope?: ViewScope
  initialScheduleTypes?: string[] | null
  onQueryChange?: (payload: ScheduleQueryChangePayload) => void
  onScheduleClick?: (payload: CalendarScheduleClickPayload) => void
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
  calendarListeners: ScheduleCalendarHostListeners
  handlers: ScheduleCalendarHostHandlers
}
```
