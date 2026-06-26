import { describe, expect, it } from 'vitest'
import {
  addDays,
  formatDayViewDate,
  formatHourLabel,
  formatMonthLabel,
  formatPeriod,
  formatTimedGridDayLabel,
  getMonthGridDays,
  getWeekDays,
  isSameDay,
  resolveCalendarNavigateDate,
  startOfDay,
  startOfWeek,
  toDateKey,
} from './date'

describe('date utils', () => {
  it('creates stable date keys', () => {
    const date = new Date(2026, 3, 19)
    expect(toDateKey(date)).toBe('2026-04-19')
  })

  it('builds a 42-day month grid', () => {
    const days = getMonthGridDays(new Date(2026, 4, 10))
    expect(days).toHaveLength(42)
    expect(days[0]!.getDay()).toBe(0)
  })

  it('returns seven days for a week', () => {
    const week = getWeekDays(new Date(2026, 3, 22))
    expect(week).toHaveLength(7)
    expect(week[0]!.getDay()).toBe(0)
    expect(isSameDay(week[0]!, startOfWeek(new Date(2026, 3, 22)))).toBe(true)
  })

  it('formats week/day column header label as weekday only', () => {
    expect(formatTimedGridDayLabel(new Date(2026, 3, 19))).toBe('Sunday')
    expect(formatTimedGridDayLabel(new Date(2026, 3, 22))).toBe('Wednesday')
  })

  it('formats month period label as YYYY-MM', () => {
    expect(formatMonthLabel(new Date(2026, 3, 22))).toBe('2026-04')
    expect(formatMonthLabel(new Date(2026, 4, 1))).toBe('2026-05')
  })

  it('formats day period label as YYYY-MM-DD', () => {
    expect(formatDayViewDate(new Date(2026, 3, 22))).toBe('2026-04-22')
  })

  it('formats hour labels in 24-hour clock', () => {
    expect(formatHourLabel(0)).toBe('00:00')
    expect(formatHourLabel(9)).toBe('09:00')
    expect(formatHourLabel(23)).toBe('23:00')
  })

  it('formats a timed period', () => {
    const start = new Date(2026, 3, 1, 9, 0)
    const end = new Date(2026, 3, 1, 10, 0)
    expect(formatPeriod(start, end)).toBe('2026-04-01 09:00 ~ 2026-04-01 10:00')
  })

  it('adds days correctly across month boundaries', () => {
    const result = addDays(new Date(2026, 3, 30), 2)
    expect(result.getMonth()).toBe(4)
    expect(result.getDate()).toBe(2)
  })
})

describe('resolveCalendarNavigateDate', () => {
  const anchor = startOfDay(new Date(2026, 3, 22))

  it('returns today for today action', () => {
    const today = startOfDay(new Date())
    expect(resolveCalendarNavigateDate(anchor, 'today').getTime()).toBe(today.getTime())
  })

  it('moves by day', () => {
    expect(resolveCalendarNavigateDate(anchor, 'prev-day')).toEqual(
      startOfDay(new Date(2026, 3, 21)),
    )
    expect(resolveCalendarNavigateDate(anchor, 'next-day')).toEqual(
      startOfDay(new Date(2026, 3, 23)),
    )
  })

  it('moves by week', () => {
    expect(resolveCalendarNavigateDate(anchor, 'prev-week')).toEqual(
      startOfDay(new Date(2026, 3, 15)),
    )
    expect(resolveCalendarNavigateDate(anchor, 'next-week')).toEqual(
      startOfDay(new Date(2026, 3, 29)),
    )
  })

  it('moves by month', () => {
    expect(resolveCalendarNavigateDate(anchor, 'prev-month')).toEqual(
      startOfDay(new Date(2026, 2, 22)),
    )
    expect(resolveCalendarNavigateDate(anchor, 'next-month')).toEqual(
      startOfDay(new Date(2026, 4, 22)),
    )
  })
})
