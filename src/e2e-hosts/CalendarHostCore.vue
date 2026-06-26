<script setup lang="ts">
import { ScheduleCalendar } from '@/components/calendar'
import { useHostCalendarFixture } from './useHostCalendarFixture'

const {
  view,
  date,
  listFilterDate,
  viewScope,
  scheduleTypes,
  calendarListeners,
  schedules,
  companyHolidays,
} = useHostCalendarFixture()
</script>

<template>
  <ScheduleCalendar
    v-model:view="view"
    v-model:date="date"
    v-model:list-filter-date="listFilterDate"
    v-model:view-scope="viewScope"
    v-model:schedule-types="scheduleTypes"
    :schedules="schedules"
    :holidays="companyHolidays"
    v-on="calendarListeners"
  />
</template>
