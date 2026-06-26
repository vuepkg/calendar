import { computed, ref } from 'vue'
import { applyScheduleFilters, useScheduleCalendarHost, type Schedule } from '@/components/calendar'
import { mockCompanyHolidays } from '@/data/mockSchedules'
import { CURRENT_USER_ID, mockSchedules } from '@/data/mockSchedules'
import { startOfDay } from '@/utils/date'

/**
 * E2E 호스트 레이아웃용 — App.vue와 동일한 연동 패턴, 필터 UI 없음.
 */
export function useHostCalendarFixture() {
  const allSchedules = ref<Schedule[]>(mockSchedules.map((schedule) => ({ ...schedule })))

  const { view, date, listFilterDate, viewScope, scheduleTypes, calendarListeners } =
    useScheduleCalendarHost({
      initialView: 'month',
      initialDate: startOfDay(new Date(2026, 3, 19)),
    })

  const schedules = computed(() =>
    applyScheduleFilters(allSchedules.value, {
      viewScope: viewScope.value,
      scheduleTypes: scheduleTypes.value,
      currentUserId: CURRENT_USER_ID,
    }),
  )

  return {
    view,
    date,
    listFilterDate,
    viewScope,
    scheduleTypes,
    calendarListeners,
    schedules,
    companyHolidays: mockCompanyHolidays,
  }
}
