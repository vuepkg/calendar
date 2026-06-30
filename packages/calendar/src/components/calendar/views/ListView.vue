<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DataTable, type DataTableColumn } from '@vuepkg/ui'
import CalendarMonthNav from '../CalendarMonthNav.vue'
import type {
  CalendarContext,
  CalendarListRow,
  CalendarNavigateAction,
  CalendarScheduleClickPayload,
} from '@/types'
import { toDateKey } from '@/utils/date'

const PAGE_SIZE = 10

const columns: DataTableColumn[] = [
  { key: 'no', label: 'No', width: '48px' },
  { key: 'title', label: 'Title', ellipsis: true },
  { key: 'type', label: 'Type', width: '100px', hideBelow: 'md' },
  { key: 'participant', label: 'Participant', width: '120px', hideBelow: 'sm' },
  { key: 'period', label: 'Period', width: '180px', ellipsis: true, hideBelow: 'md' },
]

const props = defineProps<{
  calendar: CalendarContext
}>()

const emit = defineEmits<{
  'schedule-click': [payload: CalendarScheduleClickPayload]
  'list-filter-clear': []
  navigate: [action: CalendarNavigateAction]
}>()

const listRows = computed(() => props.calendar.listRows.value)
const listFilterDate = computed(() => props.calendar.state.listFilterDate)
const listFilterLabel = computed(() =>
  listFilterDate.value ? toDateKey(listFilterDate.value) : '',
)
const monthLabel = computed(() => props.calendar.monthLabel.value)

const currentPage = ref(1)

watch(listRows, () => {
  currentPage.value = 1
})

function emitMonthNavigate(action: 'prev-month' | 'next-month') {
  if (listFilterDate.value) {
    emit('list-filter-clear')
  }
  emit('navigate', action)
}

function onRowClick(row: CalendarListRow) {
  emit('schedule-click', {
    schedule: row.schedule,
    source: 'list-row',
    date: row.schedule.start,
  })
}
</script>

<template>
  <div class="list-view calendar-scroll">
    <CalendarMonthNav
      :label="monthLabel"
      @prev="emitMonthNavigate('prev-month')"
      @next="emitMonthNavigate('next-month')"
    />

    <div v-if="listFilterDate" class="list-filter-bar">
      <span>Filtered by {{ listFilterLabel }}</span>
      <button type="button" class="clear-filter-btn" @click="emit('list-filter-clear')">
        Clear filter
      </button>
    </div>

    <DataTable
      v-model:page="currentPage"
      :columns="columns"
      :rows="listRows"
      :rowKey="(row: CalendarListRow) => row.no"
      :pageSize="PAGE_SIZE"
      ariaLabel="Schedule list"
      emptyMessage="일정이 없습니다."
      @row-click="onRowClick"
    >
      <template #cell-no="{ row }: { row: CalendarListRow }"
        ><span class="col-no-text">{{ row.no }}</span></template
      >
      <template #cell-title="{ row }: { row: CalendarListRow }">{{ row.title }}</template>
      <template #cell-type="{ row }: { row: CalendarListRow }">{{ row.scheduleType }}</template>
      <template #cell-participant="{ row }: { row: CalendarListRow }">{{
        row.participant
      }}</template>
      <template #cell-period="{ row }: { row: CalendarListRow }">{{ row.period }}</template>
    </DataTable>
  </div>
</template>

<style scoped>
.list-view {
  padding: 12px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.list-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  padding: 8px 12px;
  border: 1px solid var(--vp-list-filter-border);
  border-radius: var(--vp-chip-radius);
  background: var(--vp-list-filter-bg);
  color: var(--vp-list-filter-text);
  font-size: 12px;
  flex-shrink: 0;
}

.clear-filter-btn {
  border: 1px solid var(--vp-list-filter-btn-border);
  background: var(--vp-color-bg);
  color: var(--vp-list-filter-btn-text);
  border-radius: var(--vp-chip-radius);
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}

.col-no-text {
  color: var(--vp-color-text-muted);
  font-size: 11px;
}
</style>
