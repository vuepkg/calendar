import { describe, expect, it } from 'vitest'
import { MONTH_CELL_HEIGHT_PX } from '@/constants/calendarView'
import type { MonthDayCell } from '@/types/layout'
import type { Holiday, Schedule } from '@/types/schedule'
import {
  mockSchedules,
  MONTH_OVERFLOW_DATE_KEY,
  MONTH_PLUS_COUNT_DATE_KEY,
  MULTI_DAY_ALL_DAY_ID,
  TWO_DAY_ALL_DAY_END_KEY,
  TWO_DAY_ALL_DAY_ID,
  TWO_DAY_ALL_DAY_START_KEY,
} from '@/data/mockSchedules'
import { getMonthGridDays, toDateKey } from '@/utils/date'
import {
  allocateMonthCellDisplay,
  formatOverflowScheduleLabel,
  getBarsStartingAtColumn,
  getMonthCellDisplay,
  getMonthCellMaxChipSlots,
  layoutMonthWeeks,
  sliceMonthCellsForWeekCount,
  sortSchedulesForOverflowPopover,
} from '@/utils/month'
import { getSchedulesForDay } from '@/utils/schedule'

function makeFakeMonthCells(totalWeeks: number, selectedWeekIndex: number): MonthDayCell[] {
  const cells: MonthDayCell[] = []
  for (let week = 0; week < totalWeeks; week += 1) {
    for (let day = 0; day < 7; day += 1) {
      const index = week * 7 + day
      cells.push({
        date: new Date(2026, 0, index + 1),
        key: `cell-${index}`,
        inCurrentMonth: true,
        isToday: false,
        isSelected: week === selectedWeekIndex && day === 0,
        isSunday: day === 0,
        isSaturday: day === 6,
        schedules: [],
        visibleSchedules: [],
        hiddenScheduleCount: 0,
        holidays: [],
      })
    }
  }
  return cells
}

describe('monthCellCapacity', () => {
  it('fits five title-only rows in a cell without spanning bars', () => {
    expect(getMonthCellMaxChipSlots(0)).toBe(5)
    expect(allocateMonthCellDisplay(5, 5)).toEqual({ visible: 5, hidden: 0 })
  })

  it('reserves the last row for +count only when the cell is full', () => {
    expect(allocateMonthCellDisplay(6, 5)).toEqual({ visible: 4, hidden: 2 })
  })

  it('reduces chip slots when spanning bars occupy the top rows', () => {
    expect(getMonthCellMaxChipSlots(1)).toBe(4)
  })

  it('reduces chip slots when the measured cell height is smaller', () => {
    expect(getMonthCellMaxChipSlots(0, 96)).toBe(3)
    expect(allocateMonthCellDisplay(6, getMonthCellMaxChipSlots(0, 96))).toEqual({
      visible: 2,
      hidden: 4,
    })
  })
})

describe('getMonthCellDisplay', () => {
  it('shows all items when count is within limit', () => {
    const result = getMonthCellDisplay(['a', 'b'], 2)

    expect(result.visible).toEqual(['a', 'b'])
    expect(result.hiddenCount).toBe(0)
  })

  it('returns hidden count for overflow items', () => {
    const result = getMonthCellDisplay(['a', 'b', 'c', 'd', 'e'], 2)

    expect(result.visible).toEqual(['a', 'b'])
    expect(result.hiddenCount).toBe(3)
  })

  it('handles empty list', () => {
    const result = getMonthCellDisplay([], 2)

    expect(result.visible).toEqual([])
    expect(result.hiddenCount).toBe(0)
  })
})

function buildMonthCells(
  monthDate: Date,
  schedules: Schedule[] = mockSchedules,
  holidaysByDateKey: Record<string, Holiday[]> = {},
) {
  const days = getMonthGridDays(monthDate)

  return days.map((date) => {
    const daySchedules = getSchedulesForDay(schedules, date)
    const display = getMonthCellDisplay(daySchedules, 99)

    return {
      date,
      key: toDateKey(date),
      inCurrentMonth: date.getMonth() === monthDate.getMonth(),
      isToday: false,
      isSelected: false,
      isSunday: date.getDay() === 0,
      isSaturday: date.getDay() === 6,
      schedules: daySchedules,
      visibleSchedules: display.visible,
      hiddenScheduleCount: display.hiddenCount,
      holidays: holidaysByDateKey[toDateKey(date)] ?? [],
    }
  })
}

describe('sliceMonthCellsForWeekCount', () => {
  it('returns the full grid unchanged when weekCount covers all weeks', () => {
    const cells = makeFakeMonthCells(6, 2)
    expect(sliceMonthCellsForWeekCount(cells, 6)).toBe(cells)
  })

  it('slices to a window starting at the selected week', () => {
    const cells = makeFakeMonthCells(6, 2)
    const sliced = sliceMonthCellsForWeekCount(cells, 3)

    expect(sliced).toHaveLength(21)
    expect(sliced[0]).toBe(cells[14])
    expect(sliced[0]?.isSelected).toBe(true)
  })

  it('clamps the window start so it never runs past the last week', () => {
    const cells = makeFakeMonthCells(6, 5)
    const sliced = sliceMonthCellsForWeekCount(cells, 3)

    expect(sliced).toHaveLength(21)
    // selected week (index 5) would need weeks 5~7, but only 6 exist (0~5) — clamp to 3~5
    expect(sliced[0]).toBe(cells[21])
    expect(sliced.at(-1)).toBe(cells.at(-1))
  })

  it('falls back to the first week when no cell is selected', () => {
    const cells = makeFakeMonthCells(6, -1)
    const sliced = sliceMonthCellsForWeekCount(cells, 2)

    expect(sliced).toHaveLength(14)
    expect(sliced[0]).toBe(cells[0])
  })
})

describe('layoutMonthWeeks', () => {
  it('renders multi-day all-day schedule as one spanning bar in april week', () => {
    const weeks = layoutMonthWeeks(buildMonthCells(new Date(2026, 3, 1)))
    const weekWithMultiDay = weeks.find((week) =>
      week.bars.some((bar) => bar.schedule.id === MULTI_DAY_ALL_DAY_ID),
    )

    expect(weekWithMultiDay).toBeDefined()
    expect(weekWithMultiDay!.bars).toHaveLength(1)

    const multiDayBar = weekWithMultiDay!.bars.find(
      (bar) => bar.schedule.id === MULTI_DAY_ALL_DAY_ID,
    )
    expect(multiDayBar!.span).toBe(3)
    expect(multiDayBar!.startColumn).toBe(4)
  })

  it('keeps single-day schedules in the cell chip list', () => {
    const weeks = layoutMonthWeeks(buildMonthCells(new Date(2026, 4, 1)))
    const overflowCell = weeks
      .flatMap((week) => week.cells)
      .find((cell) => cell.key === MONTH_OVERFLOW_DATE_KEY)!

    expect(overflowCell.chipVisible.length).toBeGreaterThan(0)
    expect(overflowCell.chipVisible.some((schedule) => !schedule.allDay)).toBe(true)
  })

  it('shows all five single-day all-day schedules on april 21 without +count', () => {
    const weeks = layoutMonthWeeks(buildMonthCells(new Date(2026, 3, 1)))
    const overflowCell = weeks
      .flatMap((week) => week.cells)
      .find((cell) => cell.key === '2026-04-21')!

    expect(overflowCell.chipVisible).toHaveLength(5)
    expect(overflowCell.hiddenScheduleCount).toBe(0)
    expect(overflowCell.chipVisible.every((schedule) => schedule.allDay)).toBe(true)
  })

  it('shows all busy-day schedules when the cell still has room', () => {
    const weeks = layoutMonthWeeks(buildMonthCells(new Date(2026, 4, 1)))
    const overflowCell = weeks
      .flatMap((week) => week.cells)
      .find((cell) => cell.key === MONTH_OVERFLOW_DATE_KEY)!

    expect(overflowCell.chipVisible).toHaveLength(5)
    expect(overflowCell.hiddenScheduleCount).toBe(0)
  })

  it('shows +count on the may 15 sample date with six schedules', () => {
    const weeks = layoutMonthWeeks(buildMonthCells(new Date(2026, 4, 1)))
    const plusCountCell = weeks
      .flatMap((week) => week.cells)
      .find((cell) => cell.key === MONTH_PLUS_COUNT_DATE_KEY)!

    expect(plusCountCell.chipVisible).toHaveLength(4)
    expect(plusCountCell.hiddenScheduleCount).toBe(2)
  })

  it('shows +count only after the cell is full', () => {
    const timedOverflowSchedules = Array.from({ length: 6 }, (_, index) => ({
      id: `overflow-${index}`,
      title: `Timed ${index}`,
      type: 'my_schedule' as const,
      participantId: 'user-a',
      participantName: 'TEST USER',
      start: new Date(2026, 4, 1, 9 + index, 0),
      end: new Date(2026, 4, 1, 10 + index, 0),
    }))

    const weeks = layoutMonthWeeks(buildMonthCells(new Date(2026, 4, 1), timedOverflowSchedules))
    const overflowCell = weeks
      .flatMap((week) => week.cells)
      .find((cell) => cell.key === MONTH_OVERFLOW_DATE_KEY)!

    expect(overflowCell.chipVisible).toHaveLength(4)
    expect(overflowCell.hiddenScheduleCount).toBe(2)
  })

  describe('two-day overseas trip (s-023) month spanning bar regression', () => {
    it('places a span-2 bar starting on monday april 27', () => {
      const weeks = layoutMonthWeeks(buildMonthCells(new Date(2026, 3, 1)))
      const week = weeks.find((w) => w.cells.some((c) => c.key === TWO_DAY_ALL_DAY_START_KEY))!
      const bar = week.bars.find((b) => b.schedule.id === TWO_DAY_ALL_DAY_ID)

      expect(bar).toBeDefined()
      expect(bar!.span).toBe(2)
      expect(bar!.startColumn).toBe(1)
    })

    it('excludes the schedule from chip lists on both days in the range', () => {
      const weeks = layoutMonthWeeks(buildMonthCells(new Date(2026, 3, 1)))
      const week = weeks.find((w) => w.cells.some((c) => c.key === TWO_DAY_ALL_DAY_START_KEY))!
      const startCell = week.cells.find((c) => c.key === TWO_DAY_ALL_DAY_START_KEY)!
      const endCell = week.cells.find((c) => c.key === TWO_DAY_ALL_DAY_END_KEY)!

      expect(startCell.chipVisible.some((s) => s.id === TWO_DAY_ALL_DAY_ID)).toBe(false)
      expect(endCell.chipVisible.some((s) => s.id === TWO_DAY_ALL_DAY_ID)).toBe(false)
    })

    it('renders the bar only at the first column of the segment', () => {
      const weeks = layoutMonthWeeks(buildMonthCells(new Date(2026, 3, 1)))
      const week = weeks.find((w) => w.cells.some((c) => c.key === TWO_DAY_ALL_DAY_START_KEY))!

      expect(getBarsStartingAtColumn(week.bars, 1)).toHaveLength(1)
      expect(getBarsStartingAtColumn(week.bars, 2)).toHaveLength(0)
    })
  })

  it('starts spanning bar only at the first column of the segment', () => {
    const weeks = layoutMonthWeeks(buildMonthCells(new Date(2026, 3, 1)))
    const weekWithMultiDay = weeks.find((week) =>
      week.bars.some((bar) => bar.schedule.id === MULTI_DAY_ALL_DAY_ID),
    )!

    expect(getBarsStartingAtColumn(weekWithMultiDay.bars, 4)).toHaveLength(1)
    expect(getBarsStartingAtColumn(weekWithMultiDay.bars, 5)).toHaveLength(0)
    expect(getBarsStartingAtColumn(weekWithMultiDay.bars, 6)).toHaveLength(0)
  })

  it('exposes a fixed month cell height constant', () => {
    expect(MONTH_CELL_HEIGHT_PX).toBe(128)
  })

  it('reserves chip rows for holidays on the same date', () => {
    const withoutHoliday = layoutMonthWeeks(buildMonthCells(new Date(2026, 3, 1)))
    const withHoliday = layoutMonthWeeks(
      buildMonthCells(new Date(2026, 3, 1), mockSchedules, {
        [MONTH_OVERFLOW_DATE_KEY]: [
          {
            id: 'public-test',
            dateKey: MONTH_OVERFLOW_DATE_KEY,
            name: '테스트 공휴일',
            kind: 'public',
          },
        ],
      }),
    )

    const baseCell = withoutHoliday
      .flatMap((week) => week.cells)
      .find((cell) => cell.key === MONTH_OVERFLOW_DATE_KEY)!
    const holidayCell = withHoliday
      .flatMap((week) => week.cells)
      .find((cell) => cell.key === MONTH_OVERFLOW_DATE_KEY)!

    expect(holidayCell.holidays).toHaveLength(1)
    expect(holidayCell.chipVisible.length).toBeLessThan(baseCell.chipVisible.length)
  })
})

function schedule(
  partial: Partial<Schedule> & Pick<Schedule, 'id' | 'title' | 'start' | 'end'>,
): Schedule {
  return {
    type: 'my_schedule',
    participantId: 'u1',
    participantName: 'Test',
    allDay: false,
    ...partial,
  }
}

describe('monthOverflow utils', () => {
  it('sorts all-day schedules before timed schedules', () => {
    const sorted = sortSchedulesForOverflowPopover([
      schedule({
        id: 't1',
        title: 'Timed',
        start: new Date(2026, 3, 2, 13, 0),
        end: new Date(2026, 3, 2, 15, 0),
      }),
      schedule({
        id: 'a1',
        title: 'All day',
        start: new Date(2026, 3, 2),
        end: new Date(2026, 3, 2),
        allDay: true,
      }),
    ])

    expect(sorted.map((item) => item.id)).toEqual(['a1', 't1'])
  })

  it('formats timed and all-day labels', () => {
    expect(
      formatOverflowScheduleLabel(
        schedule({
          id: 't1',
          title: '미팅',
          start: new Date(2026, 3, 2, 13, 0),
          end: new Date(2026, 3, 2, 15, 0),
        }),
      ),
    ).toBe('13:00 ~ 15:00 미팅')

    expect(
      formatOverflowScheduleLabel(
        schedule({
          id: 'a1',
          title: '여수 출장',
          start: new Date(2026, 3, 2),
          end: new Date(2026, 3, 2),
          allDay: true,
        }),
      ),
    ).toBe('여수 출장')
  })
})
