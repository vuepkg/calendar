import { ref, watch } from 'vue'
import type { MaybeRef } from 'vue'
import { toValue } from 'vue'
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR, HOUR_HEIGHT_PX } from '@/constants/calendarView'
import type { TimeGridRange } from '@/types/layout'
import { getTimeSlotSelectionStyle } from '@/utils/timed'

export interface TimeSlotSelection {
  date: Date
  start: Date
  end: Date
}

function resolveHourIndex(offsetY: number, range: TimeGridRange): number {
  const hourHeight = range.hourHeightPx ?? HOUR_HEIGHT_PX
  const startHour = range.startHour ?? CALENDAR_START_HOUR
  const endHour = range.endHour ?? CALENDAR_END_HOUR
  const index = Math.floor(offsetY / hourHeight)
  return Math.max(0, Math.min(index, endHour - startHour))
}

function buildSlot(
  day: Date,
  anchorIndex: number,
  currentIndex: number,
  range: TimeGridRange,
): TimeSlotSelection {
  const startHour = range.startHour ?? CALENDAR_START_HOUR
  const endHour = range.endHour ?? CALENDAR_END_HOUR

  const low = Math.min(anchorIndex, currentIndex)
  const high = Math.max(anchorIndex, currentIndex)

  const slotStartHour = startHour + low
  const slotEndHour = Math.min(startHour + high + 1, endHour + 1)

  const start = new Date(day)
  start.setHours(slotStartHour, 0, 0, 0)

  const end = new Date(day)
  if (slotEndHour > endHour) {
    end.setHours(endHour, 59, 59, 999)
  } else {
    end.setHours(slotEndHour, 0, 0, 0)
  }

  return { date: day, start, end }
}

/**
 * Week/Day 시간 그리드의 슬롯 선택 상태와 드래그 로직을 캡슐화합니다.
 * pointerdown → pointermove → pointerup 드래그로 임의 시간 범위를 선택합니다.
 * days 변경 시 선택이 자동으로 초기화됩니다.
 */
export function useTimeSlotSelection(days: MaybeRef<Date[]>, timeRange: TimeGridRange) {
  const selectedSlot = ref<TimeSlotSelection | null>(null)
  const isDragging = ref(false)

  let dragDay: Date | null = null
  let anchorIndex = 0

  watch(
    () =>
      toValue(days)
        .map((d) => d.getTime())
        .join(','),
    () => {
      selectedSlot.value = null
    },
  )

  function getOffsetY(event: PointerEvent, element: HTMLElement): number {
    return event.clientY - element.getBoundingClientRect().top
  }

  function onPointerDown(event: PointerEvent, day: Date): void {
    if (event.button !== 0) return

    const column = event.currentTarget as HTMLElement
    if (typeof column.setPointerCapture === 'function') {
      column.setPointerCapture(event.pointerId)
    }

    const offsetY = getOffsetY(event, column)
    anchorIndex = resolveHourIndex(offsetY, timeRange)
    dragDay = day
    isDragging.value = true
    selectedSlot.value = buildSlot(day, anchorIndex, anchorIndex, timeRange)
  }

  function onPointerMove(event: PointerEvent): void {
    if (!isDragging.value || !dragDay) return

    const column = event.currentTarget as HTMLElement
    const offsetY = getOffsetY(event, column)
    const currentIndex = resolveHourIndex(offsetY, timeRange)
    selectedSlot.value = buildSlot(dragDay, anchorIndex, currentIndex, timeRange)
  }

  function onPointerUp(event: PointerEvent): TimeSlotSelection | null {
    if (!isDragging.value || !dragDay) return null

    const column = event.currentTarget as HTMLElement
    const offsetY = getOffsetY(event, column)
    const currentIndex = resolveHourIndex(offsetY, timeRange)
    const slot = buildSlot(dragDay, anchorIndex, currentIndex, timeRange)

    selectedSlot.value = slot
    isDragging.value = false
    dragDay = null
    return slot
  }

  function cancelDrag(): void {
    isDragging.value = false
    dragDay = null
    selectedSlot.value = null
  }

  function selectionStyle(start: Date, end: Date) {
    return getTimeSlotSelectionStyle(start, end, timeRange)
  }

  return {
    selectedSlot,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    cancelDrag,
    selectionStyle,
  }
}
