import type { ScheduleTypeOption } from '@/types/schedule'

// ── Schedule Types ────────────────────────────────────────────────────
export const SCHEDULE_TYPE_OPTIONS: ScheduleTypeOption[] = [
  { type: 'my_schedule', label: '내 일정', color: '#0277bd', backgroundColor: '#e1f5fe' },
  { type: 'team_schedule', label: '팀 일정', color: '#6a1b9a', backgroundColor: '#f3e5f5' },
  { type: 'company_schedule', label: '회사 일정', color: '#546e7a', backgroundColor: '#eceff1' },
]

// ── Timed View (Week/Day 공통) ───────────────────────────────────────
export const TIMED_VIEW_START_HOUR = 0
export const TIMED_VIEW_END_HOUR = 23
export const TIMED_VIEW_HOUR_HEIGHT_PX = 48

/** scheduleTypes.ts re-export 호환 별칭 */
export const CALENDAR_START_HOUR = TIMED_VIEW_START_HOUR
export const CALENDAR_END_HOUR = TIMED_VIEW_END_HOUR
export const HOUR_HEIGHT_PX = TIMED_VIEW_HOUR_HEIGHT_PX

// ── Month View ────────────────────────────────────────────────────────
/** 종일 바 한 줄 높이(px) */
export const MONTH_CELL_BAR_ROW_HEIGHT_PX = 20

/** 일정 칩 한 줄 높이(px) */
export const MONTH_CELL_CHIP_HEIGHT_PX = 18

/** 칩 행 간격(px) */
export const MONTH_CELL_ROW_GAP_PX = 2

/** 셀 상하 패딩 합(px) */
export const MONTH_CELL_PADDING_Y_PX = 8

/** 일자 영역 높이(px) */
export const MONTH_CELL_DATE_AREA_PX = 18

/** 월간 일자 셀 고정 높이(px) */
export const MONTH_CELL_HEIGHT_PX = 128

// ── Day View ──────────────────────────────────────────────────────────
export const DAY_VIEW_START_HOUR = TIMED_VIEW_START_HOUR
export const DAY_VIEW_END_HOUR = TIMED_VIEW_END_HOUR
export const DAY_VIEW_HOUR_HEIGHT_PX = TIMED_VIEW_HOUR_HEIGHT_PX

/** All Day 영역에 기본으로 보여줄 최대 행 수 */
export const DAY_VIEW_ALL_DAY_VISIBLE_MAX = 3
/** All Day 일정 한 줄 높이 */
export const DAY_VIEW_ALL_DAY_ROW_HEIGHT_PX = 22
/** All Day 일정 행 간격 */
export const DAY_VIEW_ALL_DAY_GAP_PX = 4
/** All Day 영역 상하 패딩 합 */
export const ALL_DAY_SECTION_PADDING_Y_PX = 12

/** All Day 영역 최대 높이 — 초과 시 내부 스크롤 (행 높이 유지) */
export const ALL_DAY_SECTION_MAX_HEIGHT =
  DAY_VIEW_ALL_DAY_VISIBLE_MAX * DAY_VIEW_ALL_DAY_ROW_HEIGHT_PX +
  (DAY_VIEW_ALL_DAY_VISIBLE_MAX - 1) * DAY_VIEW_ALL_DAY_GAP_PX +
  ALL_DAY_SECTION_PADDING_Y_PX
