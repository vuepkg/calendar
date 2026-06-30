import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IconButton from './IconButton.vue'

describe('IconButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(IconButton, { props: { ariaLabel: 'Previous' }, slots: { default: '‹' } })
    expect(wrapper.text()).toBe('‹')
  })

  it('applies aria-label from prop', () => {
    const wrapper = mount(IconButton, { props: { ariaLabel: 'Next month' } })
    expect(wrapper.attributes('aria-label')).toBe('Next month')
  })

  it('defaults to md size', () => {
    const wrapper = mount(IconButton, { props: { ariaLabel: 'Next' } })
    expect(wrapper.classes()).toContain('vp-icon-button--md')
  })

  it('applies sm size when specified', () => {
    const wrapper = mount(IconButton, { props: { ariaLabel: 'Next', size: 'sm' } })
    expect(wrapper.classes()).toContain('vp-icon-button--sm')
  })

  it('renders as a native <button type="button">', () => {
    const wrapper = mount(IconButton, { props: { ariaLabel: 'Next' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('emits native click event', async () => {
    const wrapper = mount(IconButton, { props: { ariaLabel: 'Next' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('honors explicit type prop (e.g. "submit")', () => {
    const wrapper = mount(IconButton, { props: { ariaLabel: 'Next', type: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('forwards disabled attribute', () => {
    const wrapper = mount(IconButton, { props: { ariaLabel: 'Next' }, attrs: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('merges externally passed class with component class', () => {
    const wrapper = mount(IconButton, {
      props: { ariaLabel: 'Next' },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.classes()).toContain('vp-icon-button')
    expect(wrapper.classes()).toContain('custom-class')
  })
})
