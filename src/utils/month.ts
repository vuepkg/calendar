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
  MonthOverflowPopoverLayoutInput,
  MonthOverflowPopoverLayoutResult,
  MonthWeekCell,
  MonthWeekLayout,
  RectBounds,
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

export const MONTH_OVERFLOW_POPOVER_DEFAULTS = {
  preferredWidth: 320,
  preferredMaxHeight: 360,
  minWidth: 140,
  minHeight: 120,
  containerHeightRatio: 0.45,
  margin: 8,
} as const

export function toRectBounds(rect: {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}): RectBounds {
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  }
}

export function resolvePopoverBounds(
  container: RectBounds | null | undefined,
  viewportWidth: number,
  viewportHeight: number,
  margin: number = MONTH_OVERFLOW_POPOVER_DEFAULTS.margin,
): RectBounds {
  if (!container) {
    return {
      top: margin,
      left: margin,
      right: viewportWidth - margin,
      bottom: viewportHeight - margin,
      width: viewportWidth - margin * 2,
      height: viewportHeight - margin * 2,
    }
  }

  const top = Math.max(margin, container.top + margin)
  const left = Math.max(margin, container.left + margin)
  const right = Math.min(viewportWidth - margin, container.right - margin)
  const bottom = Math.min(viewportHeight - margin, container.bottom - margin)

  return {
    top,
    left,
    right,
    bottom,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  }
}

export function computePopoverMaxSize(
  bounds: RectBounds,
  anchorTop: number,
  options: {
    preferredWidth?: number
    preferredMaxHeight?: number
    minWidth?: number
    minHeight?: number
    containerHeightRatio?: number
    margin?: number
  } = {},
): Pick<MonthOverflowPopoverLayoutResult, 'maxWidth' | 'maxHeight'> {
  const {
    preferredWidth = MONTH_OVERFLOW_POPOVER_DEFAULTS.preferredWidth,
    preferredMaxHeight = MONTH_OVERFLOW_POPOVER_DEFAULTS.preferredMaxHeight,
    minWidth = MONTH_OVERFLOW_POPOVER_DEFAULTS.minWidth,
    minHeight = MONTH_OVERFLOW_POPOVER_DEFAULTS.minHeight,
    containerHeightRatio,
    margin = MONTH_OVERFLOW_POPOVER_DEFAULTS.margin,
  } = options

  const maxWidth = Math.max(minWidth, Math.min(preferredWidth, bounds.width))
  const belowAnchor = Math.max(0, bounds.bottom - anchorTop - margin)
  const ratioCap =
    containerHeightRatio === undefined
      ? preferredMaxHeight
      : Math.max(0, Math.floor(bounds.height * containerHeightRatio))

  const maxHeight = Math.max(minHeight, Math.min(preferredMaxHeight, belowAnchor, ratioCap))

  return { maxWidth, maxHeight }
}

export function computeMonthOverflowPopoverLayout(
  input: MonthOverflowPopoverLayoutInput,
): MonthOverflowPopoverLayoutResult {
  const margin = input.margin ?? MONTH_OVERFLOW_POPOVER_DEFAULTS.margin
  const viewportWidth = input.viewportWidth ?? 0
  const viewportHeight = input.viewportHeight ?? 0
  const bounds = resolvePopoverBounds(
    input.container,
    viewportWidth || Number.MAX_SAFE_INTEGER,
    viewportHeight || Number.MAX_SAFE_INTEGER,
    margin,
  )

  const { maxWidth, maxHeight } = computePopoverMaxSize(bounds, input.anchorTop, {
    preferredWidth: input.preferredWidth,
    preferredMaxHeight: input.preferredMaxHeight,
    minWidth: input.minWidth,
    minHeight: input.minHeight,
    containerHeightRatio: input.container
      ? (input.containerHeightRatio ?? MONTH_OVERFLOW_POPOVER_DEFAULTS.containerHeightRatio)
      : undefined,
    margin,
  })

  const panelWidth = Math.min(input.panelWidth, maxWidth)
  const panelHeight = Math.min(input.panelHeight, maxHeight)

  let top = input.anchorTop
  let left = input.anchorLeft

  if (top + panelHeight > bounds.bottom) {
    const anchorBottom = input.anchorBottom ?? input.anchorTop
    const aboveAnchor = anchorBottom - panelHeight - margin
    if (aboveAnchor >= bounds.top) {
      top = aboveAnchor
    } else {
      top = Math.max(bounds.top, bounds.bottom - panelHeight)
    }
  }

  if (left + panelWidth > bounds.right) {
    left = Math.max(bounds.left, bounds.right - panelWidth)
  }

  top = Math.min(top, bounds.bottom - panelHeight)
  top = Math.max(top, bounds.top)
  left = Math.min(left, bounds.right - panelWidth)
  left = Math.max(left, bounds.left)

  return {
    top,
    left,
    maxWidth,
    maxHeight,
  }
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
