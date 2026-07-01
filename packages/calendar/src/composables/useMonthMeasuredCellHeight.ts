import { onUnmounted, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { MONTH_CELL_HEIGHT_PX } from '@/constants/calendarView'

const DEFAULT_MONTH_WEEK_COUNT = 6
const MIN_MONTH_CELL_HEIGHT_PX = 72

/**
 * 월간 그리드 주 영역 높이를 측정해 셀당 픽셀 높이를 반환합니다.
 * 부모 컨테이너에 맞춰 렌더링된 주 행 수만큼 균등 분할할 때 칩 슬롯 계산에 사용합니다.
 * `weekCount`(기본 6)는 `monthWeekCount` prop에 따라 2/3주 축소 뷰일 때도 정확한 셀 높이를 계산하기 위함입니다.
 */
export function useMonthMeasuredCellHeight(
  weeksContainerRef: Ref<HTMLElement | null>,
  weekCount: MaybeRefOrGetter<number> = DEFAULT_MONTH_WEEK_COUNT,
) {
  const cellHeightPx = ref(MONTH_CELL_HEIGHT_PX)
  let observer: ResizeObserver | undefined

  function updateCellHeight() {
    const container = weeksContainerRef.value
    if (!container) {
      return
    }

    const weekHeight = container.clientHeight / toValue(weekCount)
    if (weekHeight <= 0) {
      return
    }

    cellHeightPx.value = Math.max(MIN_MONTH_CELL_HEIGHT_PX, Math.floor(weekHeight))
  }

  watch(
    weeksContainerRef,
    (container) => {
      observer?.disconnect()
      observer = undefined

      if (!container) {
        return
      }

      if (typeof ResizeObserver === 'undefined') {
        updateCellHeight()
        return
      }

      observer = new ResizeObserver(updateCellHeight)
      observer.observe(container)
      updateCellHeight()
    },
    { flush: 'post' },
  )

  watch(() => toValue(weekCount), updateCellHeight, { flush: 'post' })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    cellHeightPx,
    updateCellHeight,
  }
}
