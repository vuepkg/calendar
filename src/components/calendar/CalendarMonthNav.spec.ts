import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CalendarMonthNav from './CalendarMonthNav.vue'

describe('CalendarMonthNav', () => {
  it('renders label and emits prev/next', async () => {
    const wrapper = mount(CalendarMonthNav, {
      props: { label: '2026-04' },
    })

    expect(wrapper.get('.calendar-month-nav-title').text()).toBe('2026-04')

    await wrapper.get('[aria-label="Previous month"]').trigger('click')
    await wrapper.get('[aria-label="Next month"]').trigger('click')

    expect(wrapper.emitted('prev')).toHaveLength(1)
    expect(wrapper.emitted('next')).toHaveLength(1)
  })
})
