# 로드맵 — @vuepkg/calendar

> **정본 문서.** 비전·전략·Phase 정의·달성률·다음 착수 순서·완료 이력·잔여 백로그를 이 문서 하나로 관리합니다.
> 기존 `roadmap-progress.md`(달성률 대시보드)·`framework-roadmap.md`(전략·Phase 정의)는 2026-07-02 문서 통합으로 이 문서에 흡수되어 삭제되었습니다 — 두 문서가 같은 수치를 서로 다르게 표기하는 불일치가 발생해 단일 정본으로 합쳤습니다.
> **측정 기준일:** 2026-07-02 · **패키지 버전:** `@vuepkg/calendar@0.5.0` (changesets 자동 배포 — SRV-P2-11 헤드리스 서브패스·SRV-P1-02 dts 수정 반영)

---

## 0. 달성률 대시보드

| 범주 | 완료 | 전체 | 달성률 | 비고 |
| ---- | ---: | ---: | -----: | ---- |
| **Phase 0** Monorepo & Core | 7 | 7 | **100%** | F0-1~F0-7 |
| **Phase 1** 테마 & 토큰 | 7 | 7 | **100%** | F1-7 시각 회귀 baseline 재캡처 완료(2026-07-02) |
| **Phase 2** `@vuepkg/ui` | 7 | 7 | **100%** | F2-6 취소 제외, F2-7은 F4-3에서 완료 |
| **Phase 3** DX & 생태계 | 6 | 7 | **86%** | F3-7 StackBlitz Playground 완료(2026-07-02), F3-4 잔여 |
| **Phase 4** 도메인 고도화 | 8 | 12 | **67%** | F4-8 보류 포함; 활성만 보면 8/11 = **73%** |
| **Staff Review (SRV)** | 22 | 22 | **100%** | P0 3/3(SRV-P0-03 npm install 불가 버그 신규 발견·완료)·P1 5/5·P2 13/13·NIT 1/1. SRV-P2-12 완료(2026-07-02) |
| **OSS Review (REV)** | 5 | 21 | **24%** | Critical 2/4(REV-A1·REV-A2 완료)·High 1/6(F3-2 완료)·Medium 1/6(DOC-A1 완료)·Low 0/4·문서 1/1 |
| **1.0.0 게이트 (Phase A)** | 4 | 4 | **100%** | REV-A1(slot API)·REV-A2(Schedule 모델)·F3-2(API 문서 자동화)·DOC-A1(문서 정합) 전부 완료 — **API freeze 준비 완료** |

> 이전 버전 문서들의 수치 불일치 기록: `roadmap-progress.md`는 SRV를 19/20, REV를 1/18로 표기했으나 각 문서 자체의 세부 표를 합산하면 20/21·1/21이 맞습니다(§7 갱신 이력 참고). 본 문서가 정정된 단일 수치입니다.

### 전체 로드맵 (Phase 0~4, 취소·보류 제외)

```
완료 35 / 계획 39  →  90%
```

- **분자:** Phase별 완료 항목 합 (F3-4, F4-6/7/12 미완 — F1-7·F3-7은 2026-07-02 완료로 이동)
- **분모:** F2-6(취소)·F4-8(명시 보류) 제외한 추적 항목

### 1.0.0까지 남은 거리 (제품 관점)

| 마일스톤 | 상태 | 추정 |
| -------- | ---- | ---- |
| npm 배포·CI·문서 사이트 | ✅ 달성 | 0.4.0 운영 중 |
| 핵심 캘린더 기능 (4뷰·DnD·반복·CRUD) | ✅ 달성 | F4-1~5 |
| API 안정화 (slot·이벤트 모델) | ✅ 달성 (2026-07-02) | **Phase A 4/4 완료** |
| 엔터프라이즈 신뢰 (SSR·대량 데이터) | ❌ 미착수 | F3-4·F4-7 (Phase B) |
| 차별화 뷰 (Timeline) | ❌ 미착수 | F4-6 (Phase C) |

**1.0.0 준비도 (가중 추정): 72%** — 인프라·핵심 기능·API 일반화까지 완료. 남은 건 엔터프라이즈 신뢰성(SSR·virtualization, Phase B)과 차별화 뷰(Timeline, Phase C).

### 품질·운영 지표 (코드베이스 실측)

| 지표 | 값 |
| ---- | -- |
| Vitest | **440** (calendar 290 + ui 76 + core 74) |
| Playwright E2E (CI) | **142** |
| Playwright 시각 회귀 | 8 (수동 workflow) |
| 번들 `index.js` (brotli) | **18.4 KB / 20 KB** (92%) |
| npm 버전 | **0.6.2** |
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
| 2026-07-02 | 외부에서 받은 README/홍보 전략 의견을 vue3-oss-reviewer(정직성·과장 금지)·senior-product-strategy-agent(검증 우선·MVP 최소화) 두 관점으로 교차 검증 → **Phase C-1 신설**(§2). "Scheduler/Timeline Ready" 등 미구현 기능 홍보 문구·다국어 README 개별 파일·다채널 동시 홍보는 거부, keywords·Use Case·비교표·headless 노출 강화는 채택 |

남은 유효 원칙: 실 사용자가 생기기 전(`1.0.0` 시점)까지 §6.1의 기술 부채는 여전히 정리 대상.

### 1.3 차별화 포지셔닝 (지켜야 할 원칙)

| 원칙 | 의미 | 현재 상태 |
| ---- | ---- | -------- |
| **Zero runtime deps** | `vue` peer 외 런타임 의존성 0 | ✅ (PrimeVue 제거 완료) |
| **Controlled / emit-only** | 상태는 소비자가 소유, 컴포넌트는 표현+emit | ✅ (`v-model` + 핸들러) |
| **CSS-variable 테마** | 런타임 JS 테마 엔진 없이 CSS 변수로 테마 | ✅ (Phase 1 완료) |
| **Type-safe public API** | 모든 공개 타입 `types/` 단일 출처 | ✅ |
| **Headless-friendly** | 로직(composable) / 표현(styled) 분리 가능 | ✅ `@vuepkg/calendar/headless` + scoped slot API(REV-A1, 2026-07-02) |
| **Tailwind / shadcn-style class** | 소비자가 `class`로 내부 UI 커스터마이즈 | ✅ `toolbar`/`day-cell`/`event`/`month-overflow-item` scoped slot (REV-A1). List 행은 잔여 |
| **A11y by default** | role/aria/keyboard 기본 제공 | ✅ `@vuepkg/ui` 7종 모두 키보드·aria 완비 |

### 1.4 왜 지금 가능한가 — calendar는 이미 미니 프레임워크였다

Phase 0~2(2026-06-30 완료)에서 calendar 내부의 재사용 가능한 primitive를 `@vuepkg/ui`/`@vuepkg/core`로 추출했다 — `CalendarPeriodNav`의 `‹ ›` 버튼 → `Button`/`IconButton`, `CalendarToolbar` → `SegmentedControl`, `ScheduleEventChip`/`HolidayChip` → `Chip`, `MonthOverflowPopover` → `Popover`, `ListView` → `DataTable`, `ScheduleFormModal` → `Dialog`(F4-3). "calendar를 분해 → 공통 토대 추출 → 그 위에 calendar 재조립" 동선은 완료됐고, 이후는 이 토대 위에서 **calendar 도메인 기능 자체를 고도화**하는 데 집중한다 (→ Phase 4).

---

## 2. Phase A/B/C — 다음 개발 방향 (2026-07-02 확정)

> OSS 리뷰([vue3-reviewer-backlog.md](../vue3-reviewer-backlog.md))·제품 전략 관점 통합. **F4-6 Timeline 즉시 착수는 보류.**

### Phase A — 1.0.0 API 게이트 (최우선)

| 순위 | ID | 항목 | 출처 | 난이도 |
| ---: | -- | ---- | ---- | ------ |
| ~~1~~ | ~~REV-A1~~ | scoped **slot API** (`event`, `day-cell`, `toolbar`, `month-overflow-item`) — ✅ **완료 (2026-07-02)**, [RFC](./rfc/REV-A1-slot-api.md), `src/types/slots.ts` 4종, Vitest 9건 추가(299건), size-limit 18.9/20KB(94%) | REV Critical | ~~🔴~~ |
| ~~2~~ | ~~REV-A2~~ | **`Schedule` 이벤트 모델 일반화** (`participant*` optional, `meta`) — ✅ **완료 (2026-07-02)**, `ScheduleDraft`/`ScheduleFormModal`은 변경 없음(참가자 필수 유지), Vitest 6건 추가(305건) | REV Critical | ~~🟡~~ |
| ~~3~~ | ~~F3-2~~ | `vue-component-meta` 문서 자동화 — ✅ **완료 (2026-07-02)**, `scripts/generate-api-docs.mjs` → `apps/docs/api/_generated/`, VitePress `@include`, CI `docs:api:check` drift 게이트 | F3 | ~~🟡~~ |
| ~~4~~ | ~~DOC-A1~~ | README·introduction Tailwind/headless 문구 정합 — ✅ **완료 (2026-07-02)**, README Props/Emits 누락 항목(`publicHolidayServiceKey`/`monthWeekCount`/`schedule-move`/`schedule-resize`) 및 `## Slots` 섹션 신규 추가도 함께 발견·수정 | REV Medium | ~~🟢~~ |

**목표:** shadcn/Tailwind adopters가 "CSS 변수 또는 slot"으로 커스터마이즈 가능. API freeze 선언 전 필수. **→ Phase A 4/4 달성, 1.0.0 API 게이트 통과.**

### Phase B — 엔터프라이즈 신뢰

| ID | 항목 | 출처 | 난이도 |
| -- | ---- | ---- | ------ |
| F3-4 | Nuxt / SSR 검증 + 모듈 스텁 | F3·REV | 🔴 |
| F4-7 | Virtualization + 1k/10k 벤치마크 | F4·REV | 🔴 |
| ~~REV-B1~~ | ~~`sideEffects` package.json~~ — ✅ 완료(2026-07-02, Tier 1) | REV High | 🟢 |
| REV-B2 | TimedGrid DnD 키보드 대안 | REV High | 🟡 |
| ~~SRV-P2-12 / F1-7~~ | ~~시각 회귀 Linux baseline~~ — ✅ 완료(2026-07-02, Tier 3) | SRV·F1 | 🟢 |

### Phase C — 차별화·성장 (1.0.0 이후 또는 서브패스 분리 후)

| ID | 항목 | 출처 | 난이도 |
| -- | ---- | ---- | ------ |
| F4-6 | Timeline / Resource (`@vuepkg/calendar/timeline` 서브패스 권장) | F4 | 🔴 |
| F4-12 | awesome-vue·니치 커뮤니티 | F4 | 🟢 |
| ~~F3-7~~ | ~~StackBlitz 예약 SaaS 데모~~ — ✅ 완료(2026-07-02, Tier 3) | F3 | 🟢 |
| F4-8 | 타임존 | F4 | 🔴 (보류) |

**~~이전 1순위~~ F4-6 Timeline — Phase C로 이동 (보류 사유):** 번들 92% 포화, slot API·이벤트 모델 미정리 상태에서 Timeline 추가 시 API breaking·유지보수 비용 증가. 설계 RFC는 Phase C 착수 시 진행.

### Phase C-1 — README·홍보 고도화 (2026-07-02, 외부 의견 교차 검증)

> 외부에서 "README/홍보 전략" 의견을 받아 `.cursor/rules/vue3-oss-reviewer.mdc`(정직성·과장 금지·OSS 채택성)·`.cursor/rules/senior-product-strategy-agent.mdc`(문제 검증 우선·MVP 최소화·성장 리스크) 두 관점으로 교차 검증. 원문 전체를 **이미 되어있음 / 채택 / 거부**로 분류.

**이미 되어있어 재작업 불필요**

| 의견 항목 | 현재 상태 |
| ---- | ---- |
| Quick Start (3분 설치→렌더) | README "빠른 시작" — 이미 30초~1분 내 렌더 가능한 수준 |
| TypeScript 타입 공개 | README `## TypeScript` 섹션 기 존재 |
| Slot / Custom Render 예제 | REV-A1 slot API 4종 + README `## Slots` 예제 기 존재 |
| 문서 사이트(VitePress) | F3-1 완료, GitHub Pages 배포 중 |
| npm 신뢰 배지 일부 | version/license/bundle size 배지 기 존재 |
| keywords 기본 | `vue`/`vue3`/`calendar`/`schedule`/`scheduler` 등 기 등록 |

**채택 — Quick Wins**

| ID | 항목 | WHY | 실행 항목 |
| -- | ---- | --- | -------- |
| GR-01 | `keywords` 보강 | npm 검색 유입은 keywords 의존도가 큼. 현재 `typescript`/`drag-drop`/`event-calendar`/`planner` 등 핵심어 누락 | `packages/calendar/package.json` keywords에 `typescript`, `drag-drop`, `event-calendar`, `weekly-calendar`, `monthly-calendar`, `recurring-events` 추가. `timeline`은 F4-6 완료 전까지 **보류** — 미구현 기능 키워드 등록은 허위 유입 |
| GR-02 | Use Case 목록 섹션 | 저비용·고효과, 구매자 페르소나 명확화 + SEO. 코드 변경 없음 | README에 "적합한 사용처" 섹션 추가 — Admin Dashboard / Booking System / Company Groupware / Task Management. Hospital Scheduler·Resource Planning은 Timeline 없이는 과장이므로 **제외** |
| GR-03 | 비교표(FullCalendar/vue-cal) | 전환율에 큰 영향이라는 의견은 타당하나, 미구현 기능은 정직하게 표기해야 리뷰어 원칙(과장 금지)에 부합 | README에 비교표 추가. `Timeline/Scheduler` 행은 "🚧 계획(F4-6)"으로 명시, `Lightweight`는 정성 표현 대신 실측치(`18.4KB brotli / 20KB budget`) 병기 |
| GR-04 | headless subpath 노출 강화 | OSS 리뷰 DX 항목에서 이미 "문서에서 더 전면 배치 권장"으로 지적됨([vue3-reviewer-backlog.md](../vue3-reviewer-backlog.md) DX 절) — 이번 의견의 "Slot 강조"와 방향 일치, 신규 항목 아닌 기존 지적과 통합 | README Hero 직후 "shadcn/Tailwind 친화" 문구에 `@vuepkg/calendar/headless` 링크 추가 |

**채택 — 기존 Phase C 항목과 통합(신규 항목 아님, 우선순위만 재확인)**

| 기존 ID | 항목 | 이번 의견과의 관계 |
| -- | ---- | ---- |
| F3-7 | StackBlitz Playground | 의견의 "Playground 필수" 재확인 — 착수 순서를 GR-01~04 다음으로 승격 |
| F4-12 | Awesome Vue / VueScript / Vue Land Showcase 등록 | 의견의 "Vue Ecosystem 등록"과 동일 항목 — GR-03 비교표·F3-7 Playground 준비 후 착수(자료 없이 등록 시 전환율 낮음) |

**거부/보류 — 근거**

| 의견 항목 | 거부·보류 사유 |
| ---- | ---- |
| Hero에 "Scheduler / Timeline Ready" 문구 | **정직성 위반** — F4-6 Timeline은 Phase C 보류로 미구현. 리뷰어 원칙(과장 금지)과 정면 충돌. Timeline 배송 전까지 Hero·비교표·keywords 어디에도 "Timeline"을 완료형으로 쓰지 않는다 |
| "Large dataset support / Optimized rendering" 성능 키워드 | F4-7 Virtualization 미착수(REV-B3 Critical) 상태에서 허위 주장. 1k+ 일정 rerender cascade가 이미 OSS 리뷰에서 지적됨 — F4-7 완료 후 재검토 |
| README 다국어 분리 (README.ko.md/README.ja.md/README.zh.md) | §6.4 "단일 메인테이너 부담" 리스크와 정면 충돌. `packages/calendar/README.md`에 이미 영어 Quick Start 섹션이 내장돼 이중 관리 비용 없이 최소 요건을 충족 — 별도 파일 분리는 보류 |
| GIF 데모 6종(월간뷰·주간뷰·드래그·생성·리사이즈·반응형) | 가치는 인정하나 우선순위 낮음 — Playground(F3-7)가 "실제 동작 체험"을 더 강하게 대체 가능. Playground 완료 후 1~2개(DnD, 반복 일정)만 선별 촬영으로 축소 |
| YouTube Shorts + Twitter/Threads + Reddit + 블로그 동시 홍보 | Product Strategist 관점: 1인 메인테이너가 감당 불가한 채널 수. 현재 npm 다운로드는 크롤러 트래픽뿐(실사용자 0, [[framework-direction]] 다운로드 통계 메모) — 채널 확장 전에 **최소 1~2팀 실사용 dogfooding 검증이 선행**되어야 함(Core Mindset: 문제 검증 > 확산). `r/vuejs` 1건 + Awesome Vue 등록(F4-12)으로 축소, 반응 확인 후 확장 |
| "개발 과정 콘텐츠화" (Velog/Medium/Dev.to) | 가치는 있으나 이번 라운드 범위 밖 — Playground·비교표·Use case 정비가 선행돼야 콘텐츠 CTA가 성립 |

### Phase C-1 실행 순서 — 작업량 순 (2026-07-02)

> 남은 백로그 전체(Phase B/C·Phase C-1·[vue3-reviewer-backlog.md](../vue3-reviewer-backlog.md) Low/Medium/High)를 작업량(파일 수·리팩터링 범위) 오름차순으로 재배열. 진행 상태는 각 Tier 안에서 체크.

**Tier 1 — 즉시 처리 (파일 1곳, 텍스트/설정 한 줄 수준)**

- [x] GR-01 `keywords` 보강 — `packages/calendar/package.json`
- [x] REV-B1 `sideEffects` 선언 — `packages/calendar/package.json`
- [x] GR-04 headless subpath 링크 노출 — README
- [x] 패키지 네이밍·브랜드 혼선 정리 (GR-01과 동일 작업으로 흡수)

**Tier 2 — 문서/텍스트 작성 (로직 변경 없음)**

- [x] GR-02 Use Case 섹션 — README (Admin Dashboard / Booking / Groupware / Task Management)
- [x] GR-03 비교표(FullCalendar/vue-cal) — README, FullCalendar Premium 경계는 공식 pricing/premium 문서로 검증 후 반영
- [x] 자체 RRULE 한계 문서화 — `apps/docs/guide/recurring-events.md § 알려진 제약`(월말 롤오버 확인됨: `addMonths`가 `setMonth` 표준 동작으로 1/31+1개월→3/3, BYSETPOS 미지원, 단일 회차 예외 미지원), README 양쪽에 링크 추가. [vue3-reviewer-backlog.md](../vue3-reviewer-backlog.md) High 항목의 "엣지 케이스 문서화" 조치 완료 처리(나머지 두 조치는 미착수)
- [x] 이슈 템플릿 정비 — `.github/ISSUE_TEMPLATE/{bug_report.md,feature_request.md,config.yml}`. **GitHub Discussions 활성화는 저장소 설정(Settings → Features → Discussions)에서 별도로 켜야 함 — 파일로는 불가, 수동 조치 필요**

**Tier 3 — 명령 실행/설정형**

- [x] SRV-P2-12 / F1-7 시각 회귀 Linux baseline 재캡처 — `pnpm test:e2e:update-snapshots:linux`(Docker) 실행, 8종 전부 diff 발생(F3-5 색상 대비 토큰 상향 반영 확인, 예상대로 stale였음)
- [x] F3-7 StackBlitz Playground 최소 예제 구성 — `examples/stackblitz-demo`(pnpm workspace 제외, npm 배포본 `@vuepkg/calendar@0.6.2` 설치, 예약 시나리오). `npm install`+`npm run build`+`preview` 로컬 검증 완료. **StackBlitz 실제 부팅은 브라우저 필요해 미검증 — 링크를 직접 열어 확인 필요**

**Tier 4 — 단일 컴포넌트/모듈 단위 수정 (테스트 동반)**

- [ ] ListView loading/error UI 추가
- [ ] CalendarMonthNav 청크 비대화 — lazy import
- [ ] core/ui tree-shake 순도 검증(빌드 리포트 조사)
- [ ] F4-12 Awesome Vue 등록 (GR-03 완료 후 착수)

**Tier 5 — 리팩터링급 (여러 파일, API 표면 영향)**

- [ ] `useCalendar` 내부 API 정리 — headless export mutation API 비공개화
- [ ] REV-B2 TimedGrid DnD 키보드 대안 (Arrow+Shift)
- [ ] `ScheduleFormModal` 국제화·slot화
- [ ] 한국 공공 API 분리 (`locale-kr` 서브패스)

**Tier 6 — 아키텍처급 (별도 세션 권장)**

- [ ] F3-4 SSR/Nuxt 검증 + 모듈
- [ ] REV-B3 / F4-7 Virtualization + 1k/10k 벤치마크
- [ ] F4-6 Timeline / Resource Scheduler
- [ ] F4-8 타임존 (보류 유지)

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

### Phase 1 — 디자인 토큰 & 테마 시스템 ✅ 완료 (100%, 7/7)

**목표**: 하드코딩 색상/치수 제거 → CSS 변수 계약. light/dark 지원. 소비자 테마 오버라이드 가능.

| ID | 작업 | 난이도 | 상태 |
| -- | ---- | ------ | ---- |
| F1-1 | 토큰 스펙 설계 (primitive/semantic/component 3계층, 네이밍 `--vp-*`) | 🟡 | ✅ |
| F1-2 | `@vuepkg/theme` 생성: `base.css` + `dark.css` + `index.css` | 🟡 | ✅ |
| F1-3 | calendar 하드코딩 상수 → component 토큰 마이그레이션 | 🟡 | ✅ |
| F1-4 | calendar 컴포넌트 CSS의 리터럴 색상 → `var(--vp-*)` 치환 | 🟡 | ✅ |
| F1-5 | `prefers-color-scheme` + `.vp-dark` 클래스 토글 둘 다 지원 | 🟢 | ✅ |
| F1-6 | 테마 커스터마이징 가이드 + 토큰 레퍼런스 문서 | 🟢 | ✅ (`docs/guide/theming.md`) |
| F1-7 | Visual regression 기준선 캡처 (토큰 전환 전/후 비교) | 🟡 | ✅ **완료(재정의, 2026-07-02)** — 원래 목표였던 "토큰 전환 전/후 비교 아카이브"는 전환 시점(2026-06-29)에 별도로 남기지 않아 소급 불가. Phase B에서 SRV-P2-12와 통합돼 "Linux CI baseline을 항상 최신으로 유지"로 재정의됨 — 이번에 8종 재캡처로 충족 |

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

### Phase 3 — DX & 생태계 — 86% (6/7)

**목표**: 외부 개발자가 발견·학습·도입할 수 있게.

| ID | 작업 | 난이도 | 상태 |
| -- | ---- | ------ | ---- |
| F3-1 | VitePress 문서 사이트 (`apps/docs`) + 라이브 플레이그라운드 | 🟡 | ✅ **완료 (2026-07-01)** — `https://vuepkg.github.io/calendar/` |
| F3-2 | `vue-component-meta`로 props/emits/slots API 표 자동 생성 | 🟡 | ✅ **완료 (2026-07-02)** |
| F3-3 | i18n/locale 시스템 (`weekdayLabels` → 범용 locale) | 🟡 | ✅ **완료 (2026-07-01)** — `locale?: string` prop |
| F3-4 | SSR / Nuxt 호환 검증 + `@vuepkg/nuxt` 모듈 | 🔴 | ⏳ Phase B |
| F3-5 | 접근성 감사 — 전 컴포넌트 키보드·스크린리더 점검 (axe) | 🟡 | ✅ **완료 (2026-07-02)** — DnD 키보드 대안은 REV-B2로 분리 |
| F3-6 | 마이그레이션 가이드 | 🟢 | ✅ **완료 (2026-07-01)** |
| F3-7 | 시작 템플릿 + StackBlitz 데모 링크 | 🟢 | ✅ **완료 (2026-07-02)** — `examples/stackblitz-demo`(npm 배포본 설치, 예약 시나리오), README 양쪽 Hero에 링크 |

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
| [F3-7] StackBlitz Playground | `examples/stackblitz-demo` 신규 — pnpm workspace(`pnpm-workspace.yaml`) 대상에서 제외해 npm 배포본 `@vuepkg/calendar@0.6.2`를 실제로 설치하는 독립 프로젝트로 구성(예약/회의실 시나리오). `npm install`(0 vulnerabilities로 의존성 버전 조정) + `vue-tsc -b && vite build` + `preview` 로컬 검증 통과. README 양쪽 Hero에 StackBlitz 링크 추가. StackBlitz 자체 부팅(WebContainer)은 브라우저 필요해 미검증 | 2026-07-02 |
| [SRV-P2-12 / F1-7] 시각 회귀 Linux baseline 재캡처 | Docker(`mcr.microsoft.com/playwright:v1.61.1-jammy`) 기반 `update-visual-snapshots-linux.sh` 실행 — Git Bash(MSYS) 경로 자동변환으로 `docker run -w /work/...`가 깨지는 문제를 `MSYS_NO_PATHCONV=1`로 해결. 8종 스냅샷 전부 diff 발생(F3-5 색상 대비 토큰 상향 반영 확인, stale 예상과 일치). F1-7의 원래 목표("토큰 전환 전/후 비교 아카이브")는 전환 시점(2026-06-29)에 별도 보존하지 않아 소급 불가 — Phase B에서 재정의된 "Linux CI baseline 상시 최신화"로 충족 처리 | 2026-07-02 |
| [DOC-A1] README·introduction 문구 정합 | README.md의 "Tailwind 미지원" 문구를 실제(REV-A1 slot) 기준으로 정정, `apps/docs/guide/introduction.md`의 slot API "🚧 예정" 표기 2건을 "✅"로 정정. 부수적으로 README Props 표에서 `publicHolidayServiceKey`/`monthWeekCount` 누락, Emits 표에서 `schedule-move`/`schedule-resize`(F4-4 DnD) 누락, `## Slots` 섹션 자체가 없던 것을 발견해 함께 추가 — **Phase A 4/4 완료, 1.0.0 API 게이트 통과** | 2026-07-02 |
| [F3-2] `vue-component-meta` API 문서 자동화 | `packages/calendar/scripts/generate-api-docs.mjs`가 `ScheduleCalendar.vue`(유일한 공개 컴포넌트)에서 props/v-model/emits/slots를 추출해 `apps/docs/api/_generated/schedule-calendar-api.md` 생성, `schedule-calendar.md`가 VitePress `<!--@include:-->`로 흡수. `apps/docs`의 `build`/`dev`가 항상 재생성 후 실행. CI(`docs:api:check`)가 재생성 결과와 커밋된 파일의 `git diff`로 drift 차단. `defineEmits<ExternalInterface>()` 패턴은 vue-component-meta가 JSDoc을 못 따라가는 한계 확인 — emit 설명 10개만 스크립트 내 정적 맵 보강(payload 타입·존재 여부는 100% 자동). props/slots는 `defineProps`/`defineSlots`에 JSDoc 보강 후 완전 자동 추출 | 2026-07-02 |
| [REV-A2] `Schedule` 이벤트 모델 일반화 | `participantId`/`participantName` optional화 + `meta?: Record<string, unknown>` 추가. `filterSchedulesByScope`는 참가자 없는 일정을 "my" scope에서 안전하게 제외, `ScheduleEventChip`/`AllDayBar`의 `:title`이 `"(undefined)"`를 출력하던 잠재 버그를 함께 수정. `ScheduleDraft`/`ScheduleFormModal`(내장 CRUD 폼)은 참가자 필수 유지 — 별도 Medium 항목(폼 i18n·도메인 결합)으로 분리. Vitest 6건 추가(299→305), 기능 E2E 95건 무변경 통과, size-limit 18.94/20KB(95%) | 2026-07-02 |
| [REV-A1] scoped slot API | `toolbar`/`day-cell`/`event`/`month-overflow-item` 4개 slot. `ScheduleCalendar`가 유일한 공개 API 표면이라 `defineSlots`로 타입 노출, 나머지는 동적/명시적 forwarding으로 최대 4단계(`ScheduleCalendar→WeekView→TimedGrid→TimedGridDayColumn`) 전달. 클릭/DnD/키보드 인터랙션 래퍼는 항상 라이브러리가 소유하고 슬롯은 안쪽 표현 콘텐츠만 교체 — 미사용 시 기존 마크업과 100% 동일. Vitest 9건 추가(290→299), 기능 E2E 95건 무변경 통과, size-limit 18.4→18.9/20KB(92%→94%) | 2026-07-02 |
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
| 2026-07-02 | **Phase C-1 신설** — 외부 README/홍보 전략 의견을 리뷰어·전략 에이전트 관점으로 교차 검증, GR-01~04 Quick Win 채택 + Timeline 조기 홍보·다국어 README·다채널 동시 홍보 거부 |
| 2026-07-02 | **Tier 1~3 실행 완료** — keywords·sideEffects·headless 노출(GR-01/04/REV-B1), Use Case·비교표·RRULE 한계 문서화·이슈 템플릿(GR-02/03), 시각 회귀 Linux baseline 재캡처(SRV-P2-12/F1-7)·StackBlitz Playground(F3-7). Phase 1 100%, Phase 3 86%, SRV 100% 달성, 전체 로드맵 85%→90% |

---

## 8. 참고 문서

- [architecture.md](./architecture.md) — 패키지 구조·컴포넌트 API·테스트 상세 (개발 시작 시 함께 읽기)
- [staff-review-backlog.md](./staff-review-backlog.md) — 코드 결함 추적 원장 (SRV-*)
- [vue3-reviewer-backlog.md](../vue3-reviewer-backlog.md) — OSS·채택성 리뷰 원장 (REV-*)
- [npm-publish-guide.md](./npm-publish-guide.md) — 배포 전 체크리스트
- [CHANGELOG.md](../../CHANGELOG.md) — npm 릴리즈 변경 이력 (Changesets 관리)
