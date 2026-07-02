# usePublicHolidays

공공데이터포털(`SpcdeInfoService/getRestDeInfo`) 국가 공휴일 API를 조회하는 composable입니다. 연도별 캐시를 유지하며, 동일 연도는 1회만 요청하고 실패 시 30초 후 재시도합니다.

> `ScheduleCalendar`에서 `fetchPublicHolidays` prop을 사용하면 이 composable이 내부적으로 호출됩니다. 직접 사용하면 공휴일 데이터를 커스텀 표시 로직에 활용할 수 있습니다.

> Vue 컴포넌트 없이 로직만 필요하다면 `@vuepkg/calendar/headless`에서 동일하게 import할 수 있습니다.

## 시그니처

```ts
function usePublicHolidays(options?: UsePublicHolidaysOptions): {
  publicHolidays: Ref<Holiday[]>
  loading: ComputedRef<boolean>
  error: Ref<string | null>
  loadedYears: Set<number>
  failedYears: Map<number, number> // year → 실패 시각(epoch ms)
  ensureYear: (year: number) => Promise<void>
  ensureYearsForDate: (date: Date) => Promise<void>
  getAllHolidays: () => Holiday[] // publicHolidays + companyHolidays 병합
}
```

## 옵션

```ts
interface UsePublicHolidaysOptions {
  /** 공공데이터포털 API 조회 여부. 기본 true — false면 API를 호출하지 않고 companyHolidays만 사용 */
  fetchPublicHolidays?: MaybeRefOrGetter<boolean>
  /** 공공데이터포털 인증키 — 프로덕션에서는 BFF/proxy 경유 권장, 클라이언트 직접 전달 시 DEV 경고 */
  serviceKey?: string
  /** API 결과와 병합할 사내 기념일 */
  companyHolidays?: MaybeRefOrGetter<Holiday[]>
}
```

날짜별 연도를 직접 지정하지 않습니다 — `date`(선택 날짜)가 바뀔 때마다 `ensureYearsForDate(date)`를 호출해 필요한 연도(1월·12월은 인접 연도 포함)만 요청합니다.

## 직접 사용 예

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePublicHolidays } from '@vuepkg/calendar'

const date = ref(new Date())
const { publicHolidays, loading, ensureYearsForDate } = usePublicHolidays({
  fetchPublicHolidays: true,
})

watch(date, (d) => ensureYearsForDate(d), { immediate: true })
</script>

<template>
  <div v-if="loading">공휴일 조회 중...</div>
  <ul v-else>
    <li v-for="h in publicHolidays" :key="h.id">
      {{ h.dateKey }} — {{ h.name }}
    </li>
  </ul>
</template>
```

## Holiday 타입

```ts
interface Holiday {
  id: string
  dateKey: string // 'YYYY-MM-DD'
  name: string
  kind: 'public' | 'company'
}
```

## 캐시·재시도 동작

- 연도는 `loadedYears`에 성공적으로 로드된 연도만 등록되며, 동일 연도는 다시 요청하지 않습니다.
- 실패한 연도는 `failedYears`에 실패 시각과 함께 기록되고, 30초(`RETRY_AFTER_MS`) 동안 재시도를 건너뜁니다.
- `unmount`(scope dispose) 시 진행 중인 요청을 `AbortController`로 취소합니다.

## BFF 프록시 패턴

보안을 위해 API 키를 클라이언트에 노출하지 않도록 BFF(Backend For Frontend) 프록시를 사용하세요.

→ [공휴일 연동 가이드](/guide/public-holidays) 참조
