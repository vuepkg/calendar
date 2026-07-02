# 테마 커스터마이징

`@vuepkg/calendar`의 모든 색상·크기·간격은 CSS 변수(`--vp-*`)로 정의되어 있습니다.  
`@vuepkg/theme` 패키지가 기본 토큰 값을 제공하며, 소비자 앱에서 원하는 부분만 덮어쓸 수 있습니다.

## 설치

```bash
pnpm add @vuepkg/calendar @vuepkg/theme
```

## 기본 사용

```ts
// main.ts
import '@vuepkg/theme/index.css'      // 디자인 토큰 (라이트 + 다크)
import '@vuepkg/calendar/style.css'   // 컴포넌트 스타일
```

## 다크 모드

`@vuepkg/theme`은 두 가지 방식으로 다크 모드를 지원합니다.

### 1. 시스템 설정 자동 반영

별도 작업 없이 `@media (prefers-color-scheme: dark)` 블록에서 자동으로 전환됩니다.

### 2. 수동 토글 (클래스 기반)

루트 엘리먼트에 `vp-dark` 클래스를 추가하면 강제로 다크 모드가 활성화됩니다.

```ts
// 토글 예시
document.documentElement.classList.toggle('vp-dark')
```

```html
<!-- 또는 직접 -->
<html class="vp-dark">
```

## 토큰 구조 (3계층)

| 계층 | 접두사 | 역할 |
|------|--------|------|
| Primitive | `--vp-palette-*` | 팔레트 원시 색상값 (변경 비권장) |
| Semantic | `--vp-color-*` | 의미 기반 색상 (배경·텍스트·강조 등) |
| Component | `--vp-calendar-*`, `--vp-chip-*` … | 컴포넌트별 세부 토큰 |

**권장 커스터마이징 범위**: Semantic 계층만 덮어써도 전체 테마가 일관성 있게 변경됩니다.

## 브랜드 색상 적용

```css
:root {
  /* 브랜드 primary 색상 변경 */
  --vp-color-primary: #7c3aed;
  --vp-color-primary-subtle: #f5f3ff;
  --vp-color-primary-border: #c4b5fd;

  /* 포커스 링도 자동으로 변경됨 (--vp-focus-ring 참조) */
}
```

## 자주 쓰는 토큰 목록

### 공통 색상

```css
:root {
  --vp-color-bg:               /* 캘린더 전체 배경 */
  --vp-color-border:           /* 주요 테두리 */
  --vp-color-text:             /* 기본 텍스트 */
  --vp-color-text-secondary:   /* 보조 텍스트 */
  --vp-color-text-muted:       /* 비활성·힌트 텍스트 */
  --vp-color-primary:          /* 강조·포커스 색상 */
  --vp-color-sunday:           /* 일요일 날짜 색상 */
  --vp-color-saturday:         /* 토요일 날짜 색상 */
}
```

### 오늘 날짜 뱃지

```css
:root {
  --vp-today-badge-bg:   /* 뱃지 배경 (기본: 틸) */
  --vp-today-badge-text: /* 뱃지 텍스트 (기본: 흰색) */
}
```

### 버튼 (`@vuepkg/ui` Button · IconButton)

```css
:root {
  --vp-button-bg:        /* 배경 */
  --vp-button-bg-hover:  /* hover 배경 */
  --vp-button-border:    /* 테두리 */
  --vp-button-text:      /* 텍스트 색상 */
  --vp-button-radius:    /* 모서리 반경 (기본 4px) */
}
```

### 공휴일 칩

```css
:root {
  --vp-holiday-chip-bg:    /* 칩 배경 (기본: 연분홍) */
  --vp-holiday-chip-color: /* 칩 텍스트 (기본: 진빨강) */
}
```

### 월간 뷰 셀

```css
:root {
  --vp-month-cell-bg:          /* 일반 셀 배경 */
  --vp-month-cell-outside-bg:  /* 이전/다음 달 셀 배경 */
  --vp-month-cell-selected-bg: /* 선택된 셀 배경 */
  --vp-month-header-bg:        /* 요일 헤더 배경 */
}
```

### 팝오버

```css
:root {
  --vp-popover-bg:         /* 팝오버 배경 */
  --vp-popover-border:     /* 팝오버 테두리 */
  --vp-popover-shadow:     /* 팝오버 그림자 */
  --vp-popover-radius:     /* 팝오버 모서리 반경 (@vuepkg/ui Popover, 기본 4px) */
  --vp-popover-header-bg:  /* 팝오버 헤더 배경 */
}
```

### 데이터 테이블

```css
:root {
  --vp-table-header-bg:     /* 테이블 헤더 배경 (@vuepkg/ui DataTable) */
  --vp-table-row-hover-bg:  /* 행 hover 배경 */
  --vp-table-row-stripe-bg: /* 홀짝 줄무늬 배경 */
}
```

## 사용 예시

### 회사 브랜드 색상

```css
:root {
  --vp-color-primary: #0f7f3b;
  --vp-color-primary-subtle: #ecfdf5;
  --vp-color-primary-border: #6ee7b7;
  --vp-today-badge-bg: #0f7f3b;
  --vp-color-selected-bg: #d1fae5;
  --vp-month-cell-selected-bg: #d1fae5;
}
```

### 공휴일 칩 색상 변경

```css
:root {
  --vp-holiday-chip-bg:    #fef3c7; /* 노란 배경 */
  --vp-holiday-chip-color: #92400e; /* 갈색 텍스트 */
}
```

### 모서리 반경 조정

```css
:root {
  --vp-calendar-radius: 12px; /* 캘린더 컨테이너 */
  --vp-chip-radius: 8px;      /* 이벤트 칩·버튼 */
}
```

## `@vuepkg/theme` 없이 사용

테마 패키지 없이 직접 모든 토큰을 정의하는 것도 가능합니다.  
단, 필수 토큰이 빠지면 색상이 비어 보일 수 있으므로 `base.css` 전체를 복사해서 시작점으로 사용하는 것을 권장합니다.

```css
/* 직접 정의 예시 — base.css 를 복사 후 수정 */
:root {
  --vp-color-bg: #1a1a2e;
  --vp-color-border: #16213e;
  /* … 나머지 토큰 … */
}
```

## Tailwind CSS 프로젝트에서 사용하기

> **공개 문서(VitePress)와 동일 내용:** `apps/docs/guide/theming.md` § Tailwind — 사이트 배포 시 그쪽이 정본입니다.

Tailwind 앱과 **공존 가능**하며, `#event`/`#day-cell`/`#toolbar`/`#month-overflow-item` scoped slot으로 해당 영역의 마크업을 Tailwind 콘텐츠로 교체할 수 있습니다(REV-A1, 2026-07-02 구현).

| 시도 | 결과 |
| ---- | ---- |
| `<ScheduleCalendar class="m-4 shadow-xl" />` | 루트에 class 합쳐짐. margin·shadow 등은 보통 적용 |
| `<ScheduleCalendar class="rounded-2xl" />` | 라이브러리 scoped CSS와 충돌 가능 |
| 내부 요소에 Tailwind class | `#event`/`#day-cell`/`#toolbar` slot으로 **가능** — 소비자가 직접 마크업 렌더 |
| `scheduleTypeOptions` 색상 | 인라인 style — Tailwind utility보다 우선 |

**권장 패턴:** Tailwind `@theme` / 팔레트 값을 `:root`의 `--vp-*`에 매핑.

```css
@import "tailwindcss";
@import "@vuepkg/calendar/style.css";

@theme {
  --color-brand: #16a34a;
}

:root {
  --vp-color-primary: var(--color-brand);
  --vp-calendar-radius: 0.75rem;
}
```

**완전한 Tailwind 마크업**이 필요하면 `@vuepkg/calendar/headless` + 자체 UI.

**남은 항목:** List 행(`list-row`) 커스터마이즈는 아직 미지원 — `DataTable`의 `cell-*` slot 재노출 후속 작업. 상세: [architecture.md § Scoped Slots](../dev/architecture.md#scoped-slots-rev-a1-2026-07-02), `docs/vue3-reviewer-backlog.md` § Critical.
