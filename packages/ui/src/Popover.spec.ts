import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import Popover from './Popover.vue'

function mountPopover(props: Partial<InstanceType<typeof Popover>['$props']> = {}) {
  return mount(Popover, {
    props: {
      open: true,
      anchorTop: 100,
      anchorLeft: 50,
      ariaLabel: 'Test popover',
      ...props,
    },
    slots: {
      default: '<button type="button" class="first-action">First</button><button type="button" class="second-action">Second</button>',
    },
    attachTo: document.body,
  })
}

describe('Popover', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when closed', () => {
    const wrapper = mountPopover({ open: false })
    expect(document.body.querySelector('.vp-popover')).toBeNull()
    wrapper.unmount()
  })

  it('renders the panel with role=dialog and the given aria-label when open', async () => {
    const wrapper = mountPopover()
    await flushPromises()
    const panel = document.body.querySelector('.vp-popover')
    expect(panel).toBeTruthy()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-label')).toBe('Test popover')
    wrapper.unmount()
  })

  it('renders slot content inside the panel', async () => {
    const wrapper = mountPopover()
    await flushPromises()
    expect(document.body.querySelector('.first-action')).toBeTruthy()
    expect(document.body.querySelector('.second-action')).toBeTruthy()
    wrapper.unmount()
  })

  it('emits close when the backdrop is clicked', async () => {
    const wrapper = mountPopover()
    await flushPromises()
    const backdrop = document.body.querySelector('.vp-popover-backdrop') as HTMLElement
    backdrop.click()
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('emits close on Escape key', async () => {
    const wrapper = mountPopover()
    await flushPromises()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('moves focus into the panel when opened', async () => {
    const wrapper = mountPopover()
    await flushPromises()
    const first = document.body.querySelector('.first-action')
    expect(document.activeElement).toBe(first)
    wrapper.unmount()
  })

  it('traps Tab focus within the panel, wrapping from last back to first', async () => {
    const wrapper = mountPopover()
    await flushPromises()
    const second = document.body.querySelector('.second-action') as HTMLElement
    second.focus()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }))
    expect(document.activeElement).toBe(document.body.querySelector('.first-action'))
    wrapper.unmount()
  })

  it('traps Shift+Tab focus, wrapping from first back to last', async () => {
    const wrapper = mountPopover()
    await flushPromises()
    const first = document.body.querySelector('.first-action') as HTMLElement
    first.focus()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true }))
    expect(document.activeElement).toBe(document.body.querySelector('.second-action'))
    wrapper.unmount()
  })

  it('restores focus to the previously focused element on close', async () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'Open'
    document.body.appendChild(trigger)
    trigger.focus()

    const wrapper = mountPopover()
    await flushPromises()
    expect(document.activeElement).not.toBe(trigger)

    await wrapper.setProps({ open: false })
    await flushPromises()
    expect(document.activeElement).toBe(trigger)

    wrapper.unmount()
    trigger.remove()
  })

  it('applies positioning styles to the panel', async () => {
    const wrapper = mountPopover({ anchorTop: 200, anchorLeft: 75 })
    await flushPromises()
    const panel = document.body.querySelector('.vp-popover') as HTMLElement
    expect(panel.style.top).toBeTruthy()
    expect(panel.style.left).toBeTruthy()
    expect(panel.style.maxWidth).toBeTruthy()
    expect(panel.style.maxHeight).toBeTruthy()
    wrapper.unmount()
  })
})
