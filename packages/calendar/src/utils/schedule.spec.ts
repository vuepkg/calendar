import { describe, expect, it } from 'vitest'
import { DAY_VIEW_END_HOUR, DAY_VIEW_START_HOUR, HOUR_HEIGHT_PX } from '@/constants/calendarView'
import type { Schedule } from '@/types/schedule'
import {
  HALF_HOUR_SLOT_DATE,
  mockSchedules,
  MULTI_DAY_ALL_DAY_END,
  MULTI_DAY_ALL_DAY_ID,
  MULTI_DAY_ALL_DAY_MIDDLE,
  MULTI_DAY_ALL_DAY_START,
  TWO_DAY_ALL_DAY_END,
  TWO_DAY_ALL_DAY_ID,
  TWO_DAY_ALL_DAY_START,
  TWO_DAY_ALL_DAY_TITLE,
  CURRENT_USER_ID,
  participants,
} from '@/data/mockSchedules'
import { endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from '@/utils/date'
import {
  applyScheduleFilters,
  buildScheduleFromDraft,
  buildScheduleQueryChangePayload,
  countSchedulesForDate,
  createScheduleId,
  filterSchedulesByScope,
  filterSchedulesByType,
  filterSchedulesForListDate,
  filterSchedulesForListMonth,
  getAllDaySchedules,
  getScheduleQueryDateRange,
  getSchedulesForDay,
  getTimedSchedules,
  layoutTimedSchedules,
  removeSchedule,
  upsertSchedule,
} from '@/utils/schedule'

const dayRange = {
  startHour: DAY_VIEW_START_HOUR,
  endHour: DAY_VIEW_END_HOUR,
  hourHeightPx: HOUR_HEIGHT_PX,
}

function getTotalMinutes(): number {
  return (dayRange.endHour - dayRange.startHour + 1) * 60
}

function createSchedule(id: string, participantId: string, start: string, end: string): Schedule {
  return {
    id,
    title: `Event ${id}`,
    type: 'my_schedule',
    participantId,
    participantName: participantId,
    start: new Date(start),
    end: new Date(end),
  }
}

describe('scheduleLayout', () => {
  const day = new Date(2026, 3, 19)

  it('returns schedules that intersect the day', () => {
    const schedules = [
      createSchedule('1', 'user-a', '2026-04-19T09:00:00', '2026-04-19T10:00:00'),
      createSchedule('2', 'user-b', '2026-04-20T09:00:00', '2026-04-20T10:00:00'),
    ]

    expect(getSchedulesForDay(schedules, day)).toHaveLength(1)
  })

  it('places non-overlapping events at full width', () => {
    const schedules = [
      createSchedule('1', 'user-a', '2026-04-19T09:00:00', '2026-04-19T10:00:00'),
      createSchedule('2', 'user-b', '2026-04-19T11:00:00', '2026-04-19T12:00:00'),
    ]

    const layout = layoutTimedSchedules(schedules, day)

    expect(layout).toHaveLength(2)
    expect(layout.every((item) => item.width === 100)).toBe(true)
    expect(layout.every((item) => item.left === 0)).toBe(true)
  })

  it('splits width when multiple people overlap in time', () => {
    const schedules = [
      createSchedule('1', 'user-a', '2026-04-19T10:00:00', '2026-04-19T12:00:00'),
      createSchedule('2', 'user-b', '2026-04-19T10:30:00', '2026-04-19T12:30:00'),
      createSchedule('3', 'user-c', '2026-04-19T11:00:00', '2026-04-19T15:00:00'),
    ]

    const layout = layoutTimedSchedules(schedules, day)

    expect(layout).toHaveLength(3)
    expect(layout.map((item) => item.column).sort()).toEqual([0, 1, 2])
    expect(
      layout.every((item) => item.width === 33.333333333333336 || item.width === 100 / 3),
    ).toBe(true)
    expect(layout[0]!.left).toBe(0)
    expect(layout[1]!.left).toBeCloseTo(33.333, 1)
    expect(layout[2]!.left).toBeCloseTo(66.666, 1)
  })

  it('keeps partial overlap groups at two columns', () => {
    const schedules = [
      createSchedule('1', 'user-a', '2026-04-19T10:00:00', '2026-04-19T12:00:00'),
      createSchedule('2', 'user-b', '2026-04-19T11:00:00', '2026-04-19T13:00:00'),
    ]

    const layout = layoutTimedSchedules(schedules, day)

    expect(layout).toHaveLength(2)
    expect(layout.every((item) => item.columnCount === 2)).toBe(true)
    expect(layout.every((item) => item.width === 50)).toBe(true)
  })

  it('includes multi-day all-day schedules on each day in the range', () => {
    const rangeDays = [MULTI_DAY_ALL_DAY_START, MULTI_DAY_ALL_DAY_MIDDLE, MULTI_DAY_ALL_DAY_END]

    for (const rangeDay of rangeDays) {
      const allDay = getAllDaySchedules(mockSchedules, rangeDay)
      const multiDay = allDay.find((schedule) => schedule.id === MULTI_DAY_ALL_DAY_ID)

      expect(multiDay).toBeDefined()
      expect(multiDay!.title).toBe('제주 연수')
    }
  })

  it('includes two-day overseas trip on both days in the range', () => {
    for (const day of [TWO_DAY_ALL_DAY_START, TWO_DAY_ALL_DAY_END]) {
      const allDay = getAllDaySchedules(mockSchedules, day)
      const overseas = allDay.find((schedule) => schedule.id === TWO_DAY_ALL_DAY_ID)

      expect(overseas).toBeDefined()
      expect(overseas!.title).toBe(TWO_DAY_ALL_DAY_TITLE)
    }
  })

  it('excludes multi-day all-day schedules outside the range', () => {
    const beforeRange = new Date(2026, 3, 22)
    const afterRange = new Date(2026, 3, 26)

    expect(
      getAllDaySchedules(mockSchedules, beforeRange).some((s) => s.id === MULTI_DAY_ALL_DAY_ID),
    ).toBe(false)
    expect(
      getAllDaySchedules(mockSchedules, afterRange).some((s) => s.id === MULTI_DAY_ALL_DAY_ID),
    ).toBe(false)
  })

  it('renders 30-minute schedules with half the height of a one-hour event', () => {
    const schedules = [
      createSchedule('30m', 'user-a', '2026-05-20T09:00:00', '2026-05-20T09:30:00'),
      createSchedule('60m', 'user-b', '2026-05-20T11:00:00', '2026-05-20T12:00:00'),
    ]

    const layout = layoutTimedSchedules(schedules, HALF_HOUR_SLOT_DATE, dayRange)
    const halfHour = layout.find((item) => item.schedule.id === '30m')!
    const oneHour = layout.find((item) => item.schedule.id === '60m')!

    expect(halfHour.height).toBeCloseTo((30 / getTotalMinutes()) * 100, 5)
    expect(oneHour.height).toBeCloseTo((60 / getTotalMinutes()) * 100, 5)
    expect(halfHour.height).toBeCloseTo(oneHour.height / 2, 5)
  })

  it('places consecutive 30-minute slots at separate positions without overlap', () => {
    const layout = layoutTimedSchedules(
      getTimedSchedules(mockSchedules, HALF_HOUR_SLOT_DATE),
      HALF_HOUR_SLOT_DATE,
      dayRange,
    )
    const standup = layout.find((item) => item.schedule.id === 's-030')!
    const coordination = layout.find((item) => item.schedule.id === 's-031')!

    expect(standup.top).toBeLessThan(coordination.top)
    expect(standup.top + standup.height).toBeCloseTo(coordination.top, 5)
    expect(standup.width).toBe(100)
    expect(coordination.width).toBe(100)
  })

  it('splits overlapping 30-minute schedules into two columns', () => {
    const layout = layoutTimedSchedules(
      getTimedSchedules(mockSchedules, HALF_HOUR_SLOT_DATE),
      HALF_HOUR_SLOT_DATE,
      dayRange,
    )
    const inspection = layout.find((item) => item.schedule.id === 's-032')!
    const collaboration = layout.find((item) => item.schedule.id === 's-033')!

    expect(inspection.width).toBe(50)
    expect(collaboration.width).toBe(50)
    expect(inspection.left).toBe(0)
    expect(collaboration.left).toBe(50)
  })
})

describe('scheduleCrud', () => {
  it('creates incremental schedule ids', () => {
    expect(createScheduleId([{ id: 's-009' } as never])).toBe('s-010')
    expect(createScheduleId([])).toBe('s-001')
  })

  it('builds a schedule from draft', () => {
    const schedule = buildScheduleFromDraft(
      {
        title: '테스트 일정',
        type: 'my_schedule',
        participantId: participants[0]!.id,
        start: new Date('2026-06-01T09:00:00'),
        end: new Date('2026-06-01T10:00:00'),
        allDay: false,
      },
      participants,
      [],
    )

    expect(schedule.id).toBe('s-001')
    expect(schedule.title).toBe('테스트 일정')
    expect(schedule.participantName).toBe(participants[0]!.name)
    expect(schedule.remarks).toContain('2026-06-01')
  })

  it('upserts and removes schedules', () => {
    const original = buildScheduleFromDraft(
      {
        id: 's-100',
        title: '원본',
        type: 'my_schedule',
        participantId: participants[0]!.id,
        start: new Date('2026-06-02T00:00:00'),
        end: new Date('2026-06-02T23:59:00'),
        allDay: true,
      },
      participants,
      [],
    )

    const created = upsertSchedule([], original)
    expect(created).toHaveLength(1)

    const updated = upsertSchedule(created, { ...original, title: '수정' })
    expect(updated[0]?.title).toBe('수정')

    const removed = removeSchedule(updated, 's-100')
    expect(removed).toHaveLength(0)
  })
})

describe('scheduleFilter', () => {
  it('filters schedules by my scope', () => {
    const mine = filterSchedulesByScope(mockSchedules, 'my', CURRENT_USER_ID)

    expect(mine.length).toBeGreaterThan(0)
    expect(mine.every((schedule) => schedule.participantId === CURRENT_USER_ID)).toBe(true)
    expect(mine.length).toBeLessThan(mockSchedules.length)
  })

  it('returns all schedules for company scope', () => {
    const all = filterSchedulesByScope(mockSchedules, 'company', CURRENT_USER_ID)
    expect(all).toHaveLength(mockSchedules.length)
  })

  it('returns empty list for my scope without currentUserId', () => {
    expect(filterSchedulesByScope(mockSchedules, 'my')).toEqual([])
  })

  it('filters list rows by selected date', () => {
    const date = startOfDay(new Date(2026, 4, 15))
    const filtered = filterSchedulesForListDate(mockSchedules, date)

    expect(filtered.length).toBeGreaterThan(0)
    expect(countSchedulesForDate(filtered, date)).toBe(filtered.length)
  })

  it('returns all schedules when list filter date is null', () => {
    expect(filterSchedulesForListDate(mockSchedules, null)).toHaveLength(mockSchedules.length)
  })

  it('filters schedules by selected types', () => {
    const trips = filterSchedulesByType(mockSchedules, ['my_schedule'])

    expect(trips.length).toBeGreaterThan(0)
    expect(trips.every((schedule) => schedule.type === 'my_schedule')).toBe(true)
  })

  it('returns empty list when schedule type filter is an empty array', () => {
    expect(filterSchedulesByType(mockSchedules, [])).toEqual([])
  })

  it('applies view scope and schedule type together', () => {
    const filtered = applyScheduleFilters(mockSchedules, {
      viewScope: 'my',
      scheduleTypes: ['my_schedule'],
      currentUserId: CURRENT_USER_ID,
    })

    expect(filtered.length).toBeGreaterThan(0)
    expect(
      filtered.every(
        (schedule) => schedule.participantId === CURRENT_USER_ID && schedule.type === 'my_schedule',
      ),
    ).toBe(true)
  })

  it('filters list rows by selected month', () => {
    const april = filterSchedulesForListMonth(mockSchedules, new Date(2026, 3, 1))
    const may = filterSchedulesForListMonth(mockSchedules, new Date(2026, 4, 1))

    expect(april.length).toBeGreaterThan(0)
    expect(may.length).toBeGreaterThan(0)
    expect(april.length).toBeLessThan(mockSchedules.length)
    expect(april.every((schedule) => schedule.start.getMonth() === 3)).toBe(true)
    expect(may.every((schedule) => schedule.start.getMonth() === 4)).toBe(true)
  })
})

describe('scheduleQuery', () => {
  const april22 = startOfDay(new Date(2026, 3, 22))

  it('builds month range for month view', () => {
    const range = getScheduleQueryDateRange('month', april22, null)

    expect(range.start).toEqual(startOfMonth(april22))
    expect(range.end).toEqual(endOfMonth(april22))
  })

  it('builds week range for week view', () => {
    const range = getScheduleQueryDateRange('week', april22, null)

    expect(range.start).toEqual(startOfWeek(april22))
    expect(range.end).toEqual(endOfWeek(april22))
  })

  it('builds day range for day view', () => {
    const range = getScheduleQueryDateRange('day', april22, null)

    expect(range.start).toEqual(april22)
    expect(range.end.getDate()).toBe(22)
    expect(range.end.getHours()).toBe(23)
  })

  it('includes viewScope and scheduleTypes in query-change payload', () => {
    const payload = buildScheduleQueryChangePayload({
      view: 'month',
      date: april22,
      viewScope: 'my',
      scheduleTypes: ['my_schedule', 'team_schedule'],
      listFilterDate: null,
      trigger: 'navigate',
      action: 'next-month',
    })

    expect(payload.viewScope).toBe('my')
    expect(payload.scheduleTypes).toEqual(['my_schedule', 'team_schedule'])
    expect(payload.trigger).toBe('navigate')
    expect(payload.action).toBe('next-month')
    expect(payload.range.start).toEqual(startOfMonth(april22))
  })
})
