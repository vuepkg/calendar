<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CalendarMonthNav from '../CalendarMonthNav.vue'
import type {
  CalendarContext,
  CalendarListRow,
  CalendarNavigateAction,
  CalendarScheduleClickPayload,
} from '@/types'
import { toDateKey } from '@/utils/date'

const PAGE_SIZE = 10

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
const totalPages = computed(() => Math.max(1, Math.ceil(listRows.value.length / PAGE_SIZE)))
const pageRows = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return listRows.value.slice(start, start + PAGE_SIZE)
})

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

    <div class="list-table-wrapper">
      <table class="list-table">
        <thead>
          <tr>
            <th class="col-no">No</th>
            <th class="col-title">Title</th>
            <th class="col-type">Type</th>
            <th class="col-participant">Participant</th>
            <th class="col-period">Period</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in pageRows"
            :key="row.no"
            class="list-row"
            :class="{ striped: index % 2 === 1 }"
            tabindex="0"
            @click="onRowClick(row)"
            @keydown.enter.prevent="onRowClick(row)"
            @keydown.space.prevent="onRowClick(row)"
          >
            <td class="col-no">{{ row.no }}</td>
            <td class="col-title">{{ row.title }}</td>
            <td class="col-type">{{ row.scheduleType }}</td>
            <td class="col-participant">{{ row.participant }}</td>
            <td class="col-period">{{ row.period }}</td>
          </tr>
          <tr v-if="pageRows.length === 0" class="list-empty">
            <td colspan="5">일정이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="list-pagination">
      <button
        type="button"
        class="page-btn"
        :disabled="currentPage === 1"
        aria-label="Previous page"
        @click="currentPage--"
      >
        ‹
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button
        type="button"
        class="page-btn"
        :disabled="currentPage === totalPages"
        aria-label="Next page"
        @click="currentPage++"
      >
        ›
      </button>
    </div>
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
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  background: #eff6ff;
  color: #1e3a8a;
  font-size: 12px;
  flex-shrink: 0;
}

.clear-filter-btn {
  border: 1px solid #93c5fd;
  background: #fff;
  color: #1d4ed8;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}

.list-table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.list-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 12px;
  color: #334155;
}

.list-table thead tr {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.list-table th {
  padding: 8px 10px;
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
}

.list-table td {
  padding: 7px 10px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.list-row {
  cursor: pointer;
  transition: background 0.1s;
}

.list-row:hover {
  background: #f0f9ff;
}

.list-row:focus-visible {
  outline: 2px solid #0277bd;
  outline-offset: -2px;
}

.list-row.striped {
  background: #fafbfc;
}

.list-row.striped:hover {
  background: #f0f9ff;
}

.list-empty td {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  cursor: default;
}

.col-no {
  width: 48px;
  color: #94a3b8;
  font-size: 11px;
}

.col-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-type {
  width: 100px;
}

.col-participant {
  width: 120px;
}

.col-period {
  width: 180px;
  white-space: nowrap;
}

.list-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 0 2px;
  flex-shrink: 0;
}

.page-btn {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
}

.page-btn:hover:not(:disabled) {
  background: #f1f5f9;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.page-info {
  font-size: 12px;
  color: #475569;
  min-width: 48px;
  text-align: center;
}

@media (max-width: 768px) {
  .col-period,
  .col-type {
    display: none;
  }
}

@media (max-width: 480px) {
  .col-participant {
    display: none;
  }
}
</style>
