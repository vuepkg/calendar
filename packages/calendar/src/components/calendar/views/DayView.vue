<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarContext } from '@/types'
import type {
  CalendarNavigateAction,
  CalendarScheduleClickPayload,
  CalendarScheduleMovePayload,
  CalendarScheduleResizePayload,
  CalendarTimeSlotSelectPayload,
} from '@/types/calendarEvents'
import CalendarPeriodNav from '../CalendarPeriodNav.vue'
import TimedGrid from '../TimedGrid.vue'
import { formatDayViewDate } from '@/utils/date'

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
  'schedule-click': [payload: CalendarScheduleClickPayload]
  'time-slot-select': [payload: CalendarTimeSlotSelectPayload]
  'schedule-move': [payload: CalendarScheduleMovePayload]
  'schedule-resize': [payload: CalendarScheduleResizePayload]
  navigate: [action: CalendarNavigateAction]
}>()

const schedules = computed(() => props.calendar.schedules.value)
const holidays = computed(() => props.calendar.holidays.value)
const selectedDate = computed(() => props.calendar.state.selectedDate)
const dayRange = computed(() => [selectedDate.value])
const periodLabel = computed(() => formatDayViewDate(selectedDate.value))
</script>

<template>
  <div class="day-view">
    <CalendarPeriodNav
      :period-label="periodLabel"
      prev-label="Previous day"
      next-label="Next day"
      @today="emit('navigate', 'today')"
      @prev="emit('navigate', 'prev-day')"
      @next="emit('navigate', 'next-day')"
    />

    <div class="timed-grid-wrapper">
      <TimedGrid
        :days="dayRange"
        :schedules="schedules"
        :holidays="holidays"
        :get-type-style="calendar.getTypeStyle"
        :start-hour="startHour"
        :end-hour="endHour"
        :locale="locale"
        show-participant
        show-current-time
        single-day
        timed-schedule-source="day-timed"
        all-day-schedule-source="day-all-day-bar"
        @schedule-click="emit('schedule-click', $event)"
        @time-slot-select="emit('time-slot-select', $event)"
        @schedule-move="emit('schedule-move', $event)"
        @schedule-resize="emit('schedule-resize', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.day-view {
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
