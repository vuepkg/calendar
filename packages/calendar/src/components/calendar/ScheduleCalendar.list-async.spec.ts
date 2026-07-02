import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { mockSchedules } from '@/data/mockSchedules'
import { startOfDay } from '@/utils/date'

// ScheduleCalendar.vue loads ListView via defineAsyncComponent — this spec is isolated in its
// own file so the mocked rejection doesn't affect the many real List view tests in
// ScheduleCalendar.spec.ts (vi.mock is file-scoped).
vi.mock('./views/ListView.vue', () => Promise.reject(new Error('chunk load failed')))

import ScheduleCalendar from './ScheduleCalendar.vue'

describe('ScheduleCalendar async List view (ListView loading/error UI)', () => {
  it('renders the error placeholder instead of a blank screen when the List view chunk fails to load', async () => {
    const wrapper = mount(ScheduleCalendar, {
      props: {
        schedules: mockSchedules,
        view: 'list',
        date: startOfDay(new Date(2026, 3, 22)),
      },
    })

    await flushPromises()

    expect(wrapper.find('.schedule-calendar-async-state--error').exists()).toBe(true)
    expect(wrapper.find('[role="alert"]').text()).toContain('불러오지 못했습니다')
    expect(wrapper.find('.list-view').exists()).toBe(false)
  })
})
