import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  clampDateToRange,
  endOfDay,
  endOfMonth,
  endOfWeek,
  formatDayHeader,
  formatDayViewDate,
  formatHourLabel,
  formatMonthColumn,
  formatMonthLabel,
  formatPeriod,
  formatTime,
  formatTimedGridDayLabel,
  getHourLabels,
  getMonthGridDays,
  getWeekDays,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDateKey,
} from './date'

describe('startOfDay / endOfDay', () => {
  it('zeroes the time portion to 00:00:00.000', () => {
    const result = startOfDay(new Date(2026, 3, 22, 13, 45, 30, 500))
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('does not mutate the input date', () => {
    const input = new Date(2026, 3, 22, 13, 45)
    startOfDay(input)
    expect(input.getHours()).toBe(13)
  })

  it('sets the time portion to 23:59:59.999', () => {
    const result = endOfDay(new Date(2026, 3, 22, 13, 45))
    expect(result.getHours()).toBe(23)
    expect(result.getMinutes()).toBe(59)
    expect(result.getSeconds()).toBe(59)
    expect(result.getMilliseconds()).toBe(999)
  })
})

describe('isSameDay / isSameMonth', () => {
  it('treats same calendar day with different times as the same day', () => {
    expect(isSameDay(new Date(2026, 3, 22, 0, 0), new Date(2026, 3, 22, 23, 59))).toBe(true)
  })

  it('treats different days as not the same day', () => {
    expect(isSameDay(new Date(2026, 3, 22), new Date(2026, 3, 23))).toBe(false)
  })

  it('treats same year/month with different days as the same month', () => {
    expect(isSameMonth(new Date(2026, 3, 1), new Date(2026, 3, 30))).toBe(true)
  })

  it('treats same month number in different years as not the same month', () => {
    expect(isSameMonth(new Date(2025, 3, 22), new Date(2026, 3, 22))).toBe(false)
  })
})

describe('addDays / addMonths', () => {
  it('adds days across a month boundary', () => {
    const result = addDays(new Date(2026, 3, 30), 2)
    expect(result.getMonth()).toBe(4)
    expect(result.getDate()).toBe(2)
  })

  it('subtracts days when given a negative count', () => {
    const result = addDays(new Date(2026, 4, 1), -1)
    expect(result.getMonth()).toBe(3)
    expect(result.getDate()).toBe(30)
  })

  it('adds months across a year boundary', () => {
    const result = addMonths(new Date(2026, 11, 15), 1)
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(0)
  })

  it('clamps an overflowing day-of-month into the next month (native Date rollover)', () => {
    // Jan 31 + 1 month -> JS Date rolls over to Mar 3 (Feb has 28 days in 2026)
    const result = addMonths(new Date(2026, 0, 31), 1)
    expect(result.getMonth()).toBe(2)
    expect(result.getDate()).toBe(3)
  })
})

describe('startOfWeek / endOfWeek', () => {
  it('defaults to Sunday as the first day of the week', () => {
    const result = startOfWeek(new Date(2026, 3, 22)) // Wednesday
    expect(result.getDay()).toBe(0)
    expect(result.getDate()).toBe(19)
  })

  it('respects a custom weekStartsOn (Monday)', () => {
    const result = startOfWeek(new Date(2026, 3, 22), 1) // Wednesday
    expect(result.getDay()).toBe(1)
    expect(result.getDate()).toBe(20)
  })

  it('stays on the same date when it already is the week start', () => {
    const sunday = new Date(2026, 3, 19)
    expect(startOfWeek(sunday).getDate()).toBe(19)
  })

  it('endOfWeek returns the last instant of the 7th day from the start', () => {
    const result = endOfWeek(new Date(2026, 3, 22))
    expect(result.getDay()).toBe(6)
    expect(result.getDate()).toBe(25)
    expect(result.getHours()).toBe(23)
    expect(result.getMinutes()).toBe(59)
  })
})

describe('startOfMonth / endOfMonth', () => {
  it('returns the 1st of the month at midnight', () => {
    const result = startOfMonth(new Date(2026, 3, 22, 15, 30))
    expect(result.getDate()).toBe(1)
    expect(result.getHours()).toBe(0)
  })

  it('returns the last day of the month at 23:59:59.999', () => {
    const result = endOfMonth(new Date(2026, 3, 22))
    expect(result.getMonth()).toBe(3)
    expect(result.getDate()).toBe(30)
    expect(result.getHours()).toBe(23)
  })

  it('handles February in a leap year', () => {
    const result = endOfMonth(new Date(2028, 1, 10))
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(29)
  })

  it('handles February in a non-leap year', () => {
    const result = endOfMonth(new Date(2026, 1, 10))
    expect(result.getDate()).toBe(28)
  })
})

describe('toDateKey', () => {
  it('formats as YYYY-MM-DD with zero-padding', () => {
    expect(toDateKey(new Date(2026, 3, 19))).toBe('2026-04-19')
  })

  it('zero-pads single-digit months and days', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('formatMonthLabel / formatMonthColumn', () => {
  it('formats as YYYY-MM', () => {
    expect(formatMonthLabel(new Date(2026, 3, 22))).toBe('2026-04')
    expect(formatMonthColumn(new Date(2026, 4, 1))).toBe('2026-05')
  })

  it('formatMonthLabel delegates to formatMonthColumn (same output)', () => {
    const date = new Date(2026, 8, 1)
    expect(formatMonthLabel(date)).toBe(formatMonthColumn(date))
  })
})

describe('formatDayHeader', () => {
  it('formats as "D Mon, Weekday" in English', () => {
    expect(formatDayHeader(new Date(2026, 3, 22))).toBe('22 Apr, Wednesday')
  })
})

describe('formatTimedGridDayLabel', () => {
  it('formats only the weekday name', () => {
    expect(formatTimedGridDayLabel(new Date(2026, 3, 19))).toBe('Sunday')
    expect(formatTimedGridDayLabel(new Date(2026, 3, 22))).toBe('Wednesday')
  })
})

describe('formatDayViewDate', () => {
  it('formats the same as toDateKey', () => {
    expect(formatDayViewDate(new Date(2026, 3, 22))).toBe('2026-04-22')
  })
})

describe('formatHourLabel', () => {
  it('formats 24-hour clock values with zero-padding', () => {
    expect(formatHourLabel(0)).toBe('00:00')
    expect(formatHourLabel(9)).toBe('09:00')
    expect(formatHourLabel(23)).toBe('23:00')
  })
})

describe('formatTime', () => {
  it('formats hours and minutes with zero-padding', () => {
    expect(formatTime(new Date(2026, 3, 1, 9, 5))).toBe('09:05')
    expect(formatTime(new Date(2026, 3, 1, 0, 0))).toBe('00:00')
  })
})

describe('formatPeriod', () => {
  it('includes time-of-day when start or end has a non-default time', () => {
    const start = new Date(2026, 3, 1, 9, 0)
    const end = new Date(2026, 3, 1, 10, 0)
    expect(formatPeriod(start, end)).toBe('2026-04-01 09:00 ~ 2026-04-01 10:00')
  })

  it('omits time-of-day for an all-day range (start 00:00, end 23:59)', () => {
    const start = startOfDay(new Date(2026, 3, 1))
    const end = endOfDay(new Date(2026, 3, 2))
    expect(formatPeriod(start, end)).toBe('2026-04-01 ~ 2026-04-02')
  })

  it('treats a start at exactly midnight with a timed end as a timed period', () => {
    const start = new Date(2026, 3, 1, 0, 0)
    const end = new Date(2026, 3, 1, 10, 30)
    expect(formatPeriod(start, end)).toBe('2026-04-01 00:00 ~ 2026-04-01 10:30')
  })
})

describe('getMonthGridDays', () => {
  it('returns a fixed 42-cell grid starting on a Sunday', () => {
    const days = getMonthGridDays(new Date(2026, 4, 10))
    expect(days).toHaveLength(42)
    expect(days[0]!.getDay()).toBe(0)
  })

  it('includes leading days from the previous month and trailing days from the next', () => {
    const days = getMonthGridDays(new Date(2026, 3, 1)) // April 2026 starts on a Wednesday
    expect(days[0]!.getMonth()).toBe(2) // March leads in
    expect(days[41]!.getMonth()).not.toBe(2)
  })
})

describe('getWeekDays', () => {
  it('returns 7 consecutive days starting on the week start', () => {
    const week = getWeekDays(new Date(2026, 3, 22))
    expect(week).toHaveLength(7)
    expect(week[0]!.getDay()).toBe(0)
    expect(isSameDay(week[0]!, startOfWeek(new Date(2026, 3, 22)))).toBe(true)
    expect(week[6]!.getDay()).toBe(6)
  })
})

describe('getHourLabels', () => {
  it('returns inclusive labels from startHour to endHour', () => {
    expect(getHourLabels(9, 12)).toEqual(['09:00', '10:00', '11:00', '12:00'])
  })

  it('returns a single label when startHour equals endHour', () => {
    expect(getHourLabels(9, 9)).toEqual(['09:00'])
  })

  it('returns an empty array when startHour is greater than endHour', () => {
    expect(getHourLabels(12, 9)).toEqual([])
  })
})

describe('clampDateToRange', () => {
  const rangeStart = new Date(2026, 3, 10)
  const rangeEnd = new Date(2026, 3, 20)

  it('returns the date unchanged when inside the range', () => {
    const date = new Date(2026, 3, 15)
    expect(clampDateToRange(date, rangeStart, rangeEnd)).toBe(date)
  })

  it('clamps to rangeStart when the date is before the range', () => {
    const result = clampDateToRange(new Date(2026, 3, 1), rangeStart, rangeEnd)
    expect(result.getTime()).toBe(rangeStart.getTime())
  })

  it('clamps to rangeEnd when the date is after the range', () => {
    const result = clampDateToRange(new Date(2026, 3, 30), rangeStart, rangeEnd)
    expect(result.getTime()).toBe(rangeEnd.getTime())
  })

  it('treats the range boundaries themselves as inside the range', () => {
    expect(clampDateToRange(rangeStart, rangeStart, rangeEnd)).toBe(rangeStart)
    expect(clampDateToRange(rangeEnd, rangeStart, rangeEnd)).toBe(rangeEnd)
  })
})
