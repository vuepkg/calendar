import { onUnmounted, ref, watch, type Ref } from 'vue'
import { MONTH_CELL_HEIGHT_PX } from '@/constants/calendarView'

const MONTH_WEEK_COUNT = 6
const MIN_MONTH_CELL_HEIGHT_PX = 72

/**
 * 월간 그리드 주 영역 높이를 측정해 셀당 픽셀 높이를 반환합니다.
 * 부모 컨테이너에 맞춰 6주 행을 균등 분할할 때 칩 슬롯 계산에 사용합니다.
 */
export function useMonthMeasuredCellHeight(weeksContainerRef: Ref<HTMLElement | null>) {
  const cellHeightPx = ref(MONTH_CELL_HEIGHT_PX)
  let observer: ResizeObserver | undefined

  function updateCellHeight() {
    const container = weeksContainerRef.value
    if (!container) {
      return
    }

    const weekHeight = container.clientHeight / MONTH_WEEK_COUNT
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

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    cellHeightPx,
    updateCellHeight,
  }
}
