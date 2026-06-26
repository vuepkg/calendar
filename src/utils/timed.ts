import {
  ALL_DAY_SECTION_MAX_HEIGHT,
  ALL_DAY_SECTION_PADDING_Y_PX,
  DAY_VIEW_ALL_DAY_GAP_PX,
  DAY_VIEW_ALL_DAY_ROW_HEIGHT_PX,
  DAY_VIEW_ALL_DAY_VISIBLE_MAX,
} from '@/constants/calendarView'
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR, HOUR_HEIGHT_PX } from '@/constants/calendarView'
import type { AllDayBarLayout, CurrentTimeIndicator, TimeGridRange } from '@/types/layout'
import type { Schedule } from '@/types/schedule'
import { isSameDay, startOfDay } from '@/utils/date'
import { getAllDaySchedules } from '@/utils/schedule'

// ── Current Time Indicator ────────────────────────────────────────────

export function getCurrentTimeIndicator(
  day: Date,
  startHour: number,
  endHour: number,
  now = new Date(),
): CurrentTimeIndicator {
  if (!isSameDay(day, now)) {
    return { topPercent: 0, label: '', visible: false }
  }

  const minutesFromMidnight = now.getHours() * 60 + now.getMinutes()
  const rangeStart = startHour * 60
  const rangeEnd = (endHour + 1) * 60
  const totalMinutes = rangeEnd - rangeStart

  if (minutesFromMidnight < rangeStart || minutesFromMidnight > rangeEnd) {
    return { topPercent: 0, label: '', visible: false }
  }

  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return {
    topPercent: ((minutesFromMidnight - rangeStart) / totalMinutes) * 100,
    label: `${hours}:${minutes}`,
    visible: true,
  }
}

export function isToday(date: Date, now = new Date()): boolean {
  return isSameDay(startOfDay(date), startOfDay(now))
}

// ── Time Slot Selection ───────────────────────────────────────────────

const DEFAULT_RANGE: TimeGridRange = {
  startHour: CALENDAR_START_HOUR,
  endHour: CALENDAR_END_HOUR,
  hourHeightPx: HOUR_HEIGHT_PX,
}

/** 클릭 Y 좌표(열 상단 기준 px)를 1시간 단위 타임 슬롯 start/end로 변환합니다. */
export function resolveTimeSlotFromOffset(
  day: Date,
  offsetY: number,
  range: TimeGridRange = DEFAULT_RANGE,
): { start: Date; end: Date } {
  const hourHeight = range.hourHeightPx ?? HOUR_HEIGHT_PX
  const startHour = range.startHour ?? CALENDAR_START_HOUR
  const endHour = range.endHour ?? CALENDAR_END_HOUR
  const hourIndex = Math.floor(offsetY / hourHeight)
  const maxIndex = endHour - startHour
  const clampedIndex = Math.max(0, Math.min(hourIndex, maxIndex))
  const hour = startHour + clampedIndex

  const start = new Date(day)
  start.setHours(hour, 0, 0, 0)

  const end = new Date(day)
  if (hour >= endHour) {
    end.setHours(endHour, 59, 59, 999)
  } else {
    end.setHours(hour + 1, 0, 0, 0)
  }

  return { start, end }
}

/** 선택 슬롯 하이라이트용 top/height 퍼센트 스타일 */
export function getTimeSlotSelectionStyle(
  start: Date,
  end: Date,
  range: TimeGridRange = DEFAULT_RANGE,
): { top: string; height: string } {
  const startHour = range.startHour ?? CALENDAR_START_HOUR
  const endHour = range.endHour ?? CALENDAR_END_HOUR
  const totalHours = endHour - startHour + 1
  const slotStartHour = start.getHours() + start.getMinutes() / 60
  const durationHours = (end.getTime() - start.getTime()) / 3_600_000

  const topPercent = ((slotStartHour - startHour) / totalHours) * 100
  const heightPercent = (durationHours / totalHours) * 100

  return {
    top: `${topPercent}%`,
    height: `${heightPercent}%`,
  }
}

function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && startB < endA
}

function splitConsecutiveColumns(columns: number[]): Array<{ startColumn: number; span: number }> {
  if (columns.length === 0) {
    return []
  }

  const sorted = [...columns].sort((a, b) => a - b)
  const segments: Array<{ startColumn: number; span: number }> = []
  let startColumn = sorted[0]!
  let span = 1

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index]!
    const previous = sorted[index - 1]!

    if (current === previous + 1) {
      span += 1
      continue
    }

    segments.push({ startColumn, span })
    startColumn = current
    span = 1
  }

  segments.push({ startColumn, span })
  return segments
}

export function layoutWeekAllDayBars(days: Date[], schedules: Schedule[]): AllDayBarLayout[] {
  const scheduleById = new Map<string, Schedule>()
  const columnsBySchedule = new Map<string, number[]>()

  days.forEach((day, columnIndex) => {
    getAllDaySchedules(schedules, day).forEach((schedule) => {
      scheduleById.set(schedule.id, schedule)
      const columns = columnsBySchedule.get(schedule.id) ?? []
      columns.push(columnIndex)
      columnsBySchedule.set(schedule.id, columns)
    })
  })

  const segments: Array<{ schedule: Schedule; startColumn: number; span: number }> = []

  for (const [scheduleId, schedule] of scheduleById) {
    const columns = columnsBySchedule.get(scheduleId) ?? []
    splitConsecutiveColumns(columns).forEach((segment) => {
      segments.push({
        schedule,
        startColumn: segment.startColumn,
        span: segment.span,
      })
    })
  }

  segments.sort((a, b) => {
    if (a.startColumn !== b.startColumn) {
      return a.startColumn - b.startColumn
    }
    return b.span - a.span
  })

  const placed: AllDayBarLayout[] = []

  for (const segment of segments) {
    let row = 0

    while (
      placed.some(
        (item) =>
          item.row === row &&
          rangesOverlap(
            item.startColumn,
            item.startColumn + item.span,
            segment.startColumn,
            segment.startColumn + segment.span,
          ),
      )
    ) {
      row += 1
    }

    placed.push({
      schedule: segment.schedule,
      startColumn: segment.startColumn,
      span: segment.span,
      row,
      key: `${segment.schedule.id}-${segment.startColumn}-${segment.span}`,
    })
  }

  return placed
}

export function getAllDayRowCount(bars: AllDayBarLayout[]): number {
  if (bars.length === 0) {
    return 1
  }

  return Math.max(...bars.map((bar) => bar.row)) + 1
}

export function getDayAllDayOverflowCount(
  totalCount: number,
  visibleMax = DAY_VIEW_ALL_DAY_VISIBLE_MAX,
): number {
  return Math.max(0, totalCount - visibleMax)
}

export function getDayAllDaySectionHeight(totalCount: number): number {
  if (totalCount <= 0) {
    return DAY_VIEW_ALL_DAY_ROW_HEIGHT_PX + ALL_DAY_SECTION_PADDING_Y_PX
  }

  const visibleRows = Math.min(totalCount, DAY_VIEW_ALL_DAY_VISIBLE_MAX)
  return (
    visibleRows * DAY_VIEW_ALL_DAY_ROW_HEIGHT_PX +
    Math.max(0, visibleRows - 1) * DAY_VIEW_ALL_DAY_GAP_PX +
    ALL_DAY_SECTION_PADDING_Y_PX
  )
}

export function getDayAllDayScrollStep(): number {
  return DAY_VIEW_ALL_DAY_ROW_HEIGHT_PX + DAY_VIEW_ALL_DAY_GAP_PX
}

export { ALL_DAY_SECTION_MAX_HEIGHT, DAY_VIEW_ALL_DAY_VISIBLE_MAX }
