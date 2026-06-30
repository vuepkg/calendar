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

## 공통 동작 — 속성 폴스루(Attribute Fallthrough)

두 컴포넌트 모두 단일 루트 `<button>`이므로 Vue 3의 기본 동작에 따라 prop으로 선언하지 않은 속성은 자동으로 루트 엘리먼트에 전달됩니다:

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
