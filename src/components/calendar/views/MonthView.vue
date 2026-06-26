<script setup lang="ts">
import { computed, ref } from 'vue'
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
import type { Schedule } from '@/types/schedule'
import { layoutMonthWeeks, sortSchedulesForOverflowPopover, toRectBounds } from '@/utils/month'
import AllDayBar from '../AllDayBar.vue'
import CalendarMonthNav from '../CalendarMonthNav.vue'
import HolidayChip from '../HolidayChip.vue'
import MonthOverflowPopover from '../MonthOverflowPopover.vue'
import ScheduleEventChip from '../ScheduleEventChip.vue'

const props = defineProps<{
  calendar: CalendarContext
}>()

const emit = defineEmits<{
  'date-select': [payload: CalendarDateSelectPayload]
  'overflow-click': [payload: CalendarOverflowClickPayload]
  'schedule-click': [payload: CalendarScheduleClickPayload]
  navigate: [action: CalendarNavigateAction]
}>()

function emitDateSelect(date: Date) {
  emit('date-select', { date, source: 'month-cell' })
}

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

function openOverflowPopover(
  cell: {
    date: Date
    hiddenScheduleCount: number
    schedules: Schedule[]
    chipVisible: Schedule[]
  },
  event: MouseEvent,
) {
  const target = event.currentTarget
  if (!(target instanceof HTMLElement)) {
    return
  }

  const rect = target.getBoundingClientRect()
  const calendarRoot = target.closest('.schedule-calendar')
  const containerBounds =
    calendarRoot instanceof HTMLElement ? toRectBounds(calendarRoot.getBoundingClientRect()) : null

  const payload: CalendarOverflowClickPayload = {
    date: cell.date,
    hiddenCount: cell.hiddenScheduleCount,
    schedules: cell.schedules,
    visibleSchedules: cell.chipVisible,
  }

  overflowPopover.value = {
    date: cell.date,
    schedules: sortSchedulesForOverflowPopover(cell.schedules),
    highlightedScheduleIds: cell.chipVisible.map((schedule) => schedule.id),
    anchorTop: rect.bottom + 4,
    anchorLeft: rect.left,
    anchorBottom: rect.bottom,
    containerBounds,
  }

  emit('overflow-click', payload)
}

function onOverflowScheduleClick(schedule: Schedule) {
  if (!overflowPopover.value) {
    return
  }

  emitScheduleClick(schedule, overflowPopover.value.date)
  closeOverflowPopover()
}

function emitScheduleClick(schedule: Schedule, date: Date) {
  const payload: CalendarScheduleClickPayload = { schedule, source: 'month-chip', date }
  emit('schedule-click', payload)
}

function emitMonthAllDayClick(schedule: Schedule, date: Date) {
  emit('schedule-click', {
    schedule,
    source: 'month-all-day-bar',
    date,
  })
}

function emitNavigate(action: CalendarNavigateAction) {
  emit('navigate', action)
}

const monthWeeksRef = ref<HTMLElement | null>(null)
const { cellHeightPx } = useMonthMeasuredCellHeight(monthWeeksRef)

const monthLabel = computed(() => props.calendar.monthLabel.value)
const monthWeeks = computed(() =>
  layoutMonthWeeks(props.calendar.monthCells.value, cellHeightPx.value),
)

const weekdayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
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
      @prev="emitNavigate('prev-month')"
      @next="emitNavigate('next-month')"
    />

    <div class="month-calendar">
      <div class="month-weekday-row">
        <div
          v-for="(label, index) in weekdayLabels"
          :key="label"
          class="weekday-header"
          :class="{ sunday: index === 0, saturday: index === 6 }"
        >
          {{ label }}
        </div>
      </div>

      <div ref="monthWeeksRef" class="month-weeks-body">
        <div v-for="(week, weekIndex) in monthWeeks" :key="`week-${weekIndex}`" class="month-week">
          <div
            v-for="cell in week.cells"
            :key="cell.key"
            class="month-cell"
            :class="{
              outside: !cell.inCurrentMonth,
              today: cell.isToday,
              selected: cell.isSelected,
              sunday: cell.isSunday,
              saturday: cell.isSaturday,
            }"
            @click="emitDateSelect(cell.date)"
          >
            <div class="cell-date">{{ cell.date.getDate() }}</div>
            <div
              v-if="cell.spanningBarRows > 0"
              class="cell-bar-spacer"
              :style="{ height: `${cell.spanningBarRows * MONTH_CELL_BAR_ROW_HEIGHT_PX}px` }"
            />
            <div class="cell-events">
              <div v-for="holiday in cell.holidays" :key="holiday.id" class="cell-holiday-chip">
                <HolidayChip :name="holiday.name" />
              </div>
              <div
                v-for="schedule in cell.chipVisible"
                :key="schedule.id"
                class="cell-event-chip"
                @click.stop
              >
                <ScheduleEventChip
                  :schedule="schedule"
                  v-bind="calendar.getTypeStyle(schedule.type)"
                  compact
                  @click="emitScheduleClick(schedule, cell.date)"
                />
              </div>
              <button
                v-if="cell.hiddenScheduleCount > 0"
                type="button"
                class="more-events"
                :title="`${cell.hiddenScheduleCount}개 일정 더 보기`"
                @click.stop="openOverflowPopover(cell, $event)"
              >
                +{{ cell.hiddenScheduleCount }}
              </button>
            </div>
          </div>

          <div
            v-if="week.barRowCount > 0"
            class="month-week-bars"
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
                  @click="emitMonthAllDayClick(bar.schedule, week.cells[bar.startColumn]!.date)"
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
  border: 1px solid #d7dee8;
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
  background: #f8fafc;
  border-bottom: 1px solid #d7dee8;
  border-right: 1px solid #d7dee8;
}

.weekday-header:nth-child(7n) {
  border-right: none;
}

.weekday-header.sunday {
  color: #d32f2f;
}

.weekday-header.saturday {
  color: #1565c0;
}

.month-week {
  position: relative;
  border-bottom: 1px solid #e2e8f0;
}

.month-week:last-child {
  border-bottom: none;
}

.month-cell {
  height: 100%;
  min-height: 0;
  border-right: 1px solid #e2e8f0;
  padding: 4px;
  cursor: pointer;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.month-cell:nth-child(7n) {
  border-right: none;
}

.month-cell.outside {
  background: #fafbfc;
}

.month-cell.outside .cell-date {
  color: #b0bac5;
}

.month-cell.selected {
  background: #e3f2fd;
}

.month-cell.today .cell-date {
  display: inline-flex;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background: #4db6ac;
  color: #fff !important;
}

.month-cell.sunday .cell-date {
  color: #d32f2f;
}

.month-cell.saturday .cell-date {
  color: #1565c0;
}

.cell-date {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.cell-bar-spacer {
  flex-shrink: 0;
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

.cell-events {
  display: flex;
  flex-direction: column;
  gap: var(--month-row-gap);
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.cell-holiday-chip {
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
}

.cell-events :deep(.event-chip.compact) {
  flex-shrink: 0;
  height: var(--month-chip-height);
  min-height: var(--month-chip-height);
  padding: 1px 6px;
  font-size: 10px;
  line-height: calc(var(--month-chip-height) - 2px);
  margin-bottom: 0;
  min-width: 0;
}

.cell-events :deep(.event-chip.compact .event-title) {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-events {
  border: none;
  background: #f1f5f9;
  color: #475569;
  font-size: 10px;
  font-weight: 600;
  height: var(--month-chip-height);
  min-height: var(--month-chip-height);
  line-height: calc(var(--month-chip-height) - 2px);
  padding: 1px 6px;
  border-radius: 4px;
  text-align: left;
  cursor: pointer;
  flex-shrink: 0;
  width: fit-content;
}

.more-events:hover {
  background: #e2e8f0;
}
</style>
