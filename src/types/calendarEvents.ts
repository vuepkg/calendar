import type { Ref } from 'vue'
import type { CalendarView, Schedule, ViewScope } from './schedule'

/** Today·‹› 버튼 동작 — `navigate` payload의 `action` */
export type CalendarNavigateAction =
  | 'today'
  | 'prev-day'
  | 'next-day'
  | 'prev-week'
  | 'next-week'
  | 'prev-month'
  | 'next-month'

/** API 조회 기간 — 뷰·날짜·List 필터에 따라 계산 */
export interface ScheduleQueryDateRange {
  start: Date
  end: Date
}

/** `query-change` emit 발생 원인 */
export type ScheduleQueryTrigger =
  | 'init'
  | 'navigate'
  | 'view-change'
  | 'filter-change'
  | 'list-filter-clear'

/**
 * 부모가 일정 API를 호출할 때 사용하는 조회 컨텍스트.
 * `viewScope`(View Option)·`scheduleTypes`·기간(`range`)을 함께 전달합니다.
 */
export interface ScheduleQueryChangePayload {
  view: CalendarView
  date: Date
  /** My / Company (View Option) */
  viewScope: ViewScope
  /** `null`이면 전체 유형, 빈 배열이면 유형 미선택(결과 없음) */
  scheduleTypes: string[] | null
  listFilterDate: Date | null
  range: ScheduleQueryDateRange
  trigger: ScheduleQueryTrigger
  action?: CalendarNavigateAction
}

/** 클라이언트 필터·API 파라미터 공통 */
export interface ScheduleQueryFilters {
  viewScope: ViewScope
  /** `null`이면 전체 유형. `Schedule.type`과 매핑되는 문자열 배열. */
  scheduleTypes: string[] | null
  currentUserId?: string
}

/** `buildScheduleQueryChangePayload` 입력 */
export interface BuildScheduleQueryChangePayloadInput {
  view: CalendarView
  date: Date
  viewScope: ScheduleQueryChangePayload['viewScope']
  scheduleTypes: ScheduleQueryChangePayload['scheduleTypes']
  listFilterDate: Date | null
  trigger: ScheduleQueryTrigger
  action?: CalendarNavigateAction
}

/** 일정 클릭 출처 — `schedule-click` payload의 `source` */
export type ScheduleClickSource =
  | 'month-chip'
  | 'month-all-day-bar'
  | 'week-all-day-bar'
  | 'day-all-day-bar'
  | 'week-timed'
  | 'day-timed'
  | 'list-row'

/** 날짜 선택 출처 — `date-select` payload의 `source` */
export type DateSelectSource = 'month-cell' | 'week-day-header'

/** Week/Day 시간 그리드 빈 셀 클릭 출처 — `time-slot-select` payload의 `source` */
export type TimeSlotSelectSource = 'week-timed-slot' | 'day-timed-slot'

/** Week/Day 시간 그리드 빈 셀 클릭 — 1시간 단위 start/end */
export interface CalendarTimeSlotSelectPayload {
  /** 슬롯이 속한 날짜 (자정 기준) */
  date: Date
  start: Date
  end: Date
  source: TimeSlotSelectSource
}

/** Month/Week/Day/List 탭 전환 */
export interface CalendarViewChangePayload {
  view: CalendarView
  previousView: CalendarView
}

/** 월간 셀·Week 날짜 헤더 클릭 */
export interface CalendarDateSelectPayload {
  date: Date
  source: DateSelectSource
}

/** 월간 `+N` 클릭 — MonthView 팝오버 표시 후 emit (List 전환 등은 부모 선택) */
export interface CalendarOverflowClickPayload {
  date: Date
  hiddenCount: number
  schedules: Schedule[]
  visibleSchedules: Schedule[]
}

/** 칩·All Day·시간 그리드·List 행 클릭 */
export interface CalendarScheduleClickPayload {
  schedule: Schedule
  source: ScheduleClickSource
  /** 월간 칩 등에서 선택일 동기화에 사용 */
  date?: Date
}

/** Today·‹› — `date`는 이동 **후** 날짜 (`resolveCalendarNavigateDate` 결과) */
export interface CalendarNavigatePayload {
  action: CalendarNavigateAction
  date: Date
}

/** `ScheduleCalendar` emit 시그니처 (Volar·문서용) */
export interface ScheduleCalendarEmits {
  'view-change': [payload: CalendarViewChangePayload]
  'date-select': [payload: CalendarDateSelectPayload]
  'overflow-click': [payload: CalendarOverflowClickPayload]
  'schedule-click': [payload: CalendarScheduleClickPayload]
  navigate: [payload: CalendarNavigatePayload]
  'list-filter-clear': []
  /** View Option·Schedule Type·기간 포함 — 부모 API 조회용 */
  'query-change': [payload: ScheduleQueryChangePayload]
  /** Week/Day 시간 그리드 빈 셀 클릭 — 일정 생성 등에 start/end 전달 */
  'time-slot-select': [payload: CalendarTimeSlotSelectPayload]
}

/** `useScheduleCalendarHost` 옵션 */
export interface UseScheduleCalendarHostOptions {
  /** 기본 `'month'` (`ScheduleCalendar` v-model 기본값과 동일) */
  initialView?: CalendarView
  initialDate?: Date
  initialListFilterDate?: Date | null
  /** View Option — My / Company */
  initialViewScope?: ViewScope
  /** Schedule Type 필터 — `null`이면 전체 유형. `Schedule.type`과 매핑되는 문자열 배열. */
  initialScheduleTypes?: string[] | null
  /** 미지정 시 `payload.date`가 있으면 `date` 갱신 */
  onScheduleClick?: (payload: CalendarScheduleClickPayload) => void
  /** API 조회 등 — `query-change` 수신 시 호출 */
  onQueryChange?: (payload: ScheduleQueryChangePayload) => void
  /** 월간 `+N` 클릭 — 기본은 팝오버만 표시, List 전환 등은 선택 구현 */
  onOverflowClick?: (payload: CalendarOverflowClickPayload) => void
  /** Week/Day 시간 그리드 빈 셀 클릭 — 일정 생성 등 */
  onTimeSlotSelect?: (payload: CalendarTimeSlotSelectPayload) => void
}

/** emit 핸들러 묶음 (camelCase) */
export interface ScheduleCalendarHostHandlers {
  onViewChange: (payload: CalendarViewChangePayload) => void
  onDateSelect: (payload: CalendarDateSelectPayload) => void
  onOverflowClick: (payload: CalendarOverflowClickPayload) => void
  onNavigate: (payload: CalendarNavigatePayload) => void
  onScheduleClick: (payload: CalendarScheduleClickPayload) => void
  onListFilterClear: () => void
  onQueryChange: (payload: ScheduleQueryChangePayload) => void
  onTimeSlotSelect: (payload: CalendarTimeSlotSelectPayload) => void
}

/** `v-on` spread용 — kebab-case 이벤트 키 */
export type ScheduleCalendarHostListeners = {
  'view-change': (payload: CalendarViewChangePayload) => void
  'date-select': (payload: CalendarDateSelectPayload) => void
  'overflow-click': (payload: CalendarOverflowClickPayload) => void
  navigate: (payload: CalendarNavigatePayload) => void
  'schedule-click': (payload: CalendarScheduleClickPayload) => void
  'list-filter-clear': () => void
  'query-change': (payload: ScheduleQueryChangePayload) => void
  'time-slot-select': (payload: CalendarTimeSlotSelectPayload) => void
}

/** `useScheduleCalendarHost` 반환값 */
export interface ScheduleCalendarHostContext {
  view: Ref<CalendarView>
  date: Ref<Date>
  listFilterDate: Ref<Date | null>
  viewScope: Ref<ViewScope>
  scheduleTypes: Ref<string[] | null>
  handlers: ScheduleCalendarHostHandlers
  calendarListeners: ScheduleCalendarHostListeners
}
