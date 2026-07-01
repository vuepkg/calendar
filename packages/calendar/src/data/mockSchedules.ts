import type { Holiday, Participant, Schedule } from '@/types/schedule'

export const CURRENT_USER_ID = 'user-hong'

export const participants: Participant[] = [
  { id: CURRENT_USER_ID, name: 'HONG GILDONG' },
  { id: 'user-kim', name: 'KIM MINSU' },
  { id: 'user-lee', name: 'LEE JIYEON' },
  { id: 'user-park', name: 'PARK SOYOUNG' },
]

function at(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`)
}

function allDay(date: string): { start: Date; end: Date } {
  return {
    start: at(date, '00:00'),
    end: at(date, '23:59'),
  }
}

function allDayRange(startDate: string, endDate: string): { start: Date; end: Date } {
  return {
    start: at(startDate, '00:00'),
    end: at(endDate, '23:59'),
  }
}

export const mockSchedules: Schedule[] = [
  {
    id: 's-001',
    title: 'A회의실 팀 회의',
    type: 'team_schedule',
    participantId: 'user-kim',
    participantName: 'KIM MINSU',
    ...allDay('2026-05-01'),
    remarks: '2026-05-01 ~ 2026-05-01',
    allDay: true,
  },
  {
    id: 's-002',
    title: '휴가',
    type: 'my_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    ...allDay('2026-05-01'),
    remarks: '2026-05-01 ~ 2026-05-01',
    allDay: true,
  },
  {
    id: 's-003',
    title: 'A회의실 팀 회의',
    type: 'team_schedule',
    participantId: 'user-lee',
    participantName: 'LEE JIYEON',
    start: at('2026-05-07', '09:00'),
    end: at('2026-05-07', '10:00'),
    remarks: '2026-05-07 09:00 ~ 2026-05-07 10:00',
  },
  {
    id: 's-004',
    title: '김민수와 프로젝트 미팅',
    type: 'my_schedule',
    participantId: 'user-kim',
    participantName: 'KIM MINSU',
    start: at('2026-05-07', '09:00'),
    end: at('2026-05-07', '11:00'),
    remarks: '2026-05-07 09:00 ~ 2026-05-07 11:00',
  },
  {
    id: 's-005',
    title: '고객사 A 미팅',
    type: 'my_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    start: at('2026-04-19', '10:00'),
    end: at('2026-04-19', '17:00'),
    remarks: '2026-04-19 10:00 ~ 2026-04-19 17:00',
  },
  {
    id: 's-006',
    title: '여수 출장',
    type: 'my_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    ...allDay('2026-04-21'),
    remarks: '2026-04-21 ~ 2026-04-21',
    allDay: true,
  },
  {
    id: 's-007',
    title: '부산 출장',
    type: 'my_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    start: at('2026-04-01', '09:00'),
    end: at('2026-04-01', '10:00'),
    remarks: '2026-04-01 09:00 ~ 2026-04-01 10:00',
  },
  {
    id: 's-008',
    title: '고객사 B 미팅',
    type: 'my_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    start: at('2026-04-01', '10:00'),
    end: at('2026-04-01', '12:00'),
    remarks: '2026-04-01 10:00 ~ 2026-04-01 12:00',
  },
  {
    id: 's-009',
    title: '기술 세미나',
    type: 'team_schedule',
    participantId: 'user-park',
    participantName: 'PARK SOYOUNG',
    start: at('2026-04-01', '10:30'),
    end: at('2026-04-01', '12:30'),
    remarks: '2026-04-01 10:30 ~ 2026-04-01 12:30',
  },
  {
    id: 's-010',
    title: '휴가',
    type: 'my_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    ...allDay('2026-04-01'),
    remarks: '2026-04-01 ~ 2026-04-01',
    allDay: true,
  },
  {
    id: 's-011',
    title: 'B회의실 팀 회의',
    type: 'team_schedule',
    participantId: 'user-lee',
    participantName: 'LEE JIYEON',
    start: at('2026-04-19', '10:00'),
    end: at('2026-04-19', '12:00'),
    remarks: '2026-04-19 10:00 ~ 2026-04-19 12:00',
  },
  {
    id: 's-012',
    title: '고객 미팅',
    type: 'my_schedule',
    participantId: 'user-park',
    participantName: 'PARK SOYOUNG',
    start: at('2026-04-19', '11:00'),
    end: at('2026-04-19', '15:00'),
    remarks: '2026-04-19 11:00 ~ 2026-04-19 15:00',
  },
  {
    id: 's-013',
    title: '고객사 A 미팅',
    type: 'my_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    start: at('2026-04-22', '10:00'),
    end: at('2026-04-22', '14:00'),
    remarks: '2026-04-22 10:00 ~ 2026-04-22 14:00',
  },
  {
    id: 's-014',
    title: '고객 미팅',
    type: 'my_schedule',
    participantId: 'user-kim',
    participantName: 'KIM MINSU',
    start: at('2026-04-22', '11:00'),
    end: at('2026-04-22', '15:00'),
    remarks: '2026-04-22 11:00 ~ 2026-04-22 15:00',
  },
  {
    id: 's-015',
    title: '울산 출장',
    type: 'my_schedule',
    participantId: 'user-lee',
    participantName: 'LEE JIYEON',
    ...allDay('2026-05-01'),
    remarks: '2026-05-01 ~ 2026-05-01',
    allDay: true,
  },
  {
    id: 's-016',
    title: '기술 세미나',
    type: 'team_schedule',
    participantId: 'user-park',
    participantName: 'PARK SOYOUNG',
    start: at('2026-05-01', '09:00'),
    end: at('2026-05-01', '10:00'),
    remarks: '2026-05-01 09:00 ~ 2026-05-01 10:00',
  },
  {
    id: 's-017',
    title: '안전교육',
    type: 'company_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    start: at('2026-05-01', '13:00'),
    end: at('2026-05-01', '14:00'),
    remarks: '2026-05-01 13:00 ~ 2026-05-01 14:00',
  },
  {
    id: 's-018',
    title: '전사 워크샵',
    type: 'company_schedule',
    participantId: 'user-kim',
    participantName: 'KIM MINSU',
    ...allDay('2026-04-21'),
    remarks: '2026-04-21 ~ 2026-04-21',
    allDay: true,
  },
  {
    id: 's-019',
    title: '팀 휴가',
    type: 'team_schedule',
    participantId: 'user-lee',
    participantName: 'LEE JIYEON',
    ...allDay('2026-04-21'),
    remarks: '2026-04-21 ~ 2026-04-21',
    allDay: true,
  },
  {
    id: 's-020',
    title: '지점 방문',
    type: 'my_schedule',
    participantId: 'user-park',
    participantName: 'PARK SOYOUNG',
    ...allDay('2026-04-21'),
    remarks: '2026-04-21 ~ 2026-04-21',
    allDay: true,
  },
  {
    id: 's-021',
    title: '인천 출장',
    type: 'my_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    ...allDay('2026-04-21'),
    remarks: '2026-04-21 ~ 2026-04-21',
    allDay: true,
  },
  {
    id: 's-022',
    title: '제주 연수',
    type: 'company_schedule',
    participantId: 'user-kim',
    participantName: 'KIM MINSU',
    ...allDayRange('2026-04-23', '2026-04-25'),
    remarks: '2026-04-23 ~ 2026-04-25',
    allDay: true,
  },
  {
    id: 's-023',
    title: '해외 출장',
    type: 'my_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    ...allDayRange('2026-04-27', '2026-04-28'),
    remarks: '2026-04-27 ~ 2026-04-28',
    allDay: true,
  },
  {
    id: 's-024',
    title: '전사 교육',
    type: 'company_schedule',
    participantId: 'user-kim',
    participantName: 'KIM MINSU',
    ...allDay('2026-05-15'),
    remarks: '2026-05-15 ~ 2026-05-15',
    allDay: true,
  },
  {
    id: 's-025',
    title: '팀 미팅',
    type: 'team_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    start: at('2026-05-15', '09:00'),
    end: at('2026-05-15', '10:00'),
    remarks: '2026-05-15 09:00 ~ 2026-05-15 10:00',
  },
  {
    id: 's-026',
    title: '비품 점검',
    type: 'my_schedule',
    participantId: 'user-lee',
    participantName: 'LEE JIYEON',
    start: at('2026-05-15', '11:00'),
    end: at('2026-05-15', '12:00'),
    remarks: '2026-05-15 11:00 ~ 2026-05-15 12:00',
  },
  {
    id: 's-027',
    title: '부산 출장',
    type: 'my_schedule',
    participantId: 'user-park',
    participantName: 'PARK SOYOUNG',
    ...allDay('2026-05-15'),
    remarks: '2026-05-15 ~ 2026-05-15',
    allDay: true,
  },
  {
    id: 's-028',
    title: '기술 세미나',
    type: 'team_schedule',
    participantId: 'user-kim',
    participantName: 'KIM MINSU',
    start: at('2026-05-15', '14:00'),
    end: at('2026-05-15', '15:00'),
    remarks: '2026-05-15 14:00 ~ 2026-05-15 15:00',
  },
  {
    id: 's-029',
    title: '안전 워크샵',
    type: 'company_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    ...allDay('2026-05-15'),
    remarks: '2026-05-15 ~ 2026-05-15',
    allDay: true,
  },
  {
    id: 's-030',
    title: '오전 스탠드업',
    type: 'team_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    start: at('2026-05-20', '09:00'),
    end: at('2026-05-20', '09:30'),
    remarks: '2026-05-20 09:00 ~ 2026-05-20 09:30',
  },
  {
    id: 's-031',
    title: '일정 조율',
    type: 'team_schedule',
    participantId: 'user-kim',
    participantName: 'KIM MINSU',
    start: at('2026-05-20', '09:30'),
    end: at('2026-05-20', '10:00'),
    remarks: '2026-05-20 09:30 ~ 2026-05-20 10:00',
  },
  {
    id: 's-032',
    title: '매장 점검',
    type: 'my_schedule',
    participantId: CURRENT_USER_ID,
    participantName: 'HONG GILDONG',
    start: at('2026-05-20', '10:00'),
    end: at('2026-05-20', '10:30'),
    remarks: '2026-05-20 10:00 ~ 2026-05-20 10:30',
  },
  {
    id: 's-033',
    title: '동료 협업',
    type: 'team_schedule',
    participantId: 'user-lee',
    participantName: 'LEE JIYEON',
    start: at('2026-05-20', '10:15'),
    end: at('2026-05-20', '10:45'),
    remarks: '2026-05-20 10:15 ~ 2026-05-20 10:45',
  },
  {
    id: 's-034',
    title: '오후 브리핑',
    type: 'team_schedule',
    participantId: 'user-park',
    participantName: 'PARK SOYOUNG',
    start: at('2026-05-20', '14:00'),
    end: at('2026-05-20', '14:30'),
    remarks: '2026-05-20 14:00 ~ 2026-05-20 14:30',
  },
]

/** 3일 종일 일정 샘플 ID (제주 연수) */
export const MULTI_DAY_ALL_DAY_ID = 's-022'

/** 3일 종일 일정 범위 (2026-04-23 ~ 2026-04-25) */
export const MULTI_DAY_ALL_DAY_START = new Date(2026, 3, 23)
export const MULTI_DAY_ALL_DAY_MIDDLE = new Date(2026, 3, 24)
export const MULTI_DAY_ALL_DAY_END = new Date(2026, 3, 25)

/** 2일 종일 일정 샘플 ID (해외 출장) — 월간 spanning bar 회귀 테스트용 */
export const TWO_DAY_ALL_DAY_ID = 's-023'
export const TWO_DAY_ALL_DAY_TITLE = '해외 출장'

/** 2일 종일 일정 범위 (2026-04-27 ~ 2026-04-28) */
export const TWO_DAY_ALL_DAY_START = new Date(2026, 3, 27)
export const TWO_DAY_ALL_DAY_END = new Date(2026, 3, 28)
export const TWO_DAY_ALL_DAY_START_KEY = '2026-04-27'
export const TWO_DAY_ALL_DAY_END_KEY = '2026-04-28'

/** 주간/일간 2인 겹침 테스트용 날짜 (2026-04-22) */
export const WEEK_OVERLAP_DATE = new Date(2026, 3, 22)

/** 일간 종일 일정 overflow 테스트용 날짜 (2026-04-21, 5건) */
export const ALL_DAY_OVERFLOW_DATE = new Date(2026, 3, 21)

/** 월간 셀 가득 참 샘플 날짜 (2026-05-01, 5건 — +count 없음) */
export const MONTH_OVERFLOW_DATE_KEY = '2026-05-01'

/** 월간 +count 표시 샘플 날짜 (2026-05-15, 6건 → 4건 표시 + +2) */
export const MONTH_PLUS_COUNT_DATE_KEY = '2026-05-15'
export const MONTH_PLUS_COUNT_DATE = new Date(2026, 4, 15)

/** 30분 단위 일정 샘플 날짜 (2026-05-20) */
export const HALF_HOUR_SLOT_DATE = new Date(2026, 4, 20)
export const HALF_HOUR_SLOT_DATE_KEY = '2026-05-20'

/** 데모용 사내 기념일 — Open API 공휴일과 병합 */
export const mockCompanyHolidays: Holiday[] = [
  {
    id: 'company-2026-04-01',
    dateKey: '2026-04-01',
    name: '회사 창립기념일',
    kind: 'company',
  },
]
