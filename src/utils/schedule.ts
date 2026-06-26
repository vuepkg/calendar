import type {
  BuildScheduleQueryChangePayloadInput,
  ScheduleQueryChangePayload,
  ScheduleQueryDateRange,
  ScheduleQueryFilters,
} from '@/types'
import type { PlacedSegment, TimedLayoutItem, TimedSegment, TimeGridRange } from '@/types/layout'
import type {
  CalendarView,
  Participant,
  Schedule,
  ScheduleDraft,
  ViewScope,
} from '@/types/schedule'
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR, HOUR_HEIGHT_PX } from '@/constants/calendarView'
import {
  clampDateToRange,
  endOfDay,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from '@/utils/date'

const DEFAULT_RANGE: TimeGridRange = {
  startHour: CALENDAR_START_HOUR,
  endHour: CALENDAR_END_HOUR,
  hourHeightPx: HOUR_HEIGHT_PX,
}

function toMinutesFromStart(date: Date, day: Date): number {
  const dayStart = startOfDay(day)
  const diffMs = date.getTime() - dayStart.getTime()
  return Math.max(0, diffMs / 60000)
}

function getTimedSegment(schedule: Schedule, day: Date, range: TimeGridRange): TimedSegment | null {
  const dayStart = startOfDay(day)
  const dayEnd = endOfDay(day)

  if (schedule.start > dayEnd || schedule.end < dayStart) {
    return null
  }

  if (schedule.allDay) {
    return null
  }

  const rangeStart = new Date(day)
  rangeStart.setHours(range.startHour, 0, 0, 0)

  const rangeEnd = new Date(day)
  rangeEnd.setHours(range.endHour, 59, 59, 999)

  const segmentStart = clampDateToRange(schedule.start, rangeStart, rangeEnd)
  const segmentEnd = clampDateToRange(schedule.end, rangeStart, rangeEnd)

  if (segmentEnd <= segmentStart) {
    return null
  }

  const startMinutes = Math.max(0, toMinutesFromStart(segmentStart, day) - range.startHour * 60)
  const endMinutes = Math.max(
    startMinutes + 15,
    toMinutesFromStart(segmentEnd, day) - range.startHour * 60,
  )

  return {
    schedule,
    startMinutes,
    endMinutes,
  }
}

function eventsOverlap(a: TimedSegment, b: TimedSegment): boolean {
  return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes
}

function assignColumns(segments: TimedSegment[], range: TimeGridRange): TimedLayoutItem[] {
  const sorted = [...segments].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) {
      return a.startMinutes - b.startMinutes
    }
    return b.endMinutes - b.startMinutes - (a.endMinutes - a.startMinutes)
  })

  const active: PlacedSegment[] = []
  const placed: PlacedSegment[] = []

  for (const segment of sorted) {
    const stillActive = active.filter((item) => eventsOverlap(item, segment))
    active.length = 0
    active.push(...stillActive)

    const usedColumns = new Set(active.map((item) => item.column))
    let column = 0
    while (usedColumns.has(column)) {
      column += 1
    }

    const placedSegment: PlacedSegment = { ...segment, column }
    active.push(placedSegment)
    placed.push(placedSegment)
  }

  const totalMinutes = (range.endHour - range.startHour + 1) * 60

  return placed.map((segment) => {
    const overlapping = placed.filter((other) => eventsOverlap(segment, other))
    const columnCount = Math.max(...overlapping.map((item) => item.column + 1))
    const width = 100 / columnCount
    const top = (segment.startMinutes / totalMinutes) * 100
    const height = ((segment.endMinutes - segment.startMinutes) / totalMinutes) * 100

    return {
      schedule: segment.schedule,
      top,
      height,
      left: segment.column * width,
      width,
      column: segment.column,
      columnCount,
    }
  })
}

export function layoutTimedSchedules(
  schedules: Schedule[],
  day: Date,
  range: TimeGridRange = DEFAULT_RANGE,
): TimedLayoutItem[] {
  const segments = schedules
    .map((schedule) => getTimedSegment(schedule, day, range))
    .filter((segment): segment is TimedSegment => segment !== null)

  return assignColumns(segments, range)
}

export function getTimedGridHeight(range: TimeGridRange = DEFAULT_RANGE): number {
  const hourHeight = range.hourHeightPx ?? HOUR_HEIGHT_PX
  return (range.endHour - range.startHour + 1) * hourHeight
}

export function getSchedulesForDay(schedules: Schedule[], day: Date): Schedule[] {
  const dayStart = startOfDay(day)
  const dayEnd = endOfDay(day)

  return schedules.filter((schedule) => schedule.start <= dayEnd && schedule.end >= dayStart)
}

export function getAllDaySchedules(schedules: Schedule[], day: Date): Schedule[] {
  return getSchedulesForDay(schedules, day).filter((schedule) => schedule.allDay)
}

export function getTimedSchedules(schedules: Schedule[], day: Date): Schedule[] {
  return getSchedulesForDay(schedules, day).filter((schedule) => !schedule.allDay)
}

export function createScheduleId(existing: Schedule[]): string {
  const maxNumber = existing.reduce((max, schedule) => {
    const matched = schedule.id.match(/^s-(\d+)$/)
    if (!matched) {
      return max
    }

    return Math.max(max, Number(matched[1]))
  }, 0)

  return `s-${String(maxNumber + 1).padStart(3, '0')}`
}

export function buildScheduleFromDraft(
  draft: ScheduleDraft,
  participants: Participant[],
  existing: Schedule[],
): Schedule {
  const participant = participants.find((item) => item.id === draft.participantId)
  const id = draft.id ?? createScheduleId(existing)
  const start = draft.allDay ? startOfDay(draft.start) : new Date(draft.start)
  const end = draft.allDay ? startOfDay(draft.end) : new Date(draft.end)
  const startKey = formatDateKey(start)
  const endKey = formatDateKey(end)

  return {
    id,
    title: draft.title.trim(),
    type: draft.type,
    participantId: draft.participantId,
    participantName: participant?.name ?? draft.participantId,
    start,
    end,
    allDay: draft.allDay,
    remarks: draft.allDay
      ? `${startKey} ~ ${endKey}`
      : `${startKey} ${formatTimeKey(start)} ~ ${endKey} ${formatTimeKey(end)}`,
  }
}

export function upsertSchedule(list: Schedule[], schedule: Schedule): Schedule[] {
  const index = list.findIndex((item) => item.id === schedule.id)
  if (index === -1) {
    return [...list, schedule]
  }

  const next = [...list]
  next[index] = schedule
  return next
}

export function removeSchedule(list: Schedule[], scheduleId: string): Schedule[] {
  return list.filter((schedule) => schedule.id !== scheduleId)
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTimeKey(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * My scope requires `currentUserId`. Without it, returns an empty list (dev: console.warn).
 * Company scope always returns the full list.
 */
export function filterSchedulesByScope(
  schedules: Schedule[],
  scope: ViewScope,
  currentUserId?: string,
): Schedule[] {
  if (scope !== 'my') {
    return schedules
  }

  if (!currentUserId) {
    if (import.meta.env.DEV) {
      console.warn(
        '[scheduleFilter] scope "my" requires currentUserId. Returning an empty schedule list.',
      )
    }
    return []
  }

  return schedules.filter((schedule) => schedule.participantId === currentUserId)
}

/**
 * Schedule Type 필터.
 * `null`/`undefined` → 전체 유형, `[]` → 결과 없음.
 */
export function filterSchedulesByType(
  schedules: Schedule[],
  scheduleTypes: string[] | null | undefined,
): Schedule[] {
  if (scheduleTypes === null || scheduleTypes === undefined) {
    return schedules
  }

  if (scheduleTypes.length === 0) {
    return []
  }

  const typeSet = new Set(scheduleTypes)
  return schedules.filter((schedule) => typeSet.has(schedule.type))
}

/** View Option(scope) + Schedule Type 순서로 클라이언트 필터 */
export function applyScheduleFilters(
  schedules: Schedule[],
  filters: ScheduleQueryFilters,
): Schedule[] {
  const byScope = filterSchedulesByScope(schedules, filters.viewScope, filters.currentUserId)

  return filterSchedulesByType(byScope, filters.scheduleTypes)
}

export function filterSchedulesForListDate(
  schedules: Schedule[],
  filterDate: Date | null | undefined,
): Schedule[] {
  if (!filterDate) {
    return schedules
  }

  return getSchedulesForDay(schedules, startOfDay(filterDate))
}

/** List 뷰 — `listFilterDate` 없을 때 `selectedDate`가 속한 월의 일정만 */
export function filterSchedulesForListMonth(schedules: Schedule[], monthAnchor: Date): Schedule[] {
  return schedules.filter((schedule) => isSameMonth(schedule.start, monthAnchor))
}

export function isScheduleOnDate(schedule: Schedule, date: Date): boolean {
  return getSchedulesForDay([schedule], date).length > 0
}

export function countSchedulesForDate(schedules: Schedule[], date: Date): number {
  return getSchedulesForDay(schedules, date).length
}

export function datesEqual(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) {
    return false
  }

  return isSameDay(a, b)
}

/** 현재 뷰·날짜 기준 API 조회에 쓸 기간 */
export function getScheduleQueryDateRange(
  view: CalendarView,
  date: Date,
  listFilterDate: Date | null = null,
): ScheduleQueryDateRange {
  const anchor = startOfDay(date)

  if (view === 'list' && listFilterDate) {
    return {
      start: startOfDay(listFilterDate),
      end: endOfDay(listFilterDate),
    }
  }

  if (view === 'day') {
    return {
      start: anchor,
      end: endOfDay(anchor),
    }
  }

  if (view === 'week') {
    return {
      start: startOfWeek(anchor),
      end: endOfWeek(anchor),
    }
  }

  return {
    start: startOfMonth(anchor),
    end: endOfMonth(anchor),
  }
}

export function buildScheduleQueryChangePayload(
  input: BuildScheduleQueryChangePayloadInput,
): ScheduleQueryChangePayload {
  return {
    view: input.view,
    date: startOfDay(input.date),
    viewScope: input.viewScope,
    scheduleTypes: input.scheduleTypes,
    listFilterDate: input.listFilterDate ? startOfDay(input.listFilterDate) : null,
    range: getScheduleQueryDateRange(input.view, input.date, input.listFilterDate),
    trigger: input.trigger,
    action: input.action,
  }
}
