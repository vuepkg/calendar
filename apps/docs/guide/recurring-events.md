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

## 알려진 제약

자체 구현한 RRULE 서브셋으로, iCal(RFC 5545) 전체 RRULE 사양과 호환되지 않습니다. 특히:

- **월말 기준일 롤오버** — `freq: 'monthly'`/`'yearly'`가 존재하지 않는 날짜(예: 1월 31일 + 1개월)로 넘어갈 경우 JS `Date.setMonth` 표준 동작에 따라 2월로 클램프되지 않고 **3월로 밀려납니다**(1/31 → 3/3). 매달 말일 반복이 필요하면 `count`/`until`로 범위를 좁히고 결과를 직접 검증하세요.
- **BYSETPOS 미지원** — "매월 둘째 주 화요일"처럼 n번째 요일 지정은 지원하지 않습니다. `weekly` + `byWeekday`로 근사만 가능합니다.
- **단일 회차 예외는 날짜 제외만 가능** — `exceptions`로 특정 날짜의 회차를 건너뛸 수는 있지만, 그 날짜의 회차만 시간을 바꾸는 등의 단일 수정은 지원하지 않습니다(§ 수정/삭제 참고).
- **타임존 전환 구간 미검증** — DST가 있는 타임존에서 반복 일정이 전환 시각을 걸치는 경우의 동작은 별도로 테스트되지 않았습니다.

iCal 호환이 필요하다면 `rrule` 같은 외부 라이브러리로 회차를 직접 계산해 `Schedule[]`을 만들고, `recurrence` 필드 없이 개별 일정으로 전달하는 방법을 권장합니다.

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
