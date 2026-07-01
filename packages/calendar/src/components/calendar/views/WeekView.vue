<script setup lang="ts">
import { computed } from 'vue'
import type {
  CalendarContext,
  CalendarDateSelectPayload,
  CalendarNavigateAction,
  CalendarScheduleClickPayload,
  CalendarScheduleMovePayload,
  CalendarScheduleResizePayload,
  CalendarTimeSlotSelectPayload,
} from '@/types'
import CalendarPeriodNav from '../CalendarPeriodNav.vue'
import TimedGrid from '../TimedGrid.vue'

const props = defineProps<{
  calendar: CalendarContext
  /** 시간 그리드 시작 시각 (0~23) — 기본 `0` */
  startHour?: number
  /** 시간 그리드 종료 시각 (0~23) — 기본 `23` */
  endHour?: number
  /** `Intl.DateTimeFormat` locale — 요일 헤더 라벨 현지화. 기본 `en-US` */
  locale?: string
}>()

const emit = defineEmits<{
  'date-select': [payload: CalendarDateSelectPayload]
  'schedule-click': [payload: CalendarScheduleClickPayload]
  'time-slot-select': [payload: CalendarTimeSlotSelectPayload]
  'schedule-move': [payload: CalendarScheduleMovePayload]
  'schedule-resize': [payload: CalendarScheduleResizePayload]
  navigate: [action: CalendarNavigateAction]
}>()

const weekDays = computed(() => props.calendar.weekDays.value)
const schedules = computed(() => props.calendar.schedules.value)
const holidays = computed(() => props.calendar.holidays.value)
const periodLabel = computed(() => props.calendar.monthLabel.value)
</script>

<template>
  <div class="week-view">
    <CalendarPeriodNav
      :period-label="periodLabel"
      prev-label="Previous week"
      next-label="Next week"
      @today="emit('navigate', 'today')"
      @prev="emit('navigate', 'prev-week')"
      @next="emit('navigate', 'next-week')"
    />

    <div class="timed-grid-wrapper">
      <TimedGrid
        :days="weekDays"
        :schedules="schedules"
        :holidays="holidays"
        :get-type-style="calendar.getTypeStyle"
        :start-hour="startHour"
        :end-hour="endHour"
        :locale="locale"
        show-participant
        timed-schedule-source="week-timed"
        all-day-schedule-source="week-all-day-bar"
        day-header-source="week-day-header"
        @date-select="emit('date-select', $event)"
        @schedule-click="emit('schedule-click', $event)"
        @time-slot-select="emit('time-slot-select', $event)"
        @schedule-move="emit('schedule-move', $event)"
        @schedule-resize="emit('schedule-resize', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.week-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 0 12px 12px;
  box-sizing: border-box;
}

.timed-grid-wrapper {
  flex: 1;
  min-height: 0;
}
</style>
