import type { ScheduleClickSource } from './calendarEvents'
import type { CalendarView, Schedule } from './schedule'
import type { MonthWeekCell } from './layout'

/**
 * `event` scoped slot — 칩·All Day 바·시간 그리드 블록 공용 (REV-A1).
 * `source`는 기존 `schedule-click` emit과 동일한 `ScheduleClickSource`를 재사용합니다.
 * `week-timed`/`day-timed`는 포인터 드래그 래퍼가 클릭을 합성하므로 `onSelect`가 없습니다 —
 * 그 외 컨텍스트(month-chip/month-all-day-bar/week-all-day-bar/day-all-day-bar)는
 * 칩·바 자체가 클릭 가능한 컨트롤이라 커스텀 콘텐츠가 직접 `onSelect`를 연결해야 합니다.
 */
export interface EventSlotProps {
  schedule: Schedule
  source: ScheduleClickSource
  typeStyle: { color: string; backgroundColor: string }
  compact?: boolean
  showParticipant?: boolean
  onSelect?: () => void
}

/** `day-cell` scoped slot — 월간 셀 내부 콘텐츠(날짜 숫자·이벤트 목록). 셀의 a11y 셸(`role="gridcell"`)은 슬롯 밖에서 소유합니다. */
export interface DayCellSlotProps {
  cell: MonthWeekCell
  getTypeStyle: (type: Schedule['type']) => { color: string; backgroundColor: string }
  onScheduleClick: (schedule: Schedule) => void
  onOpenOverflow: (event: MouseEvent) => void
}

/** `toolbar` scoped slot — 뷰 전환 UI 전체 교체 */
export interface ToolbarSlotProps {
  currentView: CalendarView
  views: readonly CalendarView[]
  onSelect: (view: CalendarView) => void
}

/** `month-overflow-item` scoped slot — `+N` 팝오버 목록 항목 콘텐츠 */
export interface MonthOverflowItemSlotProps {
  schedule: Schedule
  isHighlighted: boolean
  onSelect: () => void
}
