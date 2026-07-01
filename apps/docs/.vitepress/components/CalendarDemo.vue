<script setup lang="ts">
import { ref } from 'vue'
import { ScheduleCalendar, useScheduleCalendarHost } from '@vuepkg/calendar'
import type { Schedule, ScheduleTypeOption } from '@vuepkg/calendar'

const today = new Date()
const y = today.getFullYear()
const m = today.getMonth()

function at(date: Date, h: number, min = 0): Date {
  const d = new Date(date)
  d.setHours(h, min, 0, 0)
  return d
}

const scheduleTypeOptions: ScheduleTypeOption[] = [
  { type: 'my_schedule', label: '내 일정', color: '#1565c0', backgroundColor: '#e3f2fd' },
  { type: 'team_schedule', label: '팀 일정', color: '#6a1b9a', backgroundColor: '#f3e5f5' },
  { type: 'company', label: '전사', color: '#1b5e20', backgroundColor: '#e8f5e9' },
]

const schedules = ref<Schedule[]>([
  {
    id: 'd-1',
    title: '팀 주간 회의',
    type: 'team_schedule',
    participantId: 'user-a',
    participantName: 'Alice',
    start: at(new Date(y, m, 8), 10),
    end: at(new Date(y, m, 8), 11),
  },
  {
    id: 'd-2',
    title: '제품 로드맵 발표',
    type: 'company',
    participantId: 'user-b',
    participantName: 'Bob',
    start: at(new Date(y, m, 10), 14),
    end: at(new Date(y, m, 10), 15, 30),
  },
  {
    id: 'd-3',
    title: '고객사 미팅',
    type: 'my_schedule',
    participantId: 'user-a',
    participantName: 'Alice',
    start: at(new Date(y, m, 15), 13),
    end: at(new Date(y, m, 15), 14),
  },
  {
    id: 'd-4',
    title: '스프린트 리뷰',
    type: 'team_schedule',
    participantId: 'user-a',
    participantName: 'Alice',
    start: at(new Date(y, m, 21), 15),
    end: at(new Date(y, m, 21), 17),
  },
])

const { view, date, calendarListeners } = useScheduleCalendarHost({
  onScheduleMove({ schedule, newStart, newEnd }) {
    const idx = schedules.value.findIndex((s) => s.id === schedule.id)
    if (idx !== -1) {
      schedules.value[idx] = { ...schedules.value[idx], start: newStart, end: newEnd }
    }
  },
  onScheduleResize({ schedule, newEnd }) {
    const idx = schedules.value.findIndex((s) => s.id === schedule.id)
    if (idx !== -1) {
      schedules.value[idx] = { ...schedules.value[idx], end: newEnd }
    }
  },
})
</script>

<template>
  <div class="calendar-demo-wrapper">
    <ScheduleCalendar
      v-model:view="view"
      v-model:date="date"
      :schedules="schedules"
      :schedule-type-options="scheduleTypeOptions"
      v-bind="calendarListeners"
    />
  </div>
</template>
