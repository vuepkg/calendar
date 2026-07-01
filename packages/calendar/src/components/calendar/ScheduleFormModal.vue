<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { Button, Dialog } from '@vuepkg/ui'
import { SCHEDULE_TYPE_OPTIONS } from '@/constants/calendarView'
import type {
  Participant,
  RecurrenceFrequency,
  RecurrenceRule,
  Schedule,
  ScheduleDraft,
  ScheduleTypeOption,
} from '@/types/schedule'
import { formatTime, toDateKey } from '@/utils/date'
import { buildScheduleFromDraft } from '@/utils/schedule'

type RecurrenceEndMode = 'never' | 'count' | 'until'

const RECURRENCE_WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: 'create' | 'edit'
    /** edit 모드 수정 대상. create 모드에서는 사용되지 않습니다. */
    schedule?: Schedule | null
    /** create 모드 초기값 — `time-slot-select` payload를 그대로 전달하세요. */
    initialStart?: Date
    initialEnd?: Date
    /** `participantId` ↔ 이름 조회 및 `buildScheduleFromDraft`에 사용됩니다. */
    participants: Participant[]
    /** ID 충돌 방지용 — 현재 표시 중인 전체 일정 목록 (create 모드에서만 사용) */
    existingSchedules?: Schedule[]
    scheduleTypeOptions?: ScheduleTypeOption[]
  }>(),
  {
    schedule: null,
    existingSchedules: () => [],
    scheduleTypeOptions: () => SCHEDULE_TYPE_OPTIONS,
  },
)

const emit = defineEmits<{
  close: []
  submit: [schedule: Schedule]
  delete: [scheduleId: string]
}>()

interface FormState {
  title: string
  type: string
  participantId: string
  start: Date
  end: Date
  allDay: boolean
  recurrenceFreq: 'none' | RecurrenceFrequency
  recurrenceInterval: number
  recurrenceByWeekday: number[]
  recurrenceEndMode: RecurrenceEndMode
  recurrenceCount: number
  recurrenceUntil: Date | null
  /** UI에 노출하지 않는 기존 단일 회차 삭제 예외 — 시리즈 저장 시 보존한다 */
  recurrenceExceptions: string[]
}

function defaultStart(): Date {
  return props.initialStart ?? new Date()
}

function defaultEnd(): Date {
  return props.initialEnd ?? new Date(defaultStart().getTime() + 60 * 60 * 1000)
}

function buildInitialForm(): FormState {
  if (props.mode === 'edit' && props.schedule) {
    const rule = props.schedule.recurrence
    return {
      title: props.schedule.title,
      type: props.schedule.type,
      participantId: props.schedule.participantId,
      start: props.schedule.start,
      end: props.schedule.end,
      allDay: props.schedule.allDay ?? false,
      recurrenceFreq: rule?.freq ?? 'none',
      recurrenceInterval: rule?.interval ?? 1,
      recurrenceByWeekday: rule?.byWeekday ? [...rule.byWeekday] : [],
      recurrenceEndMode: rule?.count !== undefined ? 'count' : rule?.until ? 'until' : 'never',
      recurrenceCount: rule?.count ?? 5,
      recurrenceUntil: rule?.until ?? null,
      recurrenceExceptions: rule?.exceptions ? [...rule.exceptions] : [],
    }
  }

  const start = defaultStart()
  return {
    title: '',
    type: props.scheduleTypeOptions[0]?.type ?? '',
    participantId: props.participants[0]?.id ?? '',
    start,
    end: defaultEnd(),
    allDay: false,
    recurrenceFreq: 'none',
    recurrenceInterval: 1,
    recurrenceByWeekday: [start.getDay()],
    recurrenceEndMode: 'never',
    recurrenceCount: 5,
    recurrenceUntil: null,
    recurrenceExceptions: [],
  }
}

const form = reactive<FormState>(buildInitialForm())

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      Object.assign(form, buildInitialForm())
    }
  },
)

const dialogAriaLabel = computed(() => (props.mode === 'edit' ? '일정 수정' : '일정 생성'))
const titleError = computed(() => (form.title.trim().length === 0 ? '제목을 입력하세요.' : null))
const rangeError = computed(() =>
  form.end.getTime() < form.start.getTime() ? '종료가 시작보다 빠를 수 없습니다.' : null,
)
const isValid = computed(() => !titleError.value && !rangeError.value)
const isRecurring = computed(() => form.recurrenceFreq !== 'none')
const recurrenceIntervalUnitLabel = computed(() => {
  switch (form.recurrenceFreq) {
    case 'daily':
      return '일마다'
    case 'weekly':
      return '주마다'
    case 'monthly':
      return '월마다'
    case 'yearly':
      return '년마다'
    default:
      return ''
  }
})

function toggleRecurrenceWeekday(weekday: number) {
  form.recurrenceByWeekday = form.recurrenceByWeekday.includes(weekday)
    ? form.recurrenceByWeekday.filter((day) => day !== weekday)
    : [...form.recurrenceByWeekday, weekday].sort((a, b) => a - b)
}

function buildRecurrence(): RecurrenceRule | undefined {
  if (form.recurrenceFreq === 'none') {
    return undefined
  }

  const rule: RecurrenceRule = {
    freq: form.recurrenceFreq,
    interval: Math.max(1, form.recurrenceInterval || 1),
  }

  if (form.recurrenceFreq === 'weekly' && form.recurrenceByWeekday.length > 0) {
    rule.byWeekday = [...form.recurrenceByWeekday]
  }
  if (form.recurrenceEndMode === 'count') {
    rule.count = Math.max(1, form.recurrenceCount || 1)
  }
  if (form.recurrenceEndMode === 'until' && form.recurrenceUntil) {
    rule.until = form.recurrenceUntil
  }
  if (form.recurrenceExceptions.length > 0) {
    rule.exceptions = [...form.recurrenceExceptions]
  }

  return rule
}

function onRecurrenceUntilChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  form.recurrenceUntil = value
    ? withDateKeepingTime(form.recurrenceUntil ?? form.start, value)
    : null
}

function withDateKeepingTime(base: Date, dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  const next = new Date(base)
  next.setFullYear(year ?? next.getFullYear(), (month ?? 1) - 1, day ?? 1)
  return next
}

function combineDateAndTime(base: Date, timeValue: string): Date {
  const [hours, minutes] = timeValue.split(':').map(Number)
  const next = new Date(base)
  next.setHours(hours ?? 0, minutes ?? 0, 0, 0)
  return next
}

function onStartDateChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (value) form.start = withDateKeepingTime(form.start, value)
}

function onStartTimeChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (value) form.start = combineDateAndTime(form.start, value)
}

function onEndDateChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (value) form.end = withDateKeepingTime(form.end, value)
}

function onEndTimeChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (value) form.end = combineDateAndTime(form.end, value)
}

function handleSubmit() {
  if (!isValid.value) {
    return
  }

  const draft: ScheduleDraft = {
    id: props.mode === 'edit' ? (props.schedule?.id ?? undefined) : undefined,
    title: form.title,
    type: form.type,
    participantId: form.participantId,
    start: form.start,
    end: form.end,
    allDay: form.allDay,
    recurrence: buildRecurrence(),
  }

  const built = buildScheduleFromDraft(draft, props.participants, props.existingSchedules)
  emit('submit', built)
}

function handleDelete() {
  if (props.mode === 'edit' && props.schedule) {
    emit('delete', props.schedule.id)
  }
}
</script>

<template>
  <Dialog
    :open="open"
    :ariaLabel="dialogAriaLabel"
    panel-class="schedule-form-dialog"
    @close="emit('close')"
  >
    <form class="schedule-form" @submit.prevent="handleSubmit">
      <header class="schedule-form-header">
        <h2 class="schedule-form-title">{{ dialogAriaLabel }}</h2>
      </header>

      <div class="schedule-form-body">
        <label class="schedule-form-field">
          <span class="schedule-form-label">제목</span>
          <input v-model="form.title" type="text" class="schedule-form-input" required />
        </label>

        <label class="schedule-form-field">
          <span class="schedule-form-label">유형</span>
          <select v-model="form.type" class="schedule-form-input">
            <option v-for="option in scheduleTypeOptions" :key="option.type" :value="option.type">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="schedule-form-field">
          <span class="schedule-form-label">참가자</span>
          <select v-model="form.participantId" class="schedule-form-input">
            <option
              v-for="participant in participants"
              :key="participant.id"
              :value="participant.id"
            >
              {{ participant.name }}
            </option>
          </select>
        </label>

        <label class="schedule-form-checkbox">
          <input v-model="form.allDay" type="checkbox" />
          <span>종일</span>
        </label>

        <div class="schedule-form-row">
          <label class="schedule-form-field">
            <span class="schedule-form-label">시작</span>
            <input
              type="date"
              class="schedule-form-input"
              :value="toDateKey(form.start)"
              @change="onStartDateChange"
            />
          </label>
          <label v-if="!form.allDay" class="schedule-form-field schedule-form-field--time">
            <span class="schedule-form-label">시간</span>
            <input
              type="time"
              class="schedule-form-input"
              :value="formatTime(form.start)"
              @change="onStartTimeChange"
            />
          </label>
        </div>

        <div class="schedule-form-row">
          <label class="schedule-form-field">
            <span class="schedule-form-label">종료</span>
            <input
              type="date"
              class="schedule-form-input"
              :value="toDateKey(form.end)"
              @change="onEndDateChange"
            />
          </label>
          <label v-if="!form.allDay" class="schedule-form-field schedule-form-field--time">
            <span class="schedule-form-label">시간</span>
            <input
              type="time"
              class="schedule-form-input"
              :value="formatTime(form.end)"
              @change="onEndTimeChange"
            />
          </label>
        </div>

        <label class="schedule-form-field">
          <span class="schedule-form-label">반복</span>
          <select v-model="form.recurrenceFreq" class="schedule-form-input">
            <option value="none">반복 안 함</option>
            <option value="daily">매일</option>
            <option value="weekly">매주</option>
            <option value="monthly">매월</option>
            <option value="yearly">매년</option>
          </select>
        </label>

        <div v-if="isRecurring" class="schedule-form-recurrence">
          <div class="schedule-form-row">
            <label class="schedule-form-field schedule-form-field--interval">
              <span class="schedule-form-label">간격</span>
              <input
                v-model.number="form.recurrenceInterval"
                type="number"
                min="1"
                class="schedule-form-input"
              />
            </label>
            <span class="schedule-form-interval-unit">{{ recurrenceIntervalUnitLabel }}</span>
          </div>

          <div v-if="form.recurrenceFreq === 'weekly'" class="schedule-form-weekdays">
            <button
              v-for="(label, weekday) in RECURRENCE_WEEKDAY_LABELS"
              :key="weekday"
              type="button"
              class="schedule-form-weekday"
              :class="{ active: form.recurrenceByWeekday.includes(weekday) }"
              :aria-pressed="form.recurrenceByWeekday.includes(weekday)"
              @click="toggleRecurrenceWeekday(weekday)"
            >
              {{ label }}
            </button>
          </div>

          <fieldset class="schedule-form-end">
            <legend class="schedule-form-label">종료</legend>
            <label class="schedule-form-radio">
              <input v-model="form.recurrenceEndMode" type="radio" value="never" />
              <span>없음</span>
            </label>
            <label class="schedule-form-radio">
              <input v-model="form.recurrenceEndMode" type="radio" value="count" />
              <span>
                <input
                  v-model.number="form.recurrenceCount"
                  type="number"
                  min="1"
                  class="schedule-form-input schedule-form-input--inline"
                  :disabled="form.recurrenceEndMode !== 'count'"
                  @focus="form.recurrenceEndMode = 'count'"
                />
                회 반복
              </span>
            </label>
            <label class="schedule-form-radio">
              <input v-model="form.recurrenceEndMode" type="radio" value="until" />
              <span>
                <input
                  type="date"
                  class="schedule-form-input schedule-form-input--inline"
                  :value="form.recurrenceUntil ? toDateKey(form.recurrenceUntil) : ''"
                  :disabled="form.recurrenceEndMode !== 'until'"
                  @focus="form.recurrenceEndMode = 'until'"
                  @change="onRecurrenceUntilChange"
                />
                까지
              </span>
            </label>
          </fieldset>
        </div>

        <p v-if="titleError" class="schedule-form-error">{{ titleError }}</p>
        <p v-else-if="rangeError" class="schedule-form-error">{{ rangeError }}</p>
      </div>

      <footer class="schedule-form-footer">
        <button
          v-if="mode === 'edit'"
          type="button"
          class="schedule-form-delete"
          @click="handleDelete"
        >
          삭제
        </button>
        <div class="schedule-form-footer-spacer" />
        <Button type="button" @click="emit('close')">취소</Button>
        <Button type="submit" weight="bold" :disabled="!isValid">
          {{ mode === 'edit' ? '저장' : '생성' }}
        </Button>
      </footer>
    </form>
  </Dialog>
</template>

<style scoped>
.schedule-form {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.schedule-form-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--vp-calendar-border);
}

.schedule-form-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-color-text);
}

.schedule-form-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  overflow-y: auto;
}

.schedule-form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.schedule-form-field--time {
  flex: 0 0 120px;
}

.schedule-form-row {
  display: flex;
  gap: 8px;
}

.schedule-form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-color-text-secondary);
}

.schedule-form-input {
  padding: 6px 8px;
  font-size: 13px;
  border: 1px solid var(--vp-color-border);
  border-radius: 4px;
  background: var(--vp-color-bg);
  color: var(--vp-color-text);
  box-sizing: border-box;
}

.schedule-form-input:focus-visible {
  outline: var(--vp-focus-ring);
  outline-offset: 1px;
}

.schedule-form-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--vp-color-text);
}

.schedule-form-recurrence {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--vp-color-border);
  border-radius: 4px;
  background: var(--vp-color-bg-subtle, transparent);
}

.schedule-form-field--interval {
  flex: 0 0 80px;
}

.schedule-form-interval-unit {
  align-self: flex-end;
  padding-bottom: 6px;
  font-size: 13px;
  color: var(--vp-color-text);
}

.schedule-form-weekdays {
  display: flex;
  gap: 4px;
}

.schedule-form-weekday {
  flex: 1;
  padding: 4px 0;
  font-size: 12px;
  border: 1px solid var(--vp-color-border);
  border-radius: 4px;
  background: var(--vp-color-bg);
  color: var(--vp-color-text);
  cursor: pointer;
}

.schedule-form-weekday.active {
  border-color: var(--vp-color-primary, #1565c0);
  background: var(--vp-color-primary-subtle, #e3f2fd);
  color: var(--vp-color-primary, #1565c0);
  font-weight: 600;
}

.schedule-form-weekday:focus-visible {
  outline: var(--vp-focus-ring);
  outline-offset: 1px;
}

.schedule-form-end {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  border: none;
}

.schedule-form-radio {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--vp-color-text);
}

.schedule-form-input--inline {
  width: auto;
  display: inline-block;
  padding: 2px 6px;
}

.schedule-form-error {
  margin: 0;
  font-size: 12px;
  color: var(--vp-color-danger);
}

.schedule-form-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--vp-calendar-border);
}

.schedule-form-footer-spacer {
  flex: 1;
}

.schedule-form-delete {
  border: 1px solid var(--vp-color-danger);
  background: var(--vp-color-danger-subtle);
  color: var(--vp-color-danger);
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  padding: 6px 10px;
}

.schedule-form-delete:hover {
  filter: brightness(0.97);
}

.schedule-form-delete:focus-visible {
  outline: var(--vp-focus-ring);
  outline-offset: 1px;
}
</style>
