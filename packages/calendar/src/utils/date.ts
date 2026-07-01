export {
  startOfDay,
  endOfDay,
  isSameDay,
  isSameMonth,
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  toDateKey,
  formatMonthLabel,
  formatDayHeader,
  formatTimedGridDayLabel,
  formatWeekdayLabels,
  formatDayViewDate,
  formatHourLabel,
  formatTime,
  formatPeriod,
  formatMonthColumn,
  getMonthGridDays,
  getWeekDays,
  getHourLabels,
  clampDateToRange,
} from '@vuepkg/core/utils/date'

import type { CalendarNavigateAction } from '@/types/calendarEvents'
import { startOfDay, addDays, addMonths } from '@vuepkg/core/utils/date'

export function resolveCalendarNavigateDate(
  currentDate: Date,
  action: CalendarNavigateAction,
): Date {
  const base = startOfDay(currentDate)

  switch (action) {
    case 'today':
      return startOfDay(new Date())
    case 'prev-day':
      return startOfDay(addDays(base, -1))
    case 'next-day':
      return startOfDay(addDays(base, 1))
    case 'prev-week':
      return startOfDay(addDays(base, -7))
    case 'next-week':
      return startOfDay(addDays(base, 7))
    case 'prev-month':
      return startOfDay(addMonths(base, -1))
    case 'next-month':
      return startOfDay(addMonths(base, 1))
  }
}
