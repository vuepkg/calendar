# useCalendar

캘린더 내부 상태(weekDays, monthCells, listRows 등)를 파생하는 headless composable입니다.

> **대부분의 소비자는 이 composable을 직접 사용할 필요가 없습니다.** `ScheduleCalendar`가 내부적으로 사용하며, 커스텀 뷰를 구현하는 경우에만 직접 접근합니다.

> Vue 컴포넌트 없이 로직만 필요하다면 `@vuepkg/calendar/headless`에서 동일하게 import할 수 있습니다.

## 시그니처

```ts
function useCalendar(options: UseCalendarOptions): CalendarContext
```

## 옵션

`selectedDate`/`currentView`/`listFilterDate`를 생략하면 내부적으로 자체 `ref`를 만들고 `initialDate`/`initialView`로 초기화합니다 — 둘 다 생략 시 오늘 날짜·`'month'` 뷰가 기본값입니다.

```ts
interface UseCalendarOptions {
  schedules: MaybeRefOrGetter<Schedule[]>
  holidays?: MaybeRefOrGetter<Holiday[]>
  selectedDate?: Ref<Date>
  currentView?: Ref<CalendarView>
  listFilterDate?: Ref<Date | null>
  initialDate?: Date
  initialView?: CalendarView
  scheduleTypeOptions?: ScheduleTypeOption[] // 미지정 시 SCHEDULE_TYPE_OPTIONS
}
```

## CalendarContext

```ts
interface CalendarContext {
  state: {
    selectedDate: Date
    currentView: CalendarView
    listFilterDate: Date | null
  }
  schedules: ComputedRef<Schedule[]>       // 반복 일정 전개 포함, 필터는 부모 책임
  holidays: ComputedRef<Holiday[]>
  monthLabel: ComputedRef<string>          // "2026-07" 형식
  monthCells: ComputedRef<MonthDayCell[]>  // 월간 42칸 원시 셀 (week 슬라이싱 전)
  weekDays: ComputedRef<Date[]>            // 선택일 기준 7일
  listRows: ComputedRef<CalendarListRow[]> // List 뷰 행
  getTypeStyle: (type: string) => { color: string; backgroundColor: string }
  moveDay: (offset: number) => void
  moveWeek: (offset: number) => void
  moveMonth: (offset: number) => void
  goToToday: () => void
  // setView / selectDate / clearListFilter는 @internal — emit-only 연동에서는
  // ScheduleCalendar의 v-model만 사용하고 이 메서드들을 직접 호출하지 마세요.
  setView: (view: CalendarView) => void
  selectDate: (date: Date) => void
  clearListFilter: () => void
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
