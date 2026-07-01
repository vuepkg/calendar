import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { MonthDayCell } from './layout'
import type { Holiday, HolidayKind } from '@vuepkg/core'

export type { Holiday, HolidayKind }

/** Month / Week / Day / List 탭 식별자 */
export type CalendarView = 'month' | 'week' | 'day' | 'list'

/** 월간 뷰에 표시할 주(week) 수 — 6=전체 월, 2\|3=선택 날짜 기준 축소 뷰 */
export type MonthWeekCount = 2 | 3 | 6

/**
 * 기본 제공 일정 분류 리터럴.
 * `Schedule.type`은 `string`이므로 소비자가 이 외의 타입 문자열을 자유롭게 사용할 수 있습니다.
 * `SCHEDULE_TYPE_OPTIONS`를 확장해 `ScheduleCalendar`의 `scheduleTypeOptions` prop에 전달하세요.
 */
export type ScheduleType = 'my_schedule' | 'team_schedule' | 'company_schedule'

/** 부모 측 My/Company 필터 — `filterSchedulesByScope`와 함께 사용 */
export type ViewScope = 'my' | 'company'

/** 반복 주기 */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

/**
 * 반복 일정 규칙 — RRULE 서브셋.
 * `Schedule.start`가 반복 시작일(anchor)이며, `expandRecurringSchedules`가
 * 캘린더에 표시되는 기간 내에서만 실제 occurrence를 생성합니다.
 */
export interface RecurrenceRule {
  freq: RecurrenceFrequency
  /** 반복 간격 — 기본 1. `freq: 'weekly', interval: 2` → 격주 */
  interval?: number
  /** `freq: 'weekly'` 전용 — 반복 요일(0=일 ~ 6=토). 미지정 시 시작일 요일만 사용 */
  byWeekday?: number[]
  /** 종료 조건 — 총 발생 횟수. `until`과 동시 사용 시 먼저 도달하는 조건에서 종료 */
  count?: number
  /** 종료 조건 — 마지막 발생 가능일(포함) */
  until?: Date
  /** 삭제된 단일 회차 날짜(`YYYY-MM-DD`) — 해당 회차만 건너뜁니다 */
  exceptions?: string[]
}

/** 참가자 마스터 (CRUD·필터 UI용, 캘린더 prop에는 불필요) */
export interface Participant {
  /** 고유 ID — `Schedule.participantId`와 연결 */
  id: string
  /** 표시 이름 */
  name: string
}

/**
 * 캘린더에 표시할 일정 한 건.
 * `start`·`end`는 로컬 `Date`(시간 포함). 종일은 `allDay: true` 권장.
 *
 * @example
 * {
 *   id: 's-001',
 *   title: '여수 출장',
 *   type: 'my_schedule',
 *   participantId: 'user-hong',
 *   participantName: '홍길동',
 *   start: new Date(2026, 3, 21, 9, 0),
 *   end: new Date(2026, 3, 21, 18, 0),
 *   remarks: '현장 점검',
 * }
 */
export interface Schedule {
  id: string
  title: string
  /**
   * 일정 분류 문자열. 기본 제공 타입은 `ScheduleType`이지만 임의 문자열을 사용할 수 있습니다.
   * 커스텀 타입은 `ScheduleCalendar`의 `scheduleTypeOptions` prop으로 색상을 등록하세요.
   */
  type: string
  /** `Participant.id` — My scope 필터 키 */
  participantId: string
  participantName: string
  start: Date
  end: Date
  /** List Period 컬럼·부가 설명 */
  remarks?: string
  /** true면 All Day 행·월간 바 레이아웃 */
  allDay?: boolean
  /** 반복 규칙 — 지정 시 `expandRecurringSchedules`가 표시 기간 내 회차를 생성합니다 */
  recurrence?: RecurrenceRule
  /**
   * @internal `expandRecurringSchedules`가 생성한 가상 회차에만 설정됩니다.
   * 원본(마스터) 일정의 `id`를 가리킵니다 — 소비자는 시리즈 전체 수정/삭제 시 이 id를 사용하세요.
   */
  recurrenceId?: string
  /** @internal `expandRecurringSchedules`가 생성한 가상 회차 여부 */
  isRecurrenceInstance?: boolean
}

/** 일정 유형 선택지 — `SCHEDULE_TYPE_OPTIONS` 또는 소비자 커스텀 배열 */
export interface ScheduleTypeOption {
  /** `Schedule.type`과 매핑되는 식별자 문자열 */
  type: string
  label: string
  color: string
  backgroundColor: string
}

/** `buildScheduleFromDraft` 입력 — 저장 전 초안 */
export interface ScheduleDraft {
  id?: string
  title: string
  type: string
  participantId: string
  start: Date
  end: Date
  allDay: boolean
  recurrence?: RecurrenceRule
}

/** `useCalendar` 옵션 */
export interface UseCalendarOptions {
  schedules: MaybeRefOrGetter<Schedule[]>
  /** 월간 뷰 공휴일·기념일 칩 (Open API + 사내 일정 병합 후 전달) */
  holidays?: MaybeRefOrGetter<Holiday[]>
  selectedDate?: Ref<Date>
  currentView?: Ref<CalendarView>
  listFilterDate?: Ref<Date | null>
  initialDate?: Date
  initialView?: CalendarView
  /**
   * 일정 유형 목록 — 색상·라벨 매핑에 사용됩니다.
   * 미지정 시 기본값 `SCHEDULE_TYPE_OPTIONS`를 사용합니다.
   * 커스텀 타입을 추가하려면 `[...SCHEDULE_TYPE_OPTIONS, { type: 'custom', ... }]` 형태로 전달하세요.
   */
  scheduleTypeOptions?: ScheduleTypeOption[]
}

/** `fetchPublicHolidays` 옵션 */
export interface FetchPublicHolidaysOptions {
  /** 클라이언트 직접 호출 시에만 사용. proxy/BFF 경로면 생략(서버가 주입) */
  serviceKey?: string
  /** API 엔드포인트. 미지정 시 `VITE_SPCDE_API_URL` 또는 `/api/spcde/getRestDeInfo` */
  apiUrl?: string
  signal?: AbortSignal
}

/** `useCalendar` reactive 상태 */
export interface CalendarState {
  selectedDate: Date
  currentView: CalendarView
  listFilterDate: Date | null
}

/** List 뷰 테이블 행 */
export interface CalendarListRow {
  no: number
  title: string
  scheduleType: string
  participant: string
  period: string
  schedule: Schedule
}

/** 일정 유형 칩·바 색상 */
export interface ScheduleTypeStyle {
  color: string
  backgroundColor: string
}

/** `useCalendar` 반환 컨텍스트 — 뷰·툴바에 전달 */
export interface CalendarContext {
  state: CalendarState
  schedules: ComputedRef<Schedule[]>
  holidays: ComputedRef<Holiday[]>
  monthLabel: ComputedRef<string>
  monthCells: ComputedRef<MonthDayCell[]>
  weekDays: ComputedRef<Date[]>
  listRows: ComputedRef<CalendarListRow[]>
  /** @internal emit-only 연동에서는 사용하지 마세요. 직접 state 조작이 필요한 headless/standalone 용도 전용입니다. */
  setView: (view: CalendarView) => void
  /** @internal emit-only 연동에서는 사용하지 마세요. 직접 state 조작이 필요한 headless/standalone 용도 전용입니다. */
  selectDate: (date: Date) => void
  moveDay: (offset: number) => void
  moveWeek: (offset: number) => void
  moveMonth: (offset: number) => void
  goToToday: () => void
  /** @internal emit-only 부모는 v-model:listFilterDate 또는 list-filter-clear emit을 사용하세요. */
  clearListFilter: () => void
  /** `Schedule.type` 문자열로 색상을 조회합니다. 미등록 타입은 기본 색상을 반환합니다. */
  getTypeStyle: (type: string) => ScheduleTypeStyle
}

/** `usePublicHolidays` 옵션 */
export interface UsePublicHolidaysOptions {
  /**
   * 공공데이터포털 API 조회 여부. 기본 `true`.
   * `false`이면 API를 호출하지 않고 `companyHolidays`만 사용합니다.
   */
  fetchPublicHolidays?: MaybeRefOrGetter<boolean>
  /**
   * 공공데이터포털 인증키.
   * **프로덕션에서는 BFF/same-origin proxy를 통해 서버에서 주입**하고 이 옵션을 생략하세요.
   * 클라이언트에서 직접 전달하면 번들에 키가 노출됩니다. DEV 모드에서는 경고가 출력됩니다.
   */
  serviceKey?: string
  /** API 결과와 병합할 회사·사내 기념일 */
  companyHolidays?: MaybeRefOrGetter<Holiday[]>
}
