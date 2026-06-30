# Framework Roadmap — `@vuepkg` UI 프레임워크화

> 작성: 2026-06-29
> 목표: 단일 `@vuepkg/calendar` 컴포넌트 → **`@vuepkg` 범용 Vue 3 디자인 시스템**
> 전략 결정: 멀티 컴포넌트 라이브러리 지향 (`core` / `ui` / `calendar` / `theme`)
> **방향 확정 (2026-06-29)**: 실제 npm 배포 라이브러리로 채택을 노린다 — Phase 3/4(문서 사이트·SSR·커뮤니티 노출)에 투자할 가치가 있다고 판단. 단, 실 사용자가 생기기 전(Phase 3 착수 또는 `1.0.0` 시점)까지 §1.5의 기술 부채를 반드시 정리한다.

---

## 0. 비전 & 핵심 통찰

### 0.1 한 줄 비전

> **"zero-dependency · controlled · CSS-variable 테마"** 를 공통 DNA로 갖는 Vue 3 디자인 시스템.
> PrimeVue·Vuetify가 무겁고, shadcn-vue는 복붙형이라면 — `@vuepkg`는 **가볍고 타입 안전하며 부모가 상태를 소유하는(emit-only)** 중간 지점을 노린다.

### 0.2 왜 지금 가능한가 — calendar는 이미 미니 프레임워크다

현재 `@vuepkg/calendar` 내부에는 **재사용 가능한 primitive들이 이미 자체 구현**되어 있다. 새로 만드는 게 아니라 **추출(extract)** 하면 된다:

| 현재 calendar 내부 구현 | → 승격될 `@vuepkg/ui` primitive | 상태 |
| ----------------------- | ------------------------------- | ---- |
| `CalendarPeriodNav` / `CalendarMonthNav` 의 `‹ ›` 버튼 | `Button` / `IconButton` | ✅ 완료 |
| `CalendarToolbar.vue` (SelectButton 비주얼, `aria-pressed`) | `SegmentedControl` | ✅ 완료 |
| `ScheduleEventChip.vue` / `HolidayChip.vue` | `Chip` | ✅ 완료 (`Badge`는 보류) |
| `MonthOverflowPopover.vue` (bounds·flip 계산) | `Popover` | ⏳ F2-4 |
| `ListView.vue` (네이티브 `<table>`, 페이지네이션, 반응형 컬럼 숨김) | `DataTable` | ⏳ F2-5 |
| `useScheduleCalendarHost` (controlled 패턴) | `core` 의 controlled-component 컨벤션 | ✅ 완료 (Phase 0) |
| `utils/date.ts`, `utils/holiday.ts` | `@vuepkg/core` 유틸 | ✅ 완료 (Phase 0) |

→ **즉, "calendar를 분해 → 공통 토대 추출 → 그 위에 calendar 재조립"** 이 로드맵의 중심 동선이다. 이 동선은 calendar 품질도 같이 끌어올린다.

### 0.3 차별화 포지셔닝 (지켜야 할 원칙)

| 원칙 | 의미 | 현재 calendar가 이미 지킴? |
| ---- | ---- | -------------------------- |
| **Zero runtime deps** | `vue` peer 외 런타임 의존성 0 | ✅ (PrimeVue 제거 완료) |
| **Controlled / emit-only** | 상태는 소비자가 소유, 컴포넌트는 표현+emit | ✅ (`v-model` + 핸들러) |
| **CSS-variable 테마** | 런타임 JS 테마 엔진 없이 CSS 변수로 테마 | ✅ (Phase 1 완료) |
| **Type-safe public API** | 모든 공개 타입 `types/` 단일 출처 | ✅ |
| **Headless-friendly** | 로직(composable) / 표현(styled) 분리 가능 | ⚠️ 부분 (`useCalendar` 내부 전용) |
| **A11y by default** | role/aria/keyboard 기본 제공 | ⚠️ 부분 (`@vuepkg/ui` 4종은 키보드·aria 완비, `Popover`/`DataTable`은 F2-4·F2-5 대기) |

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
│   ├── ui/                     # @vuepkg/ui — 범용 primitive 컴포넌트 (구현: 평면 src/*.vue)
│   │   ├── Button.vue  IconButton.vue  SegmentedControl.vue  Chip.vue  (완료)
│   │   ├── Popover.vue  DataTable.vue  (F2-4·F2-5 예정)
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
- `calendar`: `ui` + `core`에 의존. (자체 구현 → ui primitive 소비로 전환 중 — Button/IconButton/SegmentedControl/Chip 완료, Popover/DataTable 대상 잔여)
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

> "실 채택 OSS"가 목표로 확정됨에 따라, 실 사용자가 생기기 전에 반드시 정리해야 할 항목들. Phase 2 작업 중 발견했지만 추출 작업 우선순위에 밀려 보류된 것들 — **F2-4/F2-5 완료 직후, Phase 3 착수 전** 처리.

| 항목 | 발견 시점 | 내용 | 영향 |
| ---- | --------- | ---- | ---- |
| `@vuepkg/core` 테스트 0건 | F2-3 작업 중 확인 (2026-06-29) | `vitest run --passWithNoTests`로 통과 처리되고 있어 CI가 그린이어도 실제 검증이 없음 | 배포 중인 npm 패키지가 무검증 상태 |
| 키보드 포커스 Tab 순서 회귀 | F2-1 검증 중 발견 (2026-06-29) | `view tab shows outline when focused via keyboard (Tab)` E2E가 메인 브랜치에서도 실패 — 데모 앱 필터 사이드바가 추가되며 Tab 순서가 깨진 것으로 추정 | 키보드 사용자가 실제로 영향받는 a11y 회귀 |
| List 뷰 반응형 너비 5px 초과 | F2-3 검증 중 발견 (2026-06-29) | `list view loads and table fits viewport width` E2E가 992px 기대값에 997px로 실패 (Desktop/Laptop 둘 다) | 좁은 화면에서 가로 스크롤 발생 가능 |

**처리 방침**: 셋 다 "이번 작업과 무관함"만 확인하고 그대로 진행해왔다. F2-4 완료 후 별도 세션으로 묶어서 처리하고, 이 표에서 제거한다.

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
| F0-6 | CI 파이프라인: `turbo run lint test build` 매트릭스 | 🟢 | `.github/workflows/ci.yml` |
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

### Phase 2 — Primitive 승격 (`@vuepkg/ui`) 🚧 진행 중

**목표**: calendar 내부 구현을 범용 primitive로 추출. calendar는 ui를 소비하도록 재조립.

추출 순서는 **calendar가 실제로 쓰는 것 우선** (당장 검증되고, 중복 제거 효과 즉시 발생):

| ID | primitive | 추출 출처 | 난이도 | 상태 |
| -- | --------- | --------- | ------ | --------- |
| F2-1 | `Button` / `IconButton` | `CalendarPeriodNav` `‹ › Today`, `CalendarMonthNav` | 🟢 | ✅ (2026-06-29, `@vuepkg/ui@0.1.0`) |
| F2-2 | `SegmentedControl` | `CalendarToolbar` | 🟡 | ✅ (2026-06-29) — 화살표 키 네비게이션·roving tabindex 신규 추가 |
| F2-3 | `Chip` | `ScheduleEventChip`, `HolidayChip` | 🟢 | ✅ (2026-06-29) — `Badge`는 보류 (today-badge 단일 사용처, 2회 미만이라 추출 기준 미충족) |
| F2-4 | `Popover` | `MonthOverflowPopover` (bounds·flip 로직 재사용) | 🔴 | focus trap, Esc, 외부클릭 |
| F2-5 | `DataTable` | `ListView` (페이지네이션·반응형 컬럼) | 🔴 | 정렬 aria, caption |
| F2-6 | `Dialog` / `Modal` (신규 — calendar의 상세/생성 모달 수요) | 신규 | 🔴 | focus trap, scroll-lock, aria-modal |
| F2-7 | `Select` (신규 — 폼 기반 확장 대비) | 신규 | 🔴 | listbox 패턴 |
| F2-8 | calendar를 ui primitive 소비로 리팩토링 (내부 중복 제거) | calendar | 🟡 | 🚧 진행 중 — `CalendarPeriodNav`/`CalendarMonthNav`/`CalendarToolbar`/`HolidayChip`/`ScheduleEventChip` 완료, `MonthOverflowPopover`/`ListView`는 F2-4·F2-5 추출과 함께 진행 |

**각 primitive 공통 산출물**:
- `props`/`emits` 타입 (`core` 타입 재사용: `Size = 'sm'|'md'|'lg'`, `Variant` 등)
- component 토큰 (`--vp-button-*` …)
- 단위 테스트(Vitest) + 접근성 테스트
- 문서 페이지 (Phase 3 사이트에 편입)

**완료 기준**: calendar의 `CalendarToolbar`/`MonthOverflowPopover`/`ListView`가 `@vuepkg/ui` primitive 위에서 재구현되고, 기존 E2E 전부 통과. ui 단독으로도 `import { Button } from '@vuepkg/ui'` 사용 가능.

**가드레일 (scope creep 방지)**: "calendar가 쓰지 않는 primitive"는 Phase 4로 미룬다. F2-6/F2-7(Dialog/Select)은 calendar의 명확한 수요(일정 상세·생성 모달, 타입 필터 셀렉트)가 있을 때만 착수.

---

### Phase 3 — DX & 생태계

**목표**: 외부 개발자가 발견·학습·도입할 수 있게. "프레임워크"의 체감은 문서에서 결정된다.

| ID | 작업 | 난이도 | 비고 |
| -- | ---- | ------ | ---- |
| F3-1 | VitePress 문서 사이트 (`apps/docs`) + 라이브 플레이그라운드 | 🟡 | props 인터랙티브 토글 |
| F3-2 | `vue-component-meta`로 props/emits/slots API 표 자동 생성 | 🟡 | 수동 문서 drift 방지 |
| F3-3 | **i18n/locale 시스템** — 백로그 `weekdayLabels`(IMP-02)를 범용 locale로 일반화 | 🟡 | `core/locale`, calendar·DataTable 공용 |
| F3-4 | SSR / Nuxt 호환 검증 + `@vuepkg/nuxt` 모듈 (auto-import) | 🔴 | hydration·CSS 주입 |
| F3-5 | 접근성 감사 — 전 컴포넌트 키보드·스크린리더 점검 (axe) | 🟡 | a11y 배지 |
| F3-6 | 마이그레이션 가이드 (`@vuepkg/calendar` 0.0.x → 신 버전) | 🟢 | breaking 정리 |
| F3-7 | 시작 템플릿 (Vite/Nuxt starter) + StackBlitz 데모 링크 | 🟢 | 유입 채널 |

**완료 기준**: `vuepkg.dev`(가칭) 문서 사이트 배포. 각 컴포넌트 라이브 데모 + 자동 API 표. calendar i18n(요일·라벨) 동작.

---

### Phase 4 — 확장 & 스케일

**목표**: 컴포넌트 커버리지 확대 + 지속 가능한 운영 체계.

| ID | 작업 | 난이도 | 비고 |
| -- | ---- | ------ | ---- |
| F4-1 | 폼 계열 확장: `Input`, `Checkbox`, `Radio`, `Switch`, `DatePicker` | 🟡~🔴 | DatePicker는 core/date 재사용 |
| F4-2 | 오버레이 계열: `Tooltip`, `Toast`, `Drawer` | 🟡 | Popover 토대 재사용 |
| F4-3 | calendar 도메인 심화(선택적): 드래그 시간 슬롯(IMP-04), 2/3-week 뷰(IMP-05), DnD 이벤트 이동(IMP-06) | 🔴 | 별도 스프린트 |
| F4-4 | 번들 사이즈 예산 + size-limit CI 게이트 | 🟢 | 패키지별 budget |
| F4-5 | RFC 프로세스 + CONTRIBUTING + 컴포넌트 추가 체크리스트 | 🟢 | 기여자 온보딩 |
| F4-6 | 시맨틱 버저닝 자동 릴리즈 (changesets → npm publish 자동화) | 🟢 | F0-3 확장 |
| F4-7 | 커뮤니티 노출: awesome-vue PR, 데모, 소개글, npm 배지 | 🟢 | 실유입 전환 |

---

## 3. 마이그레이션 전략 (하위 호환)

현재 `@vuepkg/calendar@0.1.x` 사용자(소수지만)를 깨지 않는 것이 원칙.

| 상황 | 전략 |
| ---- | ---- |
| Phase 0~1 (내부 구조 변경) | **공개 API 무변경**. import 경로·테마는 내부 사항. patch/minor 릴리즈. |
| Phase 2 (ui 의존성 추가) | calendar가 ui를 내부 의존성으로 흡수 — 소비자는 여전히 `@vuepkg/calendar`만 설치. 공개 API 동일 유지. |
| 토큰 도입으로 기본 색상 변화 | 시각 변화는 **minor**로, 기존 룩 유지 옵션(legacy 토큰 프리셋) 제공. |
| 불가피한 breaking | `0.x` 동안은 minor로 허용하되 CHANGELOG·마이그레이션 노트 필수. `1.0.0`에서 API 동결. |

**버전 전략**: `0.x` = 실험/형성기(현재). Phase 3 문서·a11y 완료 시점에 **`1.0.0`** 으로 API 안정 선언.

---

## 4. 리스크 & 완화

| 리스크 | 영향 | 완화책 |
| ------ | ---- | ------ |
| **단일 메인테이너 부담** | 범위 대비 인력 부족 → 정체 | Phase 독립 출시 설계, "calendar가 쓰는 것만" 우선순위, 각 Phase가 단독으로 가치 |
| **Scope creep** (컴포넌트 욕심) | primitive 난립, 미완성 다수 | F2 가드레일: calendar 수요 없는 primitive는 F4로. "추출 우선, 신규 후순위" |
| **추상화 비용 > 이득** | primitive 일반화가 오히려 복잡 | 기존 `componentization-backlog.md`의 CMP-X 비권장 기준 계승. 2회 이상 재사용 전엔 추출 보류 |
| **테마 시스템 과설계** | 토큰 계층 복잡, 학습 곡선 | CSS 변수만(런타임 JS 0), semantic 계층 최소화 |
| **시각 회귀** | 토큰 전환 중 UI 깨짐 | Phase 1에 Visual regression 기준선 선행 |
| **SSR/hydration 이슈** | Nuxt 사용자 이탈 | F3-4에서 명시적 검증, Popover/Dialog의 teleport·id 안정화 |

---

## 5. 성공 지표 (KPI)

| 지표 | 현재 (2026-06-29, F2-3 완료) | Phase 2 목표 | Phase 4 목표 |
| ---- | ---------------------------- | ------------ | ------------ |
| 패키지 수 | **4 (core/theme/ui/calendar)** | 4 (core/theme/ui/calendar) ✅ 달성 | 6+ |
| 실 주간 다운로드(봇 제외) | ~0 (배포 직후 크롤러 484) | 측정 체계 구축 | 의미 있는 유입 |
| 컴포넌트 수 | calendar 1 + **ui primitive 4종** (Button/IconButton/SegmentedControl/Chip) | 5+ primitive (Popover·DataTable 추가 시 달성) | 15+ |
| calendar 번들 사이즈 (gzip) | 초기 ~18.2KB / 전체 ~22.3KB (`@vuepkg/ui` 소비 포함) | core 분리로 ↓ | budget 내 유지 |
| 문서 커버리지 | docs/ 내부 문서 + theming.md + `@vuepkg/ui` README | 사이트 + 자동 API | 전 컴포넌트 라이브 데모 |
| a11y | `@vuepkg/ui` 4종 키보드·aria 완비, calendar 전체는 부분 | primitive 키보드 100% | axe 통과 |
| 테스트 | Vitest calendar 205 + ui 38 / E2E 142(시각회귀 8 포함) | 패키지별 유지·증가 | + 시각 회귀 |

> **다운로드 KPI 주의**: 현재 501/주는 신규 배포 크롤러 트래픽(6/26 484 + 6/27 17)이며 실사용 아님. 실유입 측정 체계(README npm 배지, 문서 사이트 analytics)부터 Phase 3에 구축.

### 5.1 번들 사이즈 기준선 (baseline)

> Phase 0 기준 측정: 2026-06-29 · `@vuepkg/calendar@0.0.4` · `pnpm turbo run build:lib` (ESM, `vite 8.0.16`)
> Vue는 peer dependency라 제외. Phase 4 `F4-4`의 size-limit CI 게이트 기준값으로 사용.

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

`@vuepkg/ui` **단독 패키지** (참고용 — calendar에는 소스 단위로 번들링되어 별도 설치 불필요):

| 산출물 | Raw | Gzip |
| ------ | ---: | ---: |
| `index.esm.js` | 3.77 KB | 1.48 KB |
| `style.css` | 2.62 KB | 0.71 KB |

**소비자 체감 (gzip, Phase 2 F2-3 기준)**
- 초기 로드 (List 미진입): `index.js` + `style.css` ≈ **18.2 KB**
- 전체 (List 포함): ≈ **22.3 KB**

**관찰**
- UI 컴포넌트치고 매우 가벼움 (FullCalendar ~100KB+, toast-ui ~70KB+ gzip 대비). zero-dep 포지셔닝이 수치로 증명됨.
- `@vuepkg/ui` 4개 primitive 추가에도 전체 gzip 증가는 ~1KB 미만 — Button/IconButton/SegmentedControl/Chip이 의도적으로 작게 설계된 결과.
- `CalendarMonthNav` 청크가 7.23KB로 늘어난 건 `IconButton` 컴포넌트가 그 청크에 함께 번들링되기 때문 — Phase 2 후반(F2-4 Popover 등 무거운 primitive 추가 시) 청크 분할 전략 재검토 필요.
- Phase 0에서 `@vuepkg/core` 분리 시 `utils/*` 등이 빠져 calendar JS 번들은 추가로 감소 예상.

---

## 6. 즉시 착수 가능한 첫 3걸음

로드맵 전체는 길지만, **이번 주에 시작할 수 있는 것**:

1. ~~**F0-1/F0-4 스파이크**: 현 레포를 `packages/calendar`로 옮기고 pnpm workspace + `@vuepkg/core` 빈 패키지 생성. `utils/date.ts`만 먼저 이관해서 동선 검증. (반나절)~~ ✅ 완료
2. ~~**F1-1 토큰 RFC**: `--vp-*` 네이밍과 3계층 구조를 1페이지로 확정. (1~2시간)~~ ✅ 완료
3. ~~**F2-1 `Button` 추출 PoC**: `CalendarPeriodNav`의 버튼을 `@vuepkg/ui/Button`으로 빼보고, 추출 비용이 실제로 감당되는지 1개로 체감. (반나절)~~ ✅ 완료 (2026-06-29) — `Button`/`IconButton` 둘 다 추출, `CalendarPeriodNav` + `CalendarMonthNav` 적용

→ 3축 검증 완료. Phase 2를 F2-2(`SegmentedControl`)·F2-3(`Chip`)까지 이어서 완료 (2026-06-29, `@vuepkg/ui@0.2.0`).

### 다음 단계 — Phase 2 후반 (난이도 🔴)

> **우선순위 결정 (2026-06-29)**: F2-4(Popover)를 로드맵 순서대로 계속 진행. §1.5의 기술 부채 3건은 F2-4 완료 직후로 명시적으로 미룸 (병행하지 않기로 결정).

| ID | 작업 | 난이도 | 비고 |
| -- | ---- | ------ | ---- |
| F2-4 | `Popover` 추출 — `MonthOverflowPopover`의 bounds·flip 계산 재사용 | 🔴 | focus trap·Esc·외부클릭까지 새로 구현 필요 (현재 popover는 이런 키보드 처리가 없음) — **다음 작업** |
| F2-5 | `DataTable` 추출 — `ListView`의 페이지네이션·반응형 컬럼 숨김 | 🔴 | 정렬 aria·caption까지 가면 범위 확대 — 우선 페이지네이션만으로 스코프 제한 권장 |
| — | §1.5 기술 부채 3건 정리 | 🟡 | F2-4 완료 직후 별도 세션으로 묶어서 처리 |

두 추출 항목 모두 F2-1~F2-3보다 난이도가 한 단계 높음(상태를 가진 컴포넌트 + DOM 위치 계산). 착수 전 설계 노트 1페이지 권장.

---

## 7. 참고 (기존 문서 연결)

- [roadmap.md](./roadmap.md) — calendar 단일 컴포넌트 기능 백로그 (IMP-02~08). 본 문서의 Phase 4 `F4-3`에 흡수.
- [componentization-backlog.md](./componentization-backlog.md) — CMP-01~11 내부 분리. Phase 2 primitive 추출과 연계(특히 CMP-09 `MonthWeekdayHeader` → i18n).
- [architecture.md](./architecture.md) — 현 단일 패키지 구조. Phase 0 이후 패키지별로 분할 갱신 필요.
- [improvement-backlog.md](./improvement-backlog.md) — IMP 항목 원장.
