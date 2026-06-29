import type { Holiday } from '../types/holiday'
import { toDateKey } from './date'

export function groupHolidaysByDateKey(holidays: Holiday[]): Map<string, Holiday[]> {
  const map = new Map<string, Holiday[]>()

  for (const holiday of holidays) {
    const list = map.get(holiday.dateKey) ?? []
    list.push(holiday)
    map.set(holiday.dateKey, list)
  }

  for (const list of map.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }

  return map
}

export function getHolidaysForDateKey(
  holidaysByDate: Map<string, Holiday[]>,
  dateKey: string,
): Holiday[] {
  return holidaysByDate.get(dateKey) ?? []
}

export function mergeHolidays(...groups: Holiday[][]): Holiday[] {
  const byId = new Map<string, Holiday>()

  for (const group of groups) {
    for (const holiday of group) {
      byId.set(holiday.id, holiday)
    }
  }

  return [...byId.values()].sort((a, b) => {
    if (a.dateKey !== b.dateKey) {
      return a.dateKey.localeCompare(b.dateKey)
    }
    return a.name.localeCompare(b.name, 'ko')
  })
}

export function holidayFromDate(
  date: Date,
  name: string,
  kind: Holiday['kind'],
  id?: string,
): Holiday {
  const dateKey = toDateKey(date)
  return {
    id: id ?? `${kind}-${dateKey}-${name}`,
    dateKey,
    name,
    kind,
  }
}
