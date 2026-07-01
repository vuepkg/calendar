import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mockCompanyHolidays } from '@/data/mockSchedules'
import { HOUR_HEIGHT_PX, SCHEDULE_TYPE_OPTIONS } from '@/constants/calendarView'
import { startOfDay } from '@/utils/date'
import type { CalendarScheduleMovePayload, CalendarScheduleResizePayload } from '@/types'
import type { Schedule } from '@/types/schedule'
import TimedGrid from './TimedGrid.vue'

function getTypeStyle(type: string) {
  const option = SCHEDULE_TYPE_OPTIONS.find((item) => item.type === type)
  return {
    color: option?.color ?? '#1565c0',
    backgroundColor: option?.backgroundColor ?? '#e3f2fd',
  }
}

function setupColumn(element: HTMLElement, topPx = 100) {
  const height = 24 * HOUR_HEIGHT_PX
  element.getBoundingClientRect = () =>
    ({
      top: topPx,
      left: 0,
      right: 200,
      bottom: topPx + height,
      width: 200,
      height,
      x: 0,
      y: topPx,
      toJSON: () => ({}),
    }) as DOMRect
  element.setPointerCapture = () => {}
}

async function pointerDown(element: HTMLElement, clientY: number) {
  element.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientY,
      pointerId: 1,
    }),
  )
  await nextTick()
}

async function pointerMove(element: HTMLElement, clientY: number) {
  element.dispatchEvent(
    new PointerEvent('pointermove', { bubbles: true, cancelable: true, clientY, pointerId: 1 }),
  )
  await nextTick()
}

async function pointerUp(element: HTMLElement, clientY: number) {
  element.dispatchEvent(
    new PointerEvent('pointerup', { bubbles: true, cancelable: true, clientY, pointerId: 1 }),
  )
  await nextTick()
}

describe('TimedGrid', () => {
  it('renders holiday chips in the all-day section for week view', () => {
    const wrapper = mount(TimedGrid, {
      props: {
        days: [startOfDay(new Date(2026, 3, 1))],
        schedules: [],
        holidays: mockCompanyHolidays,
        getTypeStyle,
      },
    })

    const holidayChip = wrapper.find('.holiday-chip')
    expect(holidayChip.exists()).toBe(true)
    expect(holidayChip.text()).toBe('회사 창립기념일')
    expect(wrapper.find('.holiday-chips-row').exists()).toBe(true)
  })

  it('hides the holiday row when no holidays match visible days', () => {
    const wrapper = mount(TimedGrid, {
      props: {
        days: [startOfDay(new Date(2026, 3, 2))],
        schedules: [],
        holidays: mockCompanyHolidays,
        getTypeStyle,
      },
    })

    expect(wrapper.find('.holiday-chips-row').exists()).toBe(false)
  })

  it('emits time-slot-select with one-hour slot on tap (pointerdown + pointerup at same Y)', async () => {
    const day = startOfDay(new Date(2026, 3, 22))
    const wrapper = mount(TimedGrid, {
      props: { days: [day], schedules: [], getTypeStyle, singleDay: true },
    })

    const column = wrapper.get('.day-column').element as HTMLElement
    const TOP = 100
    setupColumn(column, TOP)

    const clientY = TOP + 8 * HOUR_HEIGHT_PX + 10
    await pointerDown(column, clientY)
    await pointerUp(column, clientY)

    const events = wrapper.emitted('time-slot-select')
    expect(events).toHaveLength(1)
    expect(events![0]![0]).toMatchObject({ source: 'day-timed-slot', date: day })

    const { start, end } = events![0]![0] as { start: Date; end: Date }
    expect(start.getHours()).toBe(8)
    expect(start.getMinutes()).toBe(0)
    expect(end.getHours()).toBe(9)
    expect(end.getMinutes()).toBe(0)
    expect(wrapper.find('.time-slot-selection').exists()).toBe(true)
  })

  it('emits time-slot-select with multi-hour range when dragging down', async () => {
    const day = startOfDay(new Date(2026, 3, 22))
    const wrapper = mount(TimedGrid, {
      props: { days: [day], schedules: [], getTypeStyle, singleDay: true },
    })

    const column = wrapper.get('.day-column').element as HTMLElement
    const TOP = 100
    setupColumn(column, TOP)

    await pointerDown(column, TOP + 9 * HOUR_HEIGHT_PX + 5)
    await pointerMove(column, TOP + 11 * HOUR_HEIGHT_PX + 5)
    await pointerUp(column, TOP + 11 * HOUR_HEIGHT_PX + 5)

    const events = wrapper.emitted('time-slot-select')
    expect(events).toHaveLength(1)
    const { start, end } = events![0]![0] as { start: Date; end: Date }
    // drag from hour-index 9 to 11 → slot 09:00–12:00
    expect(start.getHours()).toBe(9)
    expect(end.getHours()).toBe(12)
    expect(end.getMinutes()).toBe(0)
  })

  it('emits time-slot-select with correct range when dragging up', async () => {
    const day = startOfDay(new Date(2026, 3, 22))
    const wrapper = mount(TimedGrid, {
      props: { days: [day], schedules: [], getTypeStyle, singleDay: true },
    })

    const column = wrapper.get('.day-column').element as HTMLElement
    const TOP = 100
    setupColumn(column, TOP)

    // down at hour 11, up at hour 9 → same 09:00–12:00
    await pointerDown(column, TOP + 11 * HOUR_HEIGHT_PX + 5)
    await pointerUp(column, TOP + 9 * HOUR_HEIGHT_PX + 5)

    const { start, end } = wrapper.emitted('time-slot-select')![0]![0] as { start: Date; end: Date }
    expect(start.getHours()).toBe(9)
    expect(end.getHours()).toBe(12)
  })

  it('does not emit time-slot-select when pointerup fires without preceding pointerdown', async () => {
    const day = startOfDay(new Date(2026, 3, 22))
    const wrapper = mount(TimedGrid, {
      props: { days: [day], schedules: [], getTypeStyle, singleDay: true },
    })

    const column = wrapper.get('.day-column').element as HTMLElement
    setupColumn(column)

    await pointerUp(column, 100 + 8 * HOUR_HEIGHT_PX)

    expect(wrapper.emitted('time-slot-select')).toBeUndefined()
  })
})

describe('TimedGrid — drag-and-drop (useScheduleDrag)', () => {
  const TOP = 100
  const day = startOfDay(new Date(2026, 3, 22))

  function makeSchedule(overrides?: Partial<Schedule>): Schedule {
    return {
      id: 'evt-1',
      title: 'Test Event',
      participantId: 'user-test',
      participantName: 'Test User',
      start: new Date(2026, 3, 22, 10, 0, 0, 0),
      end: new Date(2026, 3, 22, 11, 0, 0, 0),
      type: 'company',
      ...overrides,
    }
  }

  function mountWithSchedule(schedule: Schedule) {
    const wrapper = mount(TimedGrid, {
      props: { days: [day], schedules: [schedule], getTypeStyle },
    })
    const column = wrapper.get('.day-column').element as HTMLElement
    setupColumn(column, TOP)
    const timedEvent = wrapper.get('.timed-event').element as HTMLElement
    timedEvent.getBoundingClientRect = () =>
      ({
        top: TOP + 10 * HOUR_HEIGHT_PX,
        bottom: TOP + 11 * HOUR_HEIGHT_PX,
        left: 0,
        right: 200,
        width: 200,
        height: HOUR_HEIGHT_PX,
        x: 0,
        y: TOP + 10 * HOUR_HEIGHT_PX,
        toJSON: () => ({}),
      }) as DOMRect
    return { wrapper, column, timedEvent }
  }

  it('emits schedule-move when dragging a timed event to a new hour slot', async () => {
    const schedule = makeSchedule()
    const { wrapper, column, timedEvent } = mountWithSchedule(schedule)

    // pointerdown on the event element at the very top (anchorHourOffset = 0)
    await pointerDown(timedEvent, TOP + 10 * HOUR_HEIGHT_PX + 5)
    // drag to hour-14 position
    await pointerMove(column, TOP + 14 * HOUR_HEIGHT_PX + 5)
    await pointerUp(column, TOP + 14 * HOUR_HEIGHT_PX + 5)

    const emitted = wrapper.emitted('schedule-move')
    expect(emitted).toHaveLength(1)
    const payload = emitted![0]![0] as CalendarScheduleMovePayload
    expect(payload.schedule.id).toBe(schedule.id)
    expect(payload.newStart.getHours()).toBe(14)
    expect(payload.newEnd.getHours()).toBe(15)
  })

  it('does not emit schedule-move when pointer position does not change', async () => {
    const schedule = makeSchedule()
    const { wrapper, column, timedEvent } = mountWithSchedule(schedule)

    // pointerdown then immediate pointerup at the same position
    await pointerDown(timedEvent, TOP + 10 * HOUR_HEIGHT_PX + 5)
    await pointerUp(column, TOP + 10 * HOUR_HEIGHT_PX + 5)

    expect(wrapper.emitted('schedule-move')).toBeUndefined()
  })

  it('emits schedule-resize when dragging the resize handle to a new end hour', async () => {
    const schedule = makeSchedule()
    const { wrapper, column } = mountWithSchedule(schedule)

    const resizeHandle = wrapper.get('.resize-handle').element as HTMLElement
    // pointerdown on the resize handle (at bottom of event)
    await pointerDown(resizeHandle, TOP + 11 * HOUR_HEIGHT_PX)
    // drag to hour-13 band → end snaps to 14:00 (endIndex = max(11, 13+1) = 14)
    await pointerMove(column, TOP + 13 * HOUR_HEIGHT_PX + 5)
    await pointerUp(column, TOP + 13 * HOUR_HEIGHT_PX + 5)

    const emitted = wrapper.emitted('schedule-resize')
    expect(emitted).toHaveLength(1)
    const payload = emitted![0]![0] as CalendarScheduleResizePayload
    expect(payload.schedule.id).toBe(schedule.id)
    expect(payload.newEnd.getHours()).toBe(14)
  })

  it('does not emit schedule-resize when end time does not change', async () => {
    const schedule = makeSchedule()
    const { wrapper, column } = mountWithSchedule(schedule)

    const resizeHandle = wrapper.get('.resize-handle').element as HTMLElement
    // pointerdown on resize then immediate pointerup — end stays at 11:00
    await pointerDown(resizeHandle, TOP + 11 * HOUR_HEIGHT_PX)
    await pointerUp(column, TOP + 11 * HOUR_HEIGHT_PX)

    expect(wrapper.emitted('schedule-resize')).toBeUndefined()
  })

  it('does not emit schedule-click after a successful move drag', async () => {
    const schedule = makeSchedule()
    const { wrapper, column, timedEvent } = mountWithSchedule(schedule)

    await pointerDown(timedEvent, TOP + 10 * HOUR_HEIGHT_PX + 5)
    await pointerMove(column, TOP + 14 * HOUR_HEIGHT_PX + 5)
    await pointerUp(column, TOP + 14 * HOUR_HEIGHT_PX + 5)

    expect(wrapper.emitted('schedule-click')).toBeUndefined()

    // a later tap (pointerdown+up with no movement) still emits schedule-click normally —
    // the earlier drag must not permanently suppress future clicks
    await pointerDown(timedEvent, TOP + 14 * HOUR_HEIGHT_PX + 5)
    await pointerUp(column, TOP + 14 * HOUR_HEIGHT_PX + 5)

    expect(wrapper.emitted('schedule-click')).toHaveLength(1)
  })

  it('emits schedule-click when clicking a timed event without dragging', async () => {
    const schedule = makeSchedule()
    const { wrapper, column, timedEvent } = mountWithSchedule(schedule)

    // pointerdown then immediate pointerup with no position change → treated as a click.
    // Real browsers retarget the native `click` event to `.day-column` once
    // setPointerCapture is engaged on pointerdown, so schedule-click is emitted
    // directly from the pointerup handler rather than a `@click` listener.
    await pointerDown(timedEvent, TOP + 10 * HOUR_HEIGHT_PX + 5)
    await pointerUp(column, TOP + 10 * HOUR_HEIGHT_PX + 5)

    const emitted = wrapper.emitted('schedule-click')
    expect(emitted).toHaveLength(1)
    expect((emitted![0]![0] as { schedule: Schedule }).schedule.id).toBe(schedule.id)
  })
})

describe('TimedGrid — startHour/endHour (IMP-03)', () => {
  it('renders 24 hour labels (00:00~23:00) by default', () => {
    const wrapper = mount(TimedGrid, {
      props: { days: [startOfDay(new Date(2026, 3, 22))], schedules: [], getTypeStyle },
    })

    const labels = wrapper.findAll('.time-slot-label').map((el) => el.text())
    expect(labels).toHaveLength(24)
    expect(labels[0]).toBe('00:00')
    expect(labels.at(-1)).toBe('23:00')
  })

  it('renders only the configured hour range when startHour/endHour are narrowed', () => {
    const wrapper = mount(TimedGrid, {
      props: {
        days: [startOfDay(new Date(2026, 3, 22))],
        schedules: [],
        getTypeStyle,
        startHour: 9,
        endHour: 18,
      },
    })

    const labels = wrapper.findAll('.time-slot-label').map((el) => el.text())
    expect(labels).toHaveLength(10)
    expect(labels[0]).toBe('09:00')
    expect(labels.at(-1)).toBe('18:00')
  })

  it('places a timed schedule at the top when it starts at the narrowed startHour', () => {
    const day = startOfDay(new Date(2026, 3, 22))
    const schedule: Schedule = {
      id: 's-hour-range',
      title: '아침 회의',
      type: 'my_schedule',
      participantId: 'user-test',
      participantName: 'Test User',
      start: new Date(2026, 3, 22, 9, 0),
      end: new Date(2026, 3, 22, 10, 0),
    }

    const wrapper = mount(TimedGrid, {
      props: {
        days: [day],
        schedules: [schedule],
        getTypeStyle,
        startHour: 9,
        endHour: 18,
      },
    })

    const timedEvent = wrapper.get('.timed-event')
    expect((timedEvent.element as HTMLElement).style.top).toBe('0%')
  })
})
