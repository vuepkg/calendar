# 마이그레이션 가이드

## 0.0.x → 0.1.x

### Breaking Changes

#### `Schedule.type` 타입 변경

```ts
// 이전 (0.0.x)
type ScheduleType = 'my_schedule' | 'team_schedule' | 'company'
interface Schedule {
  type: ScheduleType
}

// 현재 (0.1.x)
interface Schedule {
  type: string  // 임의 문자열 허용 → 소비자 타입 자유 정의
}
```

기존 값(`'my_schedule'`, `'team_schedule'`, `'company'`)은 그대로 사용 가능합니다.

#### `scheduleTypes` v-model 타입 변경

```ts
// 이전
v-model:scheduleTypes="ScheduleType[] | null"

// 현재
v-model:scheduleTypes="string[] | null"
```

#### PrimeVue 의존성 제거

0.0.x에서 ListView가 PrimeVue DataTable을 사용했습니다. 0.1.x에서는 완전 제거됐습니다.

```sh
# PrimeVue를 calendar만을 위해 설치했다면 제거 가능
npm remove primevue @primeuix/themes primeicons
```

### 신규 기능 (0.1.x)

| 기능 | 관련 문서 |
|------|-----------|
| `schedule-move` / `schedule-resize` emit (DnD) | [드래그 앤 드롭](/guide/drag-and-drop) |
| `schedule-form-modal` (CRUD UI) | [일정 CRUD 모달](/guide/schedule-crud) |
| `RecurrenceRule` (반복 일정) | [반복 일정](/guide/recurring-events) |
| `monthWeekCount` prop (2/3주 뷰) | [2/3주 월간 뷰](/guide/month-week-count) |
| CSS variable dark mode | [테마 커스터마이징](/guide/theming) |
| `usePublicHolidays` (30s TTL, computed loading) | [공휴일 연동](/guide/public-holidays) |
