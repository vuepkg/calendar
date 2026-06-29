<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import type { RectBounds } from '@/types/layout'
import type { Schedule } from '@/types/schedule'
import { toDateKey } from '@/utils/date'
import {
  computeMonthOverflowPopoverLayout,
  computePopoverMaxSize,
  formatOverflowScheduleLabel,
  MONTH_OVERFLOW_POPOVER_DEFAULTS,
  resolvePopoverBounds,
} from '@/utils/month'

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

const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref({
  top: '0px',
  left: '0px',
  maxWidth: '320px',
  maxHeight: '360px',
})

const dateLabel = computed(() => (props.date ? toDateKey(props.date) : ''))
const highlightedIds = computed(() => new Set(props.highlightedScheduleIds))

function isHighlighted(schedule: Schedule): boolean {
  return highlightedIds.value.has(schedule.id)
}

function updatePanelLayout() {
  if (!props.open || !panelRef.value) {
    return
  }

  const bounds = resolvePopoverBounds(props.containerBounds, window.innerWidth, window.innerHeight)
  const size = computePopoverMaxSize(bounds, props.anchorTop, {
    containerHeightRatio: props.containerBounds
      ? MONTH_OVERFLOW_POPOVER_DEFAULTS.containerHeightRatio
      : undefined,
  })
  const panelRect = panelRef.value.getBoundingClientRect()
  const panelWidth = panelRect.width > 0 ? panelRect.width : size.maxWidth
  const panelHeight = panelRect.height > 0 ? panelRect.height : Math.min(size.maxHeight, 160)

  const layout = computeMonthOverflowPopoverLayout({
    anchorTop: props.anchorTop,
    anchorLeft: props.anchorLeft,
    anchorBottom: props.anchorBottom,
    panelWidth,
    panelHeight,
    container: props.containerBounds,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  })

  panelStyle.value = {
    top: `${layout.top}px`,
    left: `${layout.left}px`,
    maxWidth: `${layout.maxWidth}px`,
    maxHeight: `${layout.maxHeight}px`,
  }
}

function onBackdropClick() {
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

watch(
  () =>
    [
      props.open,
      props.anchorTop,
      props.anchorLeft,
      props.anchorBottom,
      props.containerBounds,
      props.schedules.length,
    ] as const,
  async () => {
    if (!props.open) {
      return
    }

    await Promise.resolve()
    updatePanelLayout()
    await Promise.resolve()
    updatePanelLayout()
  },
  { immediate: true },
)

function attachWindowListeners() {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', updatePanelLayout)
}

function detachWindowListeners() {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', updatePanelLayout)
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      attachWindowListeners()
      void Promise.resolve().then(updatePanelLayout)
    } else {
      detachWindowListeners()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  detachWindowListeners()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open && date" class="month-overflow-popover-root">
      <button
        type="button"
        class="month-overflow-backdrop"
        aria-label="Close schedule popover"
        @click="onBackdropClick"
      />

      <section
        ref="panelRef"
        class="month-overflow-popover"
        role="dialog"
        aria-modal="true"
        :aria-label="`${dateLabel} schedules`"
        :style="panelStyle"
        @click.stop
      >
        <header class="month-overflow-header">
          <h3 class="month-overflow-title">{{ dateLabel }}</h3>
          <button
            type="button"
            class="month-overflow-close"
            aria-label="Close"
            @click="emit('close')"
          >
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
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.month-overflow-popover-root {
  position: fixed;
  inset: 0;
  z-index: var(--vp-popover-z-index);
  pointer-events: none;
}

.month-overflow-backdrop {
  position: absolute;
  inset: 0;
  border: none;
  background: transparent;
  pointer-events: auto;
  cursor: default;
}

.month-overflow-popover {
  position: fixed;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-popover-border);
  border-radius: var(--vp-calendar-radius);
  background: var(--vp-popover-bg);
  box-shadow: var(--vp-popover-shadow);
  pointer-events: auto;
  overflow: hidden;
  box-sizing: border-box;
}

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
