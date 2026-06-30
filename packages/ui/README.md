# @vuepkg/ui

Headless-friendly Vue 3 UI primitives for the `@vuepkg` ecosystem.

`@vuepkg/calendar`의 내부 구현(네비게이션 버튼 등)에서 추출한 범용 컴포넌트입니다. CSS 변수(`--vp-button-*`)로 테마가 적용되며, [`@vuepkg/theme`](https://www.npmjs.com/package/@vuepkg/theme)와 함께 사용합니다.

## 설치

```bash
npm install @vuepkg/ui @vuepkg/theme
```

```ts
// main.ts
import '@vuepkg/theme/index.css'
import '@vuepkg/ui/style.css'
```

`vue` 3.5+ 가 peerDependency입니다.

---

## `Button`

텍스트 버튼. `<button>`을 그대로 감싸므로 `disabled`, `class`, `style`, `data-*`, 네이티브 이벤트(`@click`, `@dblclick` 등)를 별도 설정 없이 그대로 전달할 수 있습니다.

```vue
<script setup lang="ts">
import { Button } from '@vuepkg/ui'
</script>

<template>
  <Button @click="goToday">Today</Button>
  <Button weight="bold" @click="submit">저장</Button>
  <Button disabled>비활성</Button>
</template>
```

### Props

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| `weight` | `'normal' \| 'bold'` | `'normal'` | 글자 굵기 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 네이티브 `<button>` type 속성 |

> `type`은 명시적 prop입니다. 폼 안에서 의도치 않게 `submit`으로 동작하는 것을 막기 위해 기본값이 `'button'`으로 고정되어 있으며, 필요할 때만 `type="submit"`을 직접 지정하세요.

---

## `IconButton`

정사각형 아이콘 버튼. `‹ ›` 같은 네비게이션 화살표용입니다. `aria-label`이 필수 prop입니다.

```vue
<script setup lang="ts">
import { IconButton } from '@vuepkg/ui'
</script>

<template>
  <IconButton ariaLabel="Previous month" @click="prevMonth">‹</IconButton>
  <IconButton ariaLabel="Next month" @click="nextMonth">›</IconButton>
  <IconButton ariaLabel="Previous week" size="sm" @click="prevWeek">‹</IconButton>
</template>
```

### Props

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| `ariaLabel` | `string` | — (필수) | 스크린리더용 라벨. 시각적 라벨이 없는 아이콘 버튼이므로 항상 전달해야 합니다 |
| `size` | `'sm' \| 'md'` | `'md'` | `sm`: 30×30px, `md`: 32×32px |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 네이티브 `<button>` type 속성 |

---

## `SegmentedControl`

단일 선택 토글 버튼 그룹 (예: 캘린더 Month/Week/Day/List 뷰 전환). `v-model`로 사용합니다.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SegmentedControl } from '@vuepkg/ui'

const view = ref('month')
const options = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
  { value: 'list', label: 'List' },
]
</script>

<template>
  <SegmentedControl v-model="view" :options="options" ariaLabel="캘린더 보기 선택" />
</template>
```

### Props

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| `options` | `{ value: string; label: string }[]` | — (필수) | 선택 항목 목록 |
| `modelValue` | `string` | — (필수) | 현재 선택된 `value` |
| `ariaLabel` | `string` | — (필수) | 그룹 전체에 대한 스크린리더 라벨 |

### Emits

| 이벤트 | 페이로드 | 설명 |
| ---- | ---- | ---- |
| `update:modelValue` | `string` | 옵션 클릭 또는 키보드 네비게이션으로 선택이 바뀔 때 |

### 키보드 동작 (Roving tabindex)

- `←`/`→` (또는 `↑`/`↓`): 이전/다음 옵션으로 포커스·선택 이동 (양 끝에서 순환)
- `Home`/`End`: 첫/마지막 옵션으로 이동
- 선택된 항목만 `tabindex="0"`, 나머지는 `-1` — Tab 키로 그룹에 진입하면 항상 현재 선택값에 포커스됨

---

## `Chip`

레이블·태그형 표시 요소. 정적 표시(공휴일 칩)와 클릭 가능한 인터랙티브 칩(일정 칩) 둘 다 지원합니다. 색상은 토큰(`--vp-chip-*`) 또는 `color`/`backgroundColor` prop으로 동적 오버라이드할 수 있습니다.

```vue
<script setup lang="ts">
import { Chip } from '@vuepkg/ui'
</script>

<template>
  <!-- 정적 표시 -->
  <Chip>공휴일</Chip>

  <!-- 클릭 가능 + 동적 색상 -->
  <Chip clickable color="#1565c0" backgroundColor="#e3f2fd" @click="onSelect">
    회의
  </Chip>
</template>
```

### Props

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| `color` | `string` | — | 텍스트·테두리 색상 인라인 오버라이드 |
| `backgroundColor` | `string` | — | 배경색 인라인 오버라이드 |
| `clickable` | `boolean` | `false` | `true`이면 `role="button"`, `tabindex="0"`, 클릭/Enter/Space 인터랙션 활성화 |

### Emits

| 이벤트 | 페이로드 | 설명 |
| ---- | ---- | ---- |
| `click` | `MouseEvent \| KeyboardEvent` | `clickable`일 때 클릭 또는 Enter/Space 입력 시 |

> `Chip`은 `border-radius`(`--vp-chip-radius`)와 클릭 인터랙션만 제공하는 최소 셸입니다. `padding`·`font-size`·기본 색상 등은 의도적으로 비워뒀습니다 — 용도별로 padding/크기 차이가 커서(예: 공휴일 칩 vs 일정 칩) 무리하게 통일하지 않고, 소비 측 컴포넌트가 `class` 폴스루로 자신의 스타일을 얹는 방식을 권장합니다.

---

## `Popover`

위치 지정·포커스 관리가 포함된 오버레이 패널. 앵커 좌표(`anchorTop`/`anchorLeft`)를 기준으로 화면 경계 안에 들어오도록 위치·최대 크기를 자동 계산하고(공간이 부족하면 위로 뒤집음), `body`로 Teleport되어 렌더링됩니다. 콘텐츠는 슬롯으로 전달하는 헤드리스 컴포넌트입니다.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Popover } from '@vuepkg/ui'

const open = ref(false)
const anchor = ref({ top: 0, left: 0 })

function onTriggerClick(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  anchor.value = { top: rect.bottom + 4, left: rect.left }
  open.value = true
}
</script>

<template>
  <button @click="onTriggerClick">옵션 더보기</button>

  <Popover
    :open="open"
    :anchorTop="anchor.top"
    :anchorLeft="anchor.left"
    ariaLabel="옵션 메뉴"
    @close="open = false"
  >
    <ul>
      <li><button type="button">수정</button></li>
      <li><button type="button">삭제</button></li>
    </ul>
  </Popover>
</template>
```

### Props

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| `open` | `boolean` | — (필수) | 표시 여부 |
| `anchorTop` | `number` | — (필수) | 앵커 기준 top 좌표(px, viewport 기준) |
| `anchorLeft` | `number` | — (필수) | 앵커 기준 left 좌표(px, viewport 기준) |
| `anchorBottom` | `number` | — | 위쪽으로 뒤집을 때 기준이 되는 앵커 하단 좌표 (미전달 시 `anchorTop` 사용) |
| `containerBounds` | `RectBounds \| null` | — | 패널 위치·크기를 제한할 컨테이너 영역 (임베디드 레이아웃용, `@vuepkg/core`의 `toRectBounds`로 생성) |
| `ariaLabel` | `string` | — (필수) | 패널 `role="dialog"`의 스크린리더 라벨 |
| `panelClass` | `string \| string[] \| Record<string, boolean>` | — | 패널 엘리먼트(`.vp-popover`)에 추가할 클래스 — 소비 측 전용 스타일 후킹용 |
| `preferredWidth` / `preferredMaxHeight` / `minWidth` / `minHeight` / `containerHeightRatio` | `number` | `@vuepkg/core`의 `POPOVER_LAYOUT_DEFAULTS` 참고 | 위치·크기 계산 세부 옵션 |

### Emits

| 이벤트 | 페이로드 | 설명 |
| ---- | ---- | ---- |
| `close` | — | 배경(backdrop) 클릭 또는 `Esc` 키 입력 시 |

### 키보드·접근성

- `role="dialog"` `aria-modal="true"` + `ariaLabel`
- `Esc`: 어디에 포커스가 있든 닫힘(`close` emit)
- 배경 클릭: 닫힘(`close` emit) — 패널 내부 클릭은 전파되지 않음
- 열릴 때 패널 내부 첫 번째 포커스 가능 요소로 자동 포커스 이동, 포커스 가능한 요소가 없으면 패널 자체로 이동
- `Tab`/`Shift+Tab`: 패널 내부에서 순환(focus trap) — 패널 밖으로 포커스가 빠져나가지 않음
- 닫힐 때 열기 전 포커스가 있던 요소로 자동 복원

> 위치·크기 계산 로직(`computePopoverLayout` 등)은 `@vuepkg/core`에 있습니다 — 직접 좌표를 계산해야 하는 경우 그 함수들을 재사용할 수 있습니다.

---

## `DataTable`

페이지네이션·반응형 컬럼 숨김이 포함된 제네릭 테이블 셸 (Vue 3.3+ `<script setup generic="T">`). 행 데이터 타입을 모르는 헤드리스 컴포넌트로, 각 셀의 실제 내용은 `cell-{column.key}` 이름의 named scoped slot으로 전달합니다.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DataTable, type DataTableColumn } from '@vuepkg/ui'

interface Row {
  id: number
  title: string
  type: string
}

const columns: DataTableColumn[] = [
  { key: 'title', label: 'Title', ellipsis: true },
  { key: 'type', label: 'Type', width: '100px', hideBelow: 'md' },
]

const rows: Row[] = [{ id: 1, title: '회의', type: '내 일정' }]
const page = ref(1)
</script>

<template>
  <DataTable
    v-model:page="page"
    :columns="columns"
    :rows="rows"
    :rowKey="(row: Row) => row.id"
    ariaLabel="일정 목록"
    @row-click="(row) => console.log(row)"
  >
    <template #cell-title="{ row }: { row: Row }">{{ row.title }}</template>
    <template #cell-type="{ row }: { row: Row }">{{ row.type }}</template>
  </DataTable>
</template>
```

### Props

| Prop | 타입 | 기본값 | 설명 |
| ---- | ---- | ------ | ---- |
| `columns` | `DataTableColumn[]` | — (필수) | `{ key, label, width?, hideBelow?: 'sm' \| 'md', ellipsis? }[]` |
| `rows` | `T[]` | — (필수) | 전체 행 데이터 (페이지네이션 전, 컴포넌트가 내부에서 slice) |
| `rowKey` | `(row: T) => string \| number` | — (필수) | `:key`로 사용할 고유 값을 뽑는 함수 |
| `page` | `number` | — | 현재 페이지 (1-based). `v-model:page`로 사용 — 미전달 시 내부 상태로 자체 관리(uncontrolled) |
| `pageSize` | `number` | `10` | 페이지당 행 수 |
| `emptyMessage` | `string` | `'No data.'` | `rows`가 빈 배열일 때 표시할 메시지 |
| `ariaLabel` | `string` | — | `<table>`의 스크린리더 라벨 |

### Emits

| 이벤트 | 페이로드 | 설명 |
| ---- | ---- | ---- |
| `update:page` | `number` | 이전/다음 페이지 버튼 클릭 시 (controlled/uncontrolled 공통) |
| `row-click` | `T` | 행 클릭 또는 Enter/Space 입력 시 |

### Slots

| 슬롯 | Props | 설명 |
| ---- | ----- | ---- |
| `cell-{column.key}` | `{ row: T }` | 각 컬럼의 셀 내용 — `columns`에 정의한 모든 키에 대해 제공해야 합니다 |

> 헤더 라벨(`column.label`)은 텍스트만 지원합니다(스코프 제한). 정렬 가능한 헤더나 `caption` 등은 현재 범위 밖입니다. 페이지네이션 버튼은 내부적으로 `IconButton`을 재사용합니다.

---

## 공통 동작 — 속성 폴스루(Attribute Fallthrough)

`Button`/`IconButton`/`Chip`은 단일 루트 엘리먼트이므로 Vue 3의 기본 동작에 따라 prop으로 선언하지 않은 속성은 자동으로 루트 엘리먼트에 전달됩니다 (`SegmentedControl`/`DataTable`은 여러 루트 엘리먼트를 렌더링하므로, `Popover`는 `Teleport` + 조건부 렌더링 루트이므로 동일하게 적용되지 않습니다 — `Popover`는 대신 명시적 `panelClass` prop을 제공합니다):

```vue
<Button class="my-extra-class" data-testid="save-btn" disabled>저장</Button>
```

- `class`/`style` → 컴포넌트 자체 클래스와 **병합**
- `disabled`, `data-*`, `aria-*` (`ariaLabel` 제외) → 그대로 전달
- `@click` 외 임의의 네이티브 이벤트(`@dblclick`, `@mouseenter` 등) → 자동 바인딩

---

## 테마 토큰

```css
:root {
  --vp-button-bg:        /* 배경 */
  --vp-button-bg-hover:  /* hover 배경 */
  --vp-button-border:    /* 테두리 */
  --vp-button-text:      /* 텍스트 색상 */
  --vp-button-radius:    /* 모서리 반경 (기본 4px) */

  --vp-popover-bg:       /* Popover 패널 배경 */
  --vp-popover-border:   /* Popover 패널 테두리 */
  --vp-popover-shadow:   /* Popover 패널 그림자 */
  --vp-popover-radius:   /* Popover 패널 모서리 반경 (기본 4px) */
  --vp-popover-z-index:  /* Popover z-index (기본 1000) */

  --vp-table-header-bg:     /* DataTable 헤더 배경 */
  --vp-table-row-hover-bg:  /* DataTable 행 hover 배경 */
  --vp-table-row-stripe-bg: /* DataTable 홀짝 줄무늬 배경 */
}
```

`@vuepkg/theme`의 `base.css`에 기본값이 정의되어 있으며, 다크 모드는 `dark.css`(또는 `.vp-dark` 클래스)에서 자동 적용됩니다.

---

## 의존성 방향

```
@vuepkg/core  ←  @vuepkg/ui  ←  @vuepkg/calendar
```

`@vuepkg/ui`는 `@vuepkg/core`에만 의존합니다.

---

## License

MIT © [vuepkg](https://github.com/vuepkg)
