# 로드맵 — @vuepkg/calendar

> **정본 문서.** 비전·전략·Phase 정의·달성률·다음 착수 순서·완료 이력·잔여 백로그를 이 문서 하나로 관리합니다.
> 기존 `roadmap-progress.md`(달성률 대시보드)·`framework-roadmap.md`(전략·Phase 정의)는 2026-07-02 문서 통합으로 이 문서에 흡수되어 삭제되었습니다 — 두 문서가 같은 수치를 서로 다르게 표기하는 불일치가 발생해 단일 정본으로 합쳤습니다.
> **측정 기준일:** 2026-07-02 · **패키지 버전:** `@vuepkg/calendar@0.4.0`

---

## 0. 달성률 대시보드

| 범주 | 완료 | 전체 | 달성률 | 비고 |
| ---- | ---: | ---: | -----: | ---- |
| **Phase 0** Monorepo & Core | 7 | 7 | **100%** | F0-1~F0-7 |
| **Phase 1** 테마 & 토큰 | 6 | 7 | **86%** | F1-7 시각 회귀 baseline 미착수 |
| **Phase 2** `@vuepkg/ui` | 7 | 7 | **100%** | F2-6 취소 제외, F2-7은 F4-3에서 완료 |
| **Phase 3** DX & 생태계 | 4 | 7 | **57%** | F3-2·F3-4·F3-7 잔여 |
| **Phase 4** 도메인 고도화 | 8 | 12 | **67%** | F4-8 보류 포함; 활성만 보면 8/11 = **73%** |
| **Staff Review (SRV)** | 20 | 21 | **95%** | P0 2/2·P1 5/5·P2 12/13·NIT 1/1. SRV-P2-12만 미착수 |
| **OSS Review (REV)** | 1 | 21 | **5%** | Critical 0/4·High 0/6·Medium 0/6·Low 0/4·문서 1/1 |
| **1.0.0 게이트 (Phase A)** | 0 | 4 | **0%** | slot·이벤트 모델·문서 정합·소비자 DX |

> 이전 버전 문서들의 수치 불일치 기록: `roadmap-progress.md`는 SRV를 19/20, REV를 1/18로 표기했으나 각 문서 자체의 세부 표를 합산하면 20/21·1/21이 맞습니다(§7 갱신 이력 참고). 본 문서가 정정된 단일 수치입니다.

### 전체 로드맵 (Phase 0~4, 취소·보류 제외)

```
완료 32 / 계획 39  →  82%
```

- **분자:** Phase별 완료 항목 합 (F1-7, F3-2/4/7, F4-6/7/12 미완)
- **분모:** F2-6(취소)·F4-8(명시 보류) 제외한 추적 항목

### 1.0.0까지 남은 거리 (제품 관점)

| 마일스톤 | 상태 | 추정 |
| -------- | ---- | ---- |
| npm 배포·CI·문서 사이트 | ✅ 달성 | 0.4.0 운영 중 |
| 핵심 캘린더 기능 (4뷰·DnD·반복·CRUD) | ✅ 달성 | F4-1~5 |
| API 안정화 (slot·이벤트 모델) | ❌ 미착수 | **1.0.0 게이트** |
| 엔터프라이즈 신뢰 (SSR·대량 데이터) | ❌ 미착수 | F3-4·F4-7 |
| 차별화 뷰 (Timeline) | ❌ 미착수 | F4-6 |

**1.0.0 준비도 (가중 추정): 58%** — 인프라·핵심 기능은 높으나, API 일반화·확장성·생태계 마무리가 남음.

### 품질·운영 지표 (코드베이스 실측)

| 지표 | 값 |
| ---- | -- |
| Vitest | **440** (calendar 290 + ui 76 + core 74) |
| Playwright E2E (CI) | **142** |
| Playwright 시각 회귀 | 8 (수동 workflow) |
| 번들 `index.js` (brotli) | **18.4 KB / 20 KB** (92%) |
| npm 버전 | **0.4.0** |
| 문서 사이트 | https://vuepkg.github.io/calendar/ |

---

## 1. 비전 & 포지셔닝

### 1.1 한 줄 비전

> **Vue 3 Composition API 네이티브 · headless 가능 · zero-dependency** 한 Modern Calendar Engine.
> FullCalendar는 무겁고 핵심 기능 다수가 유료 라이선스에 막혀 있고, v-calendar·vue-cal은 정체되어 있다 — `@vuepkg/calendar`는 **Tailwind/shadcn 친화적 커스터마이징, macOS/Google Calendar 수준 UX, DnD·Timeline·Recurring Event**를 갖춘 캘린더 엔진을 노린다.
> `"zero-dependency · controlled · CSS-variable 테마"` DNA는 calendar 자체의 구현 원칙 — "범용 디자인 시스템 판매"의 차별화 포인트가 아니다 (2026-06-30 방향 전환, 아래 §1.2 참고).

### 1.2 전략 결정 이력

| 시점 | 결정 |
| ---- | ---- |
| 2026-06-29 | ~~실제 npm 배포 "범용 UI 프레임워크"로 채택을 노린다~~ — PrimeVue/Vuetify(풀세트)·shadcn-vue/Radix Vue(headless+Tailwind) 모두 이미 강자가 있는 레드오션이라는 경쟁 분석 결과. Vue 캘린더 생태계(FullCalendar/v-calendar/vue-cal)는 modern DX·headless 구조·DnD/Timeline/Recurring 지원이 빈 공간으로 확인됨 |
| 2026-06-30 | **방향 전환**: 범용 Vue 3 디자인 시스템 방향을 폐기하고 **calendar 도메인 고도화에 집중**. `core`/`ui`/`theme`는 폐기가 아니라 **calendar를 지탱하는 내부 인프라로 스코프 고정** — `ui`를 외부에 독립 판매하는 범용 컴포넌트 라이브러리로 키우는 것은 목표가 아님 |
| 2026-07-02 | OSS 리뷰([vue3-reviewer-backlog.md](../vue3-reviewer-backlog.md)) 반영 — **F4-6 Timeline 즉시 착수 보류**, 1.0.0 API 게이트(Phase A)를 먼저 닫기로 확정 |

남은 유효 원칙: 실 사용자가 생기기 전(`1.0.0` 시점)까지 §6.1의 기술 부채는 여전히 정리 대상.

### 1.3 차별화 포지셔닝 (지켜야 할 원칙)

| 원칙 | 의미 | 현재 상태 |
| ---- | ---- | -------- |
| **Zero runtime deps** | `vue` peer 외 런타임 의존성 0 | ✅ (PrimeVue 제거 완료) |
| **Controlled / emit-only** | 상태는 소비자가 소유, 컴포넌트는 표현+emit | ✅ (`v-model` + 핸들러) |
| **CSS-variable 테마** | 런타임 JS 테마 엔진 없이 CSS 변수로 테마 | ✅ (Phase 1 완료) |
| **Type-safe public API** | 모든 공개 타입 `types/` 단일 출처 | ✅ |
| **Headless-friendly** | 로직(composable) / 표현(styled) 분리 가능 | ⚠️ 부분 (`@vuepkg/calendar/headless` 공개, slot API는 미구현) |
| **Tailwind / shadcn-style class** | 소비자가 `class`로 내부 UI 커스터마이즈 | ❌ 미지원 — CSS 변수·headless가 현재 경로. slot API는 1.0.0 전 과제 (REV-A1) |
| **A11y by default** | role/aria/keyboard 기본 제공 | ✅ `@vuepkg/ui` 7종 모두 키보드·aria 완비 |

### 1.4 왜 지금 가능한가 — calendar는 이미 미니 프레임워크였다

Phase 0~2(2026-06-30 완료)에서 calendar 내부의 재사용 가능한 primitive를 `@vuepkg/ui`/`@vuepkg/core`로 추출했다 — `CalendarPeriodNav`의 `‹ ›` 버튼 → `Button`/`IconButton`, `CalendarToolbar` → `SegmentedControl`, `ScheduleEventChip`/`HolidayChip` → `Chip`, `MonthOverflowPopover` → `Popover`, `ListView` → `DataTable`, `ScheduleFormModal` → `Dialog`(F4-3). "calendar를 분해 → 공통 토대 추출 → 그 위에 calendar 재조립" 동선은 완료됐고, 이후는 이 토대 위에서 **calendar 도메인 기능 자체를 고도화**하는 데 집중한다 (→ Phase 4).

---

## 2. Phase A/B/C — 다음 개발 방향 (2026-07-02 확정)

> OSS 리뷰([vue3-reviewer-backlog.md](../vue3-reviewer-backlog.md))·제품 전략 관점 통합. **F4-6 Timeline 즉시 착수는 보류.**

### Phase A — 1.0.0 API 게이트 (최우선)

| 순위 | ID | 항목 | 출처 | 난이도 |
| ---: | -- | ---- | ---- | ------ |
| 1 | REV-A1 | scoped **slot API** (`event`, `day-cell`, `toolbar`, `month-overflow-item`) | REV Critical | 🔴 |
| 2 | REV-A2 | **`Schedule` 이벤트 모델 일반화** (`participant*` optional, `meta`) | REV Critical | 🟡 |
| 3 | F3-2 | `vue-component-meta` 문서 자동화 | F3 | 🟡 |
| 4 | DOC-A1 | README·introduction Tailwind/headless 한 줄 정합 | REV Medium | 🟢 |

**목표:** shadcn/Tailwind adopters가 "CSS 변수 또는 slot"으로 커스터마이즈 가능. API freeze 선언 전 필수.

### Phase B — 엔터프라이즈 신뢰

| ID | 항목 | 출처 | 난이도 |
| -- | ---- | ---- | ------ |
| F3-4 | Nuxt / SSR 검증 + 모듈 스텁 | F3·REV | 🔴 |
| F4-7 | Virtualization + 1k/10k 벤치마크 | F4·REV | 🔴 |
| REV-B1 | `sideEffects` package.json | REV High | 🟢 |
| REV-B2 | TimedGrid DnD 키보드 대안 | REV High | 🟡 |
| SRV-P2-12 / F1-7 | 시각 회귀 Linux baseline | SRV·F1 | 🟢 |

### Phase C — 차별화·성장 (1.0.0 이후 또는 서브패스 분리 후)

| ID | 항목 | 출처 | 난이도 |
| -- | ---- | ---- | ------ |
| F4-6 | Timeline / Resource (`@vuepkg/calendar/timeline` 서브패스 권장) | F4 | 🔴 |
| F4-12 | awesome-vue·니치 커뮤니티 | F4 | 🟢 |
| F3-7 | StackBlitz 예약 SaaS 데모 | F3 | 🟢 |
| F4-8 | 타임존 | F4 | 🔴 (보류) |

**~~이전 1순위~~ F4-6 Timeline — Phase C로 이동 (보류 사유):** 번들 92% 포화, slot API·이벤트 모델 미정리 상태에서 Timeline 추가 시 API breaking·유지보수 비용 증가. 설계 RFC는 Phase C 착수 시 진행.

### 의도적으로 뒤로 미룸

- 범용 `@vuepkg/ui` 확장 (F2-6 방향 폐기 유지)
- IMP-07 단일 타임존 (국내 ROI 낮음 — 글로벌 확장 시 F4-8로 재개)

---

## 3. Phase 0~4 상세

> 각 Phase는 **독립 출시 가능**하도록 설계. 중간에 멈춰도 calendar는 항상 동작.
> 난이도: 🟢 낮음 · 🟡 중간 · 🔴 높음

### Phase 0 — Monorepo & Core 추출 ✅ 완료 (100%, 7/7)

**목표**: 단일 레포 → 워크스페이스. `core` 패키지 분리. calendar는 그대로 동작 유지.

| ID | 작업 | 난이도 |
| -- | ---- | ------ |
| F0-1 | pnpm workspace + turborepo 도입, 기존 src → `packages/calendar`로 이관 | 🟡 |
| F0-2 | 공유 tooling 추출 (`tooling/tsconfig`, eslint, prettier, vite/tsup preset) | 🟡 |
| F0-3 | changesets 도입 — 멀티 패키지 독립 버저닝 | 🟢 |
| F0-4 | `@vuepkg/core` 생성 + `utils/date.ts`·`utils/holiday.ts`·공통 타입 이관 | 🟡 |
| F0-5 | `useControllableState` 추출 — emit-only/v-model 패턴 일반화 | 🟡 |
| F0-6 | CI 파이프라인: lint → typecheck → vitest → build → `test:e2e:ci` | 🟢 |
| F0-7 | calendar가 `@vuepkg/core` 소비하도록 import 경로 교체 | 🟡 |

**완료 기준(DoD)**: `pnpm build` 시 core·calendar 둘 다 빌드. 기존 테스트 전부 통과. calendar npm 배포 결과물 동일.

### Phase 1 — 디자인 토큰 & 테마 시스템 — 86% (6/7)

**목표**: 하드코딩 색상/치수 제거 → CSS 변수 계약. light/dark 지원. 소비자 테마 오버라이드 가능.

| ID | 작업 | 난이도 | 상태 |
| -- | ---- | ------ | ---- |
| F1-1 | 토큰 스펙 설계 (primitive/semantic/component 3계층, 네이밍 `--vp-*`) | 🟡 | ✅ |
| F1-2 | `@vuepkg/theme` 생성: `base.css` + `dark.css` + `index.css` | 🟡 | ✅ |
| F1-3 | calendar 하드코딩 상수 → component 토큰 마이그레이션 | 🟡 | ✅ |
| F1-4 | calendar 컴포넌트 CSS의 리터럴 색상 → `var(--vp-*)` 치환 | 🟡 | ✅ |
| F1-5 | `prefers-color-scheme` + `.vp-dark` 클래스 토글 둘 다 지원 | 🟢 | ✅ |
| F1-6 | 테마 커스터마이징 가이드 + 토큰 레퍼런스 문서 | 🟢 | ✅ (`docs/guide/theming.md`) |
| F1-7 | Visual regression 기준선 캡처 (토큰 전환 전/후 비교) | 🟡 | ⏳ 미착수 (Phase B) |

**왜 CSS 변수인가**: 런타임 JS 테마 엔진은 번들·런타임 비용을 만든다. CSS 변수는 비용 0이고 SSR-safe이며 "zero-dep" 포지셔닝과 일치.

### Phase 2 — Primitive 승격 (`@vuepkg/ui`) ✅ 완료 (100%, F2-6 취소·F2-7은 F4-3에서 완료)

**목표**: calendar 내부 구현에서 재사용되는 부분만 primitive로 추출. **`ui`를 독립 판매 가능한 범용 컴포넌트 라이브러리로 키우는 것은 목표가 아님** — calendar 품질을 높이는 부산물로만 유지.

| ID | primitive | 추출 출처 | 난이도 | 상태 |
| -- | --------- | --------- | ------ | --------- |
| F2-1 | `Button` / `IconButton` | `CalendarPeriodNav`, `CalendarMonthNav` | 🟢 | ✅ |
| F2-2 | `SegmentedControl` | `CalendarToolbar` | 🟡 | ✅ — 화살표 키 네비게이션·roving tabindex 신규 |
| F2-3 | `Chip` | `ScheduleEventChip`, `HolidayChip` | 🟢 | ✅ — `Badge`는 보류(2회 미만 사용) |
| F2-4 | `Popover` | `MonthOverflowPopover` | 🔴 | ✅ — Teleport·backdrop·Esc·외부클릭·focus trap 신규 |
| F2-5 | `DataTable` | `ListView` (페이지네이션·반응형 컬럼) | 🔴 | ✅ — 제네릭 컴포넌트, `cell-{key}` slot |
| F2-6 | ~~`Select`~~ | — | — | 🚫 취소 (2026-06-30) — 범용 프레임워크 방향 폐기와 함께 취소 |
| F2-7 | `Dialog` | `ScheduleFormModal` (F4-3) | 🔴 | ✅ **완료 (2026-07-01)** |
| F2-8 | calendar를 ui primitive 소비로 리팩토링 | calendar | 🟡 | ✅ 완료 |

**가드레일 (영구 원칙)**: "calendar가 쓰지 않는 primitive"는 유예가 아니라 폐기한다. 모든 신규 primitive는 calendar의 실제 기능 요구가 먼저 있고, 그 부산물로만 추출한다.

### Phase 3 — DX & 생태계 — 57% (4/7)

**목표**: 외부 개발자가 발견·학습·도입할 수 있게.

| ID | 작업 | 난이도 | 상태 |
| -- | ---- | ------ | ---- |
| F3-1 | VitePress 문서 사이트 (`apps/docs`) + 라이브 플레이그라운드 | 🟡 | ✅ **완료 (2026-07-01)** — `https://vuepkg.github.io/calendar/` |
| F3-2 | `vue-component-meta`로 props/emits/slots API 표 자동 생성 | 🟡 | ⏳ Phase A |
| F3-3 | i18n/locale 시스템 (`weekdayLabels` → 범용 locale) | 🟡 | ✅ **완료 (2026-07-01)** — `locale?: string` prop |
| F3-4 | SSR / Nuxt 호환 검증 + `@vuepkg/nuxt` 모듈 | 🔴 | ⏳ Phase B |
| F3-5 | 접근성 감사 — 전 컴포넌트 키보드·스크린리더 점검 (axe) | 🟡 | ✅ **완료 (2026-07-02)** — DnD 키보드 대안은 REV-B2로 분리 |
| F3-6 | 마이그레이션 가이드 | 🟢 | ✅ **완료 (2026-07-01)** |
| F3-7 | 시작 템플릿 + StackBlitz 데모 링크 | 🟢 | ⏳ Phase C |

### Phase 4 — Calendar 도메인 고도화 (Modern Calendar Engine) — 67% (8/12)

**목표**: FullCalendar/v-calendar/vue-cal 대비 빈 공간(modern DX, headless 구조, DnD, Timeline/Scheduler, Recurring Event, Virtualization)을 메운다. 구버전 로드맵의 범용 컴포넌트 확장(폼 계열 `Input`/`Checkbox`/`Select`, 오버레이 계열 `Tooltip`/`Toast`/`Drawer`)은 **전면 폐기**.

| ID | 작업 | 난이도 | 상태 |
| -- | ---- | ------ | ---- |
| F4-1 | 드래그로 시간 슬롯 범위 선택 | 🟡 | ✅ **완료 (2026-07-01)** — `useTimeSlotSelection` composable, pointer event 기반 |
| F4-2 | 2-week / 3-week 월간 뷰 변형 | 🟡 | ✅ **완료 (2026-07-01)** — `monthWeekCount?: 2\|3\|6` prop |
| F4-3 | 일정 상세/생성 모달 (CRUD UI) | 🔴 | ✅ **완료 (2026-07-01)** — `ScheduleFormModal` + `Dialog`(F2-7) |
| F4-4 | 드래그&드롭 이벤트 이동·리사이즈 | 🔴 | ✅ **완료 (2026-07-01)** — `useScheduleDrag` composable |
| F4-5 | Recurring Event (반복 일정) | 🔴 | ✅ **완료 (2026-07-01)** — `RecurrenceRule` + `expandRecurringSchedules` |
| F4-6 | Timeline / Resource Scheduler 뷰 | 🔴 | ⏳ **Phase C로 연기** — FullCalendar Premium 영역과 직접 겹침(§6.4 참고) |
| F4-7 | 대량 일정 Virtualization | 🔴 | ⏳ Phase B |
| F4-8 | 타임존 지원 (재검토) | 🔴 | 🔶 보류 — F4-1~F4-7 이후, 글로벌 확장 시 재검토 |
| F4-9 | 번들 사이즈 예산 + size-limit CI 게이트 | 🟢 | ✅ **완료 (2026-07-01)** |
| F4-10 | RFC 프로세스 + CONTRIBUTING + 기능 추가 체크리스트 | 🟢 | ✅ **완료 (2026-07-01)** |
| F4-11 | 시맨틱 버저닝 자동 릴리즈 (changesets → npm publish) | 🟢 | ✅ **완료 (2026-07-01)** — `@vuepkg/calendar@0.2.1`+ npm 자동 배포 |
| F4-12 | 커뮤니티 노출 — "Vue 캘린더/스케줄러" 니치 타겟 | 🟢 | ⏳ Phase C |

#### 수익화 시사점 (참고)

`F4-5`(반복 일정)·`F4-6`(Timeline/Scheduler)는 FullCalendar가 Premium 라이선스로 유료화한 영역과 정확히 겹친다. 장기적으로 "코어 무료 + 고급 뷰 유료" 모델을 검토할 수 있는 후보 — 지금 당장 결정할 사항은 아니지만, F4-6 설계 시 무료/유료 경계를 의식해두면 나중에 분리 비용이 줄어든다.

---

## 4. 완료 항목 이력

| 항목 | 내용 | 완료일 |
| ---- | ---- | ------ |
| CalendarToolbar UI | SelectButton 비주얼 CSS 재현, `aria-pressed` 접근성 | 2026-06-16 |
| `hide-toolbar` prop | 뷰 고정 임베딩 지원 | 2026-06-16 |
| [IMP-08] PrimeVue 제거 | `ListView.vue` 네이티브 `<table>` 전환, `peerDependencies`에서 제거 | 2026-06-23 |
| [IMP-01 / P3-C] `ScheduleType` 소비자 주입 | `Schedule.type: string`, `scheduleTypeOptions` prop | 2026-06-23 |
| 라이브러리 패키징 | `vite.lib.config.ts`, `build:lib` 스크립트, ES+CJS+d.ts 출력 | 2026-06-23 |
| [Phase 0] Monorepo & Core 추출 | pnpm workspace + Turborepo, `@vuepkg/core` 분리, CI 파이프라인 | 2026-06-28 |
| [Phase 1] 디자인 토큰 & 테마 시스템 | `@vuepkg/theme` CSS 패키지, 전 컴포넌트 `--vp-*` 변수 적용, 다크 모드 | 2026-06-29 |
| [Phase 2] `@vuepkg/ui` Primitive 승격 | `Button`/`IconButton`/`SegmentedControl`/`Chip`/`Popover`/`DataTable` 추출 | 2026-06-30 |
| CI E2E · Git hooks | GitHub Actions Node 24, `test:e2e:ci`(134) CI 편입, 시각 회귀 수동 workflow, Husky `verify:push` | 2026-06-30 |
| [SRV-P0-01] `query-change` 정확성 | navigate/view-change 시 다음 date/view를 payload에 반영 | 2026-06-30 |
| [IMP-04 / F4-1] 드래그 시간 슬롯 범위 선택 | `useTimeSlotSelection` composable, pointer event 기반 | 2026-07-01 |
| [IMP-06 / F4-4] 드래그&드롭 이벤트 이동·리사이즈 | `useScheduleDrag` composable, `schedule-move`/`schedule-resize` emit | 2026-07-01 |
| [IMP-05 / F4-2] 2/3주 월간 뷰 변형 | `monthWeekCount?: 2\|3\|6` prop, 선택 날짜 기준 window + clamp | 2026-07-01 |
| [F3-1] VitePress 문서 사이트 + GitHub Pages 배포 | `apps/docs`, `docs.yml` GitHub Actions | 2026-07-01 |
| [F4-11] Changesets 자동 릴리즈 | `release.yml` GitHub Actions, npm 자동 배포 | 2026-07-01 |
| [IMP-02] `weekdayLabels` prop | `MonthView` 요일 헤더 커스터마이즈, 미전달 시 영문 기본값 유지 | 2026-07-01 |
| [IMP-03] `startHour`/`endHour` prop | Week/Day 시간 그리드 표시 범위 커스터마이즈, 기본 0~23 | 2026-07-01 |
| [F3-3] `locale` prop — i18n 자동 현지화 | `Intl.DateTimeFormat` 기반 요일 자동 현지화 | 2026-07-01 |
| [SRV-P1-04] 번들 budget 상향 | size-limit 16/15/6.5KB → 20/19/8KB, F4-6 착수 여유 확보 | 2026-07-02 |
| [SRV-P2-09] Month cell roving tabindex | `role="grid"`/`row`, 단일 활성 셀만 `tabindex="0"`, 화살표 키 이동 | 2026-07-02 |
| [SRV-P2-10] 공휴일 API 응답 스키마 검증 | `isValidSpcdeApiResponse` 런타임 가드, 개별 item 필터링 | 2026-07-02 |
| [EXT-01] 공휴일 API 실패 UI | `ScheduleCalendar` dismissible alert 배너 (`role="alert"`) | 2026-07-02 |
| [SRV-P2-08] ScheduleFormModal 분리 | `RecurrenceFields.vue` 추출, 611→431줄 | 2026-07-02 |
| [SRV-P1-05] TimedGrid DnD 재팽창 해소 | `TimedGridDayColumn.vue` 추출, 495→336줄 | 2026-07-02 |
| [F3-5] axe 자동 접근성 감사 | `e2e/accessibility.spec.ts`, Month/Week/Day/List/모달 전수 0 violation, CI 편입. 색상 대비 토큰 다수 상향 | 2026-07-02 |
| [SRV-P2-13] E2E flaky 테스트 수정 | `calendar.spec.ts` 오늘 날짜 substring 매칭 버그 → 정확 매칭 정규식으로 교체 | 2026-07-02 |
| [SRV-P2-11] headless 서브패스 | `@vuepkg/calendar/headless` — `src/headless.ts` + vite lib 2-entry 빌드 + `exports`. 번들 budget 78%→92% 소진 | 2026-07-02 |
| [SRV-P1-02] dts/CSS alias 분리 | alias 제거(workspace symlink 경유 정상 해석), `@import '@vuepkg/ui/style.css'` 명시 추가 — dts 깨진 경로 해소 | 2026-07-02 |

---

## 5. 남은 백로그

### 5.1 컴포넌트 분리 백로그

> `CMP-*`는 `.vue` 파일 분리 후보. CMP-01/02/04/07은 Phase 4 리팩터(SRV-P1-03/P1-05)를 거치며 완료됨.

| ID | 후보 컴포넌트 | 대상 파일 | 상태 |
| -- | ------------ | --------- | ---- |
| CMP-01 | `CalendarMonthNav` | `MonthView.vue`/`ListView.vue` | ✅ 완료 (2026-06-10) |
| CMP-02 | `MonthCell` | `MonthView.vue` | ✅ 완료 (2026-07-01, SRV-P1-03) |
| CMP-04 | `TimedGridAllDay` | `TimedGrid.vue` | ✅ 완료 (2026-07-01, SRV-P1-03) |
| CMP-07 | `TimedGridHeader` | `TimedGrid.vue` | ✅ 완료 (2026-07-01, SRV-P1-03) |
| CMP-05 | `TimedGridTimeBody` | `TimedGrid.vue` | ✅ 사실상 완료 — `TimedGridDayColumn.vue`로 흡수 (2026-07-02, SRV-P1-05) |
| CMP-03 | `MonthWeekSpanningBars` | `MonthView.vue` | ⏳ 필요 시 재개 — 멀티데이 All Day 오버레이 분리 |
| CMP-06 | `TimedEventBlock` | `TimedGrid.vue`/`TimedGridDayColumn.vue` | ⏳ 필요 시 재개 |
| CMP-08 | `CurrentTimeIndicator` | `TimedGridDayColumn.vue` | ⏳ 필요 시 재개 |
| CMP-09 | `MonthWeekdayHeader` | `MonthView.vue` | ⏳ IMP-02로 prop 자체는 해소 — 순수 마크업 분리만 남음 |
| CMP-10 | `ListFilterBar` | `ListView.vue` | ⏳ 필요 시 재개 |
| CMP-11 | `useMonthOverflowPopover` | `MonthView.vue` | ⏳ 필요 시 재개 — 팝오버 state·앵커 계산 composable |

**비권장 (보류·취소)**

| ID | 항목 | 사유 |
| -- | ---- | ---- |
| CMP-X1 | Month/Week 공통 `AllDayBarSlot` | 그리드·CSS 컨텍스트 상이, 추상화 비용 > 이득 |
| CMP-X2 | `ScheduleEventChip` + `AllDayBar` 통합 | 역할 다름 |
| CMP-X3 | `WeekView`/`DayView` 추가 분리 | 이미 `TimedGrid` 래퍼 수준 |

### 5.2 테스트 커버리지 갭 — 전량 완료

| ID | 영역 | 상태 |
| -- | ---- | ---- |
| GAP-TS-01 | Week/Day `time-slot-select` Playwright E2E | ✅ 완료 |
| GAP-01 | List 행 `schedule-click` E2E | ✅ 완료 |
| GAP-REF-01 | `resolveCalendarNavigateDate` 단위 spec 보강 | ✅ 완료 |

### 5.3 운영·배포

| ID | 내용 | 상태 |
| -- | ---- | ---- |
| EXT-01 | 공휴일 API 실패 시 graceful degrade UI | ✅ 완료 (2026-07-02) |
| EXT-02 | `fetch-public-holidays` + SSR/프록시 키 관리 가이드 | ✅ 완료 |
| NPM-01~04 | LICENSE·기본값·Changesets·homepage | ✅ 전부 완료 |

---

## 6. 아키텍처·리스크·KPI

> 패키지 구조·의존성 방향·디렉터리 상세는 [architecture.md](./architecture.md) 참고. 이 절은 전략적 결정 사항만 다룬다.

### 6.1 알려진 기술 부채 (추적)

| 항목 | 내용 | 상태 |
| ---- | ---- | ---- |
| `vite-plugin-dts` 상대경로 누수 | `@vuepkg/core`/`@vuepkg/ui` alias가 `.d.ts`에 깨진 상대경로를 남기던 문제 | ✅ 해결 (2026-07-02, SRV-P1-02) |
| `package.json` types 경로 불일치 | 0.1.0~0.1.3 전체 배포 버전에서 `types`/`exports.types`가 실제 빌드 출력과 다른 경로를 가리킴 | ✅ 해결 (2026-06-30) |

### 6.2 디자인 토큰 3계층

```
primitive    --vp-color-blue-500: #3b82f6;     (원시값 — 팔레트)
   ▼
semantic     --vp-color-primary: var(--vp-color-blue-500);
   ▼
component     --vp-chip-bg: var(--vp-color-surface);
```

소비자는 **semantic 계층만 덮어쓰면** 전체 테마가 바뀐다.

### 6.3 마이그레이션 전략 (하위 호환)

현재 `@vuepkg/calendar` 사용자를 깨지 않는 것이 원칙.

| 상황 | 전략 |
| ---- | ---- |
| 내부 구조 변경 | **공개 API 무변경**. import 경로·테마는 내부 사항. patch/minor 릴리즈 |
| ui 의존성 추가 | calendar가 내부적으로 흡수 — 소비자는 여전히 `@vuepkg/calendar`만 설치 |
| 도메인 기능 추가 | 신규 prop/emit은 옵셔널 기본값으로 추가, 기존 기본 동작 불변 |
| 토큰 도입으로 기본 색상 변화 | 시각 변화는 **minor**로, 기존 룩 유지 옵션 제공 |
| 불가피한 breaking | `0.x` 동안은 minor로 허용하되 CHANGELOG·마이그레이션 노트 필수. `1.0.0`에서 API 동결 |

**버전 전략**: `0.x` = 실험/형성기(현재). Phase A(1.0.0 API 게이트) 완료 시점에 **`1.0.0`**으로 API 안정 선언.

### 6.4 리스크 & 완화

| 리스크 | 영향 | 완화책 |
| ------ | ---- | ------ |
| 단일 메인테이너 부담 | 범위 대비 인력 부족 → 정체 | Phase 독립 출시 설계, "calendar가 쓰는 것만" 우선순위 |
| Scope creep (범용 프레임워크 회귀 유혹) | 방향이 재차 흔들림 | 2026-06-30 결정 고정: `ui`는 calendar 내부 전용으로 동결 |
| 추상화 비용 > 이득 | primitive 일반화가 오히려 복잡 | 2회 이상 재사용 전엔 추출 보류 (§5.1 CMP-X 기준) |
| 시각 회귀 | 토큰 전환 중 UI 깨짐 | F1-7 baseline 필요 (Phase B) |
| SSR/hydration 이슈 | Nuxt 사용자 이탈 | F3-4에서 명시적 검증 |
| 캘린더 niche 시장 규모 한계 | 범용 UI 라이브러리 대비 TAM이 작음 | B2B 임베딩·고급 뷰 유료화(§3 Phase 4 수익화 시사점)로 단가 보전 |

### 6.5 성공 지표 (KPI)

| 지표 | 현재 (2026-07-02) |
| ---- | ------------------ |
| 패키지 수 | 4 (core/theme/ui/calendar) — `ui`는 calendar 전용으로 동결, 더 늘리지 않음 |
| `ui` primitive 수 | 7종 (Button/IconButton/SegmentedControl/Chip/Popover/DataTable/Dialog) — 동결 |
| 캘린더 도메인 기능 커버리지 | month/week/day/list 뷰, 공휴일, overflow popover, 드래그 시간 슬롯 선택, DnD, CRUD 모달, 반복 일정 |
| calendar 번들 사이즈 (brotli) | index.js 18.4KB / 20KB (92%) — F4-6 전 서브패스 분리 권장 |
| a11y | `@vuepkg/ui` 7종 키보드·aria 완비, axe CI 통과 |
| 테스트 | Vitest 440 / E2E 기능 142(CI) + 시각 8(수동) |

---

## 7. 갱신 이력

| 일자 | 변경 |
| ---- | ---- |
| 2026-06-29 | `framework-roadmap.md` 최초 작성 |
| 2026-06-30 | 방향 전환(범용 UI 폐기 → calendar 도메인 고도화) 확정 |
| 2026-07-02 | `roadmap-progress.md` 신규 작성 — Phase 0~4·SRV·REV 달성률, Phase A/B/C 방향 확정 |
| 2026-07-02 | **문서 통합** — `roadmap-progress.md`·`framework-roadmap.md`·`roadmap.md`(기능 백로그) 3개 문서를 본 문서로 병합. SRV 총계(19/20→20/21)·REV 총계(1/18→1/21)·Phase B 항목 누락(REV-B1/REV-B2) 등 문서 간 수치 불일치를 정정 |

---

## 8. 참고 문서

- [architecture.md](./architecture.md) — 패키지 구조·컴포넌트 API·테스트 상세 (개발 시작 시 함께 읽기)
- [staff-review-backlog.md](./staff-review-backlog.md) — 코드 결함 추적 원장 (SRV-*)
- [vue3-reviewer-backlog.md](../vue3-reviewer-backlog.md) — OSS·채택성 리뷰 원장 (REV-*)
- [npm-publish-guide.md](./npm-publish-guide.md) — 배포 전 체크리스트
- [CHANGELOG.md](../../CHANGELOG.md) — npm 릴리즈 변경 이력 (Changesets 관리)
