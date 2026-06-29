# @vuepkg/theme

CSS variable design tokens for the `@vuepkg` ecosystem — **zero JavaScript, zero runtime**.

모든 `@vuepkg` 컴포넌트의 색상·크기·간격을 `--vp-*` CSS 변수로 정의합니다.  
라이트 테마 기본값 + 다크 모드 오버라이드 포함.

---

## 설치

```bash
npm install @vuepkg/theme
```

> **참고**: `@vuepkg/calendar`를 npm으로 설치하면 테마 토큰이 `style.css`에 이미 번들됩니다.  
> 이 패키지는 토큰을 직접 커스터마이징하거나 다른 `@vuepkg` 컴포넌트와 함께 사용할 때 설치합니다.

---

## 사용법

```ts
// main.ts
import '@vuepkg/theme/index.css'   // 라이트 + 다크 토큰 전체
```

필요에 따라 개별 파일만 불러올 수도 있습니다:

```ts
import '@vuepkg/theme/base'   // 라이트 테마만
import '@vuepkg/theme/dark'   // 다크 오버라이드만
```

---

## 다크 모드

### 시스템 설정 자동 반영

별도 작업 없이 `@media (prefers-color-scheme: dark)` 블록이 자동 적용됩니다.

### 수동 토글 (클래스 기반)

```ts
document.documentElement.classList.toggle('vp-dark')
```

```html
<html class="vp-dark">
```

---

## 토큰 구조 (3계층)

| 계층 | 접두사 | 역할 |
|------|--------|------|
| Primitive | `--vp-palette-*` | 팔레트 원시값 (변경 비권장) |
| Semantic | `--vp-color-*` | 의미 기반 색상 (배경·텍스트·강조 등) |
| Component | `--vp-calendar-*`, `--vp-chip-*` … | 컴포넌트별 세부 토큰 |

**권장 커스터마이징**: Semantic 계층만 덮어써도 전체 테마가 일관성 있게 변경됩니다.

---

## 커스터마이징 예시

### 브랜드 색상

```css
:root {
  --vp-color-primary: #7c3aed;
  --vp-today-badge-bg: #7c3aed;
  --vp-month-cell-selected-bg: #f5f3ff;
}
```

### 공휴일 칩

```css
:root {
  --vp-holiday-chip-bg:    #fef3c7;
  --vp-holiday-chip-color: #92400e;
}
```

### 모서리 반경

```css
:root {
  --vp-calendar-radius: 12px;
  --vp-chip-radius: 8px;
}
```

---

## 자주 쓰는 Semantic 토큰

```css
:root {
  --vp-color-bg              /* 캘린더 전체 배경 */
  --vp-color-border          /* 주요 테두리 */
  --vp-color-text            /* 기본 텍스트 */
  --vp-color-text-secondary  /* 보조 텍스트 */
  --vp-color-text-muted      /* 비활성·힌트 텍스트 */
  --vp-color-primary         /* 강조·포커스 색상 */
  --vp-color-sunday          /* 일요일 날짜 색상 */
  --vp-color-saturday        /* 토요일 날짜 색상 */
  --vp-today-badge-bg        /* 오늘 뱃지 배경 */
  --vp-today-badge-text      /* 오늘 뱃지 텍스트 */
}
```

---

## License

MIT © [vuepkg](https://github.com/vuepkg)
