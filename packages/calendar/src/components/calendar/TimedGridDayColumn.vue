<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { TimeSlotSelection } from '@/composables/useTimeSlotSelection'
import type { ScheduleClickSource } from '@/types/calendarEvents'
import type { CurrentTimeIndicator, TimedLayoutItem } from '@/types/layout'
import type { Schedule } from '@/types/schedule'
import type { EventSlotProps } from '@/types/slots'
import { formatTime } from '@/utils/date'
import ScheduleEventChip from './ScheduleEventChip.vue'

defineSlots<{
  event?: (props: EventSlotProps) => unknown
}>()

interface GhostInfo {
  schedule: Schedule
  style: CSSProperties
  typeStyle: { color: string; backgroundColor: string }
}

defineProps<{
  day: Date
  isLastColumn: boolean
  gridHeight: number
  layout: TimedLayoutItem[]
  currentTime: CurrentTimeIndicator
  /** 이 열(day)에 해당하는 선택 슬롯 — 다른 날짜면 `null` */
  selectedSlot: TimeSlotSelection | null
  selectionStyle: (start: Date, end: Date) => { top: string; height: string }
  /** 이 열에서 진행 중인 드래그 ghost — 다른 날짜면 `null` */
  ghost: GhostInfo | null
  /** 드래그 중인 일정 id — 원본 위치 dimming 판단용 */
  draggingScheduleId: string | null
  isSlotDragging: boolean
  isEventDragging: boolean
  showParticipant: boolean
  getTypeStyle: (type: Schedule['type']) => { color: string; backgroundColor: string }
  /** `event` slot 노출용 — 실제 클릭 emit은 부모(TimedGrid)의 pointerup 로직이 처리 (REV-A1) */
  timedScheduleSource: ScheduleClickSource
}>()

const emit = defineEmits<{
  pointerdown: [event: PointerEvent]
  pointermove: [event: PointerEvent]
  pointerup: [event: PointerEvent]
  pointercancel: []
  'move-pointerdown': [event: PointerEvent, schedule: Schedule]
  'resize-pointerdown': [event: PointerEvent, schedule: Schedule]
}>()
</script>

<template>
  <div
    class="day-column"
    :class="{
      'is-last-column': isLastColumn,
      'is-slot-dragging': isSlotDragging,
      'is-event-dragging': isEventDragging,
    }"
    :style="{ height: `${gridHeight}px` }"
    @pointerdown="emit('pointerdown', $event)"
    @pointermove="emit('pointermove', $event)"
    @pointerup="emit('pointerup', $event)"
    @pointercancel="emit('pointercancel')"
  >
    <!-- 시간 슬롯 선택 오버레이 -->
    <div
      v-if="selectedSlot"
      class="time-slot-selection"
      :style="selectionStyle(selectedSlot.start, selectedSlot.end)"
      aria-hidden="true"
    />

    <!-- 이벤트 드래그 ghost -->
    <div
      v-if="ghost"
      class="drag-ghost"
      :style="{
        ...ghost.style,
        backgroundColor: ghost.typeStyle.backgroundColor,
        borderColor: ghost.typeStyle.color,
      }"
      aria-hidden="true"
    >
      <span class="drag-ghost-title">{{ ghost.schedule.title }}</span>
    </div>

    <div
      v-if="currentTime.visible"
      class="current-time-line"
      :style="{ top: `${currentTime.topPercent}%` }"
    >
      <span class="current-time-badge">{{ currentTime.label }}</span>
    </div>

    <div
      v-for="item in layout"
      :key="item.schedule.id"
      class="timed-event"
      :class="{ 'is-dragging-origin': draggingScheduleId === item.schedule.id }"
      :style="{
        top: `${item.top}%`,
        height: `${item.height}%`,
        left: `calc(${item.left}% + 2px)`,
        width: `calc(${item.width}% - 4px)`,
      }"
      @pointerdown.stop="emit('move-pointerdown', $event, item.schedule)"
      @click.stop
    >
      <slot
        name="event"
        :schedule="item.schedule"
        :source="timedScheduleSource"
        :type-style="getTypeStyle(item.schedule.type)"
        :show-participant="showParticipant"
      >
        <ScheduleEventChip
          :schedule="item.schedule"
          v-bind="getTypeStyle(item.schedule.type)"
          :show-participant="showParticipant"
        />
      </slot>
      <span class="inline-time">
        {{ formatTime(item.schedule.start) }} ~ {{ formatTime(item.schedule.end) }}
      </span>
      <!-- 리사이즈 핸들 (하단) -->
      <div
        class="resize-handle"
        @pointerdown.stop="emit('resize-pointerdown', $event, item.schedule)"
      />
    </div>
  </div>
</template>

<style scoped>
.day-column {
  position: relative;
  border-right: 1px solid var(--vp-grid-line);
  background-image: linear-gradient(to bottom, var(--vp-grid-hour-stripe) 1px, transparent 1px);
  background-size: 100% var(--hour-height);
  cursor: pointer;
  user-select: none;
}

.day-column.is-slot-dragging {
  cursor: ns-resize;
}

.day-column.is-event-dragging {
  cursor: grabbing;
}

.day-column.is-last-column {
  border-right: none;
}

.time-slot-selection {
  position: absolute;
  left: 2px;
  right: 2px;
  z-index: 0;
  border: 2px solid var(--vp-color-danger);
  background: var(--vp-color-danger-subtle);
  box-sizing: border-box;
  pointer-events: none;
}

.drag-ghost {
  position: absolute;
  left: 2px;
  right: 2px;
  z-index: 4;
  border: 2px dashed;
  border-radius: 4px;
  opacity: 0.85;
  box-sizing: border-box;
  pointer-events: none;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  overflow: hidden;
}

.drag-ghost-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timed-event {
  position: absolute;
  z-index: 1;
  overflow: hidden;
  cursor: grab;
}

.timed-event.is-dragging-origin {
  opacity: 0.4;
}

.day-column.is-event-dragging .timed-event {
  cursor: grabbing;
}

.inline-time {
  display: none;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  cursor: ns-resize;
  z-index: 2;
}

.current-time-line {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 3;
  border-top: 2px solid var(--vp-current-time-color);
  pointer-events: none;
}

.current-time-line::before {
  content: '';
  position: absolute;
  left: -5px;
  top: -5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-current-time-color);
}

.current-time-badge {
  position: absolute;
  left: calc(-1 * var(--gutter-width));
  top: -10px;
  width: calc(var(--gutter-width) - 8px);
  text-align: right;
  font-size: 10px;
  font-weight: 700;
  color: var(--vp-today-badge-text);
  background: var(--vp-current-time-color);
  border-radius: 4px;
  padding: 2px 6px;
  box-sizing: border-box;
}
</style>
