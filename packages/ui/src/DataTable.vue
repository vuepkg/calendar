<script setup lang="ts" generic="T">
import { computed } from 'vue'
import { useControllableState } from '@vuepkg/core'
import IconButton from './IconButton.vue'

export interface DataTableColumn {
  key: string
  label: string
  width?: string
  /** 이 폭 이하에서 컬럼을 숨김 — 'sm': 480px, 'md': 768px */
  hideBelow?: 'sm' | 'md'
  ellipsis?: boolean
}

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[]
    rows: T[]
    rowKey: (row: T) => string | number
    page?: number
    pageSize?: number
    emptyMessage?: string
    ariaLabel?: string
  }>(),
  {
    pageSize: 10,
    emptyMessage: 'No data.',
  },
)

const emit = defineEmits<{
  'update:page': [page: number]
  'row-click': [row: T]
}>()

const [page, setPage] = useControllableState(
  () => props.page,
  (value) => emit('update:page', value),
  1,
)

const totalPages = computed(() => Math.max(1, Math.ceil(props.rows.length / props.pageSize)))
const pageRows = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return props.rows.slice(start, start + props.pageSize)
})

function columnClass(column: DataTableColumn) {
  return {
    [`vp-data-table-col--hide-${column.hideBelow}`]: !!column.hideBelow,
    'vp-data-table-col--ellipsis': !!column.ellipsis,
  }
}

function goToPage(target: number) {
  setPage(Math.min(Math.max(1, target), totalPages.value))
}
</script>

<template>
  <div class="vp-data-table-wrapper">
    <table class="vp-data-table" :aria-label="ariaLabel">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="columnClass(column)"
            :style="{ width: column.width }"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in pageRows"
          :key="rowKey(row)"
          class="vp-data-table-row"
          :class="{ 'vp-data-table-row--striped': index % 2 === 1 }"
          tabindex="0"
          @click="emit('row-click', row)"
          @keydown.enter.prevent="emit('row-click', row)"
          @keydown.space.prevent="emit('row-click', row)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="columnClass(column)"
          >
            <slot :name="`cell-${column.key}`" :row="row" />
          </td>
        </tr>
        <tr v-if="pageRows.length === 0" class="vp-data-table-empty">
          <td :colspan="columns.length">{{ emptyMessage }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="totalPages > 1" class="vp-data-table-pagination">
    <IconButton
      size="sm"
      :disabled="page <= 1"
      ariaLabel="Previous page"
      @click="goToPage(page - 1)"
    >
      ‹
    </IconButton>
    <span class="vp-data-table-page-info">{{ page }} / {{ totalPages }}</span>
    <IconButton
      size="sm"
      :disabled="page >= totalPages"
      ariaLabel="Next page"
      @click="goToPage(page + 1)"
    >
      ›
    </IconButton>
  </div>
</template>

<style scoped>
.vp-data-table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.vp-data-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 12px;
  color: var(--vp-color-text-secondary);
}

.vp-data-table thead tr {
  background: var(--vp-table-header-bg);
  border-bottom: 2px solid var(--vp-grid-line);
}

.vp-data-table th {
  padding: 8px 10px;
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  color: var(--vp-color-text-muted);
  white-space: nowrap;
}

.vp-data-table td {
  padding: 7px 10px;
  border-bottom: 1px solid var(--vp-grid-line);
  vertical-align: middle;
}

.vp-data-table-row {
  cursor: pointer;
  transition: background 0.1s;
}

.vp-data-table-row:hover {
  background: var(--vp-table-row-hover-bg);
}

.vp-data-table-row:focus-visible {
  outline: var(--vp-focus-ring);
  outline-offset: -2px;
}

.vp-data-table-row--striped {
  background: var(--vp-table-row-stripe-bg);
}

.vp-data-table-row--striped:hover {
  background: var(--vp-table-row-hover-bg);
}

.vp-data-table-empty td {
  padding: 24px;
  text-align: center;
  color: var(--vp-color-text-muted);
  font-size: 13px;
  cursor: default;
}

.vp-data-table-col--ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vp-data-table-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 0 2px;
  flex-shrink: 0;
}

.vp-data-table-page-info {
  font-size: 12px;
  color: var(--vp-color-text-secondary);
  min-width: 48px;
  text-align: center;
}

@media (max-width: 768px) {
  .vp-data-table-col--hide-md {
    display: none;
  }
}

@media (max-width: 480px) {
  .vp-data-table-col--hide-sm {
    display: none;
  }
}
</style>
