# useCalendar

캘린더 내부 상태(weekDays, monthCells, listRows 등)를 파생하는 headless composable입니다.

> **대부분의 소비자는 이 composable을 직접 사용할 필요가 없습니다.** `ScheduleCalendar`가 내부적으로 사용하며, 커스텀 뷰를 구현하는 경우에만 직접 접근합니다.

> Vue 컴포넌트 없이 로직만 필요하다면 `@vuepkg/calendar/headless`에서 동일하게 import할 수 있습니다.

## 시그니처

```ts
function useCalendar(options: UseCalendarOptions): CalendarContext
```

## 옵션

```ts
interface UseCalendarOptions {
  schedules: Ref<Schedule[]>
  holidays: Ref<Holiday[]>
  selectedDate: Ref<Date>
  currentView: Ref<CalendarView>
  listFilterDate: Ref<Date | null>
  scheduleTypeOptions?: ScheduleTypeOption[]
}
```

## CalendarContext

```ts
interface CalendarContext {
  state: {
    currentView: CalendarView
    selectedDate: Date
    // ...
  }
  weekDays: ComputedRef<Date[]>         // 현재 주 날짜 배열
  monthLabel: ComputedRef<string>       // "2026-07" 형식
  monthCells: ComputedRef<MonthWeekCell[]>  // 월간 뷰 셀
  listRows: ComputedRef<CalendarListRow[]>  // List 뷰 행
  schedules: ComputedRef<Schedule[]>    // 활성 일정 (필터 적용)
  holidays: ComputedRef<Holiday[]>
  getTypeStyle: (type: string) => { color: string; backgroundColor: string }
}
```

## 커스텀 뷰 구현 예

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useCalendar } from '@vuepkg/calendar'
import type { Schedule, CalendarView } from '@vuepkg/calendar'

const view = ref<CalendarView>('week')
const date = ref(new Date())
const schedules = ref<Schedule[]>([])

const calendar = useCalendar({
  schedules,
  holidays: ref([]),
  selectedDate: date,
  currentView: view,
  listFilterDate: ref(null),
})

// calendar.weekDays.value → [Mon, Tue, ...]
// calendar.schedules.value → 필터된 일정
</script>
```
