# usePublicHolidays

공공데이터포털 공휴일 API를 조회하는 composable입니다. 30초 TTL 캐시와 `loading` 상태를 내장합니다.

> `ScheduleCalendar`에서 `fetchPublicHolidays` prop을 사용하면 이 composable이 내부적으로 호출됩니다. 직접 사용하면 공휴일 데이터를 커스텀 표시 로직에 활용할 수 있습니다.

## 시그니처

```ts
function usePublicHolidays(options: UsePublicHolidaysOptions): PublicHolidayContext
```

## 옵션

```ts
interface UsePublicHolidaysOptions {
  year: MaybeRefOrGetter<number>
  month: MaybeRefOrGetter<number>  // 1-12
  serviceKey?: string              // 공공 API 인증키 (BFF 없이 직접 호출 시)
  proxyUrl?: string                // BFF 프록시 URL (권장)
}
```

## 반환값

```ts
interface PublicHolidayContext {
  holidays: ComputedRef<Holiday[]>
  loading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  refetch: () => void
}
```

## 직접 사용 예

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePublicHolidays } from '@vuepkg/calendar'

const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth() + 1)

const { holidays, loading } = usePublicHolidays({
  year,
  month,
  proxyUrl: '/api/public-holidays',  // BFF 프록시 권장
})
</script>

<template>
  <div v-if="loading">공휴일 조회 중...</div>
  <ul v-else>
    <li v-for="h in holidays" :key="h.date.toISOString()">
      {{ h.date.toLocaleDateString('ko-KR') }} — {{ h.name }}
    </li>
  </ul>
</template>
```

## Holiday 타입

```ts
interface Holiday {
  date: Date
  name: string
}
```

## 캐시 동작

동일한 `year`/`month` 조합은 30초 동안 캐시됩니다. `year`나 `month`가 반응형으로 바뀌면 자동으로 재요청합니다.

## BFF 프록시 패턴

보안을 위해 API 키를 클라이언트에 노출하지 않도록 BFF(Backend For Frontend) 프록시를 사용하세요.

→ [공휴일 연동 가이드](/guide/public-holidays) 참조
