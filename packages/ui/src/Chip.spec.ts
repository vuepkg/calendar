import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Chip from './Chip.vue'

describe('Chip', () => {
  it('renders slot content', () => {
    const wrapper = mount(Chip, { slots: { default: 'Holiday' } })
    expect(wrapper.text()).toBe('Holiday')
  })

  it('is not interactive by default (no role/tabindex)', () => {
    const wrapper = mount(Chip)
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('vp-chip--clickable')
  })

  it('applies role="button" and tabindex="0" when clickable', () => {
    const wrapper = mount(Chip, { props: { clickable: true } })
    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.classes()).toContain('vp-chip--clickable')
  })

  it('emits click on click when clickable', async () => {
    const wrapper = mount(Chip, { props: { clickable: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when not clickable', async () => {
    const wrapper = mount(Chip)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('emits click on Enter and Space keydown when clickable', async () => {
    const wrapper = mount(Chip, { props: { clickable: true } })
    await wrapper.trigger('keydown', { key: 'Enter' })
    await wrapper.trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('click')).toHaveLength(2)
  })

  it('applies inline color/backgroundColor/borderColor when color props are set', () => {
    const wrapper = mount(Chip, { props: { color: 'rgb(255, 255, 255)', backgroundColor: 'rgb(99, 102, 241)' } })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('color: rgb(255, 255, 255)')
    expect(style).toContain('background-color: rgb(99, 102, 241)')
    expect(style).toContain('border-color: rgb(255, 255, 255)')
  })

  it('has no inline style when no color props are passed', () => {
    const wrapper = mount(Chip)
    expect(wrapper.attributes('style')).toBeUndefined()
  })

  it('merges externally passed class with component class', () => {
    const wrapper = mount(Chip, { attrs: { class: 'custom-chip' } })
    expect(wrapper.classes()).toContain('vp-chip')
    expect(wrapper.classes()).toContain('custom-chip')
  })

  it('forwards title attribute', () => {
    const wrapper = mount(Chip, { attrs: { title: 'New Year' } })
    expect(wrapper.attributes('title')).toBe('New Year')
  })
})
