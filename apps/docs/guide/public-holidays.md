# 공휴일 연동

공공데이터포털 공휴일 API를 통해 대한민국 법정 공휴일을 자동으로 표시합니다.

## 기본 사용

```vue
<template>
  <ScheduleCalendar
    :fetch-public-holidays="true"
    :public-holiday-service-key="serviceKey"
    ...
  />
</template>
```

::: danger 보안 주의
`publicHolidayServiceKey`를 클라이언트 번들에 직접 노출하면 API 키가 탈취될 수 있습니다.
**BFF(Backend for Frontend) 프록시를 사용하세요.**
:::

## BFF 프록시 패턴 (권장)

서버(BFF)가 API 키를 주입하고, 클라이언트는 같은 오리진의 프록시 엔드포인트를 사용합니다:

```ts
// Nuxt / Express / Next.js API route
// GET /api/holidays?year=2026&month=4
export default async function handler(req, res) {
  const { year, month } = req.query
  const response = await fetch(
    `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo` +
    `?serviceKey=${process.env.DATA_GO_KR_KEY}&year=${year}&month=${month}&_type=json`,
  )
  res.json(await response.json())
}
```

클라이언트에서는 키 없이 프록시만 사용:

```vue
<template>
  <!-- serviceKey 없이 사용 — BFF가 자동으로 주입 -->
  <ScheduleCalendar :fetch-public-holidays="true" ... />
</template>
```

> 같은 오리진 BFF를 사용하면 `publicHolidayServiceKey`를 생략할 수 있습니다. 컴포넌트는 기본적으로 `/api/holidays` 엔드포인트를 호출합니다.

## 사내 기념일 병합

`holidays` prop으로 사내 기념일을 추가할 수 있습니다:

```ts
import { mergeHolidays } from '@vuepkg/calendar'
import type { Holiday } from '@vuepkg/calendar'

const companyHolidays: Holiday[] = [
  {
    id: 'h-1',
    name: '창립기념일',
    date: new Date(2026, 3, 1), // 4월 1일
    kind: 'company',
  },
]
```

```vue
<template>
  <ScheduleCalendar
    :holidays="companyHolidays"
    :fetch-public-holidays="true"
    ...
  />
</template>
```

공공 API 결과와 사내 기념일은 자동으로 병합됩니다.

## usePublicHolidays (독립 사용)

```ts
import { usePublicHolidays } from '@vuepkg/calendar'

const { publicHolidays, loading, error } = usePublicHolidays({
  fetchPublicHolidays: () => true,
  serviceKey: undefined, // BFF 사용
})
```

- 같은 연도에 대한 API 호출은 1회만 발생 (캐시)
- 실패 후 30초 TTL 이내에는 재시도하지 않음
- `loading`: `computed` — 복수 요청 동시 진행 시에도 정확

## Holiday 타입

```ts
interface Holiday {
  id: string
  name: string
  date: Date
  kind: 'public' | 'company' | string
}
```
