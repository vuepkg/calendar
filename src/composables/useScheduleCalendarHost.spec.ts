import { describe, expect, it, vi } from 'vitest'
import { mockSchedules } from '@/data/mockSchedules'
import { startOfDay } from '@/utils/date'
import { useScheduleCalendarHost } from './useScheduleCalendarHost'

const baseDate = startOfDay(new Date(2026, 3, 22))

describe('useScheduleCalendarHost', () => {
  it('initializes view scope and schedule type filters', () => {
    const host = useScheduleCalendarHost({
      initialViewScope: 'my',
      initialScheduleTypes: ['my_schedule'],
    })

    expect(host.viewScope.value).toBe('my')
    expect(host.scheduleTypes.value).toEqual(['my_schedule'])
  })

  it('forwards time-slot-select and syncs date', () => {
    const onTimeSlotSelect = vi.fn()
    const host = useScheduleCalendarHost({ onTimeSlotSelect, initialDate: baseDate })
    const slotDate = startOfDay(new Date(2026, 3, 22))
    const start = new Date(2026, 3, 22, 8, 0)
    const end = new Date(2026, 3, 22, 9, 0)

    host.handlers.onTimeSlotSelect({
      date: slotDate,
      start,
      end,
      source: 'week-timed-slot',
    })

    expect(onTimeSlotSelect).toHaveBeenCalledTimes(1)
    expect(host.date.value.getTime()).toBe(slotDate.getTime())
    expect(host.calendarListeners['time-slot-select']).toBe(host.handlers.onTimeSlotSelect)
  })

  it('forwards query-change to onQueryChange option', () => {
    const onQueryChange = vi.fn()
    const host = useScheduleCalendarHost({ onQueryChange })

    host.handlers.onQueryChange({
      view: 'month',
      date: new Date(2026, 3, 1),
      viewScope: 'company',
      scheduleTypes: null,
      listFilterDate: null,
      range: { start: new Date(2026, 3, 1), end: new Date(2026, 3, 30) },
      trigger: 'init',
    })

    expect(onQueryChange).toHaveBeenCalledTimes(1)
    expect(host.calendarListeners['query-change']).toBe(host.handlers.onQueryChange)
  })

  it('defaults view to month when initialView is omitted', () => {
    const host = useScheduleCalendarHost()

    expect(host.view.value).toBe('month')
  })

  it('defaults date to today when initialDate is omitted', () => {
    const host = useScheduleCalendarHost()
    const today = startOfDay(new Date())

    expect(host.date.value.getTime()).toBe(today.getTime())
  })

  it('initializes view, date, and list filter', () => {
    const host = useScheduleCalendarHost({
      initialView: 'week',
      initialDate: baseDate,
      initialListFilterDate: baseDate,
    })

    expect(host.view.value).toBe('week')
    expect(host.date.value.getTime()).toBe(baseDate.getTime())
    expect(host.listFilterDate.value?.getTime()).toBe(baseDate.getTime())
  })

  it('updates view on view-change and clears list filter when leaving list', () => {
    const host = useScheduleCalendarHost({ initialView: 'list', initialListFilterDate: baseDate })

    host.handlers.onViewChange({ view: 'month', previousView: 'list' })

    expect(host.view.value).toBe('month')
    expect(host.listFilterDate.value).toBeNull()
  })

  it('keeps list filter when switching to list view', () => {
    const host = useScheduleCalendarHost({ initialListFilterDate: baseDate })

    host.handlers.onViewChange({ view: 'list', previousView: 'day' })

    expect(host.view.value).toBe('list')
    expect(host.listFilterDate.value?.getTime()).toBe(baseDate.getTime())
  })

  it('selects date and switches to day on week-day-header', () => {
    const host = useScheduleCalendarHost({ initialView: 'week' })
    const nextDate = startOfDay(new Date(2026, 3, 25))

    host.handlers.onDateSelect({ date: nextDate, source: 'week-day-header' })

    expect(host.date.value.getTime()).toBe(nextDate.getTime())
    expect(host.view.value).toBe('day')
  })

  it('selects date without view change on month-cell', () => {
    const host = useScheduleCalendarHost({ initialView: 'month' })
    const nextDate = startOfDay(new Date(2026, 3, 10))

    host.handlers.onDateSelect({ date: nextDate, source: 'month-cell' })

    expect(host.date.value.getTime()).toBe(nextDate.getTime())
    expect(host.view.value).toBe('month')
  })

  it('overflow-click keeps current view and only calls optional handler', () => {
    const onOverflowClick = vi.fn()
    const host = useScheduleCalendarHost({ initialView: 'month', onOverflowClick })
    const overflowDate = startOfDay(new Date(2026, 4, 15))
    const payload = {
      date: overflowDate,
      hiddenCount: 2,
      schedules: mockSchedules,
      visibleSchedules: [],
    }

    host.handlers.onOverflowClick(payload)

    expect(host.view.value).toBe('month')
    expect(host.listFilterDate.value).toBeNull()
    expect(onOverflowClick).toHaveBeenCalledWith(payload)
  })

  it('navigate updates date', () => {
    const host = useScheduleCalendarHost()
    const nextDate = startOfDay(new Date(2026, 4, 1))

    host.handlers.onNavigate({ action: 'next-month', date: nextDate })

    expect(host.date.value.getTime()).toBe(nextDate.getTime())
  })

  it('schedule-click updates date when payload includes date', () => {
    const host = useScheduleCalendarHost()
    const chipDate = startOfDay(new Date(2026, 3, 21))

    host.handlers.onScheduleClick({
      schedule: mockSchedules[0],
      source: 'month-chip',
      date: chipDate,
    })

    expect(host.date.value.getTime()).toBe(chipDate.getTime())
  })

  it('delegates schedule-click to custom handler', () => {
    const onScheduleClick = vi.fn()
    const host = useScheduleCalendarHost({ onScheduleClick })
    const payload = {
      schedule: mockSchedules[0],
      source: 'list-row' as const,
    }

    host.handlers.onScheduleClick(payload)

    expect(onScheduleClick).toHaveBeenCalledWith(payload)
  })

  it('clears list filter', () => {
    const host = useScheduleCalendarHost({ initialListFilterDate: baseDate })

    host.handlers.onListFilterClear()

    expect(host.listFilterDate.value).toBeNull()
  })

  it('exposes the same functions on calendarListeners', () => {
    const host = useScheduleCalendarHost()

    expect(host.calendarListeners['view-change']).toBe(host.handlers.onViewChange)
    expect(host.calendarListeners['list-filter-clear']).toBe(host.handlers.onListFilterClear)
  })
})
