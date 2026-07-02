# ScheduleFormModal

일정 생성·수정을 위한 Dialog 컴포넌트입니다. `@vuepkg/ui`의 `Dialog` primitive 위에 구축됩니다. 반복 규칙 UI는 내부적으로 `RecurrenceFields`를 사용합니다.

## Props

| prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | `boolean` | — | **필수.** 모달 열림 상태 (일반 prop — v-model 아님, 열고 닫기는 소비자가 `open` 값을 직접 갱신) |
| `mode` | `'create' \| 'edit'` | — | **필수.** 생성 모드인지 수정 모드인지 |
| `schedule` | `Schedule \| null` | `null` | edit 모드 수정 대상. create 모드에서는 사용되지 않음 |
| `initialStart` | `Date` | — | create 모드 초기값 — `time-slot-select` payload의 `start`를 그대로 전달 |
| `initialEnd` | `Date` | — | create 모드 초기값 — `time-slot-select` payload의 `end`를 그대로 전달 |
| `participants` | `Participant[]` | — | **필수.** 참가자 선택 옵션 — `participantId` ↔ 이름 조회 및 `buildScheduleFromDraft`에 사용 |
| `existingSchedules` | `Schedule[]` | `[]` | ID 충돌 방지용 — 현재 표시 중인 전체 일정 목록 (create 모드에서만 사용) |
| `scheduleTypeOptions` | `ScheduleTypeOption[]` | 기본 3종 | 일정 유형 선택 옵션 |

## Emits

| emit | payload | 설명 |
|------|---------|------|
| `close` | — | 모달 닫기 (취소, Esc, 외부 클릭, 저장/삭제 완료 후) — 소비자가 `open`을 `false`로 갱신 |
| `submit` | `Schedule` | 저장 클릭 (생성/수정 공통) — `buildScheduleFromDraft`로 조립된 완성된 `Schedule` |
| `delete` | `string` (scheduleId) | 삭제 클릭 (edit 모드에서만 표시) |

## 사용 예

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ScheduleFormModal } from '@vuepkg/calendar'
import type { Schedule, Participant } from '@vuepkg/calendar'

const open = ref(false)
const mode = ref<'create' | 'edit'>('create')
const editingSchedule = ref<Schedule | null>(null)
const schedules = ref<Schedule[]>([])
const participants: Participant[] = [{ id: 'user-1', name: '홍길동' }]

function onSubmit(schedule: Schedule) {
  const index = schedules.value.findIndex((s) => s.id === schedule.id)
  if (index === -1) schedules.value.push(schedule)
  else schedules.value[index] = schedule
  open.value = false
}

function onDelete(scheduleId: string) {
  schedules.value = schedules.value.filter((s) => s.id !== scheduleId)
  open.value = false
}
</script>

<template>
  <ScheduleFormModal
    :open="open"
    :mode="mode"
    :schedule="editingSchedule"
    :participants="participants"
    :existing-schedules="schedules"
    @close="open = false"
    @submit="onSubmit"
    @delete="onDelete"
  />
</template>
```

## 통합 가이드

→ [일정 CRUD 모달 가이드](/guide/schedule-crud)를 참조하세요.
