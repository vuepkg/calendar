import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { useCalendar } from '@/composables/useCalendar'
import { mockCompanyHolidays } from '@/data/mockSchedules'
import { mockSchedules, TWO_DAY_ALL_DAY_ID, TWO_DAY_ALL_DAY_TITLE } from '@/data/mockSchedules'
import type { CalendarDateSelectPayload } from '@/types/calendarEvents'
import type { Holiday } from '@/types/schedule'
import { startOfDay } from '@/utils/date'
import MonthView from './MonthView.vue'

describe('MonthView', () => {
  function mountMonthView(date = startOfDay(new Date(2026, 4, 1)), holidays: Holiday[] = []) {
    const calendar = useCalendar({
      schedules: mockSchedules,
      holidays,
      initialDate: date,
      initialView: 'month',
    })

    return mount(MonthView, {
      props: { calendar },
    })
  }

  it('opens overflow popover and emits overflow-click from +N without date-select', async () => {
    const wrapper = mountMonthView(startOfDay(new Date(2026, 4, 1)))
    const may15Cell = wrapper
      .findAll('.month-cell:not(.outside)')
      .find((el) => el.find('.cell-date').text() === '15')
    const overflowButton = may15Cell!.find('.more-events')

    expect(overflowButton.exists()).toBe(true)
    await overflowButton.trigger('click')

    expect(wrapper.emitted('overflow-click')).toHaveLength(1)
    expect(wrapper.emitted('date-select')).toBeUndefined()
    expect(document.body.querySelector('.month-overflow-popover')).toBeTruthy()
    expect(document.body.querySelector('.month-overflow-title')?.textContent).toBe('2026-05-15')
  })

  it('emits schedule-click when month chip is clicked without date-select', async () => {
    const wrapper = mountMonthView(startOfDay(new Date(2026, 3, 22)))
    const chip = wrapper.findAll('.event-chip').find((el) => el.text().includes('여수 출장'))

    expect(chip).toBeDefined()
    await chip!.trigger('click')

    const emitted = wrapper.emitted('schedule-click')?.[0]?.[0]
    expect(emitted).toMatchObject({
      source: 'month-chip',
      schedule: expect.objectContaining({ title: '여수 출장' }),
      date: startOfDay(new Date(2026, 3, 21)),
    })
    expect(wrapper.emitted('date-select')).toBeUndefined()
  })

  it('emits schedule-click when month all-day bar is clicked', async () => {
    const wrapper = mountMonthView(startOfDay(new Date(2026, 3, 22)))
    const bar = wrapper.findAll('.all-day-bar-chip').find((el) => el.text().includes('제주 연수'))

    expect(bar).toBeDefined()
    await bar!.trigger('click')

    const emitted = wrapper.emitted('schedule-click')?.[0]?.[0]
    expect(emitted).toMatchObject({
      source: 'month-all-day-bar',
      schedule: expect.objectContaining({ title: '제주 연수' }),
    })
  })

  describe('two-day overseas trip (s-023) month spanning bar regression', () => {
    it('renders in week overlay bars instead of cell chips', () => {
      const wrapper = mountMonthView(startOfDay(new Date(2026, 3, 1)))
      const overseasBar = wrapper
        .findAll('.all-day-bar-chip')
        .find((el) => el.text().includes(TWO_DAY_ALL_DAY_TITLE))
      const overseasChip = wrapper
        .findAll('.event-chip')
        .find((el) => el.text().includes(TWO_DAY_ALL_DAY_TITLE))
      const overseasSlot = overseasBar?.element.closest(
        '.month-week-bar-slot',
      ) as HTMLElement | null
      const overseasClick = overseasBar?.element.closest('.month-week-bar-click')

      expect(overseasBar).toBeDefined()
      expect(overseasChip).toBeUndefined()
      expect(overseasBar?.element.closest('.month-week-bars')).toBeTruthy()
      expect(overseasBar?.element.closest('.cell-events')).toBeFalsy()
      expect(overseasSlot?.style.gridColumn).toBe('2 / span 2')
      expect(overseasClick).toBeTruthy()
    })

    it('emits schedule-click from spanning bar with month-all-day-bar source', async () => {
      const wrapper = mountMonthView(startOfDay(new Date(2026, 3, 1)))
      const overseasBar = wrapper
        .findAll('.all-day-bar-chip')
        .find((el) => el.text().includes(TWO_DAY_ALL_DAY_TITLE))

      expect(overseasBar).toBeDefined()
      await overseasBar!.trigger('click')

      const emitted = wrapper.emitted('schedule-click')?.[0]?.[0]
      expect(emitted).toMatchObject({
        source: 'month-all-day-bar',
        schedule: expect.objectContaining({ id: TWO_DAY_ALL_DAY_ID, title: TWO_DAY_ALL_DAY_TITLE }),
      })
    })
  })

  it('renders holiday chips with red styling on matching dates', () => {
    const wrapper = mountMonthView(startOfDay(new Date(2026, 3, 1)), mockCompanyHolidays)
    const aprilFirstCell = wrapper
      .findAll('.month-cell:not(.outside)')
      .find((el) => el.find('.cell-date').text() === '1')
    const holidayChip = aprilFirstCell?.find('.holiday-chip')

    expect(holidayChip?.exists()).toBe(true)
    expect(holidayChip?.text()).toBe('회사 창립기념일')
    expect(holidayChip?.attributes('style')).toContain('background-color: rgb(255, 235, 238)')
    expect(holidayChip?.attributes('style')).toContain('color: rgb(198, 40, 40)')
  })

  it('emits date-select when empty area of month cell is clicked', async () => {
    const wrapper = mountMonthView(startOfDay(new Date(2026, 3, 22)))
    const cell = wrapper
      .findAll('.month-cell:not(.outside)')
      .find((el) => el.find('.cell-date').text() === '1')

    await cell!.trigger('click')

    const emitted = wrapper.emitted('date-select')?.[0]?.[0] as CalendarDateSelectPayload
    expect(emitted.source).toBe('month-cell')
    expect(emitted.date).toEqual(startOfDay(new Date(2026, 3, 1)))
  })

  // 2026-06-16: +N 오버플로우 칩 너비 축소 — more-events 버튼 렌더링 검증
  // CSS width:fit-content는 JSDOM에서 평가되지 않으므로 E2E에서 시각적으로 검증.
  // 여기서는 버튼이 올바른 클래스로 렌더링되고 셀 내부에 있음을 확인한다.
  it('renders +N overflow button inside month cell with more-events class', () => {
    const wrapper = mountMonthView(startOfDay(new Date(2026, 4, 1)))
    const may15Cell = wrapper
      .findAll('.month-cell:not(.outside)')
      .find((el) => el.find('.cell-date').text() === '15')

    const moreBtn = may15Cell?.find('button.more-events')
    expect(moreBtn?.exists()).toBe(true)
    // width:100% 인라인 스타일이 없어야 CSS width:fit-content가 적용 가능
    expect((moreBtn?.element as HTMLElement | undefined)?.style.width).not.toBe('100%')
  })

  it('renders +N overflow button as a <button> element for keyboard accessibility', () => {
    const wrapper = mountMonthView(startOfDay(new Date(2026, 4, 1)))
    const may15Cell = wrapper
      .findAll('.month-cell:not(.outside)')
      .find((el) => el.find('.cell-date').text() === '15')

    const moreBtn = may15Cell?.find('button.more-events')
    expect(moreBtn?.element.tagName).toBe('BUTTON')
    expect(moreBtn?.attributes('type')).toBe('button')
  })
})
