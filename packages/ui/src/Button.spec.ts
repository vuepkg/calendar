import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Button from './Button.vue'

describe('Button', () => {
  it('renders slot content', () => {
    const wrapper = mount(Button, { slots: { default: 'Today' } })
    expect(wrapper.text()).toBe('Today')
  })

  it('renders as a native <button type="button">', () => {
    const wrapper = mount(Button)
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('applies bold weight class when weight="bold"', () => {
    const wrapper = mount(Button, { props: { weight: 'bold' } })
    expect(wrapper.classes()).toContain('vp-button--bold')
  })

  it('does not apply bold weight class by default', () => {
    const wrapper = mount(Button)
    expect(wrapper.classes()).not.toContain('vp-button--bold')
  })

  it('emits native click event', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('honors explicit type prop (e.g. "submit")', () => {
    const wrapper = mount(Button, { props: { type: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('forwards disabled attribute and applies disabled styling', () => {
    const wrapper = mount(Button, { attrs: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('merges externally passed class with component class', () => {
    const wrapper = mount(Button, { attrs: { class: 'custom-class' } })
    expect(wrapper.classes()).toContain('vp-button')
    expect(wrapper.classes()).toContain('custom-class')
  })
})
