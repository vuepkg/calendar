# 일정 CRUD 모달

`ScheduleFormModal`은 일정 생성·수정을 위한 Dialog 컴포넌트입니다. draft → `Schedule` 변환(`buildScheduleFromDraft`)을 내부에서 처리하고, 완성된 `Schedule`을 `submit` emit으로 전달합니다 — 소비자는 `upsertSchedule`/`removeSchedule`로 목록만 갱신하면 됩니다.

## 기본 사용

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ScheduleCalendar,
  ScheduleFormModal,
  useScheduleCalendarHost,
  upsertSchedule,
  removeSchedule,
} from '@vuepkg/calendar'
import type { Schedule, Participant } from '@vuepkg/calendar'

const schedules = ref<Schedule[]>([])
const participants: Participant[] = [
  { id: 'user-hong', name: '홍길동' },
  { id: 'user-kim', name: '김민수' },
]

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingSchedule = ref<Schedule | null>(null)
const initialStart = ref<Date | undefined>()
const initialEnd = ref<Date | undefined>()

const { view, date, calendarListeners } = useScheduleCalendarHost({
  onQueryChange(payload) {
    // API 호출
  },
  onScheduleClick({ schedule }) {
    // 클릭 → 수정 모달
    modalMode.value = 'edit'
    editingSchedule.value = schedule
    modalOpen.value = true
  },
  onTimeSlotSelect({ start, end }) {
    // 빈 셀 클릭 → 생성 모달
    modalMode.value = 'create'
    editingSchedule.value = null
    initialStart.value = start
    initialEnd.value = end
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
  <div style="height: 600px;">
    <ScheduleCalendar
      v-model:view="view"
      v-model:date="date"
      :schedules="schedules"
      v-bind="calendarListeners"
    />
  </div>

  <ScheduleFormModal
    :open="modalOpen"
    :mode="modalMode"
    :schedule="editingSchedule"
    :initial-start="initialStart"
    :initial-end="initialEnd"
    :participants="participants"
    :existing-schedules="schedules"
    @close="modalOpen = false"
    @submit="handleSubmit"
    @delete="handleDelete"
  />
</template>
```

## ScheduleDraft 타입

`ScheduleFormModal`이 내부 폼 상태를 다룰 때 쓰는 타입입니다. `Schedule`과 달리 `participantId`가 필수입니다(내장 폼은 항상 참가자 선택을 요구).

```ts
interface ScheduleDraft {
  id?: string
  title: string
  type: string
  participantId: string
  start: Date
  end: Date
  allDay: boolean
  recurrence?: RecurrenceRule
}
```

## 헬퍼 함수

`ScheduleFormModal`을 그대로 쓰면 `buildScheduleFromDraft`를 직접 호출할 필요가 없습니다(모달이 내부에서 처리). **헤드리스로 직접 폼을 구현할 때만** 사용하세요.

```ts
import {
  createScheduleId,       // 순차 id 생성 — 's-001', 's-002', ... (UUID 아님)
  buildScheduleFromDraft, // (draft, participants, existing) => Schedule — id 자동 할당
  upsertSchedule,         // (list, schedule) => Schedule[] — id 있으면 교체, 없으면 추가
  removeSchedule,         // (list, scheduleId) => Schedule[]
} from '@vuepkg/calendar'

// 헤드리스 생성 예 — 직접 만든 폼에서 draft를 받은 경우
const schedule = buildScheduleFromDraft(draft, participants, schedules.value)
schedules.value = upsertSchedule(schedules.value, schedule)

// 삭제
schedules.value = removeSchedule(schedules.value, id)
```

## ScheduleFormModal API

전체 Props/Emits 표는 [ScheduleFormModal API 레퍼런스](/api/schedule-form-modal)를 참고하세요. 핵심만 요약하면:

- `open`은 v-model이 **아닙니다** — `open` prop을 직접 갱신하고 `@close`로 닫기 요청을 받습니다.
- `participants`는 필수 prop입니다.
- 저장 결과는 `@submit`으로 완성된 `Schedule`을 받습니다(`ScheduleDraft`가 아님).
