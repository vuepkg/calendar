import type { RecurrenceRule, Schedule } from '@/types/schedule'
import { addDays, addMonths, endOfDay, startOfDay, startOfWeek, toDateKey } from '@/utils/date'

/** 병적인 규칙(interval 0 등)에서도 무한 루프 없이 안전하게 멈추기 위한 회차 상한 */
const MAX_OCCURRENCES_PER_SCHEDULE = 366 * 3

function shiftDateKeepingTime(base: Date, targetDay: Date): Date {
  const next = new Date(base)
  next.setFullYear(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate())
  return next
}

function addByFrequency(date: Date, freq: RecurrenceRule['freq'], amount: number): Date {
  switch (freq) {
    case 'daily':
      return addDays(date, amount)
    case 'weekly':
      return addDays(date, amount * 7)
    case 'monthly':
      return addMonths(date, amount)
    case 'yearly':
      return addMonths(date, amount * 12)
  }
}

/** anchor(반복 시작일) 이상인 회차 후보 날짜를 시간순으로 생성한다 */
function* iterateOccurrenceDates(anchor: Date, rule: RecurrenceRule): Generator<Date> {
  const interval = Math.max(1, rule.interval ?? 1)
  const anchorDay = startOfDay(anchor)

  if (rule.freq === 'weekly' && rule.byWeekday && rule.byWeekday.length > 0) {
    const weekdays = [...new Set(rule.byWeekday)].sort((a, b) => a - b)
    let weekStart = startOfWeek(anchorDay)
    let yielded = 0

    while (yielded < MAX_OCCURRENCES_PER_SCHEDULE) {
      for (const weekday of weekdays) {
        const candidate = addDays(weekStart, weekday)
        if (candidate >= anchorDay) {
          yield candidate
          yielded++
        }
      }
      weekStart = addDays(weekStart, interval * 7)
    }
    return
  }

  for (let index = 0; index < MAX_OCCURRENCES_PER_SCHEDULE; index++) {
    yield addByFrequency(anchorDay, rule.freq, index * interval)
  }
}

/**
 * `recurrence`가 설정된 일정을 `[rangeStart, rangeEnd]` 내의 개별 회차로 펼친다.
 * 반복이 없는 일정은 그대로 통과한다. 회차 id는 `${masterId}::${YYYY-MM-DD}` 형태이며,
 * `recurrenceId`로 원본 일정을 역참조할 수 있다.
 */
export function expandRecurringSchedules(
  schedules: Schedule[],
  rangeStart: Date,
  rangeEnd: Date,
): Schedule[] {
  const result: Schedule[] = []

  for (const schedule of schedules) {
    const rule = schedule.recurrence
    if (!rule) {
      result.push(schedule)
      continue
    }

    const durationMs = schedule.end.getTime() - schedule.start.getTime()
    const exceptions = new Set(rule.exceptions ?? [])
    const until = rule.until ? endOfDay(rule.until) : null
    let occurrenceCount = 0

    for (const occurrenceDay of iterateOccurrenceDates(schedule.start, rule)) {
      if (rule.count !== undefined && occurrenceCount >= rule.count) {
        break
      }
      if (until && occurrenceDay > until) {
        break
      }
      if (occurrenceDay > rangeEnd) {
        break
      }

      occurrenceCount++

      if (occurrenceDay < rangeStart) {
        continue
      }

      const dateKey = toDateKey(occurrenceDay)
      if (exceptions.has(dateKey)) {
        continue
      }

      const start = shiftDateKeepingTime(schedule.start, occurrenceDay)
      const end = new Date(start.getTime() + durationMs)

      result.push({
        ...schedule,
        id: `${schedule.id}::${dateKey}`,
        start,
        end,
        recurrenceId: schedule.id,
        isRecurrenceInstance: true,
      })
    }
  }

  return result
}
