import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useCalendar } from '@/composables/useCalendar'
import { mockSchedules } from '@/data/mockSchedules'
import CalendarToolbar from './CalendarToolbar.vue'

describe('CalendarToolbar', () => {
  it('renders four view tabs with active state on current view', () => {
    const calendar = useCalendar({
      schedules: mockSchedules,
      initialView: 'week',
    })

    const wrapper = mount(CalendarToolbar, {
      props: { calendar },
    })

    const tabs = wrapper.findAll('.vp-segmented-control-item')
    expect(tabs).toHaveLength(4)
    expect(tabs.map((tab) => tab.text())).toEqual(['Month', 'Week', 'Day', 'List'])
    expect(tabs.find((tab) => tab.text() === 'Week')?.classes()).toContain('active')
  })

  it('emits view-change when a tab is clicked', async () => {
    const calendar = useCalendar({
      schedules: mockSchedules,
      initialView: 'month',
    })

    const wrapper = mount(CalendarToolbar, {
      props: { calendar },
    })

    await wrapper
      .findAll('.vp-segmented-control-item')
      .find((tab) => tab.text() === 'Day')!
      .trigger('click')

    expect(wrapper.emitted('view-change')?.[0]).toEqual(['day'])
  })

  it('exposes tabs as type="button" for keyboard activation', () => {
    const calendar = useCalendar({ schedules: mockSchedules })
    const wrapper = mount(CalendarToolbar, { props: { calendar } })

    wrapper.findAll('button.vp-segmented-control-item').forEach((button) => {
      expect(button.attributes('type')).toBe('button')
    })
  })

  // 2026-06-16: SelectButton 스타일 UI 개선 — 접근성 속성 추가 검증
  it('wraps view tabs with role="group" and aria-label for screen readers', () => {
    const calendar = useCalendar({ schedules: mockSchedules })
    const wrapper = mount(CalendarToolbar, { props: { calendar } })

    const group = wrapper.find('.vp-segmented-control')
    expect(group.attributes('role')).toBe('group')
    expect(group.attributes('aria-label')).toBe('캘린더 보기 선택')
  })

  it('sets aria-pressed="true" on the active tab and "false" on others', () => {
    const calendar = useCalendar({
      schedules: mockSchedules,
      initialView: 'day',
    })
    const wrapper = mount(CalendarToolbar, { props: { calendar } })

    const tabs = wrapper.findAll('button.vp-segmented-control-item')
    const dayTab = tabs.find((tab) => tab.text() === 'Day')
    const monthTab = tabs.find((tab) => tab.text() === 'Month')

    expect(dayTab?.attributes('aria-pressed')).toBe('true')
    expect(monthTab?.attributes('aria-pressed')).toBe('false')
  })

  it('updates aria-pressed when view changes', async () => {
    const calendar = useCalendar({
      schedules: mockSchedules,
      initialView: 'month',
    })
    const wrapper = mount(CalendarToolbar, { props: { calendar } })

    const weekTab = wrapper
      .findAll('button.vp-segmented-control-item')
      .find((tab) => tab.text() === 'Week')
    expect(weekTab?.attributes('aria-pressed')).toBe('false')

    // 탭 클릭 후 calendar 상태를 직접 변경해 반응성 검증
    calendar.state.currentView = 'week'
    await wrapper.vm.$nextTick()

    expect(weekTab?.attributes('aria-pressed')).toBe('true')
  })
})
