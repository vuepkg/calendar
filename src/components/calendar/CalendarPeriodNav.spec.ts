import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CalendarPeriodNav from './CalendarPeriodNav.vue'

describe('CalendarPeriodNav', () => {
  it('renders period label to the right of navigation arrows', () => {
    const wrapper = mount(CalendarPeriodNav, {
      props: {
        periodLabel: '2026-04',
        prevLabel: 'Previous week',
        nextLabel: 'Next week',
      },
    })

    const label = wrapper.get('.period-label')
    expect(label.text()).toBe('2026-04')
    expect(wrapper.get('.nav-arrows').element.nextElementSibling).toBe(label.element)
  })

  it('omits period label when not provided', () => {
    const wrapper = mount(CalendarPeriodNav)
    expect(wrapper.find('.period-label').exists()).toBe(false)
  })
})
