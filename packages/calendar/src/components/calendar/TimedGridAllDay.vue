<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarScheduleClickPayload, ScheduleClickSource } from '@/types/calendarEvents'
import type { AllDayBarLayout } from '@/types/layout'
import type { Holiday, Schedule } from '@/types/schedule'
import { toDateKey } from '@/utils/date'
import { getHolidaysForDateKey, groupHolidaysByDateKey } from '@/utils/holiday'
import AllDayBar from './AllDayBar.vue'
import HolidayChip from './HolidayChip.vue'

const props = withDefaults(
  defineProps<{
    days: Date[]
    holidays?: Holiday[]
    allDayBars: AllDayBarLayout[]
    allDayRowCount: number
    getTypeStyle: (type: Schedule['type']) => { color: string; backgroundColor: string }
    showParticipant?: boolean
    allDayScheduleSource?: ScheduleClickSource
  }>(),
  {
    holidays: () => [],
    showParticipant: false,
    allDayScheduleSource: 'week-all-day-bar',
  },
)

const emit = defineEmits<{
  'schedule-click': [payload: CalendarScheduleClickPayload]
}>()

const holidaysByDate = computed(() => groupHolidaysByDateKey(props.holidays))
const hasHolidays = computed(() =>
  props.days.some(
    (day) => getHolidaysForDateKey(holidaysByDate.value, toDateKey(day)).length > 0,
  ),
)
const dayHolidays = computed(() =>
  props.days.map((day) => ({
    day,
    holidays: getHolidaysForDateKey(holidaysByDate.value, toDateKey(day)),
  })),
)
</script>

<template>
  <div class="all-day-scroll calendar-scroll">
    <div class="calendar-grid-row all-day-layout">
      <div class="time-gutter all-day-label">all-day</div>
      <div class="all-day-content">
        <div v-if="hasHolidays" class="holiday-chips-row">
          <div
            v-for="(column, columnIndex) in dayHolidays"
            :key="`holiday-${column.day.toISOString()}`"
            class="holiday-column"
            :class="{ 'is-last-column': columnIndex === days.length - 1 }"
          >
            <div v-for="holiday in column.holidays" :key="holiday.id" class="holiday-chip-slot">
              <HolidayChip :name="holiday.name" />
            </div>
          </div>
        </div>

        <div
          class="calendar-days-track all-day-bars-track"
          :style="{ gridTemplateRows: `repeat(${allDayRowCount}, 22px)` }"
        >
          <div
            v-for="(_, index) in days.length"
            :key="`divider-${index}`"
            class="all-day-column-divider"
            :class="{ 'is-last-column': index === days.length - 1 }"
            :style="{ gridColumn: index + 1, gridRow: `1 / span ${allDayRowCount}` }"
          />

          <div
            v-for="bar in allDayBars"
            :key="bar.key"
            class="all-day-bar-slot"
            :style="{
              gridColumn: `${bar.startColumn + 1} / span ${bar.span}`,
              gridRow: bar.row + 1,
            }"
          >
            <AllDayBar
              :schedule="bar.schedule"
              :span="bar.span"
              v-bind="getTypeStyle(bar.schedule.type)"
              :show-participant="showParticipant"
              @click="
                emit('schedule-click', {
                  schedule: bar.schedule,
                  source: allDayScheduleSource,
                  date: days[bar.startColumn],
                })
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.all-day-scroll {
  flex-shrink: 0;
  max-height: var(--all-day-max-height);
  overflow-y: auto;
  overflow-x: hidden;
  border-bottom: 1px solid var(--vp-grid-line);
}

.all-day-layout {
  width: 100%;
}

.time-gutter {
  width: var(--gutter-width);
  flex-shrink: 0;
  font-size: 10px;
  color: var(--vp-color-text-muted);
  border-right: 1px solid var(--vp-grid-line);
}

.all-day-label {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
  font-size: 10px;
  text-transform: uppercase;
}

.all-day-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  min-height: 24px;
}

.holiday-chips-row {
  display: grid;
  grid-template-columns: repeat(var(--day-count), minmax(0, 1fr));
  gap: 2px 0;
  padding: 2px 0 0;
}

.holiday-column {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: 0 1px;
  border-right: 1px solid var(--vp-grid-line);
}

.holiday-column.is-last-column {
  border-right: none;
}

.holiday-chip-slot {
  min-width: 0;
}

.all-day-bars-track {
  position: relative;
  gap: 2px 0;
  padding: 2px 0;
  min-height: 24px;
}

.all-day-column-divider {
  border-right: 1px solid var(--vp-grid-line);
  pointer-events: none;
}

.all-day-column-divider.is-last-column {
  border-right: none;
}

.all-day-bar-slot {
  min-width: 0;
  padding: 0 1px;
}

.all-day-bar-slot:first-child,
.all-day-bar-slot:has(+ .all-day-bar-slot) {
  padding-left: 0;
}
</style>
