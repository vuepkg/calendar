# 반복 일정

daily / weekly / monthly / yearly 반복 일정을 지원합니다.

## RecurrenceRule 타입

```ts
interface RecurrenceRule {
  /** 반복 주기 */
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  /** 주기 간격 (기본 1). freq: 'weekly', interval: 2 → 격주 */
  interval?: number
  /** 요일 지정 (weekly에서만 의미 있음). 0=일, 1=월, ..., 6=토 */
  byWeekday?: number[]
  /** 반복 횟수 (count 또는 until 중 하나만) */
  count?: number
  /** 반복 종료 날짜 (count 또는 until 중 하나만) */
  until?: Date
  /** 제외할 날짜 목록 (이 날짜의 회차는 펼쳐지지 않음) */
  exceptions?: Date[]
}
```

## 기본 사용

`Schedule.recurrence`에 `RecurrenceRule`을 지정하면 `useCalendar`가 현재 뷰 범위 내에서 자동으로 펼쳐줍니다.

```ts
const schedules = ref<Schedule[]>([
  {
    id: 'rec-1',
    title: '매주 월요일 스탠드업',
    type: 'team_schedule',
    participantId: 'user-1',
    participantName: '홍길동',
    start: new Date(2026, 0, 5, 9, 0),   // 2026-01-05 09:00 (월요일)
    end: new Date(2026, 0, 5, 9, 30),     // 2026-01-05 09:30
    recurrence: {
      freq: 'weekly',
      byWeekday: [1], // 월요일
    },
  },
])
```

## 반복 패턴 예시

```ts
// 매일
{ freq: 'daily' }

// 격주 월·수·금
{ freq: 'weekly', interval: 2, byWeekday: [1, 3, 5] }

// 매월 1일 (3개월 후 종료)
{ freq: 'monthly', count: 3 }

// 매년 (2027-12-31까지)
{ freq: 'yearly', until: new Date(2027, 11, 31) }

// 매주 화요일, 2026-03-10 제외
{
  freq: 'weekly',
  byWeekday: [2],
  exceptions: [new Date(2026, 2, 10)],
}
```

## expandRecurringSchedules

직접 펼침이 필요한 경우 유틸 함수를 사용합니다:

```ts
import { expandRecurringSchedules } from '@vuepkg/calendar'

const expanded = expandRecurringSchedules(schedules, {
  start: new Date(2026, 0, 1),
  end: new Date(2026, 2, 31),
})
// expanded: 범위 내 각 회차를 개별 Schedule로 반환
```

## 수정 / 삭제

현재 버전은 **시리즈 전체 단위** 수정·삭제만 지원합니다. 단일 회차 수정은 예정된 기능입니다.

```ts
// 시리즈 전체 종료 날짜 변경
schedules.value = schedules.value.map((s) =>
  s.id === targetId
    ? { ...s, recurrence: { ...s.recurrence!, until: new Date(2026, 11, 31) } }
    : s,
)

// 시리즈 전체 삭제
schedules.value = schedules.value.filter((s) => s.id !== targetId)
```
