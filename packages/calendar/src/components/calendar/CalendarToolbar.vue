<script setup lang="ts">
import { SegmentedControl } from '@vuepkg/ui'
import type { CalendarContext, CalendarView } from '@/types'

defineProps<{
  calendar: CalendarContext
}>()

const emit = defineEmits<{
  'view-change': [view: CalendarView]
}>()

const viewTabs: Array<{ value: CalendarView; label: string }> = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
  { value: 'list', label: 'List' },
]

function handleViewSelect(view: string) {
  const found = viewTabs.find((t) => t.value === view)
  if (found) emit('view-change', found.value)
}
</script>

<template>
  <div class="calendar-toolbar">
    <SegmentedControl
      :options="viewTabs"
      :model-value="calendar.state.currentView"
      ariaLabel="캘린더 보기 선택"
      @update:model-value="handleViewSelect"
    />
  </div>
</template>

<style scoped>
.calendar-toolbar {
  display: flex;
  align-items: center;
  padding: var(--vp-toolbar-padding);
  border-bottom: 1px solid var(--vp-toolbar-border);
  background: var(--vp-toolbar-bg);
}

@media (max-width: 480px) {
  .calendar-toolbar {
    padding: 8px;
  }
}
</style>
