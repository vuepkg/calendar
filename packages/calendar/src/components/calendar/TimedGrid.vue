<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ALL_DAY_SECTION_MAX_HEIGHT } from '@/constants/calendarView'
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR, HOUR_HEIGHT_PX } from '@/constants/calendarView'
import type {
  CalendarDateSelectPayload,
  CalendarScheduleClickPayload,
  CalendarScheduleMovePayload,
  CalendarScheduleResizePayload,
  CalendarTimeSlotSelectPayload,
  DateSelectSource,
  ScheduleClickSource,
  TimeSlotSelectSource,
} from '@/types/calendarEvents'
import type { Holiday } from '@/types/schedule'
import type { Schedule } from '@/types/schedule'
import { getAllDayRowCount, layoutWeekAllDayBars } from '@/utils/timed'
import { getCurrentTimeIndicator } from '@/utils/timed'
import { getTimedGridHeight, getTimedSchedules, layoutTimedSchedules } from '@/utils/schedule'
import { formatHourLabel, formatTime } from '@/utils/date'
import { useTimeSlotSelection } from '@/composables/useTimeSlotSelection'
import { useScheduleDrag } from '@/composables/useScheduleDrag'
import TimedGridAllDay from './TimedGridAllDay.vue'
import TimedGridHeader from './TimedGridHeader.vue'
import ScheduleEventChip from './ScheduleEventChip.vue'

const props = withDefaults(
  defineProps<{
    days: Date[]
    schedules: Schedule[]
    holidays?: Holiday[]
    getTypeStyle: (type: Schedule['type']) => { color: string; backgroundColor: string }
    showParticipant?: boolean
    showCurrentTime?: boolean
    singleDay?: boolean
    timedScheduleSource?: ScheduleClickSource
    allDayScheduleSource?: ScheduleClickSource
    dayHeaderSource?: DateSelectSource
    timeSlotSource?: TimeSlotSelectSource
  }>(),
  {
    showParticipant: false,
    showCurrentTime: false,
    singleDay: false,
    timedScheduleSource: 'week-timed',
    allDayScheduleSource: 'week-all-day-bar',
    dayHeaderSource: 'week-day-header',
    timeSlotSource: undefined,
  },
)

const emit = defineEmits<{
  'date-select': [payload: CalendarDateSelectPayload]
  'schedule-click': [payload: CalendarScheduleClickPayload]
  'time-slot-select': [payload: CalendarTimeSlotSelectPayload]
  'schedule-move': [payload: CalendarScheduleMovePayload]
  'schedule-resize': [payload: CalendarScheduleResizePayload]
}>()

const resolvedTimeSlotSource = computed<TimeSlotSelectSource>(
  () => props.timeSlotSource ?? (props.singleDay ? 'day-timed-slot' : 'week-timed-slot'),
)

const timeRange = {
  startHour: CALENDAR_START_HOUR,
  endHour: CALENDAR_END_HOUR,
  hourHeightPx: HOUR_HEIGHT_PX,
}

const slotSel = useTimeSlotSelection(
  computed(() => props.days),
  timeRange,
)
const schedDrag = useScheduleDrag(timeRange)

// 드래그 완료 직후 click 이벤트 억제
let justDragged = false

function handlePointerDown(event: PointerEvent, day: Date) {
  slotSel.onPointerDown(event, day)
}

function handlePointerMove(event: PointerEvent) {
  if (schedDrag.isDragging.value) {
    schedDrag.onPointerMove(event)
  } else {
    slotSel.onPointerMove(event)
  }
}

function handlePointerUp(event: PointerEvent) {
  if (schedDrag.isDragging.value) {
    const result = schedDrag.onPointerUp()
    if (result) {
      justDragged = true
      if (result.type === 'move') emit('schedule-move', result.payload)
      else emit('schedule-resize', result.payload)
    }
  } else {
    const slot = slotSel.onPointerUp(event)
    if (slot) {
      emit('time-slot-select', { ...slot, source: resolvedTimeSlotSource.value })
    }
  }
}

function cancelAllDrags() {
  slotSel.cancelDrag()
  schedDrag.cancelDrag()
}

function handleMovePointerDown(event: PointerEvent, schedule: Schedule, day: Date) {
  schedDrag.onMovePointerDown(event, schedule, day)
}

function handleResizePointerDown(event: PointerEvent, schedule: Schedule, day: Date) {
  schedDrag.onResizePointerDown(event, schedule, day)
}

function handleScheduleClick(schedule: Schedule, day: Date) {
  if (justDragged) {
    justDragged = false
    return
  }
  emit('schedule-click', { schedule, source: props.timedScheduleSource, date: day })
}

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined

const hourLabels = computed(() =>
  Array.from({ length: CALENDAR_END_HOUR - CALENDAR_START_HOUR + 1 }, (_, index) =>
    formatHourLabel(CALENDAR_START_HOUR + index),
  ),
)
const gridHeight = getTimedGridHeight(timeRange)
const dayCount = computed(() => props.days.length)

const allDayBars = computed(() => layoutWeekAllDayBars(props.days, props.schedules))
const allDayRowCount = computed(() => getAllDayRowCount(allDayBars.value))

const dayColumns = computed(() =>
  props.days.map((day) => {
    const timed = getTimedSchedules(props.schedules, day)
    const layout = layoutTimedSchedules(timed, day, timeRange)
    const currentTime = props.showCurrentTime
      ? getCurrentTimeIndicator(day, CALENDAR_START_HOUR, CALENDAR_END_HOUR, now.value)
      : { visible: false, topPercent: 0, label: '' }

    return { day, layout, currentTime }
  }),
)

// 드래그 중인 열의 ghost 정보
const ghostInfo = computed(() => {
  const state = schedDrag.dragState.value
  if (!state) return null
  const ghostStart = state.type === 'move' ? state.ghostStart : state.schedule.start
  const ghostEnd = state.ghostEnd
  const style = schedDrag.ghostStyle(ghostStart, ghostEnd)
  const typeStyle = props.getTypeStyle(state.schedule.type)
  return { day: state.day, schedule: state.schedule, style, typeStyle }
})

onMounted(() => {
  if (!props.showCurrentTime) {
    return
  }

  timer = setInterval(() => {
    now.value = new Date()
  }, 60_000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div
    class="timed-grid"
    :class="{
      'single-day': singleDay,
      'is-dragging': slotSel.isDragging.value,
      'is-event-dragging': schedDrag.isDragging.value,
    }"
    :style="{
      '--hour-height': `${HOUR_HEIGHT_PX}px`,
      '--day-count': String(dayCount),
      '--all-day-max-height': `${ALL_DAY_SECTION_MAX_HEIGHT}px`,
      '--all-day-rows': String(allDayRowCount),
    }"
  >
    <TimedGridHeader
      :days="days"
      :single-day="singleDay"
      :day-header-source="dayHeaderSource"
      @date-select="emit('date-select', $event)"
    />

    <TimedGridAllDay
      :days="days"
      :holidays="holidays"
      :all-day-bars="allDayBars"
      :all-day-row-count="allDayRowCount"
      :get-type-style="getTypeStyle"
      :show-participant="showParticipant"
      :all-day-schedule-source="allDayScheduleSource"
      @schedule-click="emit('schedule-click', $event)"
    />

    <div class="timed-grid-scroll calendar-scroll">
      <div class="calendar-grid-row timed-body">
        <div class="time-axis">
          <div v-for="label in hourLabels" :key="label" class="time-slot-label">
            {{ label }}
          </div>
        </div>

        <div class="calendar-days-track day-columns">
          <div
            v-for="(column, columnIndex) in dayColumns"
            :key="`body-${column.day.toISOString()}`"
            class="day-column"
            :class="{ 'is-last-column': columnIndex === dayColumns.length - 1 }"
            :style="{ height: `${gridHeight}px` }"
            @pointerdown="handlePointerDown($event, column.day)"
            @pointermove="handlePointerMove($event)"
            @pointerup="handlePointerUp($event)"
            @pointercancel="cancelAllDrags"
          >
            <!-- 시간 슬롯 선택 오버레이 -->
            <div
              v-if="
                slotSel.selectedSlot.value &&
                slotSel.selectedSlot.value.date.getTime() === column.day.getTime()
              "
              class="time-slot-selection"
              :style="
                slotSel.selectionStyle(
                  slotSel.selectedSlot.value.start,
                  slotSel.selectedSlot.value.end,
                )
              "
              aria-hidden="true"
            />

            <!-- 이벤트 드래그 ghost -->
            <div
              v-if="ghostInfo && ghostInfo.day.getTime() === column.day.getTime()"
              class="drag-ghost"
              :style="{
                ...ghostInfo.style,
                backgroundColor: ghostInfo.typeStyle.backgroundColor,
                borderColor: ghostInfo.typeStyle.color,
              }"
              aria-hidden="true"
            >
              <span class="drag-ghost-title">{{ ghostInfo.schedule.title }}</span>
            </div>

            <div
              v-if="column.currentTime.visible"
              class="current-time-line"
              :style="{ top: `${column.currentTime.topPercent}%` }"
            >
              <span class="current-time-badge">{{ column.currentTime.label }}</span>
            </div>

            <div
              v-for="item in column.layout"
              :key="item.schedule.id"
              class="timed-event"
              :class="{
                'is-dragging-origin': schedDrag.dragState.value?.schedule.id === item.schedule.id,
              }"
              :style="{
                top: `${item.top}%`,
                height: `${item.height}%`,
                left: `calc(${item.left}% + 2px)`,
                width: `calc(${item.width}% - 4px)`,
              }"
              @pointerdown.stop="handleMovePointerDown($event, item.schedule, column.day)"
              @click.stop="handleScheduleClick(item.schedule, column.day)"
            >
              <ScheduleEventChip
                :schedule="item.schedule"
                v-bind="getTypeStyle(item.schedule.type)"
                :show-participant="showParticipant"
              />
              <span class="inline-time">
                {{ formatTime(item.schedule.start) }} ~ {{ formatTime(item.schedule.end) }}
              </span>
              <!-- 리사이즈 핸들 (하단) -->
              <div
                class="resize-handle"
                @pointerdown.stop="handleResizePointerDown($event, item.schedule, column.day)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timed-grid {
  --gutter-width: 56px;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
}

.timed-grid-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.timed-body {
  width: 100%;
}

.time-axis {
  width: var(--gutter-width);
  flex-shrink: 0;
  border-right: 1px solid var(--vp-grid-line);
}

.time-slot-label {
  height: var(--hour-height);
  font-size: 10px;
  color: var(--vp-color-text-muted);
  padding-right: 6px;
  text-align: right;
  box-sizing: border-box;
}

.time-slot-label:first-child {
  padding-top: 4px;
}

.time-slot-label:not(:first-child) {
  transform: translateY(-7px);
}

.day-columns {
  position: relative;
}

.day-column {
  position: relative;
  border-right: 1px solid var(--vp-grid-line);
  background-image: linear-gradient(to bottom, var(--vp-grid-hour-stripe) 1px, transparent 1px);
  background-size: 100% var(--hour-height);
  cursor: pointer;
  user-select: none;
}

.timed-grid.is-dragging .day-column {
  cursor: ns-resize;
}

.timed-grid.is-event-dragging .day-column {
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

.timed-grid.is-event-dragging .timed-event {
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

@media (max-width: 768px) {
  .timed-grid:not(.single-day) {
    --gutter-width: 44px;
  }
}

@media (max-width: 480px) {
  .timed-grid:not(.single-day) {
    --gutter-width: 36px;
  }
}
</style>
