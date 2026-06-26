<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarContext } from '@/types'
import type {
  CalendarNavigateAction,
  CalendarScheduleClickPayload,
  CalendarTimeSlotSelectPayload,
} from '@/types/calendarEvents'
import CalendarPeriodNav from '../CalendarPeriodNav.vue'
import TimedGrid from '../TimedGrid.vue'
import { formatDayViewDate } from '@/utils/date'

const props = defineProps<{
  calendar: CalendarContext
}>()

const emit = defineEmits<{
  'schedule-click': [payload: CalendarScheduleClickPayload]
  'time-slot-select': [payload: CalendarTimeSlotSelectPayload]
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
        show-participant
        show-current-time
        single-day
        timed-schedule-source="day-timed"
        all-day-schedule-source="day-all-day-bar"
        @schedule-click="emit('schedule-click', $event)"
        @time-slot-select="emit('time-slot-select', $event)"
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
