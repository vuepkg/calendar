<script setup lang="ts">
import type { CalendarContext, CalendarView } from '@/types'

defineProps<{
  calendar: CalendarContext
}>()

const emit = defineEmits<{
  'view-change': [view: CalendarView]
}>()

const viewTabs: Array<{ key: CalendarView; label: string }> = [
  { key: 'month', label: 'Month' },
  { key: 'week', label: 'Week' },
  { key: 'day', label: 'Day' },
  { key: 'list', label: 'List' },
]
</script>

<template>
  <div class="calendar-toolbar">
    <div class="view-tabs" role="group" aria-label="캘린더 보기 선택">
      <button
        v-for="tab in viewTabs"
        :key="tab.key"
        type="button"
        class="view-tab"
        :class="{ active: calendar.state.currentView === tab.key }"
        :aria-pressed="calendar.state.currentView === tab.key"
        @click="emit('view-change', tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.calendar-toolbar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #d7dee8;
  background: #fff;
}

.view-tabs {
  display: inline-flex;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
  background: #f1f5f9;
  padding: 3px;
  gap: 2px;
}

.view-tab {
  border: none;
  background: transparent;
  color: #64748b;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  transition:
    background 0.15s,
    color 0.15s,
    box-shadow 0.15s;
  white-space: nowrap;
}

.view-tab:hover:not(.active) {
  background: #e2e8f0;
  color: #334155;
}

.view-tab.active {
  background: #fff;
  color: #0f172a;
  font-weight: 600;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
}

.view-tab:focus-visible {
  outline: 2px solid #0277bd;
  outline-offset: 1px;
}

@media (max-width: 480px) {
  .calendar-toolbar {
    padding: 8px;
  }

  .view-tabs {
    width: 100%;
  }

  .view-tab {
    flex: 1;
    padding: 6px 4px;
    font-size: 11px;
    text-align: center;
  }
}
</style>
