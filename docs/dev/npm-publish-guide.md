# npm 배포 가이드 — @vuepkg/calendar

> 작성일: 2026-06-16 · 최종 갱신: 2026-06-30 (CI E2E 분리·Node 24·Husky 반영)  
> 현재 상태: **배포 준비 완료** — 아래 남은 항목 확인 후 배포 가능

---

## 현재 상태 요약

| 항목 | 현재 | 상태 |
| ---- | ---- | ---- |
| `"private"` 플래그 | `false` | ✅ |
| 버전 | `0.0.4` | ✅ |
| 빌드 모드 | `vite.lib.config.ts` 라이브러리 빌드 | ✅ |
| `peerDependencies` | `vue: ^3.5.0`만 | ✅ PrimeVue 불필요 |
| `exports` 필드 | ESM/CJS + 타입 맵 완성 | ✅ |
| `files` 필드 | `["dist"]` | ✅ |
| TypeScript 타입 선언 | `vite-plugin-dts` d.ts 생성 | ✅ |
| CSS 추출 | `dist/style.css` | ✅ |
| LICENSE 파일 | MIT (추가 완료) | ✅ |
| `fetchPublicHolidays` 기본값 | `false` (opt-in) | ✅ |
| README 영문화 | 한국어 전용 | ⚠️ npm 공개 배포 시 권장 |
| 모노레포 구조 | pnpm workspace + Turborepo | ✅ Phase 0 완료 |
| 버전 관리 | Changesets | ✅ `.changeset/config.json` |

---

## 완료된 항목

### 모노레포 구조 (Phase 0)

```
vue3-calendar/             ← 모노레포 루트 (private)
├── packages/
│   ├── calendar/          ← @vuepkg/calendar@0.0.4  (배포 대상)
│   └── core/              ← @vuepkg/core@0.0.1 (calendar에 번들됨)
├── turbo.json
└── pnpm-workspace.yaml
```

`@vuepkg/core`는 `@vuepkg/calendar`의 `vite.lib.config.ts`에서 **external로 선언되지 않으므로** calendar dist에 번들됩니다. 소비자는 `@vuepkg/calendar`만 설치하면 됩니다.

### 라이브러리 빌드 설정 (`packages/calendar/vite.lib.config.ts`)

ES + CJS 듀얼 출력, `vite-plugin-dts`로 d.ts 생성, `vue`만 external:

```bash
# 전체 빌드 (turbo — core → calendar 순서 보장)
pnpm turbo run build:lib

# calendar만 빌드
pnpm --filter @vuepkg/calendar build:lib
```

출력 (`packages/calendar/dist/`):
- `dist/index.js` — ES 모듈
- `dist/index.cjs` — CommonJS
- `dist/style.css` — 통합 CSS
- `dist/src/components/calendar/index.d.ts` — 타입 진입점

### package.json exports (`packages/calendar/package.json`)

```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/src/components/calendar/index.d.ts",
  "exports": {
    ".": {
      "import": { "types": "...", "default": "./dist/index.js" },
      "require": { "types": "...", "default": "./dist/index.cjs" }
    },
    "./style.css": "./dist/style.css"
  }
}
```

### PrimeVue 의존성 제거 완료

`ListView.vue`가 네이티브 `<table>`로 전환되어 소비자는 PrimeVue 설치 불필요.  
`peerDependencies`에 `vue`만 남아 있습니다.

---

## 남은 체크리스트

### Step 1. npm org 및 패키지명 확인

```bash
# 패키지명 중복 확인
npm view @vuepkg/calendar
# "npm ERR! 404" 가 나오면 사용 가능 → 배포 진행
```

### Step 2. README 영문 섹션 추가 (공개 배포 시)

최소 필요 섹션:
- Installation
- Basic usage
- Props / Emits API
- Korean public holiday API: opt-in notice

---

## 배포 명령

### 표준 (Changesets 워크플로)

```bash
# 1. 변경 사항 기록 (major/minor/patch 선택)
pnpm changeset

# 2. 버전 범프 + CHANGELOG 생성
pnpm changeset version

# 3. 빌드 + 배포
pnpm turbo run build:lib
cd packages/calendar
npm publish --access public
```

### 단일 패키지 빠른 배포 (calendar만)

```bash
# 1. 라이브러리 빌드
pnpm turbo run build:lib

# 2. 타입 체크
pnpm turbo run typecheck

# 3. 빌드 산출물 확인
ls packages/calendar/dist/
# 예상: index.js  index.cjs  style.css  src/components/calendar/index.d.ts

# 4. 패키지 내용 미리보기
cd packages/calendar && npm pack --dry-run

# 5. npm 로그인 (최초 1회)
npm login

# 6. 배포
npm publish --access public
```

> **참고**: `packages/calendar/package.json`의 `release` 스크립트(`pnpm run build:lib && npm publish --access public`)로도 가능하지만 Changesets 워크플로 사용을 권장합니다.

---

## 소비자 사용 예시 (배포 후)

```bash
npm install @vuepkg/calendar
```

```ts
// main.ts
import '@vuepkg/calendar/style.css'

// App.vue
import { ScheduleCalendar, useScheduleCalendarHost } from '@vuepkg/calendar'
import type { Schedule, CalendarView, ScheduleTypeOption } from '@vuepkg/calendar'
```

커스텀 타입 확장:
```ts
import { SCHEDULE_TYPE_OPTIONS } from '@vuepkg/calendar'

const typeOptions: ScheduleTypeOption[] = [
  ...SCHEDULE_TYPE_OPTIONS,
  { type: 'project', label: '프로젝트', color: '#fff', backgroundColor: '#6366f1' },
]
```

```vue
<ScheduleCalendar :schedule-type-options="typeOptions" ... />
```

---

## 배포 전 검증

```bash
pnpm turbo run lint typecheck test build:lib   # CI와 동일한 핵심 게이트
pnpm test:e2e:ci                               # 기능 E2E (CI와 동일)
# UI/CSS 변경이 있었다면:
pnpm test:e2e:visual                           # 시각 회귀 (수동)
```

GitHub Actions는 **Node 24** 환경에서 실행됩니다. 로컬도 Node 24+ 권장.

---

## 제약 사항 (Limitations)

### 1. `@/` path alias

빌드 산출물 내 `@/` alias는 Rollup이 상대 경로로 변환합니다. Vite 기반 소비자 프로젝트에서는 자동 처리됩니다.

### 2. CSS scoped 스타일

모든 컴포넌트가 `<style scoped>`를 사용합니다. 소비자는 `import '@vuepkg/calendar/style.css'`를 추가해야 합니다.

### 3. `import.meta.env` 사용

`ScheduleCalendar.vue` 내부에서 `import.meta.env.DEV`를 참조합니다. Vite 기반 소비자에서는 자동 처리되지만, webpack/Rollup 기반 프로젝트에서는 별도 define 설정이 필요할 수 있습니다.

### 4. 한국 공공 API opt-in

`fetch-public-holidays` 기본값이 `false`입니다. 공공 API를 사용하려면 `:fetch-public-holidays="true"`를 명시적으로 전달하고 프록시 또는 `VITE_SPCDE_API_URL`을 설정해야 합니다.

---

## 관련 문서

| 문서 | 내용 |
| ---- | ---- |
| [architecture.md](./architecture.md) | 컴포넌트 구조 및 Props/Emits 전체 API |
| [roadmap.md](./roadmap.md) | 비전·Phase별 로드맵·달성률 |
