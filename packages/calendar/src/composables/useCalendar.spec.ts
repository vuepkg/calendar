import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import {
  ALL_DAY_OVERFLOW_DATE,
  MONTH_OVERFLOW_DATE_KEY,
  HALF_HOUR_SLOT_DATE,
  MONTH_PLUS_COUNT_DATE_KEY,
  MULTI_DAY_ALL_DAY_END,
  MULTI_DAY_ALL_DAY_ID,
  MULTI_DAY_ALL_DAY_MIDDLE,
  MULTI_DAY_ALL_DAY_START,
  mockRecurringSchedules,
  mockSchedules,
  RECURRING_SCHEDULE_ID,
  WEEK_OVERLAP_DATE,
} from '@/data/mockSchedules'
import { ALL_DAY_SECTION_MAX_HEIGHT, DAY_VIEW_ALL_DAY_VISIBLE_MAX } from '@/constants/calendarView'
import { getAllDayRowCount, layoutWeekAllDayBars } from '@/utils/timed'
import {
  DAY_VIEW_END_HOUR,
  DAY_VIEW_HOUR_HEIGHT_PX,
  DAY_VIEW_START_HOUR,
} from '@/constants/calendarView'
import { MONTH_CELL_HEIGHT_PX } from '@/constants/calendarView'
import { TIMED_VIEW_START_HOUR } from '@/constants/calendarView'
import { formatPeriod, getWeekDays, isSameDay } from '@/utils/date'
import { getMonthCellDisplay, layoutMonthWeeks } from '@/utils/month'
import {
  getAllDaySchedules,
  getSchedulesForDay,
  getTimedSchedules,
  layoutTimedSchedules,
} from '@/utils/schedule'
import { useCalendar } from './useCalendar'

describe('useCalendar requirements', () => {
  describe('month view', () => {
    it('shows multiple participants on the same day', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: new Date(2026, 3, 19),
      })

      const cell = calendar.monthCells.value.find((item) => item.key === '2026-04-19')

      expect(cell!.schedules.length).toBeGreaterThanOrEqual(2)
      expect(
        new Set(cell!.schedules.map((schedule) => schedule.participantId)).size,
      ).toBeGreaterThan(1)
    })

    it('shows all busy-day schedules on may 1 when the cell still has room', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: new Date(2026, 4, 1),
      })

      const overflowCell = layoutMonthWeeks(calendar.monthCells.value)
        .flatMap((week) => week.cells)
        .find((cell) => cell.key === MONTH_OVERFLOW_DATE_KEY)!

      expect(overflowCell.chipVisible).toHaveLength(5)
      expect(overflowCell.hiddenScheduleCount).toBe(0)
    })

    it('shows all five schedules on april 21 without premature +count', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: new Date(2026, 3, 1),
      })

      const overflowCell = layoutMonthWeeks(calendar.monthCells.value)
        .flatMap((week) => week.cells)
        .find((cell) => cell.key === '2026-04-21')!

      expect(overflowCell.chipVisible).toHaveLength(5)
      expect(overflowCell.hiddenScheduleCount).toBe(0)
    })

    it('shows +count on the may 15 sample date', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: new Date(2026, 4, 1),
      })

      const plusCountCell = layoutMonthWeeks(calendar.monthCells.value)
        .flatMap((week) => week.cells)
        .find((cell) => cell.key === MONTH_PLUS_COUNT_DATE_KEY)!

      expect(plusCountCell.chipVisible).toHaveLength(4)
      expect(plusCountCell.hiddenScheduleCount).toBe(2)
    })

    it('hides overflow schedules behind +count only when the cell is full', () => {
      const timedOverflowSchedules = Array.from({ length: 6 }, (_, index) => ({
        id: `overflow-${index}`,
        title: `Timed ${index}`,
        type: 'my_schedule' as const,
        participantId: 'user-a',
        participantName: 'TEST USER',
        start: new Date(2026, 4, 1, 9 + index, 0),
        end: new Date(2026, 4, 1, 10 + index, 0),
      }))

      const overflowCell = layoutMonthWeeks(
        useCalendar({
          schedules: timedOverflowSchedules,
          initialDate: new Date(2026, 4, 1),
        }).monthCells.value,
      )
        .flatMap((week) => week.cells)
        .find((cell) => cell.key === MONTH_OVERFLOW_DATE_KEY)!

      expect(overflowCell.chipVisible).toHaveLength(4)
      expect(overflowCell.hiddenScheduleCount).toBe(2)
    })

    it('connects multi-day all-day schedule across month cells', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: MULTI_DAY_ALL_DAY_START,
      })

      const weeks = layoutMonthWeeks(calendar.monthCells.value)
      const multiDayBar = weeks
        .flatMap((week) => week.bars)
        .find((bar) => bar.schedule.id === MULTI_DAY_ALL_DAY_ID)

      expect(multiDayBar).toBeDefined()
      expect(multiDayBar!.span).toBe(3)
    })

    it('shows multi-day all-day on each day in month cell data', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: MULTI_DAY_ALL_DAY_START,
      })

      for (const key of ['2026-04-23', '2026-04-24', '2026-04-25']) {
        const cell = calendar.monthCells.value.find((item) => item.key === key)
        expect(cell!.schedules.some((schedule) => schedule.id === MULTI_DAY_ALL_DAY_ID)).toBe(true)
      }
    })

    it('keeps every month week row at a fixed cell height', () => {
      const weeks = layoutMonthWeeks(
        useCalendar({
          schedules: mockSchedules,
          initialDate: new Date(2026, 3, 1),
        }).monthCells.value,
      )

      expect(weeks.length).toBe(6)
      expect(MONTH_CELL_HEIGHT_PX).toBe(128)
    })

    it('moves to previous and next months', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: new Date(2026, 3, 19),
      })

      calendar.moveMonth(1)
      expect(calendar.state.selectedDate.getMonth()).toBe(4)
      expect(calendar.monthLabel.value).toBe('2026-05')

      calendar.moveMonth(-1)
      expect(calendar.state.selectedDate.getMonth()).toBe(3)
      expect(calendar.monthLabel.value).toBe('2026-04')
    })
  })

  describe('week view', () => {
    it('starts timed grid from 00:00', () => {
      expect(TIMED_VIEW_START_HOUR).toBe(0)
      expect(DAY_VIEW_START_HOUR).toBe(0)
    })

    it('renders two-person overlapping timed schedules side by side', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: WEEK_OVERLAP_DATE,
      })

      const timed = getTimedSchedules(
        getSchedulesForDay(calendar.schedules.value, WEEK_OVERLAP_DATE),
        WEEK_OVERLAP_DATE,
      )
      const layout = layoutTimedSchedules(timed, WEEK_OVERLAP_DATE, {
        startHour: DAY_VIEW_START_HOUR,
        endHour: DAY_VIEW_END_HOUR,
        hourHeightPx: DAY_VIEW_HOUR_HEIGHT_PX,
      })

      expect(timed).toHaveLength(2)
      expect(layout.every((item) => item.width === 50)).toBe(true)
    })

    it('connects multi-day all-day schedule as one week bar', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: MULTI_DAY_ALL_DAY_MIDDLE,
        initialView: 'week',
      })

      const multiDayBar = layoutWeekAllDayBars(
        calendar.weekDays.value,
        calendar.schedules.value,
      ).find((bar) => bar.schedule.id === MULTI_DAY_ALL_DAY_ID)

      expect(multiDayBar!.span).toBe(3)
      expect(multiDayBar!.startColumn).toBe(4)
    })

    it('moves to previous and next weeks', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: new Date(2026, 3, 22),
        initialView: 'week',
      })

      calendar.moveWeek(1)
      expect(calendar.state.selectedDate.getDate()).toBe(29)

      calendar.moveWeek(-1)
      expect(calendar.state.selectedDate.getDate()).toBe(22)
    })

    it('includes 30-minute schedules in the week containing may 20', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: HALF_HOUR_SLOT_DATE,
        initialView: 'week',
      })

      const timedOnSampleDay = getTimedSchedules(calendar.schedules.value, HALF_HOUR_SLOT_DATE)
      const layout = layoutTimedSchedules(timedOnSampleDay, HALF_HOUR_SLOT_DATE, {
        startHour: DAY_VIEW_START_HOUR,
        endHour: DAY_VIEW_END_HOUR,
        hourHeightPx: DAY_VIEW_HOUR_HEIGHT_PX,
      })

      expect(timedOnSampleDay.map((schedule) => schedule.id).sort()).toEqual([
        's-030',
        's-031',
        's-032',
        's-033',
        's-034',
      ])
      expect(layout.find((item) => item.schedule.id === 's-030')!.height).toBeCloseTo(
        layout.find((item) => item.schedule.id === 's-031')!.height,
        5,
      )
    })

    it('goes to the week that contains today', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: new Date(2026, 3, 1),
        initialView: 'week',
      })

      calendar.goToToday()
      const today = new Date()
      const weekDays = getWeekDays(calendar.state.selectedDate)

      expect(weekDays.some((day) => isSameDay(day, today))).toBe(true)
      expect(isSameDay(calendar.state.selectedDate, today)).toBe(true)
    })
  })

  describe('day view', () => {
    it('lays out 30-minute schedules on the half-hour slot sample day', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: HALF_HOUR_SLOT_DATE,
        initialView: 'day',
      })

      const timed = getTimedSchedules(calendar.schedules.value, HALF_HOUR_SLOT_DATE)
      const layout = layoutTimedSchedules(timed, HALF_HOUR_SLOT_DATE, {
        startHour: DAY_VIEW_START_HOUR,
        endHour: DAY_VIEW_END_HOUR,
        hourHeightPx: DAY_VIEW_HOUR_HEIGHT_PX,
      })
      const halfHourEvents = layout.filter((item) =>
        ['s-030', 's-031', 's-032', 's-033', 's-034'].includes(item.schedule.id),
      )

      expect(
        timed.filter((schedule) =>
          ['s-030', 's-031', 's-032', 's-033', 's-034'].includes(schedule.id),
        ),
      ).toHaveLength(5)
      expect(halfHourEvents).toHaveLength(5)
      expect(halfHourEvents.every((item) => item.height > 0)).toBe(true)
      expect(layout.find((item) => item.schedule.id === 's-032')!.width).toBe(50)
    })

    it('shows two-person overlapping schedules', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: WEEK_OVERLAP_DATE,
        initialView: 'day',
      })

      const timed = getTimedSchedules(
        getSchedulesForDay(calendar.schedules.value, WEEK_OVERLAP_DATE),
        WEEK_OVERLAP_DATE,
      )
      const layout = layoutTimedSchedules(timed, WEEK_OVERLAP_DATE, {
        startHour: DAY_VIEW_START_HOUR,
        endHour: DAY_VIEW_END_HOUR,
        hourHeightPx: DAY_VIEW_HOUR_HEIGHT_PX,
      })

      expect(timed.map((schedule) => schedule.participantName).sort()).toEqual([
        'HONG GILDONG',
        'KIM MINSU',
      ])
      expect(layout[0]!.left).toBe(0)
      expect(layout[1]!.left).toBe(50)
    })

    it('shows multi-day all-day on each day in range', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialView: 'day',
      })

      for (const day of [
        MULTI_DAY_ALL_DAY_START,
        MULTI_DAY_ALL_DAY_MIDDLE,
        MULTI_DAY_ALL_DAY_END,
      ]) {
        calendar.selectDate(day)
        const allDay = getAllDaySchedules(calendar.schedules.value, day)
        expect(allDay.some((schedule) => schedule.id === MULTI_DAY_ALL_DAY_ID)).toBe(true)
      }
    })

    it('uses the same week-style all-day layout with scroll on overflow day', () => {
      const allDay = getAllDaySchedules(mockSchedules, ALL_DAY_OVERFLOW_DATE)
      const bars = layoutWeekAllDayBars([ALL_DAY_OVERFLOW_DATE], mockSchedules)
      const rowCount = getAllDayRowCount(bars)

      expect(allDay.length).toBe(5)
      expect(bars).toHaveLength(5)
      expect(rowCount).toBe(5)
      expect(rowCount).toBeGreaterThan(DAY_VIEW_ALL_DAY_VISIBLE_MAX)
      expect(ALL_DAY_SECTION_MAX_HEIGHT).toBe(86)
    })
  })

  describe('list view', () => {
    it('builds sorted list rows with required columns for selected month', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: new Date(2026, 3, 1),
      })

      expect(calendar.listRows.value.length).toBeGreaterThan(0)
      expect(calendar.listRows.value.length).toBeLessThan(mockSchedules.length)
      expect(calendar.listRows.value[0]).toMatchObject({
        no: 1,
        title: expect.any(String),
        participant: expect.any(String),
        period: expect.any(String),
        scheduleType: expect.any(String),
      })
    })

    it('uses formatPeriod for period column instead of remarks', () => {
      const start = new Date(2026, 4, 7, 9, 0)
      const end = new Date(2026, 4, 7, 11, 0)
      const schedule = {
        id: 'period-format-test',
        title: 'Period column source',
        type: 'my_schedule' as const,
        participantId: 'user-test',
        participantName: 'TEST USER',
        start,
        end,
        remarks: 'legacy remarks — must not be used for Period',
      }

      const calendar = useCalendar({
        schedules: [schedule],
        initialDate: new Date(2026, 4, 1),
      })

      expect(calendar.listRows.value).toHaveLength(1)
      expect(calendar.listRows.value[0]!.period).toBe(formatPeriod(start, end))
      expect(calendar.listRows.value[0]!.period).not.toBe(schedule.remarks)
    })

    it('defaults the participant column to an empty string for participant-less schedules (REV-A2)', () => {
      const schedule = {
        id: 'room-booking-test',
        title: 'Conference Room A',
        type: 'room_booking',
        start: new Date(2026, 4, 7, 9, 0),
        end: new Date(2026, 4, 7, 10, 0),
        meta: { roomId: 'room-3f-a' },
      }

      const calendar = useCalendar({
        schedules: [schedule],
        initialDate: new Date(2026, 4, 1),
      })

      expect(calendar.listRows.value).toHaveLength(1)
      expect(calendar.listRows.value[0]!.participant).toBe('')
    })
  })

  describe('navigation and filtering data', () => {
    it('renders all passed schedules', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: new Date(2026, 3, 19),
      })

      expect(calendar.schedules.value).toHaveLength(mockSchedules.length)
    })

    it('changes view mode', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: new Date(2026, 3, 19),
      })

      calendar.setView('week')
      expect(calendar.state.currentView).toBe('week')

      calendar.setView('list')
      expect(calendar.state.currentView).toBe('list')
    })

    it('updates selected date and supports moveDay/goToToday', () => {
      const calendar = useCalendar({
        schedules: mockSchedules,
        initialDate: new Date(2026, 3, 20),
      })

      calendar.moveDay(1)
      expect(calendar.state.selectedDate.getDate()).toBe(21)

      calendar.selectDate(new Date(2026, 4, 1))
      expect(calendar.state.selectedDate.getMonth()).toBe(4)

      calendar.goToToday()
      expect(calendar.state.selectedDate.getDate()).toBe(new Date().getDate())
    })

    it('filters list rows by listFilterDate', () => {
      const listFilterDate = ref(new Date(2026, 4, 15))
      const calendar = useCalendar({
        schedules: mockSchedules,
        listFilterDate,
        initialDate: new Date(2026, 4, 15),
      })

      expect(calendar.listRows.value.length).toBeGreaterThan(0)
      expect(calendar.listRows.value.length).toBeLessThan(mockSchedules.length)

      calendar.clearListFilter()
      expect(calendar.state.listFilterDate).toBeNull()
      expect(calendar.listRows.value.length).toBeGreaterThan(0)
    })
  })

  describe('recurring schedules (F4-5)', () => {
    it('expands weekly instances into month cells within the visible grid range', () => {
      const calendar = useCalendar({
        schedules: mockRecurringSchedules,
        initialDate: new Date(2026, 3, 1),
        initialView: 'month',
      })

      const tueApr7 = calendar.monthCells.value.find((cell) => cell.key === '2026-04-07')
      const thuApr9 = calendar.monthCells.value.find((cell) => cell.key === '2026-04-09')
      const wedApr8 = calendar.monthCells.value.find((cell) => cell.key === '2026-04-08')

      expect(tueApr7!.schedules.some((s) => s.title === '주간 스탠드업 (반복)')).toBe(true)
      expect(thuApr9!.schedules.some((s) => s.title === '주간 스탠드업 (반복)')).toBe(true)
      expect(wedApr8!.schedules.some((s) => s.title === '주간 스탠드업 (반복)')).toBe(false)

      const instance = tueApr7!.schedules.find((s) => s.recurrenceId === RECURRING_SCHEDULE_ID)
      expect(instance?.isRecurrenceInstance).toBe(true)
      expect(instance?.id).toBe('s-r001::2026-04-07')
    })

    it('includes expanded instances in week view schedules', () => {
      const calendar = useCalendar({
        schedules: mockRecurringSchedules,
        initialDate: new Date(2026, 3, 7),
        initialView: 'week',
      })

      const expanded = calendar.schedules.value.filter(
        (schedule) => schedule.recurrenceId === RECURRING_SCHEDULE_ID,
      )
      expect(expanded.length).toBeGreaterThanOrEqual(2)
    })

    it('includes expanded instances in list rows for the month', () => {
      const calendar = useCalendar({
        schedules: mockRecurringSchedules,
        initialDate: new Date(2026, 3, 1),
        initialView: 'list',
      })

      const recurringRows = calendar.listRows.value.filter(
        (row) => row.schedule.recurrenceId === RECURRING_SCHEDULE_ID,
      )
      expect(recurringRows.length).toBeGreaterThan(0)
    })

    it('does not expand recurring schedules outside the visible range', () => {
      const calendar = useCalendar({
        schedules: mockRecurringSchedules,
        initialDate: new Date(2026, 0, 1),
        initialView: 'month',
      })

      const janCellsWithRecurring = calendar.monthCells.value.filter((cell) =>
        cell.schedules.some((s) => s.recurrenceId === RECURRING_SCHEDULE_ID),
      )
      expect(janCellsWithRecurring).toHaveLength(0)
    })
  })
})

describe('month cell display', () => {
  it('limits visible items and returns hidden count', () => {
    const schedules = Array.from({ length: 6 }, (_, index) => ({
      id: `s-${index}`,
      title: `Event ${index}`,
      type: 'my_schedule' as const,
      participantId: 'user-a',
      participantName: 'A',
      start: new Date(2026, 4, 1),
      end: new Date(2026, 4, 1),
    }))

    const display = getMonthCellDisplay(schedules, 5)
    expect(display.visible).toHaveLength(5)
    expect(display.hiddenCount).toBe(1)
  })
})
