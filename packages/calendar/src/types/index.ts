/** 도메인·일정·공휴일·CRUD 초안·composable 옵션 */
export type {
  CalendarContext,
  CalendarListRow,
  CalendarState,
  CalendarView,
  FetchPublicHolidaysOptions,
  Holiday,
  HolidayKind,
  Participant,
  Schedule,
  ScheduleDraft,
  ScheduleType,
  ScheduleTypeOption,
  ScheduleTypeStyle,
  UseCalendarOptions,
  UsePublicHolidaysOptions,
  ViewScope,
} from './schedule'

/** emit payload·이벤트·query-change·host 연동 계약 */
export type {
  BuildScheduleQueryChangePayloadInput,
  CalendarDateSelectPayload,
  CalendarNavigateAction,
  CalendarNavigatePayload,
  CalendarOverflowClickPayload,
  CalendarScheduleClickPayload,
  CalendarScheduleMovePayload,
  CalendarScheduleResizePayload,
  CalendarTimeSlotSelectPayload,
  CalendarViewChangePayload,
  DateSelectSource,
  ScheduleCalendarEmits,
  ScheduleCalendarHostContext,
  ScheduleCalendarHostHandlers,
  ScheduleCalendarHostListeners,
  ScheduleClickSource,
  ScheduleQueryChangePayload,
  ScheduleQueryDateRange,
  ScheduleQueryFilters,
  ScheduleQueryTrigger,
  TimeSlotSelectSource,
  UseScheduleCalendarHostOptions,
} from './calendarEvents'

/** 레이아웃·그리드 파생 타입 */
export type {
  AllDayBarLayout,
  CurrentTimeIndicator,
  MonthCellDisplay,
  MonthCellDisplayAllocation,
  MonthDayCell,
  MonthWeekCell,
  MonthWeekLayout,
  PlacedSegment,
  TimedLayoutItem,
  TimedSegment,
  TimeGridRange,
} from './layout'

/** 팝오버 위치 계산 경계 타입 — `@vuepkg/core`에서 재노출 */
export type { RectBounds } from '@vuepkg/core'
