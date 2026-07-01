import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { mockSchedules, participants } from '@/data/mockSchedules'
import type { Schedule } from '@/types/schedule'
import ScheduleFormModal from './ScheduleFormModal.vue'

function mountModal(props: Partial<InstanceType<typeof ScheduleFormModal>['$props']> = {}) {
  return mount(ScheduleFormModal, {
    props: {
      open: true,
      mode: 'create',
      participants,
      existingSchedules: mockSchedules,
      ...props,
    },
    attachTo: document.body,
  })
}

function setInputValue(input: HTMLInputElement, value: string) {
  input.value = value
  input.dispatchEvent(new Event('input'))
}

function setDateInputValue(input: HTMLInputElement, value: string) {
  input.value = value
  input.dispatchEvent(new Event('change'))
}

describe('ScheduleFormModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when closed', () => {
    const wrapper = mountModal({ open: false })
    expect(document.body.querySelector('.schedule-form')).toBeNull()
    wrapper.unmount()
  })

  it('shows the create title and no delete button in create mode', async () => {
    const wrapper = mountModal({ mode: 'create' })
    await flushPromises()
    expect(document.body.querySelector('.schedule-form-title')?.textContent).toBe('일정 생성')
    expect(document.body.querySelector('.schedule-form-delete')).toBeNull()
    wrapper.unmount()
  })

  it('prefills fields from the schedule prop in edit mode', async () => {
    const schedule = mockSchedules[0]!
    const wrapper = mountModal({ mode: 'edit', schedule })
    await flushPromises()

    expect(document.body.querySelector('.schedule-form-title')?.textContent).toBe('일정 수정')
    const titleInput = document.body.querySelector<HTMLInputElement>(
      '.schedule-form-input[type="text"]',
    )
    expect(titleInput?.value).toBe(schedule.title)
    expect(document.body.querySelector('.schedule-form-delete')).toBeTruthy()
    wrapper.unmount()
  })

  it('prefills start/end from initialStart/initialEnd in create mode', async () => {
    const initialStart = new Date(2026, 5, 15, 10, 0)
    const initialEnd = new Date(2026, 5, 15, 11, 0)
    const wrapper = mountModal({ mode: 'create', initialStart, initialEnd })
    await flushPromises()

    const dateInputs = document.body.querySelectorAll<HTMLInputElement>(
      'input[type="date"].schedule-form-input',
    )
    expect(dateInputs[0]?.value).toBe('2026-06-15')
    expect(dateInputs[1]?.value).toBe('2026-06-15')
    wrapper.unmount()
  })

  it('shows a validation error and disables submit when title is empty', async () => {
    const wrapper = mountModal({ mode: 'create' })
    await flushPromises()

    const submitBtn = document.body.querySelector<HTMLButtonElement>('button[type="submit"]')
    expect(submitBtn?.disabled).toBe(true)

    const form = document.body.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    expect(wrapper.emitted('submit')).toBeUndefined()
    wrapper.unmount()
  })

  it('emits submit with a fully-built Schedule when the form is valid', async () => {
    const initialStart = new Date(2026, 5, 15, 10, 0)
    const initialEnd = new Date(2026, 5, 15, 11, 0)
    const wrapper = mountModal({ mode: 'create', initialStart, initialEnd })
    await flushPromises()

    const titleInput = document.body.querySelector<HTMLInputElement>(
      '.schedule-form-input[type="text"]',
    )!
    setInputValue(titleInput, '신규 회의')
    await flushPromises()

    const form = document.body.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()

    const emitted = wrapper.emitted('submit')?.[0]?.[0] as Schedule
    expect(emitted).toBeDefined()
    expect(emitted.title).toBe('신규 회의')
    expect(emitted.start).toEqual(initialStart)
    expect(emitted.end).toEqual(initialEnd)
    expect(emitted.participantName).toBe(participants[0]!.name)
    // new schedule gets a fresh id distinct from existing mock ids
    expect(mockSchedules.some((s) => s.id === emitted.id)).toBe(false)
    wrapper.unmount()
  })

  it('emits submit with the original id preserved in edit mode', async () => {
    const schedule = mockSchedules[0]!
    const wrapper = mountModal({ mode: 'edit', schedule })
    await flushPromises()

    const titleInput = document.body.querySelector<HTMLInputElement>(
      '.schedule-form-input[type="text"]',
    )!
    setInputValue(titleInput, '수정된 제목')
    await flushPromises()

    const form = document.body.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    await flushPromises()

    const emitted = wrapper.emitted('submit')?.[0]?.[0] as Schedule
    expect(emitted.id).toBe(schedule.id)
    expect(emitted.title).toBe('수정된 제목')
    wrapper.unmount()
  })

  it('emits delete with the schedule id when the delete button is clicked', async () => {
    const schedule = mockSchedules[0]!
    const wrapper = mountModal({ mode: 'edit', schedule })
    await flushPromises()

    const deleteBtn = document.body.querySelector<HTMLButtonElement>('.schedule-form-delete')!
    deleteBtn.click()
    expect(wrapper.emitted('delete')?.[0]).toEqual([schedule.id])
    wrapper.unmount()
  })

  it('emits close when the cancel button is clicked', async () => {
    const wrapper = mountModal({ mode: 'create' })
    await flushPromises()

    const buttons = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
    const cancelBtn = buttons.find((btn) => btn.textContent?.trim() === '취소')
    cancelBtn!.click()
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('rejects an end date earlier than the start date', async () => {
    const initialStart = new Date(2026, 5, 15, 10, 0)
    const initialEnd = new Date(2026, 5, 15, 11, 0)
    const wrapper = mountModal({ mode: 'create', initialStart, initialEnd })
    await flushPromises()

    const titleInput = document.body.querySelector<HTMLInputElement>(
      '.schedule-form-input[type="text"]',
    )!
    setInputValue(titleInput, '무효 범위')

    const dateInputs = document.body.querySelectorAll<HTMLInputElement>(
      'input[type="date"].schedule-form-input',
    )
    setDateInputValue(dateInputs[1]!, '2026-06-10')
    await flushPromises()

    expect(document.body.querySelector('.schedule-form-error')?.textContent).toContain(
      '종료가 시작보다',
    )

    const form = document.body.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    expect(wrapper.emitted('submit')).toBeUndefined()
    wrapper.unmount()
  })
})
