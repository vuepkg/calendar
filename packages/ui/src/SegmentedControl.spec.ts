import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SegmentedControl from './SegmentedControl.vue'

const options = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
  { value: 'list', label: 'List' },
]

function mountControl(modelValue = 'month') {
  return mount(SegmentedControl, {
    props: { options, modelValue, ariaLabel: 'View selection' },
  })
}

describe('SegmentedControl', () => {
  it('renders one button per option with correct labels', () => {
    const wrapper = mountControl()
    const items = wrapper.findAll('.vp-segmented-control-item')
    expect(items).toHaveLength(4)
    expect(items.map((item) => item.text())).toEqual(['Month', 'Week', 'Day', 'List'])
  })

  it('applies role="group" and aria-label to the container', () => {
    const wrapper = mountControl()
    const group = wrapper.find('.vp-segmented-control')
    expect(group.attributes('role')).toBe('group')
    expect(group.attributes('aria-label')).toBe('View selection')
  })

  it('marks the active option with aria-pressed="true" and others "false"', () => {
    const wrapper = mountControl('day')
    const items = wrapper.findAll('.vp-segmented-control-item')
    const day = items.find((item) => item.text() === 'Day')
    const month = items.find((item) => item.text() === 'Month')
    expect(day?.attributes('aria-pressed')).toBe('true')
    expect(month?.attributes('aria-pressed')).toBe('false')
    expect(day?.classes()).toContain('active')
  })

  it('emits update:modelValue when an option is clicked', async () => {
    const wrapper = mountControl('month')
    await wrapper
      .findAll('.vp-segmented-control-item')
      .find((item) => item.text() === 'Day')!
      .trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['day'])
  })

  it('uses roving tabindex: active item is 0, others are -1', () => {
    const wrapper = mountControl('week')
    const items = wrapper.findAll('.vp-segmented-control-item')
    expect(items.find((item) => item.text() === 'Week')?.attributes('tabindex')).toBe('0')
    expect(items.find((item) => item.text() === 'Month')?.attributes('tabindex')).toBe('-1')
  })

  it('renders items as type="button"', () => {
    const wrapper = mountControl()
    wrapper.findAll('.vp-segmented-control-item').forEach((item) => {
      expect(item.attributes('type')).toBe('button')
    })
  })

  it('ArrowRight emits the next option, wrapping at the end', async () => {
    const wrapper = mountControl('list')
    await wrapper.find('.vp-segmented-control').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['month'])
  })

  it('ArrowLeft emits the previous option, wrapping at the start', async () => {
    const wrapper = mountControl('month')
    await wrapper.find('.vp-segmented-control').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['list'])
  })

  it('Home emits the first option', async () => {
    const wrapper = mountControl('list')
    await wrapper.find('.vp-segmented-control').trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['month'])
  })

  it('End emits the last option', async () => {
    const wrapper = mountControl('month')
    await wrapper.find('.vp-segmented-control').trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['list'])
  })

  it('moves DOM focus to the newly selected item after arrow navigation', async () => {
    const wrapper = mount(SegmentedControl, {
      props: { options, modelValue: 'month', ariaLabel: 'View selection' },
      attachTo: document.body,
    })
    await wrapper.find('.vp-segmented-control').trigger('keydown', { key: 'ArrowRight' })
    const weekItem = wrapper
      .findAll('.vp-segmented-control-item')
      .find((item) => item.text() === 'Week')
    expect(weekItem?.element).toBe(document.activeElement)
    wrapper.unmount()
  })

  it('renders no buttons and does not throw for an empty options array', () => {
    const wrapper = mount(SegmentedControl, {
      props: { options: [], modelValue: '', ariaLabel: 'Empty' },
    })
    expect(wrapper.findAll('.vp-segmented-control-item')).toHaveLength(0)
  })

  it('wraps to itself on ArrowRight/ArrowLeft with a single option', async () => {
    const single = [{ value: 'only', label: 'Only' }]
    const wrapper = mount(SegmentedControl, {
      props: { options: single, modelValue: 'only', ariaLabel: 'Single' },
    })
    await wrapper.find('.vp-segmented-control').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['only'])
  })

  it('falls back to the first option on ArrowRight when modelValue matches no option', async () => {
    const wrapper = mountControl('unknown-value')
    await wrapper.find('.vp-segmented-control').trigger('keydown', { key: 'ArrowRight' })
    // currentIndex is -1 -> baseIndex 0 -> ArrowRight selects index 1 ("week")
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['week'])
  })

  it('ignores keys other than Arrow/Home/End', async () => {
    const wrapper = mountControl('month')
    await wrapper.find('.vp-segmented-control').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
