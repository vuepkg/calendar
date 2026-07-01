import {
  MONTH_CELL_BAR_ROW_HEIGHT_PX,
  MONTH_CELL_CHIP_HEIGHT_PX,
  MONTH_CELL_DATE_AREA_PX,
  MONTH_CELL_HEIGHT_PX,
  MONTH_CELL_PADDING_Y_PX,
  MONTH_CELL_ROW_GAP_PX,
} from '@/constants/calendarView'
import type {
  AllDayBarLayout,
  MonthCellDisplay,
  MonthCellDisplayAllocation,
  MonthDayCell,
  MonthWeekCell,
  MonthWeekLayout,
} from '@/types/layout'
import type { Schedule } from '@/types/schedule'
import { formatTime } from '@/utils/date'
import { getAllDayRowCount, layoutWeekAllDayBars } from '@/utils/timed'

export function getMonthCellContentHeight(cellHeightPx = MONTH_CELL_HEIGHT_PX): number {
  return cellHeightPx - MONTH_CELL_PADDING_Y_PX - MONTH_CELL_DATE_AREA_PX
}

export function getMonthCellMaxChipSlots(
  spanningBarRows: number,
  cellHeightPx = MONTH_CELL_HEIGHT_PX,
): number {
  const spanningHeight = spanningBarRows * (MONTH_CELL_BAR_ROW_HEIGHT_PX + MONTH_CELL_ROW_GAP_PX)
  const chipArea = getMonthCellContentHeight(cellHeightPx) - spanningHeight

  if (chipArea < MONTH_CELL_CHIP_HEIGHT_PX) {
    return 0
  }

  return Math.floor(
    (chipArea + MONTH_CELL_ROW_GAP_PX) / (MONTH_CELL_CHIP_HEIGHT_PX + MONTH_CELL_ROW_GAP_PX),
  )
}

export function allocateMonthCellDisplay(
  totalCount: number,
  maxSlots: number,
): MonthCellDisplayAllocation {
  if (totalCount <= 0 || maxSlots <= 0) {
    return { visible: 0, hidden: totalCount }
  }

  if (totalCount <= maxSlots) {
    return { visible: totalCount, hidden: 0 }
  }

  const visible = Math.max(0, maxSlots - 1)
  return {
    visible,
    hidden: totalCount - visible,
  }
}

export function getMonthCellDisplay<T>(
  items: T[],
  maxVisible = getMonthCellMaxChipSlots(0),
): MonthCellDisplay<T> {
  const safeMax = Math.max(0, maxVisible)
  const visible = items.slice(0, safeMax)
  const hiddenCount = Math.max(0, items.length - visible.length)

  return { visible, hiddenCount }
}

export function sortSchedulesForOverflowPopover(schedules: Schedule[]): Schedule[] {
  return [...schedules].sort((a, b) => {
    if (a.allDay !== b.allDay) {
      return a.allDay ? -1 : 1
    }

    const startDiff = a.start.getTime() - b.start.getTime()
    if (startDiff !== 0) {
      return startDiff
    }

    return a.title.localeCompare(b.title, 'ko')
  })
}

export function formatOverflowScheduleLabel(schedule: Schedule): string {
  if (schedule.allDay) {
    return schedule.title
  }

  return `${formatTime(schedule.start)} ~ ${formatTime(schedule.end)} ${schedule.title}`
}

function getSpanningBars(bars: AllDayBarLayout[]): AllDayBarLayout[] {
  return bars.filter((bar) => bar.span > 1)
}

function getSpanningBarRowsOnColumn(bars: AllDayBarLayout[], columnIndex: number): number {
  const rows = bars
    .filter((bar) => bar.startColumn <= columnIndex && bar.startColumn + bar.span > columnIndex)
    .map((bar) => bar.row)

  if (rows.length === 0) {
    return 0
  }

  return Math.max(...rows) + 1
}

function getSingleDayAllDaySchedules(
  allDaySchedules: Schedule[],
  spanningBars: AllDayBarLayout[],
  columnIndex: number,
): Schedule[] {
  const spanningIds = new Set(
    spanningBars
      .filter((bar) => bar.startColumn <= columnIndex && bar.startColumn + bar.span > columnIndex)
      .map((bar) => bar.schedule.id),
  )

  return allDaySchedules.filter((schedule) => !spanningIds.has(schedule.id))
}

function buildChipSchedules(singleDayAllDay: Schedule[], timedSchedules: Schedule[]): Schedule[] {
  return [...singleDayAllDay, ...timedSchedules]
}

/**
 * 42셀(6주) 월간 그리드를 `weekCount`주 만큼으로 축소한다.
 * 선택 날짜가 포함된 주가 창의 첫 주가 되도록 슬라이싱하되,
 * 그리드 끝을 넘지 않도록 시작 주 인덱스를 clamp한다.
 */
export function sliceMonthCellsForWeekCount(
  monthCells: MonthDayCell[],
  weekCount: number,
): MonthDayCell[] {
  const totalWeeks = Math.ceil(monthCells.length / 7)

  if (weekCount >= totalWeeks) {
    return monthCells
  }

  const selectedIndex = monthCells.findIndex((cell) => cell.isSelected)
  const selectedWeek = selectedIndex === -1 ? 0 : Math.floor(selectedIndex / 7)
  const maxStartWeek = totalWeeks - weekCount
  const startWeek = Math.min(selectedWeek, maxStartWeek)

  return monthCells.slice(startWeek * 7, (startWeek + weekCount) * 7)
}

export function layoutMonthWeeks(
  monthCells: MonthDayCell[],
  cellHeightPx = MONTH_CELL_HEIGHT_PX,
): MonthWeekLayout[] {
  const weeks: MonthWeekLayout[] = []

  for (let index = 0; index < monthCells.length; index += 7) {
    const cells = monthCells.slice(index, index + 7)
    const days = cells.map((cell) => cell.date)
    const weekSchedules = new Map<string, Schedule>()

    cells.forEach((cell) => {
      cell.schedules.forEach((schedule) => {
        weekSchedules.set(schedule.id, schedule)
      })
    })

    const bars = layoutWeekAllDayBars(days, [...weekSchedules.values()])
    const spanningBars = getSpanningBars(bars)
    const barRowCount = spanningBars.length > 0 ? getAllDayRowCount(spanningBars) : 0

    const weekCells: MonthWeekCell[] = cells.map((cell, columnIndex) => {
      const allDaySchedules = cell.schedules.filter((schedule) => schedule.allDay)
      const timedSchedules = cell.schedules.filter((schedule) => !schedule.allDay)
      const spanningBarRows = getSpanningBarRowsOnColumn(spanningBars, columnIndex)
      const chipSchedules = buildChipSchedules(
        getSingleDayAllDaySchedules(allDaySchedules, spanningBars, columnIndex),
        timedSchedules,
      )
      const holidayRows = cell.holidays.length
      const maxChipSlots = Math.max(
        0,
        getMonthCellMaxChipSlots(spanningBarRows, cellHeightPx) - holidayRows,
      )
      const display = allocateMonthCellDisplay(chipSchedules.length, maxChipSlots)

      return {
        ...cell,
        chipVisible: chipSchedules.slice(0, display.visible),
        hiddenScheduleCount: display.hidden,
        spanningBarRows,
      }
    })

    weeks.push({
      cells: weekCells,
      bars: spanningBars,
      barRowCount,
    })
  }

  return weeks
}

export function getBarsStartingAtColumn(
  bars: AllDayBarLayout[],
  columnIndex: number,
): AllDayBarLayout[] {
  return bars.filter((bar) => bar.startColumn === columnIndex)
}

export { MONTH_CELL_BAR_ROW_HEIGHT_PX }
