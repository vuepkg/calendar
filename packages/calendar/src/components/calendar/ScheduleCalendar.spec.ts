import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchPublicHolidays } from '@/services/publicHolidaysApi'
import { mockSchedules } from '@/data/mockSchedules'
import type {
  CalendarDateSelectPayload,
  CalendarNavigatePayload,
  CalendarOverflowClickPayload,
  CalendarScheduleClickPayload,
  CalendarTimeSlotSelectPayload,
  CalendarViewChangePayload,
} from '@/types/calendarEvents'
import { HOUR_HEIGHT_PX } from '@/constants/calendarView'
import {
  formatDayViewDate,
  formatMonthLabel,
  formatTimedGridDayLabel,
  startOfDay,
} from '@/utils/date'
import ScheduleCalendar from './ScheduleCalendar.vue'

vi.mock('@/services/publicHolidaysApi', () => ({
  fetchPublicHolidays: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchPublicHolidays)

function mountScheduleCalendar(options?: {
  view?: 'month' | 'week' | 'day' | 'list'
  date?: Date
  fetchPublicHolidays?: boolean
  holidays?: []
}) {
  const view = options?.view ?? 'month'
  const date = options?.date ?? startOfDay(new Date(2026, 3, 22))

  return mount(ScheduleCalendar, {
    props: {
      schedules: mockSchedules,
      view,
      date,
      fetchPublicHolidays: options?.fetchPublicHolidays ?? false,
      holidays: options?.holidays,
    },
    global: {
      stubs: {
        DataTable: { template: '<div class="data-table-stub" />' },
        Column: true,
      },
    },
  })
}

describe('ScheduleCalendar emit-only contract', () => {
  it('emits view-change without updating view when parent does not handle it', async () => {
    const wrapper = mountScheduleCalendar({ view: 'month' })

    const weekTab = wrapper
      .findAll('.vp-segmented-control-item')
      .find((tab) => tab.text() === 'Week')
    await weekTab!.trigger('click')

    const emitted = wrapper.emitted('view-change')?.[0]?.[0] as CalendarViewChangePayload
    expect(emitted).toEqual({ view: 'week', previousView: 'month' })
    expect(wrapper.props('view')).toBe('month')
  })

  it('emits date-select when a month cell is clicked', async () => {
    const wrapper = mountScheduleCalendar({
      view: 'month',
      date: startOfDay(new Date(2026, 3, 22)),
    })

    const inMonthCell = wrapper
      .findAll('.month-cell:not(.outside)')
      .find((cell) => cell.find('.cell-date').text() === '21')

    await inMonthCell!.trigger('click')

    const emitted = wrapper.emitted('date-select')?.[0]?.[0] as CalendarDateSelectPayload
    expect(emitted.source).toBe('month-cell')
    expect(emitted.date).toEqual(startOfDay(new Date(2026, 3, 21)))
    expect(wrapper.props('date')).toEqual(startOfDay(new Date(2026, 3, 22)))
  })

  it('emits navigate with resolved date for month navigation', async () => {
    const wrapper = mountScheduleCalendar({
      view: 'month',
      date: startOfDay(new Date(2026, 3, 22)),
    })

    await wrapper.get('[aria-label="Next month"]').trigger('click')

    const emitted = wrapper.emitted('navigate')?.[0]?.[0] as CalendarNavigatePayload
    expect(emitted.action).toBe('next-month')
    expect(emitted.date).toEqual(startOfDay(new Date(2026, 4, 22)))
    expect(wrapper.props('date')).toEqual(startOfDay(new Date(2026, 3, 22)))
  })

  it('emits query-change with init trigger on mount', async () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: mockSchedules,
        view: 'month',
        date: startOfDay(new Date(2026, 3, 22)),
        fetchPublicHolidays: false,
      },
      global: {
        stubs: { DataTable: { template: '<div />' }, Column: true },
      },
    })

    const queryEvents = wrapper.emitted('query-change') ?? []
    expect(queryEvents.length).toBeGreaterThanOrEqual(1)
    expect((queryEvents[0]?.[0] as { trigger: string }).trigger).toBe('init')
  })

  it('emits query-change with filter-change when viewScope changes', async () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: mockSchedules,
        view: 'month',
        date: startOfDay(new Date(2026, 3, 22)),
        viewScope: 'company',
        fetchPublicHolidays: false,
      },
      global: {
        stubs: { DataTable: { template: '<div />' }, Column: true },
      },
    })

    await wrapper.setProps({ viewScope: 'my' })

    const queryEvents = wrapper.emitted('query-change') ?? []
    const filterChange = queryEvents.find(
      (event) => (event[0] as { trigger: string }).trigger === 'filter-change',
    )

    expect(filterChange).toBeDefined()
    expect((filterChange?.[0] as { viewScope: string }).viewScope).toBe('my')
  })

  it('emits query-change with viewScope and scheduleTypes on navigate', async () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: mockSchedules,
        view: 'month',
        date: startOfDay(new Date(2026, 3, 22)),
        viewScope: 'my',
        scheduleTypes: ['my_schedule'],
        fetchPublicHolidays: false,
      },
      global: {
        stubs: { DataTable: { template: '<div />' }, Column: true },
      },
    })

    await wrapper.get('[aria-label="Next month"]').trigger('click')

    const queryEvents = wrapper.emitted('query-change') ?? []
    const latest = queryEvents[queryEvents.length - 1]?.[0] as {
      viewScope: string
      scheduleTypes: string[]
      trigger: string
      action: string
      date: Date
    }

    expect(latest.viewScope).toBe('my')
    expect(latest.scheduleTypes).toEqual(['my_schedule'])
    expect(latest.trigger).toBe('navigate')
    expect(latest.action).toBe('next-month')
    expect(latest.date).toEqual(startOfDay(new Date(2026, 4, 22)))
    expect(wrapper.props('date')).toEqual(startOfDay(new Date(2026, 3, 22)))
  })

  it('emits query-change with next view on view-change when parent v-model is stale', async () => {
    const wrapper = mountScheduleCalendar({ view: 'month' })

    const weekTab = wrapper
      .findAll('.vp-segmented-control-item')
      .find((tab) => tab.text() === 'Week')
    await weekTab!.trigger('click')

    const queryEvents = wrapper.emitted('query-change') ?? []
    const viewChangeQuery = queryEvents.find(
      (event) => (event[0] as { trigger: string }).trigger === 'view-change',
    )

    expect((viewChangeQuery?.[0] as { view: string }).view).toBe('week')
    expect(wrapper.props('view')).toBe('month')
  })

  it('emits overflow-click from +count without switching view by itself', async () => {
    const wrapper = mountScheduleCalendar({
      view: 'month',
      date: startOfDay(new Date(2026, 3, 22)),
    })

    await wrapper.setProps({ date: startOfDay(new Date(2026, 4, 1)) })

    const may15Cell = wrapper
      .findAll('.month-cell:not(.outside)')
      .find((cell) => cell.find('.cell-date').text() === '15')

    const overflowButton = may15Cell!.find('.more-events')
    await overflowButton.trigger('click')

    const emitted = wrapper.emitted('overflow-click')?.[0]?.[0] as CalendarOverflowClickPayload
    expect(emitted.hiddenCount).toBe(2)
    expect(emitted.date).toEqual(startOfDay(new Date(2026, 4, 15)))
    expect(wrapper.props('view')).toBe('month')
  })

  it('reflects parent v-model updates', async () => {
    const wrapper = mountScheduleCalendar({ view: 'month' })

    await wrapper.setProps({ view: 'week' })

    expect(wrapper.find('.week-view').exists()).toBe(true)
  })

  it('forwards schedule-click from month chip without date-select', async () => {
    const wrapper = mountScheduleCalendar({
      view: 'month',
      date: startOfDay(new Date(2026, 3, 22)),
    })
    const chip = wrapper.findAll('.event-chip').find((el) => el.text().includes('여수 출장'))

    expect(chip).toBeDefined()
    await chip!.trigger('click')

    const emitted = wrapper.emitted('schedule-click')?.[0]?.[0] as CalendarScheduleClickPayload
    expect(emitted.source).toBe('month-chip')
    expect(emitted.schedule.title).toBe('여수 출장')
    expect(wrapper.emitted('date-select')).toBeUndefined()
  })

  it('emits time-slot-select when an empty week timed grid cell is clicked', async () => {
    const wrapper = mountScheduleCalendar({ view: 'week', date: startOfDay(new Date(2026, 3, 22)) })
    const columnEl = wrapper.get('.day-column').element as HTMLElement
    const height = 24 * HOUR_HEIGHT_PX

    columnEl.getBoundingClientRect = () =>
      ({
        top: 200,
        left: 0,
        right: 120,
        bottom: 200 + height,
        width: 120,
        height,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      }) as DOMRect
    columnEl.setPointerCapture = () => {}

    const clientY = 200 + 8 * HOUR_HEIGHT_PX + 6
    columnEl.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientY,
        pointerId: 1,
      }),
    )
    await nextTick()
    columnEl.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, cancelable: true, clientY, pointerId: 1 }),
    )
    await nextTick()

    const emitted = wrapper.emitted('time-slot-select')?.[0]?.[0] as CalendarTimeSlotSelectPayload
    expect(emitted.source).toBe('week-timed-slot')
    expect(emitted.start.getHours()).toBe(8)
    expect(emitted.end.getHours()).toBe(9)
  })

  it('forwards schedule-click from week timed event click', async () => {
    const wrapper = mountScheduleCalendar({ view: 'week', date: startOfDay(new Date(2026, 3, 22)) })

    const timedEvent = wrapper
      .findAll('.timed-event')
      .find((el) => el.text().includes('고객사 A 미팅'))
    expect(timedEvent).toBeDefined()
    const timedEventEl = timedEvent!.element as HTMLElement
    const columnEl = timedEventEl.closest('.day-column') as HTMLElement
    columnEl.setPointerCapture = () => {}
    timedEventEl.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        right: 120,
        bottom: HOUR_HEIGHT_PX,
        width: 120,
        height: HOUR_HEIGHT_PX,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect

    // real browsers retarget the synthesized `click` event to `.day-column` once
    // setPointerCapture is engaged, so a plain `.trigger('click')` no longer reflects
    // what actually opens the schedule — pointerdown+pointerup at the same Y does.
    const clientY = 10
    timedEventEl.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientY,
        pointerId: 1,
      }),
    )
    await nextTick()
    columnEl.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, cancelable: true, clientY, pointerId: 1 }),
    )
    await nextTick()

    const emitted = wrapper.emitted('schedule-click')?.[0]?.[0] as CalendarScheduleClickPayload
    expect(emitted.source).toBe('week-timed')
    expect(emitted.schedule.title).toBe('고객사 A 미팅')
  })

  it('shows year-month period label in week view nav', async () => {
    const date = startOfDay(new Date(2026, 3, 22))
    const wrapper = mountScheduleCalendar({ view: 'week', date })

    expect(wrapper.get('.week-view .period-label').text()).toBe(formatMonthLabel(date))
  })

  it('shows weekday only under each day column in week view', async () => {
    const date = startOfDay(new Date(2026, 3, 22))
    const wrapper = mountScheduleCalendar({ view: 'week', date })

    const day22Header = wrapper
      .findAll('.day-header.clickable')
      .find((el) => el.find('.day-number').text() === '22')
    expect(day22Header).toBeDefined()
    expect(day22Header!.find('.day-label').text()).toBe(formatTimedGridDayLabel(date))
    expect(day22Header!.find('.day-label').text()).not.toMatch(/Apr|April/)
  })

  it('shows year-month-day period label in day view nav', async () => {
    const date = startOfDay(new Date(2026, 3, 22))
    const wrapper = mountScheduleCalendar({ view: 'day', date })

    expect(wrapper.get('.day-view .period-label').text()).toBe(formatDayViewDate(date))
  })

  it('shows weekday only under day column in day view', async () => {
    const date = startOfDay(new Date(2026, 3, 22))
    const wrapper = mountScheduleCalendar({ view: 'day', date })

    expect(wrapper.get('.timed-grid.single-day .day-label').text()).toBe(
      formatTimedGridDayLabel(date),
    )
    expect(wrapper.get('.timed-grid.single-day .day-label').text()).not.toMatch(/Apr|April/)
  })

  it('emits date-select with week-day-header source from week view', async () => {
    const wrapper = mountScheduleCalendar({ view: 'week', date: startOfDay(new Date(2026, 3, 22)) })

    const dayHeader = wrapper
      .findAll('.day-header.clickable')
      .find((el) => el.find('.day-number').text() === '23')
    expect(dayHeader).toBeDefined()
    await dayHeader!.trigger('click')

    const emitted = wrapper.emitted('date-select')?.[0]?.[0] as CalendarDateSelectPayload
    expect(emitted.source).toBe('week-day-header')
    expect(emitted.date).toEqual(startOfDay(new Date(2026, 3, 23)))
    expect(wrapper.props('view')).toBe('week')
  })

  it('renders month grid with empty schedules', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: [],
        view: 'month',
        date: startOfDay(new Date(2026, 3, 22)),
        fetchPublicHolidays: false,
      },
    })

    expect(wrapper.find('.month-calendar').exists()).toBe(true)
    expect(wrapper.findAll('.month-cell:not(.outside)')).toHaveLength(30)
  })

  it('emits navigate when list view month navigation is used', async () => {
    const wrapper = mountScheduleCalendar({ view: 'list', date: startOfDay(new Date(2026, 3, 22)) })
    await flushPromises()
    await vi.waitFor(() => {
      expect(wrapper.find('.list-view').exists()).toBe(true)
    })

    await wrapper.get('.list-view [aria-label="Next month"]').trigger('click')

    const emitted = wrapper.emitted('navigate')?.[0]?.[0] as CalendarNavigatePayload
    expect(emitted.action).toBe('next-month')
    expect(emitted.date).toEqual(startOfDay(new Date(2026, 4, 22)))
  })

  it('shows month label in list view navigation', async () => {
    const wrapper = mountScheduleCalendar({ view: 'list', date: startOfDay(new Date(2026, 3, 22)) })
    await flushPromises()
    await vi.waitFor(() => {
      expect(wrapper.find('.calendar-month-nav-title').exists()).toBe(true)
    })

    expect(wrapper.get('.calendar-month-nav-title').text()).toBe('2026-04')
  })

  // 2026-06-16: hideToolbar prop 추가 — 툴바 렌더링 제어 검증
  it('hides toolbar when hideToolbar prop is true', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: [],
        view: 'month',
        date: startOfDay(new Date(2026, 3, 22)),
        fetchPublicHolidays: false,
        hideToolbar: true,
      },
    })

    expect(wrapper.find('.calendar-toolbar').exists()).toBe(false)
    expect(wrapper.find('.month-calendar').exists()).toBe(true)
  })

  it('shows toolbar when hideToolbar is false (default)', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: [],
        view: 'month',
        date: startOfDay(new Date(2026, 3, 22)),
        fetchPublicHolidays: false,
        hideToolbar: false,
      },
    })

    expect(wrapper.find('.calendar-toolbar').exists()).toBe(true)
  })

  it('shows toolbar by default when hideToolbar is omitted', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: [],
        view: 'month',
        date: startOfDay(new Date(2026, 3, 22)),
        fetchPublicHolidays: false,
      },
    })

    expect(wrapper.find('.calendar-toolbar').exists()).toBe(true)
  })

  it('still renders view content when hideToolbar is true', async () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: [],
        view: 'week',
        date: startOfDay(new Date(2026, 3, 22)),
        fetchPublicHolidays: false,
        hideToolbar: true,
      },
    })

    expect(wrapper.find('.calendar-toolbar').exists()).toBe(false)
    expect(wrapper.find('.timed-grid').exists()).toBe(true)
  })

  // F4-2 — monthWeekCount prop 전달 검증
  it('renders all 6 weeks by default (monthWeekCount omitted)', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: [],
        view: 'month',
        date: startOfDay(new Date(2026, 4, 1)),
        fetchPublicHolidays: false,
      },
    })

    expect(wrapper.findAll('.month-week')).toHaveLength(6)
  })

  it('renders a reduced grid when monthWeekCount is 2', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: [],
        view: 'month',
        date: startOfDay(new Date(2026, 4, 15)),
        fetchPublicHolidays: false,
        monthWeekCount: 2,
      },
    })

    expect(wrapper.findAll('.month-week')).toHaveLength(2)
  })

  // IMP-02 — weekdayLabels prop 전달 검증
  it('forwards weekdayLabels down to the month view weekday header', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: [],
        view: 'month',
        date: startOfDay(new Date(2026, 4, 1)),
        fetchPublicHolidays: false,
        weekdayLabels: ['일', '월', '화', '수', '목', '금', '토'],
      },
    })

    const labels = wrapper.findAll('.weekday-header').map((el) => el.text())
    expect(labels).toEqual(['일', '월', '화', '수', '목', '금', '토'])
  })

  // IMP-03 — startHour/endHour prop 전달 검증
  it('forwards startHour/endHour down to the week view time grid', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: [],
        view: 'week',
        date: startOfDay(new Date(2026, 3, 22)),
        fetchPublicHolidays: false,
        startHour: 9,
        endHour: 18,
      },
    })

    expect(wrapper.findAll('.time-slot-label')).toHaveLength(10)
  })

  it('forwards startHour/endHour down to the day view time grid', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: [],
        view: 'day',
        date: startOfDay(new Date(2026, 3, 22)),
        fetchPublicHolidays: false,
        startHour: 9,
        endHour: 18,
      },
    })

    expect(wrapper.findAll('.time-slot-label')).toHaveLength(10)
  })

  // F3-3 — locale prop 전달 검증
  it('forwards locale down to the month view weekday header (auto-formats when weekdayLabels omitted)', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: [],
        view: 'month',
        date: startOfDay(new Date(2026, 4, 1)),
        fetchPublicHolidays: false,
        locale: 'ko-KR',
      },
    })

    const labels = wrapper.findAll('.weekday-header').map((el) => el.text())
    expect(labels).toEqual(['일', '월', '화', '수', '목', '금', '토'])
  })

  it('forwards locale down to the week view day header', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: [],
        view: 'week',
        date: startOfDay(new Date(2026, 3, 22)),
        fetchPublicHolidays: false,
        locale: 'ko-KR',
      },
    })

    const labels = wrapper.findAll('.day-label').map((el) => el.text())
    expect(labels.length).toBeGreaterThan(0)
    expect(labels.every((label) => /[가-힣]/.test(label))).toBe(true)
  })

  it('emits list-filter-clear from list view', async () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: mockSchedules,
        view: 'list',
        date: startOfDay(new Date(2026, 4, 15)),
        listFilterDate: startOfDay(new Date(2026, 4, 15)),
        fetchPublicHolidays: false,
      },
      global: {
        stubs: {
          ListView: {
            props: ['calendar'],
            template:
              '<div class="list-view"><button class="clear-filter-btn" @click="$emit(\'list-filter-clear\')">Clear filter</button></div>',
          },
        },
      },
    })

    await wrapper.get('.clear-filter-btn').trigger('click')
    expect(wrapper.emitted('list-filter-clear')).toHaveLength(1)
  })
})

describe('ScheduleCalendar public holiday fetching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedFetch.mockResolvedValue([
      {
        id: 'public-2026-01-01',
        dateKey: '2026-01-01',
        name: '신정',
        kind: 'public',
      },
    ])
  })

  it('defaults fetchPublicHolidays to false', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: mockSchedules,
        view: 'month',
        date: startOfDay(new Date(2026, 3, 22)),
      },
      global: {
        stubs: { DataTable: { template: '<div />' }, Column: true },
      },
    })

    expect(wrapper.props('fetchPublicHolidays')).toBe(false)
  })

  it('fetches the current year once on mount when fetchPublicHolidays is true', async () => {
    mount(ScheduleCalendar, {
      props: {
        schedules: mockSchedules,
        view: 'month',
        date: startOfDay(new Date(2026, 3, 22)),
        fetchPublicHolidays: true,
      },
      global: {
        stubs: { DataTable: { template: '<div />' }, Column: true },
      },
    })

    await flushPromises()

    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(mockedFetch).toHaveBeenCalledWith(2026, {
      serviceKey: undefined,
      signal: expect.any(AbortSignal),
    })
  })

  it('does not fetch when fetchPublicHolidays is false', async () => {
    mount(ScheduleCalendar, {
      props: {
        schedules: mockSchedules,
        view: 'month',
        date: startOfDay(new Date(2026, 3, 22)),
        fetchPublicHolidays: false,
      },
      global: {
        stubs: { DataTable: { template: '<div />' }, Column: true },
      },
    })

    await flushPromises()

    expect(mockedFetch).not.toHaveBeenCalled()
  })

  it('fetches a new year only when date v-model crosses into an unloaded year', async () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: mockSchedules,
        view: 'month',
        date: startOfDay(new Date(2026, 3, 22)),
        fetchPublicHolidays: true,
      },
      global: {
        stubs: { DataTable: { template: '<div />' }, Column: true },
      },
    })

    await flushPromises()
    expect(mockedFetch).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ date: startOfDay(new Date(2026, 8, 1)) })
    await flushPromises()
    expect(mockedFetch).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ date: startOfDay(new Date(2027, 3, 22)) })
    await flushPromises()
    expect(mockedFetch).toHaveBeenCalledTimes(2)
    expect(mockedFetch).toHaveBeenLastCalledWith(2027, {
      serviceKey: undefined,
      signal: expect.any(AbortSignal),
    })
  })

  it('defaults date to today when date prop is omitted', () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: mockSchedules,
        view: 'day',
        fetchPublicHolidays: false,
      },
      global: {
        stubs: {
          DataTable: { template: '<div class="data-table-stub" />' },
          Column: true,
        },
      },
    })

    const today = startOfDay(new Date())
    const resolvedDate = wrapper.props('date')
    expect(resolvedDate).toBeDefined()
    expect(resolvedDate!.getTime()).toBe(today.getTime())
  })

  it('renders public holiday chips after the API resolves', async () => {
    mockedFetch.mockResolvedValue([
      {
        id: 'public-2026-05-05',
        dateKey: '2026-05-05',
        name: '어린이날',
        kind: 'public',
      },
    ])

    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: mockSchedules,
        view: 'month',
        date: startOfDay(new Date(2026, 4, 1)),
        fetchPublicHolidays: true,
      },
      global: {
        stubs: { DataTable: { template: '<div />' }, Column: true },
      },
    })

    expect(wrapper.find('.holiday-chip').exists()).toBe(false)

    await flushPromises()

    const may5Cell = wrapper
      .findAll('.month-cell:not(.outside)')
      .find((cell) => cell.find('.cell-date').text() === '5')

    expect(may5Cell?.find('.holiday-chip').text()).toBe('어린이날')
  })

  it('merges company holidays with API results on the same date', async () => {
    mockedFetch.mockResolvedValue([
      {
        id: 'public-2026-05-05',
        dateKey: '2026-05-05',
        name: '어린이날',
        kind: 'public',
      },
    ])

    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: mockSchedules,
        view: 'month',
        date: startOfDay(new Date(2026, 4, 1)),
        fetchPublicHolidays: true,
        holidays: [
          {
            id: 'company-2026-05-05',
            dateKey: '2026-05-05',
            name: '창립기념일',
            kind: 'company',
          },
        ],
      },
      global: {
        stubs: { DataTable: { template: '<div />' }, Column: true },
      },
    })

    await flushPromises()

    const may5Cell = wrapper
      .findAll('.month-cell:not(.outside)')
      .find((cell) => cell.find('.cell-date').text() === '5')

    const chipLabels = may5Cell?.findAll('.holiday-chip').map((chip) => chip.text()) ?? []
    expect(chipLabels).toContain('어린이날')
    expect(chipLabels).toContain('창립기념일')
  })
})
