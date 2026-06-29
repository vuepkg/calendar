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
  padding: var(--vp-toolbar-padding);
  border-bottom: 1px solid var(--vp-toolbar-border);
  background: var(--vp-toolbar-bg);
}

.view-tabs {
  display: inline-flex;
  border: 1px solid var(--vp-tab-track-border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--vp-tab-track-bg);
  padding: 3px;
  gap: 2px;
}

.view-tab {
  border: none;
  background: transparent;
  color: var(--vp-tab-text);
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  transition:
    background var(--vp-transition-base),
    color var(--vp-transition-base),
    box-shadow var(--vp-transition-base);
  white-space: nowrap;
}

.view-tab:hover:not(.active) {
  background: var(--vp-tab-bg-hover);
  color: var(--vp-tab-text-hover);
}

.view-tab.active {
  background: var(--vp-tab-active-bg);
  color: var(--vp-tab-active-text);
  font-weight: 600;
  box-shadow: var(--vp-tab-active-shadow);
}

.view-tab:focus-visible {
  outline: var(--vp-focus-ring);
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
