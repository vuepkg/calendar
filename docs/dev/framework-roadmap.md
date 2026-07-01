# Calendar Engine Roadmap — `@vuepkg/calendar` 고도화

> 작성: 2026-06-29 · **대대적 개편: 2026-06-30**
> 목표: 단일 `@vuepkg/calendar` 컴포넌트 → **Vue 3 전용 Modern Calendar Engine**
> **전략 결정 (2026-06-30, 방향 전환)**: 범용 Vue 3 디자인 시스템(PrimeVue/Vuetify식 풀세트) 방향을 폐기하고 **calendar 도메인 고도화에 집중**한다. `core`/`ui`/`theme`는 폐기가 아니라 **calendar를 지탱하는 내부 인프라로 스코프를 고정** — `ui`를 외부에 독립 판매하는 범용 컴포넌트 라이브러리로 키우는 것은 더 이상 목표가 아니다.
> **이전 방향 (2026-06-29, 폐기)**: ~~실제 npm 배포 "범용 UI 프레임워크"로 채택을 노린다~~ — PrimeVue/Vuetify(풀세트)·shadcn-vue/Radix Vue(headless+Tailwind) 모두 이미 강자가 있는 레드오션이라는 경쟁 분석 결과 방향 전환. 반면 Vue 캘린더 생태계(FullCalendar/v-calendar/vue-cal)는 modern DX·headless 구조·DnD/Timeline/Recurring 지원이 빈 공간으로 확인됨.
> 남은 유효 원칙: 실 사용자가 생기기 전(`1.0.0` 시점)까지 §1.5의 기술 부채는 여전히 정리 대상.

---

## 0. 비전 & 핵심 통찰

### 0.1 한 줄 비전

> **Vue 3 Composition API 네이티브 · headless 가능 · zero-dependency** 한 Modern Calendar Engine.
> FullCalendar는 무겁고 핵심 기능 다수가 유료 라이선스에 막혀 있고, v-calendar·vue-cal은 정체되어 있다면 — `@vuepkg/calendar`는 **Tailwind/shadcn 친화적 커스터마이징, macOS/Google Calendar 수준 UX, DnD·Timeline·Recurring Event**를 갖춘 캘린더 엔진을 노린다.
> `"zero-dependency · controlled · CSS-variable 테마"` DNA는 그대로 유지 — 다만 이건 이제 **calendar 자체의 구현 원칙**이지, "범용 디자인 시스템 판매"의 차별화 포인트가 아니다.

### 0.2 왜 지금 가능한가 — calendar는 이미 미니 프레임워크다

현재 `@vuepkg/calendar` 내부에는 **재사용 가능한 primitive들이 이미 자체 구현**되어 있다. 새로 만드는 게 아니라 **추출(extract)** 하면 된다:

| 현재 calendar 내부 구현 | → 승격될 `@vuepkg/ui` primitive | 상태 |
| ----------------------- | ------------------------------- | ---- |
| `CalendarPeriodNav` / `CalendarMonthNav` 의 `‹ ›` 버튼 | `Button` / `IconButton` | ✅ 완료 |
| `CalendarToolbar.vue` (SelectButton 비주얼, `aria-pressed`) | `SegmentedControl` | ✅ 완료 |
| `ScheduleEventChip.vue` / `HolidayChip.vue` | `Chip` | ✅ 완료 (`Badge`는 보류) |
| `MonthOverflowPopover.vue` (bounds·flip 계산) | `Popover` | ✅ 완료 |
| `ListView.vue` (네이티브 `<table>`, 페이지네이션, 반응형 컬럼 숨김) | `DataTable` | ✅ 완료 |
| `useScheduleCalendarHost` (controlled 패턴) | `core` 의 controlled-component 컨벤션 | ✅ 완료 (Phase 0) |
| `utils/date.ts`, `utils/holiday.ts` | `@vuepkg/core` 유틸 | ✅ 완료 (Phase 0) |

→ **즉, "calendar를 분해 → 공통 토대 추출 → 그 위에 calendar 재조립"** 이 로드맵의 중심 동선이었다. 이 동선(Phase 0~2)은 2026-06-30 기준 완료됐다. 앞으로는 이 토대 위에서 **calendar 도메인 기능 자체를 고도화**하는 데 집중한다 (→ Phase 4).

### 0.3 차별화 포지셔닝 (지켜야 할 원칙)

| 원칙 | 의미 | 현재 calendar가 이미 지킴? |
| ---- | ---- | -------------------------- |
| **Zero runtime deps** | `vue` peer 외 런타임 의존성 0 | ✅ (PrimeVue 제거 완료) |
| **Controlled / emit-only** | 상태는 소비자가 소유, 컴포넌트는 표현+emit | ✅ (`v-model` + 핸들러) |
| **CSS-variable 테마** | 런타임 JS 테마 엔진 없이 CSS 변수로 테마 | ✅ (Phase 1 완료) |
| **Type-safe public API** | 모든 공개 타입 `types/` 단일 출처 | ✅ |
| **Headless-friendly** | 로직(composable) / 표현(styled) 분리 가능 | ⚠️ 부분 (`useCalendar` 내부 전용) |
| **A11y by default** | role/aria/keyboard 기본 제공 | ✅ `@vuepkg/ui` 6종 모두 키보드·aria 완비 (`Popover`는 focus trap·Esc·외부클릭, `DataTable`은 row Enter/Space + aria-label) |

---

## 1. 타깃 아키텍처

### 1.1 패키지 구조 (monorepo)

```
vuepkg/                         # monorepo 루트 (pnpm workspace)
├── packages/
│   ├── core/                   # @vuepkg/core  — 의존성 최하단
│   │   ├── tokens/             #   디자인 토큰 타입 + 기본값
│   │   ├── composables/        #   useControllableState, useId, useFloating(경량) …
│   │   ├── utils/              #   date, dom, a11y, array (calendar에서 이관)
│   │   └── types/              #   공통 타입 (Size, Variant, Color …)
│   ├── theme/                  # @vuepkg/theme — CSS 변수 정의(런타임 JS 0)
│   │   ├── base.css            #   reset + primitive 토큰
│   │   ├── light.css / dark.css
│   │   └── presets/            #   브랜드 프리셋
│   ├── ui/                     # @vuepkg/ui — calendar 전용 내부 primitive (외부 단독 채택 비목표, 평면 src/*.vue)
│   │   ├── Button.vue  IconButton.vue  SegmentedControl.vue  Chip.vue  Popover.vue  DataTable.vue  (완료, 신규 추가는 calendar 기능 요구 발생 시에만)
│   │   └── index.ts
│   └── calendar/               # @vuepkg/calendar — ui·core 위에 재구성
│       └── (기존 src/components/calendar 이관)
├── apps/
│   ├── docs/                   # VitePress 문서 + 라이브 플레이그라운드
│   └── playground/             # 개발용 데모 (현 App.vue 계승)
├── tooling/                    # 공유 설정 (tsconfig, eslint, vite/tsup preset)
├── pnpm-workspace.yaml
├── turbo.json                  # 빌드 오케스트레이션
└── .changeset/                 # 버전·릴리즈 관리
```

### 1.2 의존성 방향 (단방향 — 순환 금지)

```
theme(css) ────────────────┐
                           ▼
core  ◄──  ui  ◄──  calendar
 (런타임 의존성은 항상 왼쪽으로만)
```

- `core`: 다른 `@vuepkg` 패키지에 의존하지 않음. `vue` peer만.
- `ui`: `core`에만 의존.
- `calendar`: `ui` + `core`에 의존. (자체 구현 → ui primitive 소비로 전환 완료 — Button/IconButton/SegmentedControl/Chip/Popover/DataTable 전부 추출·소비)
- `theme`: 순수 CSS. JS 의존성 없음. 모든 패키지가 참조하는 CSS 변수 계약(contract).

### 1.3 디자인 토큰 3계층

```
primitive    --vp-color-blue-500: #3b82f6;     (원시값 — 팔레트)
   ▼
semantic     --vp-color-primary: var(--vp-color-blue-500);
             --vp-color-danger:  var(--vp-color-red-600);
   ▼
component     --vp-chip-bg: var(--vp-color-surface);
             --vp-holiday-chip-bg: var(--vp-color-danger-subtle);
```

- 소비자는 **semantic 계층만 덮어쓰면** 전체 테마가 바뀐다.
- 현 calendar의 `HOLIDAY_CHIP_BACKGROUND(#ffebee)`, `HOLIDAY_CHIP_COLOR(#c62828)`, `TIMED_VIEW_HOUR_HEIGHT_PX` 등 하드코딩 상수가 component 토큰의 1차 이관 대상.

### 1.5 알려진 기술 부채 (추적)

> "실 채택 OSS"가 목표로 확정됨에 따라, 실 사용자가 생기기 전에 반드시 정리해야 할 항목들.

| 항목 | 발견 시점 | 내용 | 영향 | 상태 |
| ---- | --------- | ---- | ---- | ---- |
| ~~`@vuepkg/core` 테스트 0건~~ | F2-3 작업 중 확인 (2026-06-29) | 당시 `vitest run --passWithNoTests`만 보고 0건으로 오판. 실제로는 date/holiday/useControllableState 테스트가 이미 존재(65건) | — | ✅ 오판으로 확인 (F2-4 검증 중, 2026-06-30) — popover 유틸 이관으로 70건으로 증가 |
| ~~키보드 포커스 Tab 순서 회귀~~ | F2-1 검증 중 발견 (2026-06-29) | `view tab shows outline when focused via keyboard (Tab)` E2E 실패 | 키보드 사용자 영향 a11y 회귀 | ✅ 해소 확인 (F2-4 전체 E2E 142건 재실행, 2026-06-30) — 중간 커밋에서 이미 수정된 것으로 추정 |
| ~~List 뷰 반응형 너비 5px 초과~~ | F2-3 검증 중 발견 (2026-06-29) | `list view loads and table fits viewport width` E2E 실패 (Desktop/Laptop) | 좁은 화면 가로 스크롤 | ✅ 해소 확인 (F2-4 전체 E2E 142건 재실행, 2026-06-30) — `fix(calendar): clip overflowing Period column text in list view` 커밋으로 수정된 것으로 추정 |
| ~~`@vuepkg/calendar`의 `package.json` `types`/`exports.types`가 `./dist/src/components/calendar/index.d.ts`를 가리키나 실제 빌드 출력은 `./dist/components/calendar/index.d.ts`였음 (`src` 세그먼트 없음)~~ | F2-4 작업 중 발견 (2026-06-30), `main` 기준 재현 확인 | 0.1.0~0.1.3 전체 배포 버전에서 동일하게 깨져 있었음 — TS 소비자가 타입을 못 찾을 수 있었음 | 게시된 패키지의 TypeScript 지원이 깨졌을 가능성 (높은 심각도) | ✅ 수정 완료 (2026-06-30) — `package.json`의 `types`/`exports.types` 3곳을 실제 빌드 경로로 정정, `vite.lib.config.ts`의 stale 주석도 함께 정정. 빌드 재실행으로 경로 일치 확인 |
| `vite-plugin-dts`가 일부 내부 컴포넌트 `.d.ts`에 깨진 상대경로(`'../../../../core/src'` 등)를 남김 | F2-4 작업 중 발견 (2026-06-30) | `vite.lib.config.ts`의 `@vuepkg/core`/`@vuepkg/ui` alias(원시 src 지정) 때문에 `vite-plugin-dts`가 그 경로를 그대로 `.d.ts` import에 박아넣음. **주의**: 이 alias는 의도된 설계다 — calendar는 core/ui를 원시 소스로 직접 컴파일해 번들링하는 자기완결형(self-contained) 패키지이며(`architecture.md`에 명시), 이 alias가 동시에 `@vuepkg/ui` 컴포넌트들의 `<style>` 블록을 calendar의 `style.css`로 추출해주는 역할도 겸하고 있음. **시도했던 수정(alias 제거 → node_modules 경유 resolve)은 되돌림**: dts는 깨끗해지지만 `@vuepkg/ui` 컴포넌트 스타일(`.vp-button`/`.vp-chip`/`.vp-popover`/`.vp-segmented-control` 등)이 calendar의 `style.css`에서 통째로 빠지는 회귀를 직접 확인함(`grep`으로 검증) | 현재는 공개 엔트리(`dist/components/calendar/index.d.ts`)의 타입 그래프 밖이라 일반 소비자에게는 무해. `MonthOverflowPopover.vue.d.ts` 같은 비공개 컴포넌트를 deep-import하거나, F3-2(`vue-component-meta` 자동 문서화)에서 전 컴포넌트를 introspect할 때 문제될 수 있음 | 🟡 BLOCKED(범위밖 근본원인) — CSS 번들링과 타입 생성이 같은 alias에 결합되어 있어, 분리하려면 ui 컴포넌트 CSS를 calendar 빌드에 주입하는 별도 메커니즘이 필요. 설계 결정 필요 |

**처리 방침**: `types` 경로 버그는 수정·검증 완료. 남은 dts 누수 항목은 영향도가 낮고 (CSS 회귀 없이) 고치려면 별도 설계가 필요해 Phase 4 착수와 별개로 여유 있을 때 재검토 권장.

---

## 2. 단계별 로드맵

> 각 Phase는 **독립 출시 가능**하도록 설계. 중간에 멈춰도 calendar는 항상 동작.
> 난이도: 🟢 낮음 · 🟡 중간 · 🔴 높음

### Phase 0 — Monorepo & Core 추출 (기반 공사) ✅ 완료

**목표**: 단일 레포 → 워크스페이스. `core` 패키지 분리. calendar는 그대로 동작 유지.

| ID | 작업 | 난이도 | 산출물 |
| -- | ---- | ------ | ------ |
| F0-1 | pnpm workspace + turborepo 도입, 기존 src → `packages/calendar`로 이관 | 🟡 | `pnpm-workspace.yaml`, `turbo.json` |
| F0-2 | 공유 tooling 추출 (`tooling/tsconfig`, eslint, prettier, vite/tsup preset) | 🟡 | `tooling/*` |
| F0-3 | changesets 도입 — 멀티 패키지 독립 버저닝 | 🟢 | `.changeset/`, release 워크플로 |
| F0-4 | `@vuepkg/core` 생성 + `utils/date.ts`·`utils/holiday.ts`·공통 타입 이관 | 🟡 | `packages/core` |
| F0-5 | `useControllableState` 추출 — emit-only/v-model 패턴 일반화 (현 `useScheduleCalendarHost`의 핵심을 범용화) | 🟡 | `core/composables` |
| F0-6 | CI 파이프라인: lint → typecheck → vitest → build → `test:e2e:ci` (Node 24). 시각 회귀는 별도 workflow | 🟢 | `.github/workflows/ci.yml`, `visual-regression.yml` |
| F0-7 | calendar가 `@vuepkg/core` 소비하도록 import 경로 교체 (`@/utils/date` → `@vuepkg/core`) | 🟡 | calendar 리팩토링 |

**완료 기준(DoD)**: `pnpm build` 시 core·calendar 둘 다 빌드. 기존 테스트(Vitest 205 / E2E 126) 전부 통과. calendar npm 배포 결과물 동일.

**리스크**: 경로 alias(`@/`) 대거 변경 → import 깨짐. → codemod 스크립트로 일괄 치환, typecheck로 검증.

---

### Phase 1 — 디자인 토큰 & 테마 시스템 ✅ 완료 (2026-06-29)

**목표**: 하드코딩 색상/치수 제거 → CSS 변수 계약. light/dark 지원. 소비자 테마 오버라이드 가능.

| ID | 작업 | 난이도 | 상태 |
| -- | ---- | ------ | ---- |
| F1-1 | 토큰 스펙 설계 (primitive/semantic/component 3계층, 네이밍 `--vp-*`) | 🟡 | ✅ |
| F1-2 | `@vuepkg/theme` 생성: `base.css` + `dark.css` + `index.css` | 🟡 | ✅ |
| F1-3 | calendar 하드코딩 상수 → component 토큰 마이그레이션 (`HOLIDAY_CHIP_*` 삭제) | 🟡 | ✅ |
| F1-4 | calendar 컴포넌트 CSS의 리터럴 색상 → `var(--vp-*)` 치환 | 🟡 | ✅ |
| F1-5 | `prefers-color-scheme` + `.vp-dark` 클래스 토글 둘 다 지원 | 🟢 | ✅ |
| F1-6 | 테마 커스터마이징 가이드 + 토큰 레퍼런스 문서 | 🟢 | ✅ (`docs/guide/theming.md`) |
| F1-7 | Visual regression 기준선 캡처 (토큰 전환 전/후 비교) | 🟡 | ⏳ 미착수 |

**완료 기준**: calendar에 다크모드 적용. 소비자가 `--vp-color-primary` 한 줄 덮어써서 브랜드 컬러 변경 가능. 시각 회귀 0건(의도된 변경 제외).

**왜 CSS 변수인가**: 런타임 JS 테마 엔진(예: 일부 라이브러리의 `createTheme()`)은 번들·런타임 비용을 만든다. CSS 변수는 비용 0이고 SSR-safe이며, "zero-dep" 포지셔닝과 일치.

---

### Phase 2 — Primitive 승격 (`@vuepkg/ui`) ✅ 완료 (2026-06-30, F2-6 취소·F2-7 보류)

**목표**: calendar 내부 구현에서 재사용되는 부분만 primitive로 추출해 중복을 없앤다. **`ui`를 독립 판매 가능한 범용 컴포넌트 라이브러리로 키우는 것은 더 이상 목표가 아니다** (2026-06-30 방향 전환) — calendar 품질을 높이는 부산물로만 유지한다.

추출 순서는 **calendar가 실제로 쓰는 것 우선** (당장 검증되고, 중복 제거 효과 즉시 발생):

| ID | primitive | 추출 출처 | 난이도 | 상태 |
| -- | --------- | --------- | ------ | --------- |
| F2-1 | `Button` / `IconButton` | `CalendarPeriodNav` `‹ › Today`, `CalendarMonthNav` | 🟢 | ✅ (2026-06-29, `@vuepkg/ui@0.1.0`) |
| F2-2 | `SegmentedControl` | `CalendarToolbar` | 🟡 | ✅ (2026-06-29) — 화살표 키 네비게이션·roving tabindex 신규 추가 |
| F2-3 | `Chip` | `ScheduleEventChip`, `HolidayChip` | 🟢 | ✅ (2026-06-29) — `Badge`는 보류 (today-badge 단일 사용처, 2회 미만이라 추출 기준 미충족) |
| F2-4 | `Popover` | `MonthOverflowPopover` (bounds·flip 로직 재사용) | 🔴 | ✅ (2026-06-30) — `RectBounds`/위치 계산 함수는 `@vuepkg/core`로 이관, `Popover`가 Teleport·backdrop·Esc·외부클릭(backdrop)·focus trap·focus 복원을 신규 구현 |
| F2-5 | `DataTable` | `ListView` (페이지네이션·반응형 컬럼) | 🔴 | ✅ (2026-06-30) — 제네릭(`<script setup generic="T">`) 컴포넌트, `cell-{key}` named slot, 페이지네이션은 `IconButton` 재사용 + `useControllableState`(v-model). 정렬 aria·caption은 스코프 제외 |
| F2-6 | ~~`Select`~~ (취소, 2026-06-30) | — | — | "폼 기반 확장 대비"용으로 잡혀 있던 신규 컴포넌트 — calendar에 실수요가 없어 범용 프레임워크 방향 폐기와 함께 취소 |
| F2-7 | `Dialog` / `Modal` — calendar 일정 상세/생성 모달용 | calendar 신규 기능 종속 | 🔴 | 단독 추출 안 함. Phase 4 `F4-3`(일정 CRUD UI)가 실제로 착수될 때 그 작업과 함께 진행 |
| F2-8 | calendar를 ui primitive 소비로 리팩토링 (내부 중복 제거) | calendar | 🟡 | ✅ 완료 (2026-06-30) — `CalendarPeriodNav`/`CalendarMonthNav`/`CalendarToolbar`/`HolidayChip`/`ScheduleEventChip`/`MonthOverflowPopover`/`ListView` 전부 ui primitive 소비로 전환 |

**각 primitive 공통 산출물**:
- `props`/`emits` 타입 (`core` 타입 재사용: `Size = 'sm'|'md'|'lg'`, `Variant` 등)
- component 토큰 (`--vp-button-*` …)
- 단위 테스트(Vitest) + 접근성 테스트
- 문서 페이지 (Phase 3 사이트에 편입)

**완료 기준**: calendar의 `CalendarToolbar`/`MonthOverflowPopover`/`ListView`가 `@vuepkg/ui` primitive 위에서 재구현되고, 기존 E2E 전부 통과. (달성)

**가드레일 (영구 원칙, 2026-06-30 갱신)**: "calendar가 쓰지 않는 primitive"는 유예가 아니라 폐기한다. 모든 신규 primitive는 calendar의 실제 기능 요구가 먼저 있고, 그 부산물로만 추출한다 — 범용 컴포넌트를 먼저 만들고 calendar가 나중에 쓰는 순서는 금지.

---

### Phase 3 — DX & 생태계

**목표**: 외부 개발자가 발견·학습·도입할 수 있게. "캘린더 엔진"으로서의 체감은 문서·데모에서 결정된다.

| ID | 작업 | 난이도 | 비고 |
| -- | ---- | ------ | ---- |
| F3-1 | VitePress 문서 사이트 (`apps/docs`) + 라이브 플레이그라운드 | 🟡 | props 인터랙티브 토글 |
| F3-2 | `vue-component-meta`로 props/emits/slots API 표 자동 생성 | 🟡 | 수동 문서 drift 방지 |
| F3-3 | **i18n/locale 시스템** — 백로그 `weekdayLabels`(IMP-02)를 범용 locale로 일반화 | 🟡 | `core/locale`, calendar·DataTable 공용 |
| F3-4 | SSR / Nuxt 호환 검증 + `@vuepkg/nuxt` 모듈 (auto-import) | 🔴 | hydration·CSS 주입 |
| F3-5 | 접근성 감사 — 전 컴포넌트 키보드·스크린리더 점검 (axe) | 🟡 | a11y 배지 |
| F3-6 | 마이그레이션 가이드 (`@vuepkg/calendar` 0.0.x → 신 버전) | 🟢 | breaking 정리 |
| F3-7 | 시작 템플릿 (Vite/Nuxt starter) + StackBlitz 데모 링크 | 🟢 | 예약/일정관리 앱 시나리오로 데모 구성 — 범용 UI 데모 아님 |

**완료 기준**: `vuepkg.dev`(가칭) 문서 사이트 배포. 각 컴포넌트 라이브 데모 + 자동 API 표. calendar i18n(요일·라벨) 동작.

---

### Phase 4 — Calendar 도메인 고도화 (Modern Calendar Engine) — 신규 종착점 (2026-06-30)

**목표**: FullCalendar/v-calendar/vue-cal 대비 빈 공간(modern DX, headless 구조, DnD, Timeline/Scheduler, Recurring Event, Virtualization)을 메운다. 구버전 로드맵의 범용 컴포넌트 확장(폼 계열 `Input`/`Checkbox`/`Select`, 오버레이 계열 `Tooltip`/`Toast`/`Drawer`)은 **전면 폐기** — calendar와 무관한 범용 primitive는 더 이상 만들지 않는다.

| ID | 작업 | 난이도 | 비고 |
| -- | ---- | ------ | ---- |
| F4-1 | 드래그로 시간 슬롯 범위 선택 (IMP-04) | 🟡 | ✅ **완료 (2026-07-01)** — `useTimeSlotSelection` composable로 분리. `pointerdown→pointermove→pointerup` 순수 pointer event 드래그, 위·아래 방향 모두 지원. `setPointerCapture`로 열 외부 이탈 보호. `isDragging` 상태로 `cursor: ns-resize` 피드백. |
| F4-2 | 2-week / 3-week 월간 뷰 변형 (IMP-05) | 🟡 | `monthWeekCount?: 2\|3\|6` prop |
| F4-3 | 일정 상세/생성 모달 (CRUD UI) | 🔴 | `Dialog` primitive(F2-7)를 이 작업과 함께 추출 |
| F4-4 | 드래그&드롭 이벤트 이동·리사이즈 (IMP-06, 보류 해제) | 🔴 | emit-only 아키텍처와 정합되는 `schedule-update` emit 설계 필요. 외부 드래그 라이브러리 도입 여부 결정 필요 |
| F4-5 | Recurring Event (반복 일정) — 신규 | 🔴 | RRULE 서브셋 또는 자체 recurrence 규칙. 현재 로드맵에서 가장 큰 차별화 포인트 |
| F4-6 | Timeline / Resource Scheduler 뷰 — 신규 | 🔴 | 다중 리소스(인원/장소)를 가로 타임라인으로. FullCalendar Premium 라이선스 영역과 직접 겹침 — §4.1 수익화 시사점 참고 |
| F4-7 | 대량 일정 Virtualization | 🔴 | 월/리스트 뷰에 수백~수천 건 렌더링 시 성능 확보 |
| F4-8 | 타임존 지원 (IMP-07, 재검토) | 🔴 | "국내 단일 타임존이라 ROI 낮음" 판단을 글로벌 캘린더 엔진 포지션 기준으로 재검토. 즉시 착수 아님 — F4-1~F4-7 이후 |
| F4-9 | 번들 사이즈 예산 + size-limit CI 게이트 | 🟢 | 패키지별 budget |
| F4-10 | RFC 프로세스 + CONTRIBUTING + 기능 추가 체크리스트 | 🟢 | 기여자 온보딩 |
| F4-11 | 시맨틱 버저닝 자동 릴리즈 (changesets → npm publish 자동화) | 🟢 | F0-3 확장 |
| F4-12 | 커뮤니티 노출 — "Vue 캘린더/스케줄러" 니치 타겟 | 🟢 | awesome-vue calendar 섹션, 예약·일정관리 SaaS 빌더 커뮤니티. 범용 UI 라이브러리 커뮤니티는 더 이상 타겟 아님 |

#### 4.1 수익화 시사점 (참고)

`F4-5`(반복 일정)·`F4-6`(Timeline/Scheduler)는 FullCalendar가 Premium 라이선스로 유료화한 영역과 정확히 겹친다. 장기적으로 "코어 무료 + 고급 뷰 유료" 모델을 검토할 수 있는 후보 — 지금 당장 결정할 사항은 아니지만, F4-6 설계 시 무료/유료 경계를 의식해두면 나중에 분리 비용이 줄어든다.

---

## 3. 마이그레이션 전략 (하위 호환)

현재 `@vuepkg/calendar@0.1.x` 사용자(소수지만)를 깨지 않는 것이 원칙.

| 상황 | 전략 |
| ---- | ---- |
| Phase 0~1 (내부 구조 변경) | **공개 API 무변경**. import 경로·테마는 내부 사항. patch/minor 릴리즈. |
| Phase 2 (ui 의존성 추가) | calendar가 ui를 내부 의존성으로 흡수 — 소비자는 여전히 `@vuepkg/calendar`만 설치. 공개 API 동일 유지. |
| Phase 4 (도메인 기능 추가) | 신규 prop/emit은 옵셔널 기본값으로 추가, 기존 기본 동작 불변. |
| 토큰 도입으로 기본 색상 변화 | 시각 변화는 **minor**로, 기존 룩 유지 옵션(legacy 토큰 프리셋) 제공. |
| 불가피한 breaking | `0.x` 동안은 minor로 허용하되 CHANGELOG·마이그레이션 노트 필수. `1.0.0`에서 API 동결. |

**버전 전략**: `0.x` = 실험/형성기(현재). Phase 3 문서·a11y 완료 시점에 **`1.0.0`** 으로 API 안정 선언.

---

## 4. 리스크 & 완화

| 리스크 | 영향 | 완화책 |
| ------ | ---- | ------ |
| **단일 메인테이너 부담** | 범위 대비 인력 부족 → 정체 | Phase 독립 출시 설계, "calendar가 쓰는 것만" 우선순위, 각 Phase가 단독으로 가치 |
| **Scope creep** (범용 프레임워크 회귀 유혹) | "이왕 ui 만든 거 더 키우자"는 유혹으로 방향이 재차 흔들림 | 2026-06-30 결정 고정: `ui`는 calendar 내부 전용으로 동결, 신규 primitive는 calendar 기능 요구가 선행될 때만 추출. PrimeVue/Vuetify/shadcn-vue와 직접 경쟁하지 않는다 |
| **추상화 비용 > 이득** | primitive 일반화가 오히려 복잡 | 기존 `componentization-backlog.md`의 CMP-X 비권장 기준 계승. 2회 이상 재사용 전엔 추출 보류 |
| **테마 시스템 과설계** | 토큰 계층 복잡, 학습 곡선 | CSS 변수만(런타임 JS 0), semantic 계층 최소화 |
| **시각 회귀** | 토큰 전환 중 UI 깨짐 | Phase 1에 Visual regression 기준선 선행 |
| **SSR/hydration 이슈** | Nuxt 사용자 이탈 | F3-4에서 명시적 검증, Popover/Dialog의 teleport·id 안정화 |
| **캘린더 niche 시장 규모 한계** | 범용 UI 라이브러리 대비 TAM(시장 규모)이 작음 | B2B 임베딩(예약/스케줄링 SaaS)·고급 뷰 유료화(§4.1)로 단가 보전. "넓은 사용자" 대신 "깊은 사용처"를 노림 |

---

## 5. 성공 지표 (KPI)

| 지표 | 현재 (2026-06-30, Phase 2 종료) | Phase 2 목표 | Phase 4 목표 (신규 — calendar 도메인 고도화) |
| ---- | ---------------------------- | ------------ | ------------ |
| 패키지 수 | **4 (core/theme/ui/calendar)** | 4 ✅ 달성 | 4 유지 — `ui`는 calendar 전용으로 동결, 더 늘리지 않음 |
| 실 주간 다운로드(봇 제외) | ~0 (배포 직후 크롤러 484) | 측정 체계 구축 | 의미 있는 유입 (캘린더/스케줄링 니치 타겟) |
| `ui` primitive 수 (calendar 내부용, 동결) | **6종** (Button/IconButton/SegmentedControl/Chip/Popover/DataTable) | 6종 ✅ 달성 | 6~7종 유지 — `Dialog`는 F4-3 착수 시에만 추가, 그 외 신규 없음 |
| **캘린더 도메인 기능 커버리지** (신규 KPI) | month/week/day/list 뷰, 공휴일, overflow popover, 클릭 1시간 단위 슬롯 선택 | — | 반복 일정(F4-5), DnD 이동·리사이즈(F4-4), Timeline/Resource 뷰(F4-6), 대량 데이터 virtualization(F4-7), 타임존(F4-8) |
| calendar 번들 사이즈 (gzip) | index.js ~12.1KB + style.css ~4.9KB (§1.5 dts 누수 부채 영향권) | core 분리로 ↓ | budget 내 유지 — 도메인 기능 추가에도 size-limit CI(F4-9)로 가드 |
| 문서 커버리지 | docs/ 내부 문서 + theming.md + `@vuepkg/ui` README | 사이트 + 자동 API | 전 도메인 기능 라이브 데모(드래그·반복·Timeline 시연 포함) |
| a11y | `@vuepkg/ui` 6종 키보드·aria 완비(Popover focus trap·Esc·외부클릭, DataTable row Enter/Space), calendar 전체는 부분 | ✅ primitive 키보드 100% 달성 | axe 통과 |
| 테스트 | Vitest 336 / E2E 기능 **134**(CI·`test:e2e:ci`) + 시각 **8**(수동·`test:e2e:visual`) | 패키지별 유지·증가 | 도메인 기능별(드래그/반복/DnD) 신규 테스트 스위트 |

> **다운로드 KPI 주의**: 현재 501/주는 신규 배포 크롤러 트래픽(6/26 484 + 6/27 17)이며 실사용 아님. 실유입 측정 체계(README npm 배지, 문서 사이트 analytics)부터 Phase 3에 구축.

### 5.1 번들 사이즈 기준선 (baseline)

> Phase 0 기준 측정: 2026-06-29 · `@vuepkg/calendar@0.0.4` · `pnpm turbo run build:lib` (ESM, `vite 8.0.16`)
> Vue는 peer dependency라 제외. Phase 4 `F4-9`의 size-limit CI 게이트 기준값으로 사용.

**Phase 0 완료 직후 (테마 토큰 이전)**

| 산출물 | Raw | Gzip | 비고 |
| ------ | ---: | ---: | ---- |
| `index.js` (메인) | 48.5 KB | **13.6 KB** | calendar 전체 진입점 |
| `style.css` | 18.0 KB | **3.6 KB** | 전체 스타일 |
| `ListView-*.js` | 3.7 KB | 1.6 KB | List 탭 진입 시 지연 로드 (`defineAsyncComponent`) |
| `CalendarMonthNav-*.js` | 3.7 KB | 1.4 KB | 분리 청크 |

**Phase 1 완료 후 (테마 토큰 포함)**

| 산출물 | Raw | Gzip | 비고 |
| ------ | ---: | ---: | ---- |
| `index.js` (메인) | 48.5 KB | **13.6 KB** | 변동 없음 |
| `style.css` | **26.89 KB** | **4.84 KB** | `@vuepkg/theme` 토큰 번들링됨 |
| `ListView-*.js` | 3.7 KB | 1.6 KB | 변동 없음 |
| `CalendarMonthNav-*.js` | 3.7 KB | 1.4 KB | 변동 없음 |

**Phase 2 진행 중 (F2-1~F2-3, `@vuepkg/ui` 소비 포함) — 측정: 2026-06-29**

| 산출물 | Raw | Gzip | 비고 |
| ------ | ---: | ---: | ---- |
| `index.js` (메인) | 46.05 KB | **13.20 KB** | `@vuepkg/ui` 소스가 인라인 번들링됨 (소폭 감소 — tree-shaking) |
| `style.css` | **27.77 KB** | **5.00 KB** | Button/IconButton/SegmentedControl/Chip 토큰·스타일 추가 |
| `ListView-*.js` | 3.7 KB | 1.61 KB | 거의 변동 없음 |
| `CalendarMonthNav-*.js` | 7.23 KB | 2.48 KB | `IconButton` 의존성 포함으로 청크 크기 증가 |

**Phase 2 F2-4 완료 (Popover 추가) — 측정: 2026-06-30**

| 산출물 | Raw | Gzip | 비고 |
| ------ | ---: | ---: | ---- |
| `index.js` (메인) | 41.87 KB | **12.04 KB** | `RectBounds`/popover 유틸이 `@vuepkg/core`로 이동하며 소폭 감소 |
| `style.css` | **27.86 KB** | **5.02 KB** | `--vp-popover-radius` 토큰 1개 추가 |
| `ListView-*.js` | 3.70 KB | 1.61 KB | 변동 없음 |
| `CalendarMonthNav-*.js` | 13.66 KB | 4.39 KB | 청크 분할 기준 변경으로 증가 — §1.5 external 누락 부채와 연관, 정확한 원인은 다음 부채 정리 세션에서 확인 |

**Phase 2 F2-5 완료 (DataTable 추가, Phase 2 종료 시점) — 측정: 2026-06-30**

| 산출물 | Raw | Gzip | 비고 |
| ------ | ---: | ---: | ---- |
| `index.js` (메인) | 41.88 KB | **12.07 KB** | 거의 변동 없음 |
| `style.css` | **27.22 KB** | **4.92 KB** | `--vp-list-row-*`/`--vp-list-header-bg` → `--vp-table-*`로 이름만 이관(중복 제거로 소폭 감소) |
| `ListView-*.js` | 2.77 KB | 1.28 KB | 페이지네이션·테이블 마크업이 `DataTable`로 빠지며 감소 |
| `CalendarMonthNav-*.js` | 16.53 KB | 5.17 KB | `DataTable`이 내부에서 재사용하는 `IconButton`이 같은 청크에 묶이며 증가 — §1.5의 external 미설정 부채와 동일 원인으로 추정, 별도 설계 검토 시 함께 확인 |

`@vuepkg/ui` **단독 패키지** (참고용 — calendar에는 소스 단위로 번들링되어 별도 설치 불필요):

| 산출물 | Raw | Gzip |
| ------ | ---: | ---: |
| `index.esm.js` | 10.31 KB | 3.51 KB |
| `style.css` | 4.92 KB | 1.20 KB |

**관찰**
- UI 컴포넌트치고 매우 가벼움 (FullCalendar ~100KB+, toast-ui ~70KB+ gzip 대비). zero-dep 포지셔닝이 수치로 증명됨.
- `CalendarMonthNav` 청크가 Phase 2 진행 중 계속 커진 건(3.7→7.2→13.7→16.5KB) `IconButton`/`Popover`/`DataTable`이 그 청크에 함께 번들링되기 때문 — §1.5의 "calendar lib 빌드가 core/ui를 external 처리하지 않음" 부채와 같은 원인. Phase 2가 끝난 지금이 청크 분할 전략을 재검토할 적기.
- `ListView` 청크는 반대로 계속 작아짐(3.7→2.77KB) — 페이지네이션/테이블 마크업이 `@vuepkg/ui`의 공용 `DataTable`로 이동했기 때문, 의도된 변화.

---

## 6. 진행 이력 & 다음 단계

**완료된 첫 단계들**:
1. ~~F0-1/F0-4 스파이크~~ ✅ — pnpm workspace + `@vuepkg/core` 분리
2. ~~F1-1 토큰 RFC~~ ✅ — `--vp-*` 네이밍·3계층 확정
3. ~~F2-1 `Button` 추출 PoC~~ ✅ (2026-06-29)
4. ~~Phase 2 전체 (F2-1~F2-5, F2-8)~~ ✅ (2026-06-30) — `@vuepkg/ui` 6종 추출, calendar 전체가 ui 소비로 전환 완료

### 다음 단계 — Phase 4 진행 현황 (2026-07-01 갱신)

> **진행 현황 (2026-07-01)**: SRV-P1-01/P1-03 완료 → F4-1(드래그 슬롯 선택) 완료 → SRV-P2 부채 전량 처리 완료 (P2-01~07 + NIT-01). `useTimeSlotSelection` composable이 F4-4 DnD의 pointer event 인프라를 이미 갖추고 있다.

| ID | 작업 | 난이도 | 비고 |
| -- | ---- | ------ | ---- |
| ~~F4-1~~ | ~~드래그 시간 슬롯 범위 선택 (IMP-04)~~ | ~~🟡~~ | ✅ 완료 (2026-07-01) |
| F4-4 | 드래그&드롭 이벤트 이동·리사이즈 (IMP-06) | 🔴 | F4-1의 `useTimeSlotSelection` pointer 인프라 재사용 가능 — **다음 작업 후보** |
| F4-2 | 2-week / 3-week 월간 뷰 변형 (IMP-05) | 🟡 | `monthWeekCount?: 2\|3\|6` prop — F4-4와 병행 가능 |
| — | §1.5 잔여 항목 (`vite-plugin-dts` 상대경로 누수) 설계 검토 | 🟡 | 영향도 낮음 — Phase 4 작업과 별개로 여유 있을 때 처리 |
| ~~—~~ | ~~[staff-review-backlog.md](./staff-review-backlog.md) P2~~ | ~~🟡~🔴~~ | ~~SRV-P2-01~P2-07 — 1.0.0 전 처리 필요~~ → ✅ 완료 (2026-07-01) |

F4-5(반복 일정)·F4-6(Timeline) 같은 고난도 항목은 F4-4로 DnD 인프라를 다진 뒤 착수 권장.

---

## 7. 참고 (기존 문서 연결)

- [staff-review-backlog.md](./staff-review-backlog.md) — Phase 0~2 Staff Review 추적 원장 (P0 완료, P1~ 에이전트 점검)
- [roadmap.md](./roadmap.md) — calendar 단일 컴포넌트 기능 백로그 (IMP-02~08). 본 문서의 Phase 4(`F4-1`/`F4-2`/`F4-4`/`F4-8`)에 흡수.
- [componentization-backlog.md](./componentization-backlog.md) — CMP-01~11 내부 분리. Phase 2 primitive 추출과 연계(특히 CMP-09 `MonthWeekdayHeader` → i18n).
- [architecture.md](./architecture.md) — 현 단일 패키지 구조. Phase 0 이후 패키지별로 분할 갱신 필요.
- [improvement-backlog.md](./improvement-backlog.md) — IMP 항목 원장.
