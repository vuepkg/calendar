<script setup lang="ts">
import type { CalendarScheduleClickPayload, CalendarOverflowClickPayload } from '@/types/calendarEvents'
import type { MonthWeekCell } from '@/types/layout'
import type { Schedule } from '@/types/schedule'
import { toRectBounds } from '@vuepkg/core'
import HolidayChip from './HolidayChip.vue'
import ScheduleEventChip from './ScheduleEventChip.vue'

const props = defineProps<{
  cell: MonthWeekCell
  getTypeStyle: (type: Schedule['type']) => { color: string; backgroundColor: string }
}>()

const emit = defineEmits<{
  'date-select': [date: Date]
  'schedule-click': [payload: CalendarScheduleClickPayload]
  'open-overflow': [payload: CalendarOverflowClickPayload & { anchorRect: DOMRect; containerBounds: ReturnType<typeof toRectBounds> | null }]
}>()

function onCellActivate() {
  emit('date-select', props.cell.date)
}

function onScheduleClick(schedule: Schedule) {
  emit('schedule-click', { schedule, source: 'month-chip', date: props.cell.date })
}

function onOpenOverflow(event: MouseEvent) {
  const target = event.currentTarget
  if (!(target instanceof HTMLElement)) {
    return
  }

  const rect = target.getBoundingClientRect()
  const calendarRoot = target.closest('.schedule-calendar')
  const containerBounds =
    calendarRoot instanceof HTMLElement ? toRectBounds(calendarRoot.getBoundingClientRect()) : null

  emit('open-overflow', {
    date: props.cell.date,
    hiddenCount: props.cell.hiddenScheduleCount,
    schedules: props.cell.schedules,
    visibleSchedules: props.cell.chipVisible,
    anchorRect: rect,
    containerBounds,
  })
}
</script>

<template>
  <div
    class="month-cell"
    role="gridcell"
    tabindex="0"
    :class="{
      outside: !cell.inCurrentMonth,
      today: cell.isToday,
      selected: cell.isSelected,
      sunday: cell.isSunday,
      saturday: cell.isSaturday,
    }"
    @click="onCellActivate"
    @keydown.enter.prevent="onCellActivate"
    @keydown.space.prevent="onCellActivate"
  >
    <div class="cell-date">{{ cell.date.getDate() }}</div>
    <div
      v-if="cell.spanningBarRows > 0"
      class="cell-bar-spacer"
      :style="{ height: `calc(${cell.spanningBarRows} * var(--month-bar-row-height))` }"
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
          v-bind="getTypeStyle(schedule.type)"
          compact
          @click="onScheduleClick(schedule)"
        />
      </div>
      <button
        v-if="cell.hiddenScheduleCount > 0"
        type="button"
        class="more-events"
        :title="`${cell.hiddenScheduleCount}개 일정 더 보기`"
        @click.stop="onOpenOverflow($event)"
      >
        +{{ cell.hiddenScheduleCount }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.month-cell {
  height: 100%;
  min-height: 0;
  border-right: 1px solid var(--vp-grid-line);
  padding: 4px;
  cursor: pointer;
  background: var(--vp-month-cell-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.month-cell:nth-child(7n) {
  border-right: none;
}

.month-cell:focus-visible {
  outline: 2px solid var(--vp-color-primary);
  outline-offset: -2px;
}

.month-cell.outside {
  background: var(--vp-month-cell-outside-bg);
}

.month-cell.outside .cell-date {
  color: var(--vp-month-cell-outside-text);
}

.month-cell.selected {
  background: var(--vp-month-cell-selected-bg);
}

.month-cell.today .cell-date {
  display: inline-flex;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background: var(--vp-today-badge-bg);
  color: var(--vp-today-badge-text) !important;
}

.month-cell.sunday .cell-date {
  color: var(--vp-color-sunday);
}

.month-cell.saturday .cell-date {
  color: var(--vp-color-saturday);
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
  background: var(--vp-popover-item-bg);
  color: var(--vp-color-text-secondary);
  font-size: 10px;
  font-weight: 600;
  height: var(--month-chip-height);
  min-height: var(--month-chip-height);
  line-height: calc(var(--month-chip-height) - 2px);
  padding: 1px 6px;
  border-radius: var(--vp-chip-radius);
  text-align: left;
  cursor: pointer;
  flex-shrink: 0;
  width: fit-content;
}

.more-events:hover {
  background: var(--vp-popover-item-bg-hover);
}
</style>
