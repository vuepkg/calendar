import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import Dialog from './Dialog.vue'

function mountDialog(props: Partial<InstanceType<typeof Dialog>['$props']> = {}) {
  return mount(Dialog, {
    props: {
      open: true,
      ariaLabel: 'Test dialog',
      ...props,
    },
    slots: {
      default:
        '<button type="button" class="first-action">First</button><button type="button" class="second-action">Second</button>',
    },
    attachTo: document.body,
  })
}

describe('Dialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when closed', () => {
    const wrapper = mountDialog({ open: false })
    expect(document.body.querySelector('.vp-dialog')).toBeNull()
    wrapper.unmount()
  })

  it('renders the panel with role=dialog, aria-modal, and the given aria-label when open', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    const panel = document.body.querySelector('.vp-dialog')
    expect(panel).toBeTruthy()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    expect(panel?.getAttribute('aria-label')).toBe('Test dialog')
    wrapper.unmount()
  })

  it('renders slot content inside the panel', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    expect(document.body.querySelector('.first-action')).toBeTruthy()
    expect(document.body.querySelector('.second-action')).toBeTruthy()
    wrapper.unmount()
  })

  it('applies panelClass to the panel', async () => {
    const wrapper = mountDialog({ panelClass: 'custom-dialog' })
    await flushPromises()
    expect(document.body.querySelector('.vp-dialog.custom-dialog')).toBeTruthy()
    wrapper.unmount()
  })

  it('emits close when the backdrop is clicked', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    const backdrop = document.body.querySelector('.vp-dialog-backdrop') as HTMLElement
    backdrop.click()
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('does not close when the panel itself is clicked', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    const panel = document.body.querySelector('.vp-dialog') as HTMLElement
    panel.click()
    expect(wrapper.emitted('close')).toBeUndefined()
    wrapper.unmount()
  })

  it('emits close on Escape key', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('moves focus into the panel when opened', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    const first = document.body.querySelector('.first-action')
    expect(document.activeElement).toBe(first)
    wrapper.unmount()
  })

  it('traps Tab focus within the panel, wrapping from last back to first', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    const second = document.body.querySelector('.second-action') as HTMLElement
    second.focus()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }))
    expect(document.activeElement).toBe(document.body.querySelector('.first-action'))
    wrapper.unmount()
  })

  it('traps Shift+Tab focus, wrapping from first back to last', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    const first = document.body.querySelector('.first-action') as HTMLElement
    first.focus()
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true }),
    )
    expect(document.activeElement).toBe(document.body.querySelector('.second-action'))
    wrapper.unmount()
  })

  it('restores focus to the previously focused element on close', async () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'Open'
    document.body.appendChild(trigger)
    trigger.focus()

    const wrapper = mountDialog()
    await flushPromises()
    expect(document.activeElement).not.toBe(trigger)

    await wrapper.setProps({ open: false })
    await flushPromises()
    expect(document.activeElement).toBe(trigger)

    wrapper.unmount()
    trigger.remove()
  })
})
