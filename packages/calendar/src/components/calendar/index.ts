export { default as ScheduleCalendar } from './ScheduleCalendar.vue'

export type {
  // 도메인 타입
  Schedule,
  ScheduleDraft,
  ScheduleType,
  ScheduleTypeOption,
  Holiday,
  HolidayKind,
  Participant,
  // 뷰·필터 상태
  CalendarView,
  MonthWeekCount,
  ViewScope,
  // emit payload
  CalendarDateSelectPayload,
  CalendarNavigateAction,
  CalendarNavigatePayload,
  CalendarOverflowClickPayload,
  CalendarScheduleClickPayload,
  CalendarScheduleMovePayload,
  CalendarScheduleResizePayload,
  CalendarTimeSlotSelectPayload,
  CalendarViewChangePayload,
  // payload 상세 타입
  DateSelectSource,
  ScheduleClickSource,
  TimeSlotSelectSource,
  // query-change
  ScheduleQueryChangePayload,
  ScheduleQueryDateRange,
  ScheduleQueryFilters,
  // useScheduleCalendarHost
  UseScheduleCalendarHostOptions,
  ScheduleCalendarHostContext,
  ScheduleCalendarHostListeners,
  // usePublicHolidays
  UsePublicHolidaysOptions,
} from '@/types'

// 일정 CRUD · 필터 헬퍼
export {
  buildScheduleFromDraft,
  createScheduleId,
  upsertSchedule,
  removeSchedule,
  applyScheduleFilters,
} from '@/utils/schedule'

// 기본 일정 유형 상수 (커스텀 타입 확장 시 spread 베이스로 사용)
export { SCHEDULE_TYPE_OPTIONS } from '@/constants/calendarView'

// 공휴일 병합 (사내 기념일 + 공공 API 결과 합칠 때)
export { mergeHolidays } from '@/utils/holiday'

// composable
export { usePublicHolidays } from '@/composables/usePublicHolidays'
export { useScheduleCalendarHost } from '@/composables/useScheduleCalendarHost'
export { useCalendar } from '@/composables/useCalendar'
