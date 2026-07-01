/** `ScheduleFormModal`/`RecurrenceFields`가 공유하는 날짜·시간 입력 조합 헬퍼 */
export function withDateKeepingTime(base: Date, dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  const next = new Date(base)
  next.setFullYear(year ?? next.getFullYear(), (month ?? 1) - 1, day ?? 1)
  return next
}

export function combineDateAndTime(base: Date, timeValue: string): Date {
  const [hours, minutes] = timeValue.split(':').map(Number)
  const next = new Date(base)
  next.setHours(hours ?? 0, minutes ?? 0, 0, 0)
  return next
}
