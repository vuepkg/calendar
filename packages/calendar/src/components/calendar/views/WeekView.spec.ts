import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useCalendar } from '@/composables/useCalendar'
import { mockSchedules } from '@/data/mockSchedules'
import WeekView from './WeekView.vue'

describe('WeekView', () => {
  function mountWeekView(date = new Date(2026, 3, 22)) {
    const calendar = useCalendar({
      schedules: mockSchedules,
      initialDate: date,
      initialView: 'week',
    })

    return mount(WeekView, { props: { calendar } })
  }

  it('renders TimedGrid with week navigation', () => {
    const wrapper = mountWeekView()

    expect(wrapper.find('.week-view').exists()).toBe(true)
    expect(wrapper.find('.timed-grid').exists()).toBe(true)
    expect(wrapper.get('[aria-label="Next week"]')).toBeTruthy()
  })

  it('emits navigate when next week is clicked', async () => {
    const wrapper = mountWeekView()

    await wrapper.get('[aria-label="Next week"]').trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['next-week'])
  })

  it('renders seven day columns for the selected week', () => {
    const wrapper = mountWeekView(new Date(2026, 3, 21))

    expect(wrapper.findAll('.day-column')).toHaveLength(7)
    expect(wrapper.text()).toContain('여수 출장')
  })
})
