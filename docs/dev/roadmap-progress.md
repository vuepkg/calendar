# Roadmap Progress — `@vuepkg/calendar`

> **측정 기준일:** 2026-07-02 · **패키지 버전:** `@vuepkg/calendar@0.4.0`  
> **정본 로드맵:** [framework-roadmap.md](./framework-roadmap.md) · **운영 백로그:** [roadmap.md](./roadmap.md)  
> **갱신 규칙:** Phase 항목 완료·추가 시 본 문서의 분모·분자를 함께 수정한다.

---

## 종합 달성률

| 범주 | 완료 | 전체 | 달성률 | 비고 |
| ---- | ---: | ---: | -----: | ---- |
| **Phase 0** Monorepo & Core | 7 | 7 | **100%** | F0-1~F0-7 |
| **Phase 1** 테마 & 토큰 | 6 | 7 | **86%** | F1-7 시각 회귀 baseline 미착수 |
| **Phase 2** `@vuepkg/ui` | 7 | 7 | **100%** | F2-6 취소 제외, F2-7은 F4-3에서 완료 |
| **Phase 3** DX & 생태계 | 4 | 7 | **57%** | F3-2·F3-4·F3-7 잔여 |
| **Phase 4** 도메인 고도화 | 8 | 12 | **67%** | F4-8 보류 포함; 활성만 보면 8/11 = **73%** |
| **Staff Review (SRV)** | 19 | 20 | **95%** | SRV-P2-12만 미착수 |
| **OSS Review (REV)** | 1 | 18 | **6%** | 문서 1건 완료, 구현 17건 잔여 |
| **1.0.0 게이트 (Phase A)** | 0 | 4 | **0%** | slot·이벤트 모델·문서 정합·소비자 DX |

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

---

## Phase별 상세

### Phase 0 — 100% (7/7)

| ID | 상태 |
| -- | ---- |
| F0-1 ~ F0-7 | ✅ 전부 완료 |

### Phase 1 — 86% (6/7)

| ID | 상태 |
| -- | ---- |
| F1-1 ~ F1-6 | ✅ |
| F1-7 Visual regression baseline | ⏳ 미착수 (= SRV-P2-12와 연계) |

### Phase 2 — 100% (7/7, F2-6 제외)

| ID | 상태 |
| -- | ---- |
| F2-1 ~ F2-5, F2-7, F2-8 | ✅ |
| F2-6 Select | 🚫 취소 |

### Phase 3 — 57% (4/7)

| ID | 작업 | 상태 |
| -- | ---- | ---- |
| F3-1 | VitePress + GitHub Pages | ✅ |
| F3-2 | `vue-component-meta` API 자동화 | ⏳ |
| F3-3 | `locale` i18n | ✅ |
| F3-4 | Nuxt / SSR | ⏳ |
| F3-5 | axe 접근성 감사 | ✅ |
| F3-6 | 마이그레이션 가이드 | ✅ |
| F3-7 | StackBlitz / starter | ⏳ |

### Phase 4 — 67% (8/12)

| ID | 작업 | 상태 |
| -- | ---- | ---- |
| F4-1 ~ F4-5 | 슬롯 선택·월간 변형·CRUD·DnD·반복 | ✅ |
| F4-6 | Timeline / Resource Scheduler | ⏳ |
| F4-7 | Virtualization | ⏳ |
| F4-8 | 타임존 | 🔶 보류 (F4-7 이후 재검토) |
| F4-9 ~ F4-11 | size-limit·CONTRIBUTING·자동 릴리즈 | ✅ |
| F4-12 | 커뮤니티 노출 | ⏳ |

---

## 백로그·리뷰 통합 달성률

### Staff Review — 95% (19/20)

| 구간 | 완료 | 전체 | 달성률 |
| ---- | ---: | ---: | -----: |
| P0 | 2 | 2 | 100% |
| P1 | 5 | 5 | 100% |
| P2 | 12 | 13 | 92% |
| NIT | 1 | 1 | 100% |

**미완:** [SRV-P2-12](./staff-review-backlog.md#srv-p2-12-visual-regression-스냅샷-재생성-필요) — Linux 시각 회귀 스냅샷 8종

### OSS Review (`vue3-reviewer-backlog`) — 문서 6% / 구현 0%

| 구간 | 완료 | 전체 | 달성률 |
| ---- | ---: | ---: | -----: |
| Critical (구현) | 0 | 4 | 0% |
| High (구현) | 0 | 6 | 0% |
| Medium | 0 | 6 | 0% |
| Low | 0 | 4 | 0% |
| 문서·가이드 | 1 | 1 | 100% (Tailwind §) |

> REV 항목은 로드맵 **Phase A/B**로 흡수됨 — 아래 "앞으로의 개발 방향" 참고.

### 기능 IMP 백로그 — 100% (활성 항목)

| ID | 상태 |
| -- | ---- |
| IMP-02 ~ IMP-06 | ✅ |
| IMP-07 타임존 | 🚫 제외 (ROI) |
| IMP-08 PrimeVue 제거 | ✅ (완료 항목 표 참고) |

### 테스트 GAP — 100% (3/3)

GAP-01, GAP-TS-01, GAP-REF-01 전부 완료.

---

## 품질·운영 지표 (코드베이스 실측, 2026-07-02)

| 지표 | 값 |
| ---- | -- |
| Vitest | **440** (calendar 290 + ui 76 + core 74) |
| Playwright E2E (CI) | **142** |
| Playwright 시각 회귀 | 8 (수동 workflow) |
| 번들 `index.js` (brotli) | **18.4 KB / 20 KB** (92%) |
| npm 버전 | **0.4.0** |
| 문서 사이트 | https://vuepkg.github.io/calendar/ |

---

## 앞으로의 개발 방향 (2026-07-02 확정)

> OSS 리뷰([vue3-reviewer-backlog.md](../vue3-reviewer-backlog.md))·제품 전략 관점 통합. **F4-6 Timeline 즉시 착수는 보류.**

### Phase A — 1.0.0 API 게이트 (최우선)

| ID | 항목 | 출처 | 난이도 |
| -- | ---- | ---- | ------ |
| REV-A1 | scoped **slot API** (`event`, `day-cell`, `toolbar`, `month-overflow-item`) | REV Critical | 🔴 |
| REV-A2 | **`Schedule` 이벤트 모델 일반화** (`participant*` optional, `meta`) | REV Critical | 🟡 |
| F3-2 | `vue-component-meta` 문서 자동화 | F3 | 🟡 |
| DOC-A1 | README·introduction Tailwind/headless 한 줄 정합 | REV Medium | 🟢 |

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

### 의도적으로 뒤로 미룸

- 범용 `@vuepkg/ui` 확장 (F2-6 방향 폐기 유지)
- IMP-07 단일 타임존 (국내 ROI 낮음 — 글로벌 시 F4-8로 재개)

---

## 문서 맵 (개발 시작 시 읽는 순서)

1. **본 문서** — 달성률·다음 착수 순서
2. [framework-roadmap.md](./framework-roadmap.md) — Phase 정의·아키텍처·KPI
3. [roadmap.md](./roadmap.md) — 완료 이력·IMP·운영 항목
4. [staff-review-backlog.md](./staff-review-backlog.md) — 코드 결함 SRV-*
5. [vue3-reviewer-backlog.md](../vue3-reviewer-backlog.md) — OSS·채택성 REV-*
6. [architecture.md](./architecture.md) — 구현 상세

---

## 갱신 이력

| 일자 | 변경 |
| ---- | ---- |
| 2026-07-02 | 최초 작성 — Phase 0~4·SRV·REV 달성률, Phase A/B/C 방향 확정 |
