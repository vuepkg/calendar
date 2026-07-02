# Vue3 Calendar Library Review Backlog

> **리뷰 일자:** 2026-07-02 · **갱신:** 2026-07-02 (로드맵 달성률·Phase A/B/C 흡수)  
> **리뷰어:** vue3-oss-reviewer (심층 코드·아키텍처·OSS 채택성 점검)  
> **대상:** `@vuepkg/calendar@0.4.0` 모노레포 전체  
> **기준:** `.cursor/rules/vue3-oss-reviewer.mdc`, `docs/dev/staff-review-backlog.md` (리뷰 #2 이후 delta)

---

## 다음 로드맵 개선 세션 — 문서 점검 체크리스트

> **2026-07-02 갱신 완료** — [roadmap.md](./dev/roadmap.md)에 달성률·Phase A/B/C 반영됨.
> **2026-07-02 문서 통합** — `roadmap-progress.md`·`framework-roadmap.md`가 `roadmap.md`로 병합되어 삭제됨. 아래 표·이하 링크를 `roadmap.md` 기준으로 갱신.

| 문서 | 역할 | 상태 |
| ---- | ---- | ---- |
| `docs/dev/roadmap.md` | **정본** — 전략·Phase 정의·달성률·백로그 | ✅ 통합 (2026-07-02) |
| `docs/vue3-reviewer-backlog.md` | OSS 리뷰 원장 | ✅ 본 문서 |
| `docs/dev/staff-review-backlog.md` | 코드 결함 원장 | ⏳ REV-A* 로드맵 흡수 후 중복 정리 |
| `apps/docs/guide/theming.md` | 소비자 정본 | ✅ Tailwind § |
| `docs/guide/theming.md` | 내부 테마 | ✅ 요약 동기화 |
| `README.md` | npm 첫인상 | ✅ 테마 링크 (2026-07-02) |
| `apps/docs/guide/introduction.md` | 포지셔닝 | ✅ 스타일·로드맵 링크 (2026-07-02) |

**로드맵 Phase A/B/C (확정):** [roadmap.md § Phase A/B/C — 다음 개발 방향](./dev/roadmap.md#2-phase-abc--다음-개발-방향-2026-07-02-확정)

---

## Critical

> **로드맵 ID:** REV-A1·REV-A2(Phase A) · REV-B2·REV-B3(Phase B, severity는 Critical) → [roadmap.md Phase A/B](./dev/roadmap.md#2-phase-abc--다음-개발-방향-2026-07-02-확정)

- [ ] **REV-A1 / `ScheduleCalendar` slot API 부재**
  - `packages/calendar/src/components/calendar/**` 전체에 `<slot>`이 0건. 이벤트 칩·툴바·셀·All Day 바·List 행 렌더링을 소비자가 교체할 수 없음.
  - shadcn-vue / Radix 철학(표현 분리)과 정면 충돌. CSS 변수만으로는 브랜드·도메인 UI 요구를 충족하기 어려움.
  - **조치:** 최소 `event`, `day-cell`, `toolbar`, `month-overflow-item` scoped slot + slot props(`schedule`, `date`, `getTypeStyle`) 설계. 1.0.0 전 breaking 없이 optional slot으로 도입.

- [ ] **REV-A2 / `Schedule` 도메인 모델 HR 과결합**
  - `participantId`·`participantName` 필수, `ViewScope: 'my' | 'company'`, List 컬럼이 Participant 고정.
  - 범용 이벤트 캘린더(회의실·의료·교육·예약 SaaS) 채택 시 매핑 레이어가 필수 → DX 저하.
  - **조치:** `Schedule`을 제네릭 `CalendarEvent<TMeta>`로 점진 전환하거나, `participant*`를 optional + `meta?: Record<string, unknown>` 추가. `viewScope`/`scheduleTypes` 필터를 composable로 분리해 컴포넌트 prop에서 제거 검토.

- [ ] **REV-B3 / 대량 일정·반복 전개 성능 (F4-7)**
  - `useCalendar`의 `schedules` computed가 뷰 전환·월 이동마다 `expandRecurringSchedules` 전체 실행.
  - `monthCells` computed가 42셀 × `getSchedulesForDay` O(n) — 일정 1k+ 시 월 네비게이션마다 rerender cascade.
  - F4-7 미착수. 엔터프라이즈 스케줄러 시나리오에서 채택 차단 요인.
  - **조치:** visible range 기반 인덱스(Map by dateKey), 반복 전개 memoization, List/Month virtualization POC + 벤치마크(1k/10k events) CI 게이트.

- [ ] **REV-B2 / SSR · Nuxt (F3-4)**
  - `publicHolidaysApi.ts`의 `window.location`, Popover/Dialog `Teleport`, `onMounted` 기반 `query-change` init.
  - Nuxt 3 사용자(상당수 Vue 엔터프라이즈) 채택 전 검증 필수. F3-4 미착수.
  - **조치:** `import.meta.client` 가드, `useId` 안정화, Nuxt minimal reproduction + hydration 테스트, `@vuepkg/nuxt` 스텁 모듈.

---

## High Priority

- [ ] **자체 RRULE 서브셋 유지보수 리스크**
  - `recurrence.ts`가 monthly 31일→28일, DST, 윤년, BYSETPOS 등 미지원.
  - iCal 호환 기대 사용자에게 breaking surprise. 장기적으로 `rrule` peer optional 또는 어댑터 레이어 필요.
  - **조치:** 엣지 케이스 문서화(한계 명시), 단일 회차 예외(exceptions) API 안정화, 1.x에서 RRULE import 옵션 RFC.

- [ ] **번들 budget 92% 포화 — F4-6(Timeline) 착수 전 아키텍처 분리 필요**
  - 현재 `index.js` 18.4KB / 20KB limit (brotli). headless 7.33KB / 9KB.
  - Timeline/Resource 뷰는 동적 import 없이는 budget 초과 확실.
  - **조치:** 뷰별 lazy chunk 강화, Timeline을 `@vuepkg/calendar/timeline` 서브패스로 분리, 또는 F4-6 전용 budget tier.

- [ ] **`package.json`에 `sideEffects: false` 미선언**
  - tree-shaking 힌트 부재. Vite/Rollup은 대체로 동작하나 webpack 소비자에서 CSS side-effect 처리 불명확.
  - **조치:** `"sideEffects": ["*.css", "**/*.css"]` 또는 `false` + style import 문서 강화.

- [ ] **문서 drift — `vue-component-meta` 미도입 (F3-2)**
  - README·VitePress API 표가 수동 유지. prop/emit 추가 시 문서 불일치 이력 있음(타입 경로 버그 등).
  - **조치:** CI에서 props/emits diff 검증 또는 VitePress에 자동 생성 파이프라인.

- [ ] **접근성: TimedGrid DnD·드래그 슬롯 선택의 키보드 대안 없음**
  - axe CI는 정적 위반만 검출. pointer-only DnD는 WCAG 2.2 operable 요구와 충돌.
  - **조치:** 이벤트 선택 후 Arrow+Shift로 이동/리사이즈, 또는 대화형 모드 문서화 + `aria-grabbed` 패턴.

- [ ] **한국 공공 API 결합이 글로벌 포지셔닝과 충돌**
  - `fetchPublicHolidays`·`publicHolidaysApi`가 패키지 코어에 포함. 번들·문서·예제가 KR 중심.
  - **조치:** holidays를 순수 prop/composable로만 제공, KR API는 `@vuepkg/calendar/locale-kr` 또는 문서 레시피로 분리.

---

## Medium Priority

- [ ] **`useCalendar` context에 내부 전용 API 잔존**
  - `setView`/`selectDate`/`moveMonth` 등이 여전히 반환됨 (`@internal` JSDoc만).
  - headless 소비자가 emit-only 패턴을 우회할 수 있어 상태 이중화 위험.
  - **조치:** headless export에서 navigation helper만 공개, mutation API는 private module로 이동.

- [ ] **`ScheduleFormModal` 국제화·도메인 결합**
  - 폼 라벨·검증 메시지 한국어 하드코딩. Participant 선택 UI 내장.
  - **조치:** i18n 키 또는 slot 기반 폼 필드. 모달은 headless `buildScheduleFromDraft` + 소비자 UI 권장 패턴 문서화.

- [ ] **core/ui가 calendar에 소스 번들 — 외부 tree-shake 한계**
  - 소비자는 `@vuepkg/calendar`만 설치하지만 내부 ui 7종 전체가 인라인됨.
  - headless만 쓰는 경우에도 shared chunk에 UI 로직 일부 잔존 가능.
  - **조치:** 빌드 리포트로 headless 청크 순도 주기적 검증.

- [ ] **시각 회귀 스냅샷 미갱신 (SRV-P2-12)**
  - F3-5 토큰 변경 후 Linux baseline 8종 stale.
  - **조치:** `test:e2e:update-snapshots:linux` 실행 + Visual Regression workflow.

- [ ] **패키지 네이밍·브랜드 혼선**
  - repo `vue3-calendar`, npm `@vuepkg/calendar`, org `vuepkg` — 검색·SEO 분산.
  - **조치:** keywords·npm scope 일관성, awesome-vue 등록 시 동의어 정리.

- [ ] **Playground / StackBlitz 미구축 (F3-7)**
  - 문서 사이트는 있으나 즉시 fork 가능한 데모 부재. 전환율 저하.
  - **조치:** Vite + `@vuepkg/calendar` 최소 StackBlitz, 예약 SaaS 시나리오.

- [x] **DOC-01 / Tailwind 연동 가이드** — `apps/docs/guide/theming.md` § Tailwind (2026-07-02). 로드맵: [roadmap.md](./dev/roadmap.md)

---

## Low Priority

- [ ] **`CalendarMonthNav` 청크 비대화 (14.44KB cjs gzip 3.95KB)**
  - IconButton/DataTable 의존이 청크에 묶임. lazy 경로 최적화 여지.
- [ ] **Node 24 engines 제약**
  - CI는 Node 24. 소비자·기여자 진입장벽. LTS 22 병행 검토.
- [ ] **`ListView` defineAsyncComponent — loading/error UI 없음**
  - 느린 네트워크에서 List 탭 전환 시 빈 화면.
- [ ] **이슈 템플릿·GitHub Discussions 미정비**
  - CONTRIBUTING은 우수하나 OSS 온보딩 마지막 퍼즐.

---

# Architecture Notes

## Vue Reactivity

- `useCalendar`의 `reactive` state + getter/setter 패턴은 v-model 연동에 적합하나, `monthCells`·`listRows`가 `schedules`(반복 전개 포함)에 강결합 — 뷰 전환 시 불필요한 전체 재계산.
- `watch([viewScope, scheduleTypes])`가 `emitQueryChange`만 호출하고 로컬 필터링은 부모 책임 — 설계 일관적이나, 필터를 library 내부에서 할지 문서에 명시 필요.
- `defineAsyncComponent(ListView)`는 초기 번들 절감에 유효. 다른 뷰는 eager — Timeline 추가 시 동일 패턴 필수.

## TypeScript

- 공개 타입 `types/` 단일 출처 원칙 준수. `headless.ts` export 목록이 명확.
- `Schedule` 확장성 부족이 가장 큰 타입 설계 부채. 제네릭 이벤트 모델 없음.
- dts alias 이슈(SRV-P1-02) 해결됨 — 유지 회귀 테스트 권장.

## Accessibility

- 월간 grid roving tabindex(SRV-P2-09), SegmentedControl 키보드, Popover/Dialog focus trap — primitive 수준 우수.
- 캘린더 도메인: TimedGrid pointer DnD, Week/Day 시간 선택 drag — 키보드 대체 없음.
- axe 5케이스 CI — "자동 검증" 주장은 과장에 가깝고, 상호작용 a11y는 수동+E2E 보강 필요.

## Performance

- Virtualization 0. 반복 `MAX_OCCURRENCES_PER_SCHEDULE = 366*3` 안전장치는 있으나 대량 마스터 일정에서 CPU 스파이크.
- `getSchedulesForDay` 선형 탐색 — dateKey 인덱스 없음.
- 번들: zero-dep 대비 FullCalendar 압도적 우위 유지. 기능 추가 시 lazy subpath가 생존 조건.

## DX

- `useScheduleCalendarHost` + `v-on="calendarListeners"` 패턴은 학습 곡선 있으나 DEV warn으로 완화.
- emit-only는 서버 상태·TanStack Query와 궁합 좋음.
- slot 부재·Schedule 스키마 결합이 "5분 안에 커스텀 UI" 스토리를 깸.
- headless subpath(SRV-P2-11)는 shadcn 친화 포지셔닝의 핵심 자산 — 문서에서 더 전면 배치 권장.

## Tailwind / 스타일 커스터마이징

- **설계:** CSS 변수(`--vp-*`) + scoped SFC 스타일. 라이브러리 내부에 Tailwind 없음.
- **루트 class fallthrough:** `ScheduleCalendar` 단일 루트 → Vue 기본 `inheritAttrs`로 외부 `class` 합쳐짐. 단 scoped `.schedule-calendar`와 **동일 속성 충돌** (border-radius, border, background 등).
- **내부 요소:** slot 0건 → Tailwind utility를 prop으로 넘길 경로 없음. `scheduleTypeOptions`는 **인라인 color/backgroundColor**.
- **Tailwind 프로젝트 정석:** `@theme` 또는 팔레트 hex → `:root { --vp-* }` 매핑. 문서화됨 (`apps/docs/guide/theming.md`).
- **완전 Tailwind UI:** `@vuepkg/calendar/headless` + 소비자 마크업.
- **로드맵 정합:** `roadmap.md` §1.1 "Tailwind/shadcn 친화적"은 **목표 상태** — slot API 완료 전까지는 "CSS 변수 친화 + headless"로 문구 조정 권장.

---

# OSS Readiness Score (2026-07-02)

| 항목 | 점수 | 근거 |
| ---- | ---: | ---- |
| Architecture | **7.5/10** | 모노레포·emit-only·headless 우수. slot/이벤트 모델 일반화 부족. |
| DX | **6.5/10** | 호스트 composable 좋음. 커스터마이징·스키마 유연성 약함. |
| Maintainability | **8/10** | 테스트·CI·changeset·백로그 문화 강함. 단일 메인테이너 리스크. |
| Scalability | **5/10** | virtualization·timezone·인덱싱 없음. |
| Accessibility | **6.5/10** | primitive·월간 grid 양호. DnD·drag a11y 미흡. |
| Documentation | **7.5/10** | VitePress·아키텍처 문서 훌륭. API 자동화·라이브 데모 부족. |
| Production Readiness | **7/10** | 0.4.x 실서비스 가능(중소 규모). 엔터프라이즈·글로벌은 미완. |

**종합: 7.0 / 10** — "잘 만든 내부 컴포넌트의 npm 승격"을 넘어섰으나, "시니어 Vue 개발자가 무조건 신뢰하는 범용 OSS"까지는 아직 아님.

---

# Final Verdict

| 질문 | 답 |
| ---- | -- |
| 실제 publishable한가? | **예** — 0.4.0, CI·테스트·문서·자동 릴리즈 갖춤. |
| 시니어 Vue 개발자가 신뢰하는가? | **조건부** — 아키텍처 문서·테스트 깊이는 신뢰 요소. slot·스키마·SSR 공백이 의심 요인. |
| 채택을 막는 것은? | 커스터마이징(slot), Schedule 도메인 결합, 대량 데이터·타임존, Nuxt 미검증. |
| Vue-native한가? | **대체로 예** — defineModel, composable, emit-only는 모범에 가깝다. |
| 위험한 장기 결정은? | (1) slot 없이 기능만 추가 (2) 자체 recurrence 영구 유지 (3) 번들 한도 내 Timeline 억지 통합 (4) ui 범용화 재유혹. |
| 내부 컴포넌트 추출형인가, 진짜 OSS인가? | **전환기** — headless·로드맵·테스트는 OSS 의지. API 일반화가 뒤처짐. |
