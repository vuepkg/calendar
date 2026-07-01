import { computed, ref } from 'vue'
import type { CSSProperties } from 'vue'
import type { Schedule } from '@/types/schedule'
import type { TimeGridRange } from '@/types/layout'
import type {
  CalendarScheduleMovePayload,
  CalendarScheduleResizePayload,
} from '@/types/calendarEvents'
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR, HOUR_HEIGHT_PX } from '@/constants/calendarView'

interface MoveDragState {
  type: 'move'
  schedule: Schedule
  day: Date
  /** pointer가 이벤트 상단에서 몇 시간 아래를 눌렀는지 (스냅 기준) */
  anchorHourOffset: number
  durationMs: number
  ghostStart: Date
  ghostEnd: Date
}

interface ResizeDragState {
  type: 'resize'
  schedule: Schedule
  day: Date
  ghostEnd: Date
}

type ActiveDrag = MoveDragState | ResizeDragState

export type ScheduleDragResult =
  | { type: 'move'; payload: CalendarScheduleMovePayload }
  | { type: 'resize'; payload: CalendarScheduleResizePayload }

export function useScheduleDrag(timeRange: TimeGridRange) {
  const startHour = timeRange.startHour ?? CALENDAR_START_HOUR
  const endHour = timeRange.endHour ?? CALENDAR_END_HOUR
  const hourHeight = timeRange.hourHeightPx ?? HOUR_HEIGHT_PX
  const totalHours = endHour - startHour

  const dragState = ref<ActiveDrag | null>(null)
  const isDragging = computed(() => dragState.value !== null)

  function clampHourIndex(index: number): number {
    return Math.max(0, Math.min(index, totalHours))
  }

  function floorHourIndex(offsetY: number): number {
    return clampHourIndex(Math.floor(offsetY / hourHeight))
  }

  function setHour(day: Date, hour: number): Date {
    const d = new Date(day)
    d.setHours(hour, 0, 0, 0)
    return d
  }

  /** .timed-event 요소의 @pointerdown.stop 핸들러 */
  function onMovePointerDown(event: PointerEvent, schedule: Schedule, day: Date) {
    if (event.button !== 0) return

    const eventEl = event.currentTarget as HTMLElement
    const columnEl = eventEl.closest('.day-column') as HTMLElement | null
    if (!columnEl) return

    const eventRect = eventEl.getBoundingClientRect()
    const clickOffsetInEvent = event.clientY - eventRect.top
    const anchorHourOffset = Math.floor(clickOffsetInEvent / hourHeight)
    const durationMs = schedule.end.getTime() - schedule.start.getTime()

    if (typeof columnEl.setPointerCapture === 'function') {
      columnEl.setPointerCapture(event.pointerId)
    }

    dragState.value = {
      type: 'move',
      schedule,
      day,
      anchorHourOffset,
      durationMs,
      ghostStart: new Date(schedule.start),
      ghostEnd: new Date(schedule.end),
    }
  }

  /** .resize-handle 요소의 @pointerdown.stop 핸들러 */
  function onResizePointerDown(event: PointerEvent, schedule: Schedule, day: Date) {
    if (event.button !== 0) return

    const resizeEl = event.currentTarget as HTMLElement
    const columnEl = resizeEl.closest('.day-column') as HTMLElement | null
    if (!columnEl) return

    if (typeof columnEl.setPointerCapture === 'function') {
      columnEl.setPointerCapture(event.pointerId)
    }

    dragState.value = {
      type: 'resize',
      schedule,
      day,
      ghostEnd: new Date(schedule.end),
    }
  }

  /** .day-column 의 @pointermove 핸들러 */
  function onPointerMove(event: PointerEvent) {
    const state = dragState.value
    if (!state) return

    const columnEl = event.currentTarget as HTMLElement
    const rect = columnEl.getBoundingClientRect()
    const offsetY = event.clientY - rect.top

    if (state.type === 'move') {
      const pointerHourIndex = floorHourIndex(offsetY)
      const durationHours = Math.max(1, Math.ceil(state.durationMs / 3_600_000))
      const newStartIndex = clampHourIndex(Math.max(0, pointerHourIndex - state.anchorHourOffset))
      const clampedStart = Math.min(newStartIndex, totalHours - durationHours)

      const newStart = setHour(state.day, startHour + clampedStart)
      const newEnd = new Date(newStart.getTime() + state.durationMs)

      dragState.value = { ...state, ghostStart: newStart, ghostEnd: newEnd }
    } else {
      const pointerHourIndex = floorHourIndex(offsetY)
      // end 는 start 보다 최소 1시간 후
      const minEndIndex = state.schedule.start.getHours() - startHour + 1
      const endIndex = clampHourIndex(Math.max(minEndIndex, pointerHourIndex + 1))
      const ghostEnd = setHour(state.day, startHour + endIndex)

      dragState.value = { ...state, ghostEnd }
    }
  }

  /** .day-column 의 @pointerup 핸들러 */
  function onPointerUp(): ScheduleDragResult | null {
    const state = dragState.value
    dragState.value = null

    if (!state) return null

    if (state.type === 'move') {
      if (
        state.ghostStart.getTime() === state.schedule.start.getTime() &&
        state.ghostEnd.getTime() === state.schedule.end.getTime()
      ) {
        return null
      }
      return {
        type: 'move',
        payload: {
          schedule: state.schedule,
          date: state.day,
          newStart: state.ghostStart,
          newEnd: state.ghostEnd,
        },
      }
    } else {
      if (state.ghostEnd.getTime() === state.schedule.end.getTime()) {
        return null
      }
      return {
        type: 'resize',
        payload: {
          schedule: state.schedule,
          date: state.day,
          newEnd: state.ghostEnd,
        },
      }
    }
  }

  function cancelDrag() {
    dragState.value = null
  }

  function ghostStyle(start: Date, end: Date): CSSProperties {
    const startOffsetHours = start.getHours() + start.getMinutes() / 60 - startHour
    const endOffsetHours = end.getHours() + end.getMinutes() / 60 - startHour
    const topPct = (startOffsetHours / totalHours) * 100
    const heightPct = ((endOffsetHours - startOffsetHours) / totalHours) * 100
    return { top: `${topPct}%`, height: `${heightPct}%` }
  }

  return {
    dragState,
    isDragging,
    onMovePointerDown,
    onResizePointerDown,
    onPointerMove,
    onPointerUp,
    cancelDrag,
    ghostStyle,
  }
}
