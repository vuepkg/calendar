# 일정 CRUD 모달

`ScheduleFormModal`은 일정 생성·수정을 위한 Dialog 컴포넌트입니다.

## 기본 사용

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  ScheduleCalendar,
  ScheduleFormModal,
  useScheduleCalendarHost,
  createScheduleId,
  upsertSchedule,
  removeSchedule,
} from '@vuepkg/calendar'
import type { Schedule, ScheduleDraft } from '@vuepkg/calendar'

const schedules = ref<Schedule[]>([])
const editingSchedule = ref<Schedule | null>(null)
const modalOpen = ref(false)
const defaultDraft = ref<Partial<ScheduleDraft>>({})

const { view, date, calendarListeners } = useScheduleCalendarHost({
  onQueryChange(payload) {
    // API 호출
  },
  onScheduleClick({ schedule }) {
    // 클릭 → 수정 모달
    editingSchedule.value = schedule
    defaultDraft.value = {}
    modalOpen.value = true
  },
  onTimeSlotSelect({ start, end }) {
    // 빈 셀 클릭 → 생성 모달
    editingSchedule.value = null
    defaultDraft.value = { start, end }
    modalOpen.value = true
  },
})

function handleSave(draft: ScheduleDraft) {
  schedules.value = upsertSchedule(schedules.value, draft, editingSchedule.value?.id)
  modalOpen.value = false
}

function handleDelete() {
  if (editingSchedule.value) {
    schedules.value = removeSchedule(schedules.value, editingSchedule.value.id)
  }
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
    v-model:open="modalOpen"
    :schedule="editingSchedule"
    :default-draft="defaultDraft"
    @save="handleSave"
    @delete="handleDelete"
    @cancel="modalOpen = false"
  />
</template>
```

## ScheduleDraft 타입

```ts
interface ScheduleDraft {
  title: string
  type: string
  participantId: string
  participantName: string
  start: Date
  end: Date
  allDay?: boolean
  remarks?: string
  recurrence?: RecurrenceRule
}
```

## 헬퍼 함수

```ts
import {
  createScheduleId,  // UUID 생성
  upsertSchedule,    // 생성/수정 (id 없으면 생성, 있으면 교체)
  removeSchedule,    // id로 삭제
  buildScheduleFromDraft, // ScheduleDraft → Schedule (id 자동 할당)
} from '@vuepkg/calendar'

// 생성
const newSchedule = buildScheduleFromDraft(draft)
schedules.value = [...schedules.value, newSchedule]

// 수정
schedules.value = upsertSchedule(schedules.value, draft, existingId)

// 삭제
schedules.value = removeSchedule(schedules.value, id)
```

## ScheduleFormModal Props

| prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | `boolean` | — | v-model:open — 모달 열림 상태 |
| `schedule` | `Schedule \| null` | — | 수정할 일정 (`null`이면 생성 모드) |
| `defaultDraft` | `Partial<ScheduleDraft>` | `{}` | 생성 모드 초기값 (start/end 미리 채움) |
| `scheduleTypeOptions` | `ScheduleTypeOption[]` | 기본 3종 | 일정 유형 선택 옵션 |

## ScheduleFormModal Emits

| emit | payload | 설명 |
|------|---------|------|
| `save` | `ScheduleDraft` | 저장 버튼 클릭 |
| `delete` | — | 삭제 버튼 클릭 (수정 모드에서만 표시) |
| `cancel` | — | 취소/닫기 |
