import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HolidayChip from './HolidayChip.vue'

describe('HolidayChip', () => {
  it('renders holiday name with title attribute', () => {
    const wrapper = mount(HolidayChip, { props: { name: '어린이날' } })

    expect(wrapper.find('.holiday-chip-label').text()).toBe('어린이날')
    expect(wrapper.find('.holiday-chip').attributes('title')).toBe('어린이날')
  })

  it('applies holiday chip styling class', () => {
    const wrapper = mount(HolidayChip, { props: { name: '설날' } })

    expect(wrapper.find('.holiday-chip').classes()).toContain('holiday-chip')
  })
})
