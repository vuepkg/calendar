import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { mockSchedules } from '@/data/mockSchedules'
import ScheduleEventChip from './ScheduleEventChip.vue'

describe('ScheduleEventChip', () => {
  const schedule = mockSchedules[0]

  it('emits click on mouse click', async () => {
    const wrapper = mount(ScheduleEventChip, {
      props: {
        schedule,
        color: '#1565c0',
        backgroundColor: '#e3f2fd',
      },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')?.[0]).toEqual([schedule])
  })

  it('emits click on Enter key', async () => {
    const wrapper = mount(ScheduleEventChip, {
      props: {
        schedule,
        color: '#1565c0',
        backgroundColor: '#e3f2fd',
      },
    })

    await wrapper.trigger('keydown.enter')
    expect(wrapper.emitted('click')?.[0]).toEqual([schedule])
  })

  it('has button role and tabindex for accessibility', () => {
    const wrapper = mount(ScheduleEventChip, {
      props: {
        schedule,
        color: '#1565c0',
        backgroundColor: '#e3f2fd',
      },
    })

    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.attributes('title')).toContain(schedule.title)
  })

  it('shows a recurrence icon and hint for recurring instances', () => {
    const recurringInstance = {
      ...schedule,
      id: `${schedule!.id}::2026-05-07`,
      recurrenceId: schedule!.id,
    }
    const wrapper = mount(ScheduleEventChip, {
      props: {
        schedule: recurringInstance,
        color: '#1565c0',
        backgroundColor: '#e3f2fd',
      },
    })

    expect(wrapper.find('.event-recurrence-icon').exists()).toBe(true)
    expect(wrapper.attributes('title')).toContain('반복 일정')
  })

  it('does not show a recurrence icon for a non-recurring schedule', () => {
    const wrapper = mount(ScheduleEventChip, {
      props: {
        schedule,
        color: '#1565c0',
        backgroundColor: '#e3f2fd',
      },
    })

    expect(wrapper.find('.event-recurrence-icon').exists()).toBe(false)
  })
})
