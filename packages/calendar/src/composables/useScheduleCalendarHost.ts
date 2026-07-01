import { ref } from 'vue'
import type {
  CalendarDateSelectPayload,
  CalendarNavigatePayload,
  CalendarOverflowClickPayload,
  CalendarScheduleClickPayload,
  CalendarScheduleMovePayload,
  CalendarScheduleResizePayload,
  CalendarTimeSlotSelectPayload,
  CalendarViewChangePayload,
  ScheduleCalendarHostContext,
  ScheduleQueryChangePayload,
  UseScheduleCalendarHostOptions,
} from '@/types'
import { startOfDay } from '@/utils/date'

export function useScheduleCalendarHost(
  options: UseScheduleCalendarHostOptions = {},
): ScheduleCalendarHostContext {
  const view = ref(options.initialView ?? 'month')
  const date = ref(options.initialDate ?? startOfDay(new Date()))
  const listFilterDate = ref<Date | null>(options.initialListFilterDate ?? null)
  const viewScope = ref(options.initialViewScope ?? 'company')
  const scheduleTypes = ref(options.initialScheduleTypes ?? null)

  function onViewChange(payload: CalendarViewChangePayload) {
    view.value = payload.view
    if (payload.previousView === 'list' && payload.view !== 'list') {
      listFilterDate.value = null
    }
  }

  function onDateSelect(payload: CalendarDateSelectPayload) {
    date.value = payload.date
    if (payload.source === 'week-day-header') {
      view.value = 'day'
    }
  }

  function onOverflowClick(payload: CalendarOverflowClickPayload) {
    options.onOverflowClick?.(payload)
  }

  function onNavigate(payload: CalendarNavigatePayload) {
    date.value = payload.date
  }

  function onScheduleClick(payload: CalendarScheduleClickPayload) {
    if (options.onScheduleClick) {
      options.onScheduleClick(payload)
    } else if (payload.date) {
      date.value = payload.date
    }
  }

  function onListFilterClear() {
    listFilterDate.value = null
  }

  function onQueryChange(payload: ScheduleQueryChangePayload) {
    options.onQueryChange?.(payload)
  }

  function onTimeSlotSelect(payload: CalendarTimeSlotSelectPayload) {
    date.value = payload.date
    options.onTimeSlotSelect?.(payload)
  }

  function onScheduleMove(payload: CalendarScheduleMovePayload) {
    options.onScheduleMove?.(payload)
  }

  function onScheduleResize(payload: CalendarScheduleResizePayload) {
    options.onScheduleResize?.(payload)
  }

  const handlers = {
    onViewChange,
    onDateSelect,
    onOverflowClick,
    onNavigate,
    onScheduleClick,
    onListFilterClear,
    onQueryChange,
    onTimeSlotSelect,
    onScheduleMove,
    onScheduleResize,
  }

  const calendarListeners = {
    'view-change': onViewChange,
    'date-select': onDateSelect,
    'overflow-click': onOverflowClick,
    navigate: onNavigate,
    'schedule-click': onScheduleClick,
    'list-filter-clear': onListFilterClear,
    'query-change': onQueryChange,
    'time-slot-select': onTimeSlotSelect,
    'schedule-move': onScheduleMove,
    'schedule-resize': onScheduleResize,
  }

  return {
    view,
    date,
    listFilterDate,
    viewScope,
    scheduleTypes,
    handlers,
    calendarListeners,
  }
}
