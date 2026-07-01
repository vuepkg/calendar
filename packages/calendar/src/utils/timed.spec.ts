import { describe, expect, it } from 'vitest'
import {
  HOUR_HEIGHT_PX,
  TIMED_VIEW_END_HOUR,
  TIMED_VIEW_START_HOUR,
} from '@/constants/calendarView'
import {
  ALL_DAY_OVERFLOW_DATE,
  mockSchedules,
  MULTI_DAY_ALL_DAY_ID,
  TWO_DAY_ALL_DAY_ID,
  TWO_DAY_ALL_DAY_START,
} from '@/data/mockSchedules'
import { getWeekDays, startOfDay } from '@/utils/date'
import {
  ALL_DAY_SECTION_MAX_HEIGHT,
  DAY_VIEW_ALL_DAY_VISIBLE_MAX,
  getAllDayRowCount,
  getCurrentTimeIndicator,
  getDayAllDayOverflowCount,
  getDayAllDayScrollStep,
  getDayAllDaySectionHeight,
  getTimeSlotSelectionStyle,
  layoutWeekAllDayBars,
  resolveTimeSlotFromOffset,
} from '@/utils/timed'

describe('getCurrentTimeIndicator', () => {
  const day = new Date(2026, 5, 10)

  it('is hidden for non-today dates', () => {
    const result = getCurrentTimeIndicator(
      day,
      TIMED_VIEW_START_HOUR,
      TIMED_VIEW_END_HOUR,
      new Date(2026, 5, 9, 10, 1),
    )

    expect(result.visible).toBe(false)
  })

  it('returns position and label for today', () => {
    const now = new Date(2026, 5, 10, 10, 1)
    const result = getCurrentTimeIndicator(day, TIMED_VIEW_START_HOUR, TIMED_VIEW_END_HOUR, now)
    const totalMinutes = (TIMED_VIEW_END_HOUR - TIMED_VIEW_START_HOUR + 1) * 60

    expect(result.visible).toBe(true)
    expect(result.label).toBe('10:01')
    expect(result.topPercent).toBeCloseTo(
      ((10 * 60 + 1 - TIMED_VIEW_START_HOUR * 60) / totalMinutes) * 100,
      1,
    )
  })
})

// ── resolveTimeSlotFromOffset ─────────────────────────────────────────

const day = startOfDay(new Date(2026, 3, 22))

describe('resolveTimeSlotFromOffset', () => {
  it('maps click offset to a one-hour slot (02:00 ~ 03:00)', () => {
    const { start, end } = resolveTimeSlotFromOffset(day, 2 * HOUR_HEIGHT_PX)

    expect(start.getHours()).toBe(2)
    expect(start.getMinutes()).toBe(0)
    expect(end.getHours()).toBe(3)
    expect(end.getMinutes()).toBe(0)
  })

  it('maps click offset to a one-hour slot (08:00 ~ 09:00)', () => {
    const { start, end } = resolveTimeSlotFromOffset(day, 8 * HOUR_HEIGHT_PX + 12)

    expect(start.getHours()).toBe(8)
    expect(start.getMinutes()).toBe(0)
    expect(end.getHours()).toBe(9)
    expect(end.getMinutes()).toBe(0)
  })

  it('clamps clicks below the grid to the first hour', () => {
    const { start, end } = resolveTimeSlotFromOffset(day, -10)

    expect(start.getHours()).toBe(0)
    expect(end.getHours()).toBe(1)
  })

  it('clamps clicks beyond the grid to the last hour', () => {
    const { start, end } = resolveTimeSlotFromOffset(day, 99 * HOUR_HEIGHT_PX)

    expect(start.getHours()).toBe(23)
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
  })
})

// ── getTimeSlotSelectionStyle ─────────────────────────────────────────

describe('getTimeSlotSelectionStyle', () => {
  it('positions overlay for the 08:00 hour row', () => {
    const start = new Date(day)
    start.setHours(8, 0, 0, 0)
    const end = new Date(day)
    end.setHours(9, 0, 0, 0)

    expect(getTimeSlotSelectionStyle(start, end)).toEqual({
      top: `${(8 / 24) * 100}%`,
      height: `${(1 / 24) * 100}%`,
    })
  })
})

describe('layoutWeekAllDayBars', () => {
  const weekDays = getWeekDays(new Date(2026, 3, 21))

  it('merges multi-day all-day schedule into one spanning bar', () => {
    const bars = layoutWeekAllDayBars(weekDays, mockSchedules)
    const multiDayBar = bars.find((bar) => bar.schedule.id === MULTI_DAY_ALL_DAY_ID)

    expect(multiDayBar).toBeDefined()
    expect(multiDayBar!.span).toBe(3)
    expect(multiDayBar!.startColumn).toBe(4)
  })

  it('keeps single-day all-day schedules as one-day bars', () => {
    const bars = layoutWeekAllDayBars(weekDays, mockSchedules)
    const singleDayBars = bars.filter(
      (bar) => bar.span === 1 && bar.schedule.id !== MULTI_DAY_ALL_DAY_ID,
    )

    expect(singleDayBars.length).toBeGreaterThan(0)
  })

  it('merges two-day overseas trip into one spanning bar', () => {
    const weekDays = getWeekDays(TWO_DAY_ALL_DAY_START)
    const bars = layoutWeekAllDayBars(weekDays, mockSchedules)
    const overseasBar = bars.find((bar) => bar.schedule.id === TWO_DAY_ALL_DAY_ID)

    expect(overseasBar).toBeDefined()
    expect(overseasBar!.span).toBe(2)
    expect(overseasBar!.startColumn).toBe(1)
  })

  it('assigns separate rows for overlapping bars', () => {
    const bars = layoutWeekAllDayBars(weekDays, mockSchedules)
    const rows = new Set(bars.map((bar) => bar.row))

    expect(rows.size).toBeGreaterThan(1)
    expect(getAllDayRowCount(bars)).toBeGreaterThan(1)
  })
})

describe('dayAllDayLayout', () => {
  it('limits visible area height to three rows', () => {
    expect(getDayAllDaySectionHeight(5)).toBe(ALL_DAY_SECTION_MAX_HEIGHT)
    expect(getDayAllDaySectionHeight(2)).toBeLessThan(ALL_DAY_SECTION_MAX_HEIGHT)
  })

  it('stacks overflow all-day schedules into week-style rows', () => {
    const bars = layoutWeekAllDayBars([ALL_DAY_OVERFLOW_DATE], mockSchedules)

    expect(bars).toHaveLength(5)
    expect(getAllDayRowCount(bars)).toBe(5)
    expect(getDayAllDayOverflowCount(bars.length)).toBe(2)
    expect(DAY_VIEW_ALL_DAY_VISIBLE_MAX).toBe(3)
  })

  it('scrolls one row at a time', () => {
    expect(getDayAllDayScrollStep()).toBe(26)
  })
})
