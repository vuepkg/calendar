import { describe, expect, it } from 'vitest'
import type { Holiday } from '@/types/schedule'
import { getHolidaysForDateKey, groupHolidaysByDateKey, mergeHolidays } from './holiday'

const sample: Holiday[] = [
  { id: 'a', dateKey: '2026-05-05', name: '어린이날', kind: 'public' },
  { id: 'b', dateKey: '2026-04-01', name: '회사 창립기념일', kind: 'company' },
  { id: 'c', dateKey: '2026-05-05', name: '석가탄신일', kind: 'public' },
]

describe('holiday utils', () => {
  it('groups holidays by dateKey and sorts names in Korean locale', () => {
    const map = groupHolidaysByDateKey(sample)

    expect(map.get('2026-05-05')?.map((h) => h.name)).toEqual(['석가탄신일', '어린이날'])
    expect(getHolidaysForDateKey(map, '2026-04-01')).toHaveLength(1)
    expect(getHolidaysForDateKey(map, '2026-01-01')).toEqual([])
  })

  it('mergeHolidays deduplicates by id and sorts by date then name', () => {
    const merged = mergeHolidays(
      [{ id: 'd', dateKey: '2026-01-01', name: '신정', kind: 'public' }],
      sample,
    )

    expect(merged).toHaveLength(4)
    expect(merged.map((h) => h.id)).toEqual(['d', 'b', 'c', 'a'])
  })
})
