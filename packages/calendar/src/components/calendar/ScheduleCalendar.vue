<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, toRef, useAttrs, watch } from 'vue'
import { useCalendar } from '@/composables/useCalendar'
import { usePublicHolidays } from '@/composables/usePublicHolidays'
import type {
  CalendarDateSelectPayload,
  CalendarNavigateAction,
  CalendarOverflowClickPayload,
  CalendarScheduleClickPayload,
  CalendarScheduleMovePayload,
  CalendarScheduleResizePayload,
  CalendarTimeSlotSelectPayload,
  ScheduleCalendarEmits,
} from '@/types/calendarEvents'
import type { BuildScheduleQueryChangePayloadInput, ScheduleQueryTrigger } from '@/types/calendarEvents'
import type { Holiday } from '@/types/schedule'
import type { CalendarView, Schedule, ScheduleTypeOption, ViewScope } from '@/types/schedule'
import { startOfDay } from '@/utils/date'
import { mergeHolidays } from '@/utils/holiday'
import { resolveCalendarNavigateDate } from '@/utils/date'
import { buildScheduleQueryChangePayload } from '@/utils/schedule'
import '@/styles/calendarScroll.css'
import CalendarToolbar from './CalendarToolbar.vue'
import DayView from './views/DayView.vue'
import MonthView from './views/MonthView.vue'
import WeekView from './views/WeekView.vue'

const ListView = defineAsyncComponent(() => import('./views/ListView.vue'))

const props = withDefaults(
  defineProps<{
    schedules: Schedule[]
    /** 사내 기념일 등 — API 결과와 병합됩니다 */
    holidays?: Holiday[]
    /**
     * 공공데이터포털 공휴일 API 자동 조회.
     * 기본 `false` — 사용하려면 명시적으로 `true`를 전달하세요.
     * `true`이면 `date` v-model 기준 연도별 1회만 요청합니다.
     */
    fetchPublicHolidays?: boolean
    /**
     * 공공데이터포털 인증키 — proxy/BFF 사용 시 생략.
     * 직접 외부 API URL 호출 시에만 전달합니다.
     */
    publicHolidayServiceKey?: string
    /**
     * `true`이면 뷰 전환 툴바(Month / Week / Day / List)를 숨깁니다.
     * 부모가 `v-model:view`로 뷰를 직접 제어하는 임베딩 시나리오에서 사용합니다.
     */
    hideToolbar?: boolean
    /**
     * 일정 유형 목록 — 칩·바의 색상과 List 뷰 라벨에 사용됩니다.
     * 기본값은 `SCHEDULE_TYPE_OPTIONS` (my/team/company 3종).
     * 커스텀 타입을 추가하려면 기본값을 spread 후 항목을 추가하세요:
     * `[...SCHEDULE_TYPE_OPTIONS, { type: 'project', label: '프로젝트', color: '...', backgroundColor: '...' }]`
     */
    scheduleTypeOptions?: ScheduleTypeOption[]
  }>(),
  {
    fetchPublicHolidays: false,
  },
)

const emit = defineEmits<ScheduleCalendarEmits>()
const attrs = useAttrs()

const view = defineModel<CalendarView>('view', {
  default: 'month',
})

const date = defineModel<Date>('date', {
  default: () => startOfDay(new Date()),
})

const listFilterDate = defineModel<Date | null>('listFilterDate', {
  default: null,
})

const viewScope = defineModel<ViewScope>('viewScope', {
  default: 'company',
})

const scheduleTypes = defineModel<string[] | null>('scheduleTypes', {
  default: null,
})

const {
  ensureYearsForDate,
  publicHolidays,
  error: publicHolidaysError,
} = usePublicHolidays({
  fetchPublicHolidays: () => props.fetchPublicHolidays,
  serviceKey: props.publicHolidayServiceKey,
})

watch(publicHolidaysError, (message) => {
  if (message && import.meta.env.DEV) {
    console.warn('[ScheduleCalendar] public holidays:', message)
  }
})

const resolvedHolidays = computed(() => {
  const companyHolidays = props.holidays ?? []
  if (!props.fetchPublicHolidays) {
    return companyHolidays
  }
  return mergeHolidays(publicHolidays.value, companyHolidays)
})

const calendar = useCalendar({
  schedules: toRef(props, 'schedules'),
  holidays: resolvedHolidays,
  selectedDate: date,
  currentView: view,
  listFilterDate,
  scheduleTypeOptions: props.scheduleTypeOptions,
})

watch(
  date,
  (nextDate) => {
    if (props.fetchPublicHolidays) {
      void ensureYearsForDate(nextDate)
    }
  },
  { immediate: true },
)

const currentView = computed(() => calendar.state.currentView)
const isTimedView = computed(() => currentView.value === 'week' || currentView.value === 'day')
const isMonthView = computed(() => currentView.value === 'month')

type QueryChangeOverrides = Partial<
  Pick<BuildScheduleQueryChangePayloadInput, 'view' | 'date' | 'listFilterDate'>
>

function emitQueryChange(
  trigger: ScheduleQueryTrigger,
  action?: CalendarNavigateAction,
  overrides?: QueryChangeOverrides,
) {
  emit(
    'query-change',
    buildScheduleQueryChangePayload({
      view: overrides?.view ?? view.value,
      date: overrides?.date ?? date.value,
      viewScope: viewScope.value,
      scheduleTypes: scheduleTypes.value,
      listFilterDate: overrides?.listFilterDate ?? listFilterDate.value,
      trigger,
      action,
    }),
  )
}

onMounted(() => {
  if (import.meta.env.DEV && !('onNavigate' in attrs)) {
    console.warn(
      '[ScheduleCalendar] No `navigate` event listener detected. ' +
        'Calendar navigation will be a dead-end without event handlers. ' +
        'Use useScheduleCalendarHost() and spread v-bind="calendarListeners" on <ScheduleCalendar>.',
    )
  }

  emitQueryChange('init')
})

watch([viewScope, scheduleTypes], () => {
  emitQueryChange('filter-change')
})

watch(listFilterDate, () => {
  emitQueryChange('filter-change')
})

function handleViewChange(nextView: CalendarView) {
  emit('view-change', { view: nextView, previousView: view.value })
  emitQueryChange('view-change', undefined, { view: nextView })
}

function handleDateSelect(payload: CalendarDateSelectPayload) {
  emit('date-select', payload)
}

function handleOverflowClick(payload: CalendarOverflowClickPayload) {
  emit('overflow-click', payload)
}

function handleScheduleClick(payload: CalendarScheduleClickPayload) {
  emit('schedule-click', payload)
}

function handleNavigate(action: CalendarNavigateAction) {
  const nextDate = resolveCalendarNavigateDate(date.value, action)
  emit('navigate', {
    action,
    date: nextDate,
  })
  emitQueryChange('navigate', action, { date: nextDate })
}

function handleListFilterClear() {
  emit('list-filter-clear')
  emitQueryChange('list-filter-clear', undefined, { listFilterDate: null })
}

function handleTimeSlotSelect(payload: CalendarTimeSlotSelectPayload) {
  emit('time-slot-select', payload)
}

function handleScheduleMove(payload: CalendarScheduleMovePayload) {
  emit('schedule-move', payload)
}

function handleScheduleResize(payload: CalendarScheduleResizePayload) {
  emit('schedule-resize', payload)
}
</script>

<template>
  <div class="schedule-calendar">
    <CalendarToolbar v-if="!hideToolbar" :calendar="calendar" @view-change="handleViewChange" />

    <section
      class="calendar-content"
      :class="{ 'timed-view': isTimedView, 'month-view-content': isMonthView }"
    >
      <MonthView
        v-if="currentView === 'month'"
        :calendar="calendar"
        @date-select="handleDateSelect"
        @overflow-click="handleOverflowClick"
        @schedule-click="handleScheduleClick"
        @navigate="handleNavigate"
      />
      <WeekView
        v-else-if="currentView === 'week'"
        :calendar="calendar"
        @date-select="handleDateSelect"
        @schedule-click="handleScheduleClick"
        @time-slot-select="handleTimeSlotSelect"
        @schedule-move="handleScheduleMove"
        @schedule-resize="handleScheduleResize"
        @navigate="handleNavigate"
      />
      <DayView
        v-else-if="currentView === 'day'"
        :calendar="calendar"
        @schedule-click="handleScheduleClick"
        @time-slot-select="handleTimeSlotSelect"
        @schedule-move="handleScheduleMove"
        @schedule-resize="handleScheduleResize"
        @navigate="handleNavigate"
      />
      <ListView
        v-else
        :calendar="calendar"
        @schedule-click="handleScheduleClick"
        @list-filter-clear="handleListFilterClear"
        @navigate="handleNavigate"
      />
    </section>
  </div>
</template>

<style>
@import '@vuepkg/theme/index.css';
</style>

<style scoped>
.schedule-calendar {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: var(--vp-calendar-min-height);
  background: var(--vp-calendar-bg);
  border: 1px solid var(--vp-calendar-border);
  border-radius: var(--vp-calendar-radius);
  overflow: hidden;
}

.calendar-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.calendar-content.timed-view,
.calendar-content.month-view-content {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
