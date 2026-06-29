<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ALL_DAY_SECTION_MAX_HEIGHT } from '@/constants/calendarView'
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR, HOUR_HEIGHT_PX } from '@/constants/calendarView'
import type {
  CalendarDateSelectPayload,
  CalendarScheduleClickPayload,
  CalendarTimeSlotSelectPayload,
  DateSelectSource,
  ScheduleClickSource,
  TimeSlotSelectSource,
} from '@/types/calendarEvents'
import type { Holiday } from '@/types/schedule'
import type { Schedule } from '@/types/schedule'
import { getAllDayRowCount, layoutWeekAllDayBars } from '@/utils/timed'
import { toDateKey } from '@/utils/date'
import { getHolidaysForDateKey, groupHolidaysByDateKey } from '@/utils/holiday'
import {
  getCurrentTimeIndicator,
  getTimeSlotSelectionStyle,
  resolveTimeSlotFromOffset,
} from '@/utils/timed'
import { formatHourLabel, formatTimedGridDayLabel, formatTime } from '@/utils/date'
import {
  getTimedGridHeight,
  getTimedSchedules,
  layoutTimedSchedules,
} from '@/utils/schedule'
import AllDayBar from './AllDayBar.vue'
import HolidayChip from './HolidayChip.vue'
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
}>()

const resolvedTimeSlotSource = computed<TimeSlotSelectSource>(
  () => props.timeSlotSource ?? (props.singleDay ? 'day-timed-slot' : 'week-timed-slot'),
)

const selectedSlot = ref<{ date: Date; start: Date; end: Date } | null>(null)

function emitDateSelect(date: Date) {
  emit('date-select', { date, source: props.dayHeaderSource })
}

function onDayHeaderActivate(date: Date) {
  if (props.singleDay) {
    return
  }

  emitDateSelect(date)
}

function emitScheduleClick(schedule: Schedule, date: Date, source: ScheduleClickSource) {
  emit('schedule-click', { schedule, source, date })
}

function onTimeSlotClick(event: MouseEvent, day: Date) {
  const column = event.currentTarget as HTMLElement
  const offsetY = event.clientY - column.getBoundingClientRect().top
  const { start, end } = resolveTimeSlotFromOffset(day, offsetY, timeRange)

  selectedSlot.value = { date: day, start, end }
  emit('time-slot-select', {
    date: day,
    start,
    end,
    source: resolvedTimeSlotSource.value,
  })
}

function selectionStyle(start: Date, end: Date) {
  return getTimeSlotSelectionStyle(start, end, timeRange)
}

const timeRange = {
  startHour: CALENDAR_START_HOUR,
  endHour: CALENDAR_END_HOUR,
  hourHeightPx: HOUR_HEIGHT_PX,
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
const holidaysByDate = computed(() => groupHolidaysByDateKey(props.holidays ?? []))
const hasHolidays = computed(() =>
  props.days.some((day) => getHolidaysForDateKey(holidaysByDate.value, toDateKey(day)).length > 0),
)

const dayColumns = computed(() =>
  props.days.map((day) => {
    const timed = getTimedSchedules(props.schedules, day)
    const layout = layoutTimedSchedules(timed, day, timeRange)
    const currentTime = props.showCurrentTime
      ? getCurrentTimeIndicator(day, CALENDAR_START_HOUR, CALENDAR_END_HOUR, now.value)
      : { visible: false, topPercent: 0, label: '' }
    const dayHolidays = getHolidaysForDateKey(holidaysByDate.value, toDateKey(day))

    return {
      day,
      layout,
      currentTime,
      holidays: dayHolidays,
    }
  }),
)

watch(
  () => props.days.map((day) => day.getTime()).join(','),
  () => {
    selectedSlot.value = null
  },
)

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
    :class="{ 'single-day': singleDay }"
    :style="{
      '--hour-height': `${HOUR_HEIGHT_PX}px`,
      '--day-count': String(dayCount),
      '--all-day-max-height': `${ALL_DAY_SECTION_MAX_HEIGHT}px`,
      '--all-day-rows': String(allDayRowCount),
    }"
  >
    <div class="timed-grid-header-shell calendar-scroll">
      <div class="calendar-grid-row timed-grid-header">
        <div class="time-gutter header-gutter" />
        <div class="calendar-days-track">
          <div
            v-for="(column, columnIndex) in dayColumns"
            :key="column.day.toISOString()"
            class="day-header"
            :class="{
              sunday: column.day.getDay() === 0,
              saturday: column.day.getDay() === 6,
              'is-last-column': columnIndex === dayColumns.length - 1,
              clickable: !singleDay,
            }"
            :role="singleDay ? undefined : 'button'"
            :tabindex="singleDay ? undefined : 0"
            @click="onDayHeaderActivate(column.day)"
            @keydown.enter.prevent="onDayHeaderActivate(column.day)"
            @keydown.space.prevent="onDayHeaderActivate(column.day)"
          >
            <span class="day-number">{{ column.day.getDate() }}</span>
            <span class="day-label">{{ formatTimedGridDayLabel(column.day) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="all-day-scroll calendar-scroll">
      <div class="calendar-grid-row all-day-layout">
        <div class="time-gutter all-day-label">all-day</div>
        <div class="all-day-content">
          <div v-if="hasHolidays" class="holiday-chips-row">
            <div
              v-for="(column, columnIndex) in dayColumns"
              :key="`holiday-${column.day.toISOString()}`"
              class="holiday-column"
              :class="{ 'is-last-column': columnIndex === dayColumns.length - 1 }"
            >
              <div v-for="holiday in column.holidays" :key="holiday.id" class="holiday-chip-slot">
                <HolidayChip :name="holiday.name" />
              </div>
            </div>
          </div>

          <div
            class="calendar-days-track all-day-bars-track"
            :style="{ gridTemplateRows: `repeat(${allDayRowCount}, 22px)` }"
          >
            <div
              v-for="(_, index) in dayCount"
              :key="`divider-${index}`"
              class="all-day-column-divider"
              :class="{ 'is-last-column': index === dayCount - 1 }"
              :style="{ gridColumn: index + 1, gridRow: `1 / span ${allDayRowCount}` }"
            />

            <div
              v-for="bar in allDayBars"
              :key="bar.key"
              class="all-day-bar-slot"
              :style="{
                gridColumn: `${bar.startColumn + 1} / span ${bar.span}`,
                gridRow: bar.row + 1,
              }"
            >
              <AllDayBar
                :schedule="bar.schedule"
                :span="bar.span"
                v-bind="getTypeStyle(bar.schedule.type)"
                :show-participant="showParticipant"
                @click="
                  emitScheduleClick(bar.schedule, days[bar.startColumn]!, allDayScheduleSource)
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>

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
            @click="onTimeSlotClick($event, column.day)"
          >
            <div
              v-if="selectedSlot && selectedSlot.date.getTime() === column.day.getTime()"
              class="time-slot-selection"
              :style="selectionStyle(selectedSlot.start, selectedSlot.end)"
              aria-hidden="true"
            />

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
              :style="{
                top: `${item.top}%`,
                height: `${item.height}%`,
                left: `calc(${item.left}% + 2px)`,
                width: `calc(${item.width}% - 4px)`,
              }"
              @click.stop="emitScheduleClick(item.schedule, column.day, timedScheduleSource)"
            >
              <ScheduleEventChip
                :schedule="item.schedule"
                v-bind="getTypeStyle(item.schedule.type)"
                :show-participant="showParticipant"
              />
              <span class="inline-time">
                {{ formatTime(item.schedule.start) }} ~ {{ formatTime(item.schedule.end) }}
              </span>
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

.timed-grid-header-shell {
  flex-shrink: 0;
  overflow: hidden;
}

.timed-grid-header {
  width: 100%;
}

.all-day-scroll {
  flex-shrink: 0;
  max-height: var(--all-day-max-height);
  overflow-y: auto;
  overflow-x: hidden;
  border-bottom: 1px solid #e2e8f0;
}

.all-day-layout {
  width: 100%;
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
  border-right: 1px solid #e2e8f0;
}

.time-gutter {
  width: var(--gutter-width);
  flex-shrink: 0;
  font-size: 10px;
  color: #64748b;
  border-right: 1px solid #e2e8f0;
}

.header-gutter {
  border-bottom: 1px solid #e2e8f0;
}

.day-header {
  text-align: left;
  padding: 10px 12px;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.day-header.clickable {
  cursor: pointer;
}

.day-header.clickable:hover {
  background: #f8fafc;
}

.day-header.is-last-column {
  border-right: none;
}

.day-header.sunday .day-number {
  color: #d32f2f;
}

.day-header.saturday .day-number {
  color: #1565c0;
}

.day-number {
  display: block;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.1;
  color: #1e293b;
  margin-bottom: 2px;
}

.day-label {
  display: block;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.3;
  color: #64748b;
}

.all-day-label {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
  font-size: 10px;
  text-transform: uppercase;
}

.all-day-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  min-height: 24px;
}

.holiday-chips-row {
  display: grid;
  grid-template-columns: repeat(var(--day-count), minmax(0, 1fr));
  gap: 2px 0;
  padding: 2px 0 0;
}

.holiday-column {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: 0 1px;
  border-right: 1px solid #e2e8f0;
}

.holiday-column.is-last-column {
  border-right: none;
}

.holiday-chip-slot {
  min-width: 0;
}

.all-day-bars-track {
  position: relative;
  gap: 2px 0;
  padding: 2px 0;
  min-height: 24px;
}

.all-day-column-divider {
  border-right: 1px solid #e2e8f0;
  pointer-events: none;
}

.all-day-column-divider.is-last-column {
  border-right: none;
}

.all-day-bar-slot {
  min-width: 0;
  padding: 0 1px;
}

.all-day-bar-slot:first-child,
.all-day-bar-slot:has(+ .all-day-bar-slot) {
  padding-left: 0;
}

.time-slot-label {
  height: var(--hour-height);
  font-size: 10px;
  color: #64748b;
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
  border-right: 1px solid #e2e8f0;
  background-image: linear-gradient(to bottom, #edf2f7 1px, transparent 1px);
  background-size: 100% var(--hour-height);
  cursor: pointer;
}

.time-slot-selection {
  position: absolute;
  left: 2px;
  right: 2px;
  z-index: 0;
  border: 2px solid #ef4444;
  background: rgb(239 68 68 / 12%);
  box-sizing: border-box;
  pointer-events: none;
}

.day-column.is-last-column {
  border-right: none;
}

.timed-event {
  position: absolute;
  z-index: 1;
  overflow: hidden;
  cursor: pointer;
}

.inline-time {
  display: none;
}

.current-time-line {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 3;
  border-top: 2px solid #3b82f6;
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
  background: #3b82f6;
}

.current-time-badge {
  position: absolute;
  left: calc(-1 * var(--gutter-width));
  top: -10px;
  width: calc(var(--gutter-width) - 8px);
  text-align: right;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: #3b82f6;
  border-radius: 4px;
  padding: 2px 6px;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .timed-grid:not(.single-day) {
    --gutter-width: 44px;
  }

  .timed-grid:not(.single-day) .day-header {
    padding: 8px 4px;
  }

  .timed-grid:not(.single-day) .day-number {
    font-size: 18px;
  }

  .timed-grid:not(.single-day) .day-label {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .timed-grid:not(.single-day) {
    --gutter-width: 36px;
  }

  .timed-grid:not(.single-day) .day-label {
    display: none;
  }

  .timed-grid:not(.single-day) .day-number {
    font-size: 14px;
  }
}
</style>
