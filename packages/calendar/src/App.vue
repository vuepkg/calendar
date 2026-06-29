<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ScheduleCalendar,
  SCHEDULE_TYPE_OPTIONS,
  applyScheduleFilters,
  useScheduleCalendarHost,
  type Schedule,
} from '@/components/calendar'
import { mockCompanyHolidays } from '@/data/mockSchedules'
import { CURRENT_USER_ID, mockSchedules } from '@/data/mockSchedules'
import { startOfDay } from '@/utils/date'

const allSchedules = ref<Schedule[]>(mockSchedules.map((schedule) => ({ ...schedule })))

const ALL_SCHEDULE_TYPES = SCHEDULE_TYPE_OPTIONS.map((option) => option.type)

const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost({
    initialDate: startOfDay(new Date(2026, 3, 22)),
    onQueryChange: (payload) => {
      if (import.meta.env.DEV) {
        console.debug('[demo] schedule query-change', payload)
      }
    },
    onTimeSlotSelect: (payload) => {
      if (import.meta.env.DEV) {
        console.debug('[demo] time-slot-select', payload)
      }
    },
  })

const schedules = computed(() =>
  applyScheduleFilters(allSchedules.value, {
    viewScope: viewScope.value,
    scheduleTypes: scheduleTypes.value,
    currentUserId: CURRENT_USER_ID,
  }),
)

function toggleScheduleType(type: string) {
  const active = scheduleTypes.value ?? ALL_SCHEDULE_TYPES
  const next = active.includes(type) ? active.filter((item) => item !== type) : [...active, type]

  scheduleTypes.value = next.length === ALL_SCHEDULE_TYPES.length ? null : next
}
</script>

<template>
  <main class="app">
    <section class="app-filters" aria-label="Schedule filters">
      <div class="filter-group">
        <span class="filter-label">View Option</span>
        <label class="filter-option">
          <input v-model="viewScope" type="radio" value="company" />
          Company
        </label>
        <label class="filter-option">
          <input v-model="viewScope" type="radio" value="my" />
          My
        </label>
      </div>

      <div class="filter-group">
        <span class="filter-label">Schedule Type</span>
        <label v-for="option in SCHEDULE_TYPE_OPTIONS" :key="option.type" class="filter-option">
          <input
            type="checkbox"
            :checked="scheduleTypes === null || scheduleTypes.includes(option.type)"
            @change="toggleScheduleType(option.type)"
          />
          {{ option.label }}
        </label>
      </div>
    </section>

    <ScheduleCalendar
      v-model:view="view"
      v-model:date="date"
      v-model:list-filter-date="listFilterDate"
      v-model:view-scope="viewScope"
      v-model:schedule-types="scheduleTypes"
      :schedules="schedules"
      :holidays="mockCompanyHolidays"
      v-on="calendarListeners"
    />
  </main>
</template>

<style scoped>
.app {
  height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  background: #edf2f7;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.app-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #d7dee8;
  border-radius: 4px;
  flex-shrink: 0;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.filter-option {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #334155;
}

.app > :deep(.schedule-calendar) {
  flex: 1;
  min-height: 0;
}
</style>
