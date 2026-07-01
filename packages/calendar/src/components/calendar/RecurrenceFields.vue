<script setup lang="ts">
import { computed } from 'vue'
import type { RecurrenceFrequency } from '@/types/schedule'
import { withDateKeepingTime } from '@/utils/scheduleForm'
import { toDateKey } from '@/utils/date'

type RecurrenceEndMode = 'never' | 'count' | 'until'

const RECURRENCE_WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

const props = defineProps<{
  /** "until 미지정" 상태에서 종료일 선택 시 기준 시각(년/월/일 외 시:분:초) — 일정 시작 시각 */
  start: Date
}>()

const freq = defineModel<'none' | RecurrenceFrequency>('freq', { required: true })
const interval = defineModel<number>('interval', { required: true })
const byWeekday = defineModel<number[]>('byWeekday', { required: true })
const endMode = defineModel<RecurrenceEndMode>('endMode', { required: true })
const count = defineModel<number>('count', { required: true })
const until = defineModel<Date | null>('until', { required: true })

const isRecurring = computed(() => freq.value !== 'none')
const intervalUnitLabel = computed(() => {
  switch (freq.value) {
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

function toggleWeekday(weekday: number) {
  byWeekday.value = byWeekday.value.includes(weekday)
    ? byWeekday.value.filter((day) => day !== weekday)
    : [...byWeekday.value, weekday].sort((a, b) => a - b)
}

function onUntilChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  until.value = value ? withDateKeepingTime(until.value ?? props.start, value) : null
}
</script>

<template>
  <label class="schedule-form-field">
    <span class="schedule-form-label">반복</span>
    <select v-model="freq" class="schedule-form-input">
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
        <input v-model.number="interval" type="number" min="1" class="schedule-form-input" />
      </label>
      <span class="schedule-form-interval-unit">{{ intervalUnitLabel }}</span>
    </div>

    <div v-if="freq === 'weekly'" class="schedule-form-weekdays">
      <button
        v-for="(label, weekday) in RECURRENCE_WEEKDAY_LABELS"
        :key="weekday"
        type="button"
        class="schedule-form-weekday"
        :class="{ active: byWeekday.includes(weekday) }"
        :aria-pressed="byWeekday.includes(weekday)"
        @click="toggleWeekday(weekday)"
      >
        {{ label }}
      </button>
    </div>

    <fieldset class="schedule-form-end">
      <legend class="schedule-form-label">종료</legend>
      <label class="schedule-form-radio">
        <input v-model="endMode" type="radio" value="never" />
        <span>없음</span>
      </label>
      <label class="schedule-form-radio">
        <input v-model="endMode" type="radio" value="count" />
        <span>
          <input
            v-model.number="count"
            type="number"
            min="1"
            class="schedule-form-input schedule-form-input--inline"
            :disabled="endMode !== 'count'"
            @focus="endMode = 'count'"
          />
          회 반복
        </span>
      </label>
      <label class="schedule-form-radio">
        <input v-model="endMode" type="radio" value="until" />
        <span>
          <input
            type="date"
            class="schedule-form-input schedule-form-input--inline"
            :value="until ? toDateKey(until) : ''"
            :disabled="endMode !== 'until'"
            @focus="endMode = 'until'"
            @change="onUntilChange"
          />
          까지
        </span>
      </label>
    </fieldset>
  </div>
</template>

<style scoped>
.schedule-form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
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
</style>
