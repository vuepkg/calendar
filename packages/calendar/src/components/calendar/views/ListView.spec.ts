import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useCalendar } from '@/composables/useCalendar'
import { mockSchedules } from '@/data/mockSchedules'
import { startOfDay } from '@/utils/date'
import ListView from './ListView.vue'

describe('ListView', () => {
  it('shows filter bar and emits list-filter-clear', async () => {
    const listFilterDate = ref(startOfDay(new Date(2026, 4, 15)))
    const calendar = useCalendar({
      schedules: mockSchedules,
      listFilterDate,
      initialDate: new Date(2026, 4, 15),
    })

    const wrapper = mount(ListView, { props: { calendar } })

    expect(wrapper.find('.list-filter-bar').exists()).toBe(true)
    await wrapper.get('.clear-filter-btn').trigger('click')
    expect(wrapper.emitted('list-filter-clear')).toHaveLength(1)
  })

  it('renders month navigation and emits navigate', async () => {
    const calendar = useCalendar({
      schedules: mockSchedules,
      initialDate: new Date(2026, 3, 22),
    })

    const wrapper = mount(ListView, { props: { calendar } })

    expect(wrapper.get('.calendar-month-nav-title').text()).toBe('2026-04')
    await wrapper.get('[aria-label="Next month"]').trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['next-month'])
  })

  it('clears day filter before month navigation when filter is active', async () => {
    const listFilterDate = ref(startOfDay(new Date(2026, 4, 15)))
    const calendar = useCalendar({
      schedules: mockSchedules,
      listFilterDate,
      initialDate: new Date(2026, 4, 15),
    })

    const wrapper = mount(ListView, { props: { calendar } })

    await wrapper.get('[aria-label="Previous month"]').trigger('click')
    expect(wrapper.emitted('list-filter-clear')).toHaveLength(1)
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['prev-month'])
  })

  it('emits schedule-click when a list row is clicked', async () => {
    const calendar = useCalendar({
      schedules: mockSchedules,
      initialDate: new Date(2026, 3, 22),
    })
    const expectedSchedule = calendar.listRows.value[0]!.schedule

    const wrapper = mount(ListView, { props: { calendar } })

    const firstRow = wrapper.get('.list-row')
    await firstRow.trigger('click')

    const emitted = wrapper.emitted('schedule-click')?.[0]?.[0] as {
      schedule: { id: string }
      source: string
    }

    expect(emitted.schedule.id).toBe(expectedSchedule.id)
    expect(emitted.source).toBe('list-row')
  })
})
