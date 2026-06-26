import { computed, reactive, ref, toValue } from 'vue'
import { SCHEDULE_TYPE_OPTIONS } from '@/constants/calendarView'
import type { CalendarContext } from '@/types/schedule'
import type { UseCalendarOptions } from '@/types/schedule'
import type { MonthDayCell } from '@/types/layout'
import type { CalendarView } from '@/types/schedule'
import {
  addDays,
  addMonths,
  formatMonthLabel,
  formatPeriod,
  getMonthGridDays,
  getWeekDays,
  isSameDay,
  isSameMonth,
  startOfDay,
  toDateKey,
} from '@/utils/date'
import { getMonthCellDisplay } from '@/utils/month'
import { groupHolidaysByDateKey, getHolidaysForDateKey } from '@/utils/holiday'
import {
  filterSchedulesForListDate,
  filterSchedulesForListMonth,
  getSchedulesForDay,
} from '@/utils/schedule'

/**
 * 캘린더 내부 파생 데이터·표시 상태.
 *
 * **소비자(부모)는 `ScheduleCalendar`의 v-model만 사용**하세요.
 * `setView`·`selectDate`·`clearListFilter` 등은 컴포넌트 내부용이며,
 * emit-only 연동 시 List 필터 해제는 `listFilterDate = null` + `@list-filter-clear`로 처리합니다.
 */
export function useCalendar(options: UseCalendarOptions): CalendarContext {
  const selectedDateRef = options.selectedDate ?? ref(startOfDay(options.initialDate ?? new Date()))
  const currentViewRef =
    options.currentView ?? ref((options.initialView ?? 'month') as CalendarView)
  const listFilterDateRef = options.listFilterDate ?? ref<Date | null>(null)
  const scheduleTypeOptions = options.scheduleTypeOptions ?? SCHEDULE_TYPE_OPTIONS

  const state = reactive({
    get selectedDate() {
      return selectedDateRef.value
    },
    set selectedDate(value: Date) {
      selectedDateRef.value = startOfDay(value)
    },
    get currentView() {
      return currentViewRef.value
    },
    set currentView(value: CalendarView) {
      currentViewRef.value = value
    },
    get listFilterDate() {
      return listFilterDateRef.value
    },
    set listFilterDate(value: Date | null) {
      listFilterDateRef.value = value ? startOfDay(value) : null
    },
  })

  const schedules = computed(() => toValue(options.schedules))
  const holidays = computed(() => toValue(options.holidays ?? []))
  const holidaysByDate = computed(() => groupHolidaysByDateKey(holidays.value))

  const monthLabel = computed(() => formatMonthLabel(selectedDateRef.value))

  const monthCells = computed<MonthDayCell[]>(() => {
    const today = startOfDay(new Date())
    const days = getMonthGridDays(selectedDateRef.value)
    const holidayMap = holidaysByDate.value

    return days.map((date) => {
      const key = toDateKey(date)
      const daySchedules = getSchedulesForDay(schedules.value, date)
      const dayHolidays = getHolidaysForDateKey(holidayMap, key)
      const display = getMonthCellDisplay(daySchedules)

      return {
        date,
        key,
        inCurrentMonth: isSameMonth(date, selectedDateRef.value),
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDateRef.value),
        isSunday: date.getDay() === 0,
        isSaturday: date.getDay() === 6,
        schedules: daySchedules,
        visibleSchedules: display.visible,
        hiddenScheduleCount: display.hiddenCount,
        holidays: dayHolidays,
      }
    })
  })

  const weekDays = computed(() => getWeekDays(selectedDateRef.value))

  const listRows = computed(() => {
    const filtered = listFilterDateRef.value
      ? filterSchedulesForListDate(schedules.value, listFilterDateRef.value)
      : filterSchedulesForListMonth(schedules.value, selectedDateRef.value)

    return [...filtered]
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map((schedule, index) => ({
        no: index + 1,
        title: schedule.title,
        scheduleType:
          scheduleTypeOptions.find((option) => option.type === schedule.type)?.label ??
          schedule.type,
        participant: schedule.participantName,
        period: formatPeriod(schedule.start, schedule.end),
        schedule,
      }))
  })

  function setView(view: CalendarView) {
    currentViewRef.value = view
  }

  function selectDate(date: Date) {
    selectedDateRef.value = startOfDay(date)
  }

  function moveDay(offset: number) {
    selectedDateRef.value = startOfDay(addDays(selectedDateRef.value, offset))
  }

  function moveWeek(offset: number) {
    selectedDateRef.value = startOfDay(addDays(selectedDateRef.value, offset * 7))
  }

  function moveMonth(offset: number) {
    selectedDateRef.value = startOfDay(addMonths(selectedDateRef.value, offset))
  }

  function goToToday() {
    selectedDateRef.value = startOfDay(new Date())
  }

  /** 내부용 — emit-only 부모는 `v-model:list-filter-date`를 직접 갱신 */
  function clearListFilter() {
    listFilterDateRef.value = null
  }

  function getTypeStyle(type: string) {
    const option = scheduleTypeOptions.find((item) => item.type === type)
    return {
      color: option?.color ?? '#0277bd',
      backgroundColor: option?.backgroundColor ?? '#e1f5fe',
    }
  }

  return {
    state,
    schedules,
    holidays,
    monthLabel,
    monthCells,
    weekDays,
    listRows,
    setView,
    selectDate,
    moveDay,
    moveWeek,
    moveMonth,
    goToToday,
    clearListFilter,
    getTypeStyle,
  }
}
