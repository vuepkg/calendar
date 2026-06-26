import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
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

  it('emits time-slot-select with one-hour start and end when an empty cell is clicked', async () => {
    const day = startOfDay(new Date(2026, 3, 22))
    const wrapper = mount(TimedGrid, {
      props: {
        days: [day],
        schedules: [],
        getTypeStyle,
        singleDay: true,
      },
    })

    const column = wrapper.get('.day-column')
    const height = 24 * HOUR_HEIGHT_PX
    column.element.getBoundingClientRect = () =>
      ({
        top: 100,
        left: 0,
        right: 200,
        bottom: 100 + height,
        width: 200,
        height,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      }) as DOMRect

    await column.trigger('click', { clientY: 100 + 8 * HOUR_HEIGHT_PX + 10 })

    const events = wrapper.emitted('time-slot-select')
    expect(events).toHaveLength(1)
    expect(events![0]![0]).toMatchObject({
      source: 'day-timed-slot',
      date: day,
    })

    const payload = events![0]![0] as {
      start: Date
      end: Date
    }
    expect(payload.start.getHours()).toBe(8)
    expect(payload.start.getMinutes()).toBe(0)
    expect(payload.end.getHours()).toBe(9)
    expect(payload.end.getMinutes()).toBe(0)
    expect(wrapper.find('.time-slot-selection').exists()).toBe(true)
  })
})
