<script setup lang="ts">
import { ref } from 'vue'
import {
  ScheduleCalendar,
  ScheduleFormModal,
  useScheduleCalendarHost,
  upsertSchedule,
  removeSchedule,
  type Schedule,
  type Participant,
} from '@vuepkg/calendar'

// Booking / Reservation 시나리오 데모 — 회의실 예약 캘린더
const participants: Participant[] = [
  { id: 'room-a', name: 'Room A' },
  { id: 'room-b', name: 'Room B' },
]

const today = new Date()
const schedules = ref<Schedule[]>([
  {
    id: '1',
    title: 'Design Review',
    type: 'team_schedule',
    participantId: 'room-a',
    participantName: 'Room A',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
  },
])

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const activeSchedule = ref<Schedule | null>(null)
const initialStart = ref<Date>()
const initialEnd = ref<Date>()

const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
  useScheduleCalendarHost({
    onTimeSlotSelect(payload) {
      // Week/Day 뷰에서 빈 시간대를 드래그하면 예약 생성 모드로 모달을 엽니다.
      modalMode.value = 'create'
      activeSchedule.value = null
      initialStart.value = payload.start
      initialEnd.value = payload.end
      modalOpen.value = true
    },
    onScheduleClick(payload) {
      // 기존 예약을 클릭하면 수정 모드로 모달을 엽니다.
      modalMode.value = 'edit'
      activeSchedule.value = payload.schedule
      modalOpen.value = true
    },
  })

function handleSubmit(schedule: Schedule) {
  schedules.value = upsertSchedule(schedules.value, schedule)
  modalOpen.value = false
}

function handleDelete(scheduleId: string) {
  schedules.value = removeSchedule(schedules.value, scheduleId)
  modalOpen.value = false
}
</script>

<template>
  <div style="height: 100vh; display: flex; flex-direction: column">
    <ScheduleCalendar
      :schedules="schedules"
      v-model:view="view"
      v-model:date="date"
      v-model:list-filter-date="listFilterDate"
      v-model:view-scope="viewScope"
      v-model:schedule-types="scheduleTypes"
      v-on="calendarListeners"
    />

    <ScheduleFormModal
      :open="modalOpen"
      :mode="modalMode"
      :schedule="activeSchedule"
      :initial-start="initialStart"
      :initial-end="initialEnd"
      :participants="participants"
      :existing-schedules="schedules"
      @close="modalOpen = false"
      @submit="handleSubmit"
      @delete="handleDelete"
    />
  </div>
</template>
