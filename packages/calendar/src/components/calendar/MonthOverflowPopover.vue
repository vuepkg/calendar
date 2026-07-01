<script setup lang="ts">
import { computed } from 'vue'
import type { RectBounds } from '@vuepkg/core'
import { Popover } from '@vuepkg/ui'
import type { Schedule } from '@/types/schedule'
import { toDateKey } from '@/utils/date'
import { formatOverflowScheduleLabel } from '@/utils/month'

const props = defineProps<{
  open: boolean
  date: Date | null
  schedules: Schedule[]
  highlightedScheduleIds: string[]
  anchorTop: number
  anchorLeft: number
  anchorBottom?: number
  /** `.schedule-calendar` 영역 — 임베디드 레이아웃에서 팝오버 크기·위치 제한 */
  containerBounds?: RectBounds | null
}>()

const emit = defineEmits<{
  close: []
  'schedule-click': [schedule: Schedule]
}>()

const dateLabel = computed(() => (props.date ? toDateKey(props.date) : ''))
const highlightedIds = computed(() => new Set(props.highlightedScheduleIds))

function isHighlighted(schedule: Schedule): boolean {
  return highlightedIds.value.has(schedule.id)
}
</script>

<template>
  <Popover
    :open="open && date !== null"
    :anchor-top="anchorTop"
    :anchor-left="anchorLeft"
    :anchor-bottom="anchorBottom"
    :container-bounds="containerBounds"
    :aria-label="`${dateLabel} schedules`"
    panel-class="month-overflow-popover"
    @close="emit('close')"
  >
    <header class="month-overflow-header">
      <h3 class="month-overflow-title">{{ dateLabel }}</h3>
      <button type="button" class="month-overflow-close" aria-label="Close" @click="emit('close')">
        ×
      </button>
    </header>

    <ul class="month-overflow-list calendar-scroll">
      <li v-for="schedule in schedules" :key="schedule.id">
        <button
          type="button"
          class="month-overflow-item"
          :class="{ highlighted: isHighlighted(schedule) }"
          @click="emit('schedule-click', schedule)"
        >
          {{ formatOverflowScheduleLabel(schedule) }}
        </button>
      </li>
    </ul>
  </Popover>
</template>

<style scoped>
.month-overflow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: var(--vp-popover-header-bg);
  border-bottom: 1px solid var(--vp-color-border);
  flex-shrink: 0;
}

.month-overflow-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-color-text);
}

.month-overflow-close {
  border: none;
  background: transparent;
  color: var(--vp-color-text-secondary);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
}

.month-overflow-close:hover {
  color: var(--vp-color-text);
}

.month-overflow-list {
  list-style: none;
  margin: 0;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: auto;
  flex: 1;
  min-height: 0;
  scrollbar-gutter: auto;
}

.month-overflow-item {
  width: 100%;
  border: none;
  border-radius: var(--vp-chip-radius);
  padding: 6px 8px;
  text-align: left;
  font-size: 11px;
  line-height: 1.35;
  color: var(--vp-color-text);
  background: var(--vp-popover-item-bg);
  cursor: pointer;
}

.month-overflow-item.highlighted {
  color: var(--vp-popover-item-highlighted-text);
  background: var(--vp-popover-item-highlighted-bg);
  font-weight: 600;
}

.month-overflow-item:hover {
  background: var(--vp-popover-item-bg-hover);
}
</style>
