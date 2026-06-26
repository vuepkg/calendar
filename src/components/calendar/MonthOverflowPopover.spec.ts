import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { mockSchedules } from '@/data/mockSchedules'
import { startOfDay } from '@/utils/date'
import MonthOverflowPopover from './MonthOverflowPopover.vue'

describe('MonthOverflowPopover', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('applies container-constrained max size for embedded calendars', async () => {
    mount(MonthOverflowPopover, {
      props: {
        open: true,
        date: startOfDay(new Date(2026, 4, 15)),
        schedules: mockSchedules.filter((schedule) => schedule.start.getMonth() === 4),
        highlightedScheduleIds: [],
        anchorTop: 420,
        anchorLeft: 140,
        anchorBottom: 438,
        containerBounds: {
          top: 120,
          left: 80,
          right: 560,
          bottom: 680,
          width: 480,
          height: 560,
        },
      },
      attachTo: document.body,
    })

    await flushPromises()
    await flushPromises()

    const panel = document.body.querySelector('.month-overflow-popover') as HTMLElement | null
    expect(panel).toBeTruthy()

    const maxWidth = Number.parseFloat(panel!.style.maxWidth)
    const maxHeight = Number.parseFloat(panel!.style.maxHeight)

    expect(maxWidth).toBeLessThanOrEqual(464)
    expect(maxWidth).toBeGreaterThan(140)
    expect(maxHeight).toBeLessThanOrEqual(252)
  })
})
