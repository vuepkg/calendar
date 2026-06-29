# @vuepkg/core

Core utilities, composables, and types shared across the `@vuepkg` package ecosystem.

> **내부 의존성**: `@vuepkg/calendar`이 내부적으로 사용합니다. 직접 설치는 `@vuepkg/calendar`를 소스 복사 이식할 때만 필요합니다.

## 설치

```bash
npm install @vuepkg/core
```

`vue` 3.5+ 가 peerDependency입니다.

---

## API

### 날짜 유틸 (`@vuepkg/core/utils/date`)

```ts
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  formatDate,
} from '@vuepkg/core'
```

날짜 연산을 위한 순수 함수 모음. 외부 date 라이브러리 의존성 없음.

### 공휴일 유틸 (`@vuepkg/core/utils/holiday`)

```ts
import { groupHolidaysByDateKey } from '@vuepkg/core'
```

`Holiday[]`를 날짜 키(`YYYY-MM-DD`)로 그룹핑합니다.

### 타입

```ts
import type { Holiday, HolidayKind } from '@vuepkg/core'

interface Holiday {
  date: Date
  name: string
  kind: HolidayKind  // 'public' | 'company'
}
```

### `useControllableState` composable

controlled/uncontrolled 패턴을 통일하는 composable. `v-model`을 받으면 controlled, 없으면 내부 상태로 동작합니다.

```ts
import { useControllableState } from '@vuepkg/core'

const [value, setValue] = useControllableState({
  value: props.modelValue,
  defaultValue: props.defaultValue,
  onChange: (v) => emit('update:modelValue', v),
})
```

---

## 의존성 방향

```
@vuepkg/core  ←  @vuepkg/calendar
```

`@vuepkg/core`는 다른 `@vuepkg` 패키지에 의존하지 않습니다. `vue` peer만.

---

## License

MIT © [vuepkg](https://github.com/vuepkg)
