<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { toRectBounds } from '@vuepkg/core'
import { useMonthMeasuredCellHeight } from '@/composables/useMonthMeasuredCellHeight'
import {
  MONTH_CELL_BAR_ROW_HEIGHT_PX,
  MONTH_CELL_CHIP_HEIGHT_PX,
  MONTH_CELL_ROW_GAP_PX,
} from '@/constants/calendarView'
import type { CalendarContext } from '@/types'
import type {
  CalendarDateSelectPayload,
  CalendarNavigateAction,
  CalendarOverflowClickPayload,
  CalendarScheduleClickPayload,
} from '@/types/calendarEvents'
import type { MonthWeekCount, Schedule } from '@/types/schedule'
import {
  layoutMonthWeeks,
  sliceMonthCellsForWeekCount,
  sortSchedulesForOverflowPopover,
} from '@/utils/month'
import { formatWeekdayLabels, toDateKey } from '@/utils/date'
import CalendarMonthNav from '../CalendarMonthNav.vue'
import MonthCell from '../MonthCell.vue'
import AllDayBar from '../AllDayBar.vue'
import MonthOverflowPopover from '../MonthOverflowPopover.vue'

const DEFAULT_WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const props = withDefaults(
  defineProps<{
    calendar: CalendarContext
    /** 표시할 주(week) 수 — 기본 6(전체 월), 2\|3이면 선택 날짜 기준 축소 뷰 */
    monthWeekCount?: MonthWeekCount
    /** 요일 헤더 라벨 (일~토 순서 7개) — 명시하면 `locale` 자동 현지화보다 우선 */
    weekdayLabels?: string[]
    /** `Intl.DateTimeFormat` locale — 요일 헤더 자동 현지화 (`weekdayLabels` 미전달 시) */
    locale?: string
  }>(),
  {
    monthWeekCount: 6,
  },
)

const resolvedWeekdayLabels = computed(
  () =>
    props.weekdayLabels ??
    (props.locale ? formatWeekdayLabels(props.locale) : DEFAULT_WEEKDAY_LABELS),
)

const emit = defineEmits<{
  'date-select': [payload: CalendarDateSelectPayload]
  'overflow-click': [payload: CalendarOverflowClickPayload]
  'schedule-click': [payload: CalendarScheduleClickPayload]
  navigate: [action: CalendarNavigateAction]
}>()

const overflowPopover = ref<{
  date: Date
  schedules: Schedule[]
  highlightedScheduleIds: string[]
  anchorTop: number
  anchorLeft: number
  anchorBottom: number
  containerBounds: ReturnType<typeof toRectBounds> | null
} | null>(null)

function closeOverflowPopover() {
  overflowPopover.value = null
}

function onOpenOverflow(
  payload: CalendarOverflowClickPayload & {
    anchorRect: DOMRect
    containerBounds: ReturnType<typeof toRectBounds> | null
  },
) {
  overflowPopover.value = {
    date: payload.date,
    schedules: sortSchedulesForOverflowPopover(payload.schedules),
    highlightedScheduleIds: payload.visibleSchedules.map((s) => s.id),
    anchorTop: payload.anchorRect.bottom + 4,
    anchorLeft: payload.anchorRect.left,
    anchorBottom: payload.anchorRect.bottom,
    containerBounds: payload.containerBounds,
  }

  emit('overflow-click', {
    date: payload.date,
    hiddenCount: payload.hiddenCount,
    schedules: payload.schedules,
    visibleSchedules: payload.visibleSchedules,
  })
}

function onOverflowScheduleClick(schedule: Schedule) {
  if (!overflowPopover.value) {
    return
  }

  emit('schedule-click', { schedule, source: 'month-chip', date: overflowPopover.value.date })
  closeOverflowPopover()
}

const monthWeeksRef = ref<HTMLElement | null>(null)
const { cellHeightPx } = useMonthMeasuredCellHeight(monthWeeksRef, () => props.monthWeekCount)

const monthLabel = computed(() => props.calendar.monthLabel.value)
const visibleMonthCells = computed(() =>
  sliceMonthCellsForWeekCount(props.calendar.monthCells.value, props.monthWeekCount),
)
const monthWeeks = computed(() => layoutMonthWeeks(visibleMonthCells.value, cellHeightPx.value))

// ── Roving tabindex (SRV-P2-09, WCAG grid pattern) ──────────────────────
const cellRefs = ref<Record<string, InstanceType<typeof MonthCell> | null>>({})
function setCellRef(el: InstanceType<typeof MonthCell> | null, key: string) {
  cellRefs.value[key] = el
}

const focusedCellKey = ref<string | null>(null)

const defaultFocusKey = computed(() => {
  const cells = visibleMonthCells.value
  const preferred = cells.find((c) => c.isSelected) ?? cells.find((c) => c.isToday) ?? cells[0]
  return preferred?.key ?? null
})

const activeFocusKey = computed(() => focusedCellKey.value ?? defaultFocusKey.value)

watch(
  () => props.calendar.monthLabel.value,
  () => {
    closeOverflowPopover()
    focusedCellKey.value = null
  },
)

watch(
  () => props.monthWeekCount,
  () => {
    focusedCellKey.value = null
  },
)

function onCellDateSelect(date: Date) {
  focusedCellKey.value = toDateKey(date)
  emit('date-select', { date, source: 'month-cell' })
}

function findCellPosition(key: string | null): { weekIndex: number; colIndex: number } | null {
  if (key === null) {
    return null
  }

  for (let weekIndex = 0; weekIndex < monthWeeks.value.length; weekIndex += 1) {
    const colIndex = monthWeeks.value[weekIndex]!.cells.findIndex((cell) => cell.key === key)
    if (colIndex !== -1) {
      return { weekIndex, colIndex }
    }
  }

  return null
}

function moveFocus(deltaWeek: number, deltaCol: number) {
  const current = findCellPosition(activeFocusKey.value)
  if (!current) {
    return
  }

  const targetCell =
    monthWeeks.value[current.weekIndex + deltaWeek]?.cells[current.colIndex + deltaCol]
  if (!targetCell) {
    return
  }

  focusedCellKey.value = targetCell.key
  void nextTick(() => {
    cellRefs.value[targetCell.key]?.focus()
  })
}

function onGridKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      moveFocus(-1, 0)
      break
    case 'ArrowDown':
      event.preventDefault()
      moveFocus(1, 0)
      break
    case 'ArrowLeft':
      event.preventDefault()
      moveFocus(0, -1)
      break
    case 'ArrowRight':
      event.preventDefault()
      moveFocus(0, 1)
      break
  }
}
</script>

<template>
  <div
    class="month-view"
    :style="{
      '--month-cell-height': `${cellHeightPx}px`,
      '--month-bar-row-height': `${MONTH_CELL_BAR_ROW_HEIGHT_PX}px`,
      '--month-chip-height': `${MONTH_CELL_CHIP_HEIGHT_PX}px`,
      '--month-row-gap': `${MONTH_CELL_ROW_GAP_PX}px`,
    }"
  >
    <CalendarMonthNav
      :label="monthLabel"
      @prev="emit('navigate', 'prev-month')"
      @next="emit('navigate', 'next-month')"
    />

    <div class="month-calendar">
      <div class="month-weekday-row">
        <div
          v-for="(label, index) in resolvedWeekdayLabels"
          :key="label"
          class="weekday-header"
          :class="{ sunday: index === 0, saturday: index === 6 }"
        >
          {{ label }}
        </div>
      </div>

      <div
        ref="monthWeeksRef"
        class="month-weeks-body"
        role="grid"
        aria-label="Month calendar"
        @keydown="onGridKeydown"
      >
        <div
          v-for="(week, weekIndex) in monthWeeks"
          :key="`week-${weekIndex}`"
          class="month-week"
          role="row"
        >
          <MonthCell
            v-for="cell in week.cells"
            :ref="(el) => setCellRef(el as InstanceType<typeof MonthCell> | null, cell.key)"
            :key="cell.key"
            :cell="cell"
            :get-type-style="calendar.getTypeStyle"
            :tabindex="cell.key === activeFocusKey ? 0 : -1"
            @date-select="onCellDateSelect($event)"
            @schedule-click="emit('schedule-click', $event)"
            @open-overflow="onOpenOverflow($event)"
          />

          <div
            v-if="week.barRowCount > 0"
            class="month-week-bars"
            role="gridcell"
            aria-colspan="7"
            :style="{
              height: `${week.barRowCount * MONTH_CELL_BAR_ROW_HEIGHT_PX}px`,
              gridTemplateRows: `repeat(${week.barRowCount}, ${MONTH_CELL_BAR_ROW_HEIGHT_PX}px)`,
            }"
          >
            <div
              v-for="bar in week.bars"
              :key="bar.key"
              class="month-week-bar-slot"
              :style="{
                gridColumn: `${bar.startColumn + 1} / span ${bar.span}`,
                gridRow: bar.row + 1,
              }"
            >
              <div class="month-week-bar-click" @click.stop>
                <AllDayBar
                  :schedule="bar.schedule"
                  :span="bar.span"
                  v-bind="calendar.getTypeStyle(bar.schedule.type)"
                  @click="
                    emit('schedule-click', {
                      schedule: bar.schedule,
                      source: 'month-all-day-bar',
                      date: week.cells[bar.startColumn]?.date,
                    })
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <MonthOverflowPopover
      :open="overflowPopover !== null"
      :date="overflowPopover?.date ?? null"
      :schedules="overflowPopover?.schedules ?? []"
      :highlighted-schedule-ids="overflowPopover?.highlightedScheduleIds ?? []"
      :anchor-top="overflowPopover?.anchorTop ?? 0"
      :anchor-left="overflowPopover?.anchorLeft ?? 0"
      :anchor-bottom="overflowPopover?.anchorBottom"
      :container-bounds="overflowPopover?.containerBounds"
      @close="closeOverflowPopover"
      @schedule-click="onOverflowScheduleClick"
    />
  </div>
</template>

<style scoped>
.month-view {
  flex: 1;
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
  overflow: hidden;
}

.month-calendar {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-calendar-border);
}

.month-weeks-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.month-weekday-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  flex-shrink: 0;
}

.month-week {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  flex: 1;
  min-height: 0;
}

.weekday-header {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 4px;
  background: var(--vp-month-header-bg);
  border-bottom: 1px solid var(--vp-calendar-border);
  border-right: 1px solid var(--vp-calendar-border);
}

.weekday-header:nth-child(7n) {
  border-right: none;
}

.weekday-header.sunday {
  color: var(--vp-color-sunday);
}

.weekday-header.saturday {
  color: var(--vp-color-saturday);
}

.month-week {
  position: relative;
  border-bottom: 1px solid var(--vp-grid-line);
}

.month-week:last-child {
  border-bottom: none;
}

.month-week-bars {
  position: absolute;
  top: 26px;
  left: 4px;
  right: 4px;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--month-row-gap) 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 3;
}

.month-week-bar-slot {
  display: flex;
  align-items: stretch;
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: 0 2px;
  box-sizing: border-box;
  pointer-events: auto;
}

.month-week-bar-click {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: stretch;
}

.month-week-bar-slot :deep(.all-day-bar-chip) {
  flex: 1;
  width: 100%;
  min-height: calc(var(--month-bar-row-height) - 2px);
  padding: 1px 6px;
  font-size: 10px;
  line-height: calc(var(--month-bar-row-height) - 4px);
}
</style>
