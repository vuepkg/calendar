export function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function endOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export function startOfWeek(date: Date, weekStartsOn = 0): Date {
  const result = startOfDay(date)
  const day = result.getDay()
  const diff = (day - weekStartsOn + 7) % 7
  return addDays(result, -diff)
}

export function endOfWeek(date: Date, weekStartsOn = 0): Date {
  return endOfDay(addDays(startOfWeek(date, weekStartsOn), 6))
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatMonthLabel(date: Date): string {
  return formatMonthColumn(date)
}

export function formatDayHeader(date: Date): string {
  const day = date.getDate()
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date)
  return `${day} ${month}, ${weekday}`
}

export function formatTimedGridDayLabel(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale ?? 'en-US', { weekday: 'long' }).format(date)
}

/** 일~토 순서 축약 요일명 7개를 지정 locale로 생성합니다 (`Intl.DateTimeFormat` 기반, zero-dep). */
export function formatWeekdayLabels(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  // 2023-01-01은 일요일 — 요일 순서 계산용 고정 기준일
  const referenceSunday = new Date(2023, 0, 1)
  return Array.from({ length: 7 }, (_, index) => formatter.format(addDays(referenceSunday, index)))
}

export function formatDayViewDate(date: Date): string {
  return toDateKey(date)
}

export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatPeriod(start: Date, end: Date): string {
  const datePart = (value: Date) => {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const startHasTime = start.getHours() !== 0 || start.getMinutes() !== 0
  const endHasTime = end.getHours() !== 23 || end.getMinutes() !== 59

  if (startHasTime || endHasTime) {
    return `${datePart(start)} ${formatTime(start)} ~ ${datePart(end)} ${formatTime(end)}`
  }

  return `${datePart(start)} ~ ${datePart(end)}`
}

export function formatMonthColumn(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getMonthGridDays(date: Date): Date[] {
  const monthStart = startOfMonth(date)
  const gridStart = startOfWeek(monthStart)
  const days: Date[] = []

  for (let index = 0; index < 42; index += 1) {
    days.push(addDays(gridStart, index))
  }

  return days
}

export function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date)
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function getHourLabels(startHour: number, endHour: number): string[] {
  const labels: string[] = []
  for (let hour = startHour; hour <= endHour; hour += 1) {
    labels.push(`${String(hour).padStart(2, '0')}:00`)
  }
  return labels
}

export function clampDateToRange(date: Date, rangeStart: Date, rangeEnd: Date): Date {
  if (date < rangeStart) {
    return new Date(rangeStart)
  }
  if (date > rangeEnd) {
    return new Date(rangeEnd)
  }
  return date
}
