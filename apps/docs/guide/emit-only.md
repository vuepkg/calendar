# Emit-only 아키텍처

`@vuepkg/calendar`의 핵심 설계 원칙입니다.

## 개념

**컴포넌트는 상태를 소유하지 않습니다.** 모든 상태(현재 뷰, 선택 날짜, 일정 목록)는 소비자(부모 컴포넌트)가 소유하고, `ScheduleCalendar`는 표현(렌더링)과 이벤트 emit만 담당합니다.

```
사용자 클릭
    ↓
ScheduleCalendar
  emit('navigate', { action: 'next-week', date: ... })
    ↓
소비자 (useScheduleCalendarHost)
  date.value = payload.date  ← 상태 변경
  emit('query-change', ...)   ← API 호출 트리거
    ↓
서버 응답 → schedules.value 업데이트
    ↓
ScheduleCalendar 재렌더링
```

## 왜 emit-only인가?

### 서버 저장과 낙관적 업데이트

일정을 드래그 이동할 때 일반 캘린더는 즉시 위치를 업데이트합니다. 그러나 서버 저장이 실패하면 UI를 롤백해야 합니다.

`@vuepkg/calendar`는 `schedule-move` emit만 발생시키고 UI를 **직접 변경하지 않습니다**. 소비자가 서버 응답 후에 `schedules` 배열을 업데이트하면 그때 UI가 갱신됩니다:

```ts
const { calendarListeners } = useScheduleCalendarHost({
  async onScheduleMove({ schedule, newStart, newEnd }) {
    try {
      await api.updateSchedule(schedule.id, { start: newStart, end: newEnd })
      // 성공 시에만 UI 업데이트
      schedules.value = schedules.value.map((s) =>
        s.id === schedule.id ? { ...s, start: newStart, end: newEnd } : s,
      )
    } catch {
      // 실패 → schedules 그대로 → 이전 위치로 자동 복원
      toast.error('일정 이동 실패')
    }
  },
})
```

### 낙관적 업데이트 패턴

```ts
async onScheduleMove({ schedule, newStart, newEnd }) {
  const prev = schedules.value.find((s) => s.id === schedule.id)!
  
  // 낙관적 업데이트 (즉시 UI 반영)
  schedules.value = schedules.value.map((s) =>
    s.id === schedule.id ? { ...s, start: newStart, end: newEnd } : s,
  )
  
  try {
    await api.updateSchedule(schedule.id, { start: newStart, end: newEnd })
  } catch {
    // 실패 시 롤백
    schedules.value = schedules.value.map((s) =>
      s.id === schedule.id ? prev : s,
    )
    toast.error('일정 이동 실패')
  }
},
```

### 권한 기반 뷰 제어

소비자가 상태를 소유하므로 권한에 따른 뷰 제어가 단순합니다:

```ts
// 권한이 없으면 월간 뷰로 강제 고정
const { view, date, calendarListeners } = useScheduleCalendarHost({
  initialView: canAccessTimedView ? 'week' : 'month',
  onScheduleMove(payload) {
    if (!canEditSchedules) return  // 이동 emit 무시
    // ...
  },
})
```

## v-model 바인딩

`v-bind="calendarListeners"`는 `useScheduleCalendarHost`가 반환하는 모든 이벤트 핸들러를 한 번에 바인딩합니다:

```vue
<ScheduleCalendar
  v-model:view="view"
  v-model:date="date"
  :schedules="schedules"
  v-bind="calendarListeners"
/>
```

이는 다음과 동일합니다:

```vue
<ScheduleCalendar
  v-model:view="view"
  v-model:date="date"
  :schedules="schedules"
  @navigate="handlers.onNavigate"
  @view-change="handlers.onViewChange"
  @date-select="handlers.onDateSelect"
  @schedule-click="handlers.onScheduleClick"
  @query-change="handlers.onQueryChange"
  @time-slot-select="handlers.onTimeSlotSelect"
  @schedule-move="handlers.onScheduleMove"
  @schedule-resize="handlers.onScheduleResize"
  @overflow-click="handlers.onOverflowClick"
  @list-filter-clear="handlers.onListFilterClear"
/>
```
