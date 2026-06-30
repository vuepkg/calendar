import { describe, expect, it } from 'vitest'
import type { Holiday } from '../types/holiday'
import { getHolidaysForDateKey, groupHolidaysByDateKey, holidayFromDate, mergeHolidays } from './holiday'

const sample: Holiday[] = [
  { id: 'a', dateKey: '2026-05-05', name: '어린이날', kind: 'public' },
  { id: 'b', dateKey: '2026-04-01', name: '회사 창립기념일', kind: 'company' },
  { id: 'c', dateKey: '2026-05-05', name: '석가탄신일', kind: 'public' },
]

describe('groupHolidaysByDateKey', () => {
  it('groups holidays by dateKey and sorts names in Korean locale', () => {
    const map = groupHolidaysByDateKey(sample)
    expect(map.get('2026-05-05')?.map((h) => h.name)).toEqual(['석가탄신일', '어린이날'])
  })

  it('returns an empty map for an empty input array', () => {
    const map = groupHolidaysByDateKey([])
    expect(map.size).toBe(0)
  })

  it('returns a single-entry list for a dateKey with one holiday', () => {
    const map = groupHolidaysByDateKey(sample)
    expect(map.get('2026-04-01')).toHaveLength(1)
  })
})

describe('getHolidaysForDateKey', () => {
  it('returns the holidays for a known dateKey', () => {
    const map = groupHolidaysByDateKey(sample)
    expect(getHolidaysForDateKey(map, '2026-04-01')).toHaveLength(1)
  })

  it('returns an empty array (not undefined) for an unknown dateKey', () => {
    const map = groupHolidaysByDateKey(sample)
    expect(getHolidaysForDateKey(map, '1999-01-01')).toEqual([])
  })

  it('returns an empty array when the map itself is empty', () => {
    expect(getHolidaysForDateKey(new Map(), '2026-01-01')).toEqual([])
  })
})

describe('mergeHolidays', () => {
  it('deduplicates by id and sorts by date then name', () => {
    const merged = mergeHolidays([{ id: 'd', dateKey: '2026-01-01', name: '신정', kind: 'public' }], sample)
    expect(merged).toHaveLength(4)
    expect(merged.map((h) => h.id)).toEqual(['d', 'b', 'c', 'a'])
  })

  it('returns an empty array when called with no groups', () => {
    expect(mergeHolidays()).toEqual([])
  })

  it('returns an empty array when all groups are empty', () => {
    expect(mergeHolidays([], [])).toEqual([])
  })

  it('lets a later group override an earlier group for the same id', () => {
    const first: Holiday[] = [{ id: 'x', dateKey: '2026-01-01', name: 'old name', kind: 'company' }]
    const second: Holiday[] = [{ id: 'x', dateKey: '2026-01-01', name: 'new name', kind: 'public' }]
    const merged = mergeHolidays(first, second)
    expect(merged).toHaveLength(1)
    expect(merged[0]).toEqual(second[0])
  })

  it('deduplicates ids within the same group too', () => {
    const group: Holiday[] = [
      { id: 'x', dateKey: '2026-01-01', name: 'first', kind: 'public' },
      { id: 'x', dateKey: '2026-01-01', name: 'second', kind: 'public' },
    ]
    expect(mergeHolidays(group)).toHaveLength(1)
  })
})

describe('holidayFromDate', () => {
  it('builds a Holiday with a derived dateKey and a default id', () => {
    const holiday = holidayFromDate(new Date(2026, 0, 1), '신정', 'public')
    expect(holiday).toEqual({
      id: 'public-2026-01-01-신정',
      dateKey: '2026-01-01',
      name: '신정',
      kind: 'public',
    })
  })

  it('uses the provided id when one is given', () => {
    const holiday = holidayFromDate(new Date(2026, 0, 1), '신정', 'public', 'custom-id')
    expect(holiday.id).toBe('custom-id')
  })

  it('reflects the given kind in both the kind field and the default id', () => {
    const holiday = holidayFromDate(new Date(2026, 3, 1), '창립기념일', 'company')
    expect(holiday.kind).toBe('company')
    expect(holiday.id).toBe('company-2026-04-01-창립기념일')
  })
})
