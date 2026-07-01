import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useCalendar } from '@/composables/useCalendar'
import { mockSchedules } from '@/data/mockSchedules'
import DayView from './DayView.vue'

describe('DayView', () => {
  function mountDayView(date = new Date(2026, 3, 21)) {
    const calendar = useCalendar({
      schedules: mockSchedules,
      initialDate: date,
      initialView: 'day',
    })

    return mount(DayView, { props: { calendar } })
  }

  it('renders single-day TimedGrid with day navigation', () => {
    const wrapper = mountDayView()

    expect(wrapper.find('.day-view').exists()).toBe(true)
    expect(wrapper.find('.timed-grid.single-day').exists()).toBe(true)
    expect(wrapper.get('[aria-label="Next day"]')).toBeTruthy()
  })

  it('emits navigate when previous day is clicked', async () => {
    const wrapper = mountDayView()

    await wrapper.get('[aria-label="Previous day"]').trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['prev-day'])
  })

  it('shows timed schedules for the selected day', () => {
    const wrapper = mountDayView(new Date(2026, 3, 21))

    expect(wrapper.text()).toContain('여수 출장')
  })
})
