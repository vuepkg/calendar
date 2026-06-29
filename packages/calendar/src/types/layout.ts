import type { Holiday, Schedule } from './schedule'

/** Week/Day/Month All Day 바 한 줄의 레이아웃 */
export interface AllDayBarLayout {
  schedule: Schedule
  startColumn: number
  span: number
  row: number
  key: string
}

/** Week/Day 시간 그리드 현재 시각 인디케이터 */
export interface CurrentTimeIndicator {
  topPercent: number
  label: string
  visible: boolean
}

/** 월간 그리드 셀 한 칸의 파생 상태 */
export interface MonthDayCell {
  date: Date
  key: string
  inCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isSunday: boolean
  isSaturday: boolean
  schedules: Schedule[]
  visibleSchedules: Schedule[]
  hiddenScheduleCount: number
  holidays: Holiday[]
}

/** 월간 주 단위 셀 — 칩·spanning 바 행 수 포함 */
export interface MonthWeekCell extends MonthDayCell {
  chipVisible: Schedule[]
  hiddenScheduleCount: number
  spanningBarRows: number
}

/** 월간 한 주의 칩·All Day 바 레이아웃 */
export interface MonthWeekLayout {
  cells: MonthWeekCell[]
  bars: AllDayBarLayout[]
  barRowCount: number
}

/** 월간 셀 칩 visible/hidden 분할 결과 */
export interface MonthCellDisplay<T> {
  visible: T[]
  hiddenCount: number
}

/** `allocateMonthCellDisplay` 반환 — 칩 슬롯 수 기준 */
export interface MonthCellDisplayAllocation {
  visible: number
  hidden: number
}

/** Week/Day 시간 그리드 표시 범위 */
export interface TimeGridRange {
  startHour: number
  endHour: number
  hourHeightPx?: number
}

/** `scheduleLayout` 내부 — 하루 구간에 잘린 시간 일정 */
export interface TimedSegment {
  schedule: Schedule
  startMinutes: number
  endMinutes: number
}

/** `assignColumns` 내부 — 컬럼이 배정된 시간 구간 */
export interface PlacedSegment extends TimedSegment {
  column: number
}

/** Week/Day 시간 그리드에 배치된 일정 블록 */
export interface TimedLayoutItem {
  schedule: Schedule
  top: number
  height: number
  left: number
  width: number
  column: number
  columnCount: number
}

/** DOM `getBoundingClientRect` 기반 경계 */
export interface RectBounds {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

/** 월간 overflow 팝오버 위치·크기 계산 입력 */
export interface MonthOverflowPopoverLayoutInput {
  anchorTop: number
  anchorLeft: number
  anchorBottom?: number
  panelWidth: number
  panelHeight: number
  container?: RectBounds | null
  viewportWidth?: number
  viewportHeight?: number
  margin?: number
  preferredWidth?: number
  preferredMaxHeight?: number
  minWidth?: number
  minHeight?: number
  containerHeightRatio?: number
}

/** 월간 overflow 팝오버 위치·크기 계산 결과 */
export interface MonthOverflowPopoverLayoutResult {
  top: number
  left: number
  maxWidth: number
  maxHeight: number
}
