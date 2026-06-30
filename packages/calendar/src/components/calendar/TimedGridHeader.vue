<script setup lang="ts">
import type { CalendarDateSelectPayload, DateSelectSource } from '@/types/calendarEvents'
import { formatTimedGridDayLabel } from '@/utils/date'

const props = withDefaults(
  defineProps<{
    days: Date[]
    singleDay?: boolean
    dayHeaderSource?: DateSelectSource
  }>(),
  {
    singleDay: false,
    dayHeaderSource: 'week-day-header',
  },
)

const emit = defineEmits<{
  'date-select': [payload: CalendarDateSelectPayload]
}>()

function onDayHeaderActivate(day: Date) {
  if (props.singleDay) {
    return
  }

  emit('date-select', { date: day, source: props.dayHeaderSource })
}
</script>

<template>
  <div class="timed-grid-header-shell calendar-scroll" :class="{ 'single-day': singleDay }">
    <div class="calendar-grid-row timed-grid-header">
      <div class="time-gutter header-gutter" />
      <div class="calendar-days-track">
        <div
          v-for="(day, columnIndex) in days"
          :key="day.toISOString()"
          class="day-header"
          :class="{
            sunday: day.getDay() === 0,
            saturday: day.getDay() === 6,
            'is-last-column': columnIndex === days.length - 1,
            clickable: !singleDay,
          }"
          :role="singleDay ? undefined : 'button'"
          :tabindex="singleDay ? undefined : 0"
          @click="onDayHeaderActivate(day)"
          @keydown.enter.prevent="onDayHeaderActivate(day)"
          @keydown.space.prevent="onDayHeaderActivate(day)"
        >
          <span class="day-number">{{ day.getDate() }}</span>
          <span class="day-label">{{ formatTimedGridDayLabel(day) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timed-grid-header-shell {
  flex-shrink: 0;
  overflow: hidden;
}

.timed-grid-header {
  width: 100%;
}

.time-gutter {
  width: var(--gutter-width);
  flex-shrink: 0;
  font-size: 10px;
  color: var(--vp-color-text-muted);
  border-right: 1px solid var(--vp-grid-line);
}

.header-gutter {
  border-bottom: 1px solid var(--vp-grid-line);
}

.day-header {
  text-align: left;
  padding: 10px 12px;
  border-right: 1px solid var(--vp-grid-line);
  border-bottom: 1px solid var(--vp-grid-line);
}

.day-header.clickable {
  cursor: pointer;
}

.day-header.clickable:hover {
  background: var(--vp-nav-btn-bg-hover);
}

.day-header.is-last-column {
  border-right: none;
}

.day-header.sunday .day-number {
  color: var(--vp-color-sunday);
}

.day-header.saturday .day-number {
  color: var(--vp-color-saturday);
}

.day-number {
  display: block;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.1;
  color: var(--vp-color-text);
  margin-bottom: 2px;
}

.day-label {
  display: block;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.3;
  color: var(--vp-color-text-muted);
}

@media (max-width: 768px) {
  .timed-grid-header-shell:not(.single-day) .day-header {
    padding: 8px 4px;
  }

  .timed-grid-header-shell:not(.single-day) .day-number {
    font-size: 18px;
  }

  .timed-grid-header-shell:not(.single-day) .day-label {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .timed-grid-header-shell:not(.single-day) .day-label {
    display: none;
  }

  .timed-grid-header-shell:not(.single-day) .day-number {
    font-size: 14px;
  }
}
</style>
