import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mockCompanyHolidays } from '@/data/mockSchedules'
import { HOUR_HEIGHT_PX, SCHEDULE_TYPE_OPTIONS } from '@/constants/calendarView'
import { startOfDay } from '@/utils/date'
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
    new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, clientY, pointerId: 1 }),
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
