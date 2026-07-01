import { describe, expect, it } from 'vitest'
import type { Schedule } from '@/types/schedule'
import { expandRecurringSchedules } from './recurrence'

function makeSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: 's-recur',
    title: '주간 회의',
    type: 'team_schedule',
    participantId: 'user-a',
    participantName: 'TEST USER',
    start: new Date(2026, 4, 6, 9, 0), // 2026-05-06 (Wed)
    end: new Date(2026, 4, 6, 10, 0),
    ...overrides,
  }
}

describe('expandRecurringSchedules', () => {
  it('passes through schedules without a recurrence rule unchanged', () => {
    const schedule = makeSchedule()
    const result = expandRecurringSchedules([schedule], new Date(2026, 4, 1), new Date(2026, 4, 31))

    expect(result).toEqual([schedule])
  })

  it('expands a daily recurrence within the range', () => {
    const schedule = makeSchedule({ recurrence: { freq: 'daily', count: 5 } })
    const result = expandRecurringSchedules([schedule], new Date(2026, 4, 1), new Date(2026, 4, 31))

    expect(result).toHaveLength(5)
    expect(result.map((item) => item.start.getDate())).toEqual([6, 7, 8, 9, 10])
    expect(result.every((item) => item.recurrenceId === 's-recur')).toBe(true)
    expect(result.every((item) => item.isRecurrenceInstance)).toBe(true)
    expect(result[0]!.id).toBe('s-recur::2026-05-06')
  })

  it('preserves the original time-of-day and duration on each occurrence', () => {
    const schedule = makeSchedule({ recurrence: { freq: 'daily', count: 3 } })
    const result = expandRecurringSchedules([schedule], new Date(2026, 4, 1), new Date(2026, 4, 31))

    for (const occurrence of result) {
      expect(occurrence.start.getHours()).toBe(9)
      expect(occurrence.end.getTime() - occurrence.start.getTime()).toBe(60 * 60 * 1000)
    }
  })

  it('clips occurrences to the given range', () => {
    const schedule = makeSchedule({ recurrence: { freq: 'daily', count: 10 } })
    const result = expandRecurringSchedules([schedule], new Date(2026, 4, 8), new Date(2026, 4, 9))

    expect(result.map((item) => item.start.getDate())).toEqual([8, 9])
  })

  it('honors weekly interval (biweekly)', () => {
    const schedule = makeSchedule({ recurrence: { freq: 'weekly', interval: 2, count: 3 } })
    const result = expandRecurringSchedules([schedule], new Date(2026, 4, 1), new Date(2026, 6, 31))

    expect(result.map((item) => item.start.toDateString())).toEqual([
      new Date(2026, 4, 6).toDateString(),
      new Date(2026, 4, 20).toDateString(),
      new Date(2026, 5, 3).toDateString(),
    ])
  })

  it('expands weekly recurrence across multiple byWeekday days', () => {
    // anchor: 2026-05-06 (Wed). byWeekday: Mon(1), Wed(3), Fri(5)
    const schedule = makeSchedule({
      recurrence: { freq: 'weekly', byWeekday: [1, 3, 5], count: 5 },
    })
    const result = expandRecurringSchedules([schedule], new Date(2026, 4, 1), new Date(2026, 4, 31))

    // first week: only Wed(6)/Fri(8) are >= anchor (Mon 4th is before anchor)
    expect(result.map((item) => item.start.toDateString())).toEqual([
      new Date(2026, 4, 6).toDateString(),
      new Date(2026, 4, 8).toDateString(),
      new Date(2026, 4, 11).toDateString(),
      new Date(2026, 4, 13).toDateString(),
      new Date(2026, 4, 15).toDateString(),
    ])
  })

  it('stops at the until date (inclusive)', () => {
    const schedule = makeSchedule({
      recurrence: { freq: 'daily', until: new Date(2026, 4, 8) },
    })
    const result = expandRecurringSchedules([schedule], new Date(2026, 4, 1), new Date(2026, 4, 31))

    expect(result.map((item) => item.start.getDate())).toEqual([6, 7, 8])
  })

  it('skips dates listed in exceptions', () => {
    const schedule = makeSchedule({
      recurrence: { freq: 'daily', count: 5, exceptions: ['2026-05-08'] },
    })
    const result = expandRecurringSchedules([schedule], new Date(2026, 4, 1), new Date(2026, 4, 31))

    expect(result.map((item) => item.start.getDate())).toEqual([6, 7, 9, 10])
  })

  it('expands monthly and yearly recurrence', () => {
    const monthly = makeSchedule({
      id: 's-monthly',
      recurrence: { freq: 'monthly', count: 3 },
    })
    const monthlyResult = expandRecurringSchedules(
      [monthly],
      new Date(2026, 4, 1),
      new Date(2026, 7, 31),
    )
    expect(monthlyResult.map((item) => item.start.getMonth())).toEqual([4, 5, 6])

    const yearly = makeSchedule({
      id: 's-yearly',
      recurrence: { freq: 'yearly', count: 2 },
    })
    const yearlyResult = expandRecurringSchedules(
      [yearly],
      new Date(2026, 0, 1),
      new Date(2028, 11, 31),
    )
    expect(yearlyResult.map((item) => item.start.getFullYear())).toEqual([2026, 2027])
  })

  it('does not mutate the count budget when the range excludes early occurrences', () => {
    // count=3 but range starts after occurrence #1 — should still only surface remaining in-range ones
    const schedule = makeSchedule({ recurrence: { freq: 'daily', count: 3 } })
    const result = expandRecurringSchedules([schedule], new Date(2026, 4, 7), new Date(2026, 4, 31))

    expect(result.map((item) => item.start.getDate())).toEqual([7, 8])
  })
})
