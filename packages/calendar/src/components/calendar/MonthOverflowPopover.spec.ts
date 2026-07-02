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

  describe('month-overflow-item slot (REV-A1)', () => {
    function mountPopover(slots?: Record<string, string>) {
      return mount(MonthOverflowPopover, {
        props: {
          open: true,
          date: startOfDay(new Date(2026, 4, 15)),
          schedules: mockSchedules.filter(
            (schedule) => schedule.start.getMonth() === 4 && schedule.start.getDate() === 15,
          ),
          highlightedScheduleIds: [],
          anchorTop: 420,
          anchorLeft: 140,
        },
        slots,
        attachTo: document.body,
      })
    }

    it('renders custom content and wires onSelect to schedule-click', async () => {
      const wrapper = mountPopover({
        'month-overflow-item': `
          <template #month-overflow-item="{ schedule, isHighlighted, onSelect }">
            <span class="custom-overflow-item" :data-highlighted="isHighlighted" @click="onSelect">{{ schedule.title }}</span>
          </template>
        `,
      })

      await flushPromises()

      const marker = document.body.querySelector('.custom-overflow-item') as HTMLElement | null
      expect(marker).toBeTruthy()
      expect(marker?.closest('.month-overflow-item')).toBeTruthy()

      marker!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await flushPromises()

      expect(wrapper.emitted('schedule-click')).toBeTruthy()
    })

    it('renders default label text unchanged when the slot is not used', async () => {
      mountPopover()
      await flushPromises()

      const item = document.body.querySelector('.month-overflow-item')
      expect(item?.textContent?.trim().length).toBeGreaterThan(0)
      expect(document.body.querySelector('.custom-overflow-item')).toBeFalsy()
    })
  })
})
