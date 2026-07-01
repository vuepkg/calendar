# 드래그 앤 드롭

Week/Day 그리드에서 이벤트 이동과 리사이즈를 지원합니다.

## 동작 방식

- **이동**: 이벤트 본체를 드래그 → 새 시각으로 이동 (hour-snapping)
- **리사이즈**: 이벤트 하단 8px 핸들을 드래그 → 종료 시각 변경 (최소 1시간)
- 드래그 중 ghost overlay로 새 위치 미리보기
- 원본 이벤트는 40% 투명도로 표시

## 이벤트 연결

```vue
<script setup lang="ts">
import { useScheduleCalendarHost } from '@vuepkg/calendar'
import type { Schedule } from '@vuepkg/calendar'
import { ref } from 'vue'

const schedules = ref<Schedule[]>([...])

const { view, date, calendarListeners } = useScheduleCalendarHost({
  onScheduleMove({ schedule, newStart, newEnd }) {
    // schedule: 이동된 원본 일정
    // newStart, newEnd: 이동 후 시각 (hour-snapped)
    schedules.value = schedules.value.map((s) =>
      s.id === schedule.id ? { ...s, start: newStart, end: newEnd } : s,
    )
  },

  onScheduleResize({ schedule, newEnd }) {
    // schedule: 리사이즈된 원본 일정
    // newEnd: 변경된 종료 시각 (hour-snapped)
    schedules.value = schedules.value.map((s) =>
      s.id === schedule.id ? { ...s, end: newEnd } : s,
    )
  },
})
</script>
```

## Payload 타입

```ts
interface CalendarScheduleMovePayload {
  schedule: Schedule  // 원본 일정 객체
  date: Date          // 이동 후 날짜 (자정 기준)
  newStart: Date      // 새 시작 시각
  newEnd: Date        // 새 종료 시각
}

interface CalendarScheduleResizePayload {
  schedule: Schedule  // 원본 일정 객체
  date: Date          // 날짜 (자정 기준)
  newEnd: Date        // 새 종료 시각
}
```

## 서버 저장 패턴

```ts
const { calendarListeners } = useScheduleCalendarHost({
  async onScheduleMove({ schedule, newStart, newEnd }) {
    const prev = schedules.value.find((s) => s.id === schedule.id)!

    // 낙관적 업데이트
    schedules.value = schedules.value.map((s) =>
      s.id === schedule.id ? { ...s, start: newStart, end: newEnd } : s,
    )

    try {
      await api.patch(`/schedules/${schedule.id}`, { start: newStart, end: newEnd })
    } catch {
      // 롤백
      schedules.value = schedules.value.map((s) => (s.id === schedule.id ? prev : s))
      toast.error('일정 이동에 실패했습니다.')
    }
  },
})
```

## 주의 사항

- DnD는 **Week/Day 뷰**의 timed 그리드에서만 동작합니다 (All-day 바·Month 뷰는 해당 없음)
- 위치 변경 없이 클릭만 한 경우에는 `schedule-move` emit이 발생하지 않습니다 (`schedule-click`만 발생)
- 드래그 직후 브라우저가 발생시키는 click 이벤트는 내부적으로 억제됩니다
