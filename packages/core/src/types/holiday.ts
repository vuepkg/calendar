/** 공휴일 출처 */
export type HolidayKind = 'public' | 'company'

/** 캘린더에 표시할 공휴일·사내 기념일 */
export interface Holiday {
  id: string
  /** `YYYY-MM-DD` */
  dateKey: string
  name: string
  kind: HolidayKind
}
