# Vue3 Calendar Library Review Backlog

> **리뷰 일자:** 2026-07-02 · **갱신:** 2026-07-02 (로드맵 달성률·Phase A/B/C 흡수)  
> **리뷰어:** vue3-oss-reviewer (심층 코드·아키텍처·OSS 채택성 점검)  
> **대상:** `@vuepkg/calendar@0.4.0` 모노레포 전체  
> **기준:** `.cursor/rules/vue3-oss-reviewer.mdc`, `docs/dev/staff-review-backlog.md` (리뷰 #2 이후 delta)
>
> **🎉 2026-07-02: Phase A(1.0.0 API 게이트) 4/4 완료** — REV-A1(slot API)·REV-A2(Schedule 모델 일반화)·F3-2(API 문서 자동화)·DOC-A1(문서 정합) 전부 완료. 아래 Critical 2건·Medium 1건은 완료 표기로 갱신됨. Architecture/DX 점수(§ OSS Readiness Score)는 이 갱신 시점 기준 재평가 전이므로 참고용으로만 보세요 — 실제로는 slot·Schedule 모델 공백이 해소되어 더 높아야 합니다.

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

- [x] **REV-A1 / `ScheduleCalendar` slot API 부재** — ✅ **완료 (2026-07-02)**
  - `toolbar`/`day-cell`/`event`/`month-overflow-item` scoped slot 4종 구현. `event`는 month-chip/month-all-day-bar/week·day-all-day-bar/week·day-timed 6개 컨텍스트 공용, `source`는 기존 `ScheduleClickSource` 재사용.
  - List 행(`list-row`)은 v1 범위 밖 — `DataTable`의 `cell-*` slot 재노출로 별도 처리 예정.
  - non-breaking(미사용 시 기존 마크업 100% 동일), `src/types/slots.ts` 타입 4종 + `ScheduleCalendar`에 `defineSlots`. 상세: [RFC](./dev/rfc/REV-A1-slot-api.md), [architecture.md § Scoped Slots](./dev/architecture.md#scoped-slots-rev-a1-2026-07-02).

- [x] **REV-A2 / `Schedule` 도메인 모델 HR 과결합** — ✅ **완료 (2026-07-02)**
  - `participantId`/`participantName`을 optional로 전환, `meta?: Record<string, unknown>` 추가 — 제네릭 `CalendarEvent<TMeta>` 전환 대신 채택(대안이었던 안, 마이그레이션 비용이 더 낮음).
  - `filterSchedulesByScope`가 참가자 없는 일정을 "my" scope에서 안전하게 제외(에러 없음). 칩·바 `:title`이 참가자 부재 시 `"(undefined)"`를 출력하던 버그도 함께 수정.
  - **범위 밖(유지):** `ScheduleDraft`/`ScheduleFormModal`(내장 CRUD 폼)은 참가자 선택 필수 그대로 — Medium 우선순위 "ScheduleFormModal 국제화·도메인 결합" 항목에서 별도 처리. `viewScope`/`scheduleTypes` 필터의 composable 분리도 이번엔 미착수(범위 밖).

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
  - **조치:** ~~엣지 케이스 문서화(한계 명시)~~ ✅ 완료(2026-07-02, [recurring-events.md § 알려진 제약](../apps/docs/guide/recurring-events.md)), 단일 회차 예외(exceptions) API 안정화, 1.x에서 RRULE import 옵션 RFC — 나머지 두 조치 미착수.

- [x] **번들 budget 92% 포화 — 측정 결함 발견·수정 (2026-07-02), F4-6 서브패스 분리는 원칙으로 확정**
  - **측정 결함 발견**: `size-limit`의 `index.js (ESM)` glob이 `dist/index.js`·`dist/headless-*.js`만 포함하고, Month 뷰 기본값이라 사실상 항상 eager 로드되는 `dist/CalendarMonthNav-*.js` 공유 청크는 처음부터 측정에서 빠져 있었음. 지금까지 기록된 18.4~19.09KB(92~95%)는 전부 과소 측정치.
  - **조치 완료**: glob에 `CalendarMonthNav-*.js`/`.cjs` 추가해 측정 보정 → 실측 22.38KB/20.39KB 확인. `@vuepkg/ui`에서 DataTable만 정밀 분리(barrel에서 제거, `@vuepkg/ui/DataTable` subpath 신설)해 List 뷰 전용 코드를 진짜 lazy 청크로 이동. budget을 실측치에 맞춰 20→24KB(index.js)·19→22KB(index.cjs)로 현실화.
  - **원칙 확정**: Timeline(F4-6) 등 향후 대형 기능은 코어 budget을 더 올리는 대신 `@vuepkg/calendar/<feature>` 서브패스 + 자체 size-limit 항목으로 분리(`headless`가 선례) — [roadmap.md §6.4](./dev/roadmap.md#64-리스크--완화) 참고.

- [x] **`package.json`에 `sideEffects: false` 미선언** — ✅ 완료 (calendar: 2026-07-02 Tier 1 / ui·core: 2026-07-02)
  - `packages/calendar/package.json`에 `"sideEffects": ["*.css"]`, `packages/ui/package.json`에 동일, `packages/core/package.json`(CSS 없음)에 `"sideEffects": false` 선언.

- [x] **문서 drift — `vue-component-meta` 미도입 (F3-2)** — ✅ **완료 (2026-07-02)**
  - `packages/calendar/scripts/generate-api-docs.mjs`가 `ScheduleCalendar.vue`에서 props/v-model/emits/slots를 추출해 `apps/docs/api/_generated/schedule-calendar-api.md`로 생성, `apps/docs/api/schedule-calendar.md`가 VitePress `@include`로 끌어옴. `apps/docs` `build`/`dev` 스크립트가 항상 재생성 후 빌드.
  - CI(`ci.yml`)에 `docs:api:check`(재생성 후 `git diff --exit-code`) 게이트 추가 — prop/emit/slot 변경 후 재생성을 깜빡하면 CI가 막음.
  - **알려진 한계:** `defineEmits<ScheduleCalendarEmits>()`처럼 외부 인터페이스로 선언된 emit은 vue-component-meta가 JSDoc을 못 따라감(inline literal인 props/slots는 정상 추출) — emit 설명 10개는 스크립트 내 정적 맵으로 보강, payload 타입·존재 여부는 100% 자동 추출이라 drift 위험 없음.

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

- [x] **시각 회귀 스냅샷 미갱신 (SRV-P2-12)** — ✅ **완료 (2026-07-02)**
  - F3-5 토큰 변경 후 Linux baseline 8종 stale였던 것을 `test:e2e:update-snapshots:linux`(Docker) 실행으로 확인·재생성. 8종 전부 diff 발생 — 예상대로였음.

- [ ] **패키지 네이밍·브랜드 혼선**
  - repo `vue3-calendar`, npm `@vuepkg/calendar`, org `vuepkg` — 검색·SEO 분산.
  - **조치:** keywords·npm scope 일관성, awesome-vue 등록 시 동의어 정리.

- [x] **Playground / StackBlitz 미구축 (F3-7)** — ✅ **완료 (2026-07-02)**
  - `examples/stackblitz-demo` — pnpm workspace 제외, npm 배포본 설치, 예약 시나리오. 로컬 install/build/preview 검증 통과, README 양쪽에 링크. StackBlitz WebContainer 실제 부팅은 브라우저 필요해 미검증.

- [x] **DOC-01 / Tailwind 연동 가이드** — `apps/docs/guide/theming.md` § Tailwind (2026-07-02). 로드맵: [roadmap.md](./dev/roadmap.md)

---

## Low Priority

- [x] **`CalendarMonthNav` 청크 비대화** — ✅ **부분 해결 (2026-07-02)**, 상세는 High Priority "번들 budget" 항목 참고
  - 근본 원인(재확인): `@vuepkg/ui`가 단일 파일(`index.esm.js`)로 빌드돼 eager(CalendarMonthNav)·lazy(ListView) 양쪽에서 참조되는 순간 7개 primitive 전체가 하나의 공유 청크로 묶임.
  - 1차 시도(7종 전부 분리)는 `index.js` brotli 19.09KB→20.51KB로 늘어 size-limit 초과 → 롤백.
  - 2차 시도(DataTable만 정밀 분리, barrel에서 완전 제거) — **성공**: `CalendarMonthNav` 청크 15.23KB→12.70KB, `index.js` 무변화. 나머지 6종(Popover/SegmentedControl/Chip/Button/Dialog/IconButton)은 대부분 eager 전용이라 분리 이득이 없어 그대로 barrel에 유지 — 의도적 결정.
  - 제네릭 SFC(`generic="T"`)를 lib entry로 직접 쓰면 `vite-plugin-dts`가 `.d.ts`를 못 만드는 것도 함께 확인 — `.ts` re-export wrapper로 우회.
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
- **내부 요소:** `toolbar`/`day-cell`/`event`/`month-overflow-item` scoped slot(REV-A1, 2026-07-02)로 Tailwind 마크업 직접 렌더 가능. List 행만 잔여. `scheduleTypeOptions`는 여전히 **인라인 color/backgroundColor**.
- **Tailwind 프로젝트 정석:** `@theme` 또는 팔레트 hex → `:root { --vp-* }` 매핑, 또는 slot으로 마크업 자체를 Tailwind로 재작성. 문서화됨 (`apps/docs/guide/theming.md`).
- **완전 Tailwind UI:** `@vuepkg/calendar/headless` + 소비자 마크업.
- **로드맵 정합:** `roadmap.md` §1.1 "Tailwind/shadcn 친화적" — REV-A1 완료로 slot 경로 확보됨. List 행 slot화 전까지는 "CSS 변수 + slot(List 제외) + headless"로 정확.

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
