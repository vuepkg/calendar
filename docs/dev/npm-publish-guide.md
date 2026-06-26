# npm 배포 가이드 — @vuepkg/calendar

> 작성일: 2026-06-16 · 최종 갱신: 2026-06-23 (라이브러리 빌드 완료 반영)  
> 현재 상태: **배포 준비 완료** — 아래 남은 항목 확인 후 배포 가능

---

## 현재 상태 요약

| 항목 | 현재 | 상태 |
| ---- | ---- | ---- |
| `"private"` 플래그 | `false` | ✅ |
| 버전 | `0.0.1` | ✅ (첫 배포 전 확인 권장) |
| 빌드 모드 | `vite.lib.config.ts` 라이브러리 빌드 | ✅ |
| `peerDependencies` | `vue: ^3.5.0`만 | ✅ PrimeVue 불필요 |
| `exports` 필드 | ESM/CJS + 타입 맵 완성 | ✅ |
| `files` 필드 | `["dist"]` | ✅ |
| TypeScript 타입 선언 | `vite-plugin-dts` d.ts 생성 | ✅ |
| CSS 추출 | `dist/style.css` | ✅ |
| LICENSE 파일 | MIT (추가 완료) | ✅ |
| `fetchPublicHolidays` 기본값 | `false` (opt-in) | ✅ |
| README 영문화 | 한국어 전용 | ⚠️ npm 공개 배포 시 권장 |

---

## 완료된 항목

### 라이브러리 빌드 설정 (`vite.lib.config.ts`)

ES + CJS 듀얼 출력, `vite-plugin-dts`로 d.ts 생성, `vue`만 external:

```bash
npm run build:lib
```

출력 (`dist/`):
- `dist/index.js` — ES 모듈
- `dist/index.cjs` — CommonJS
- `dist/style.css` — 통합 CSS
- `dist/src/components/calendar/index.d.ts` — 타입 진입점

### package.json exports

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

### ~~Step 1. LICENSE 파일 추가~~ ✅ 완료

`LICENSE` (MIT) 루트에 생성됨.

### ~~Step 2. `fetchPublicHolidays` 기본값 변경~~ ✅ 완료

기본값 `false`로 변경 완료. 소비자가 명시적으로 `:fetch-public-holidays="true"`를 전달해야 API를 호출합니다.

### Step 3. npm org 및 패키지명 확인

```bash
# @vup org 가용 여부 확인 (브라우저에서 확인하거나 CLI로)
npm view @vuepkg/calendar

# 존재하지 않으면 org 생성 후 배포 가능
# https://www.npmjs.com/org/create → org명: vup
```

### Step 4. README 영문 섹션 추가 (공개 배포 시)

최소 필요 섹션:
- Installation
- Basic usage
- Props / Emits API
- Korean public holiday API: opt-in notice

---

## 배포 명령

```bash
# 1. 라이브러리 빌드
npm run build:lib

# 2. 타입 체크
npm run typecheck

# 3. 빌드 산출물 확인
ls dist/
# 예상: index.js  index.cjs  style.css  src/components/calendar/index.d.ts

# 4. 패키지 내용 미리보기
npm pack --dry-run

# 5. npm 로그인 (최초 1회)
npm login

# 6. 배포
npm publish --access public
```

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

## 제약 사항 (Limitations)

### 1. 한국 공공 API 의존성 내장

`fetch-public-holidays` 기본값이 `true`이면 글로벌 소비자에게 의도치 않은 API 호출이 발생할 수 있습니다. 배포 전 기본값을 `false`로 변경하거나 README에 명시하세요.

### 2. `@/` path alias

빌드 산출물 내 `@/` alias는 Rollup이 상대 경로로 변환합니다. Vite 기반 소비자 프로젝트에서는 자동 처리됩니다.

### 3. CSS scoped 스타일

모든 컴포넌트가 `<style scoped>`를 사용합니다. 소비자는 `import '@vuepkg/calendar/style.css'`를 추가해야 합니다.

### 4. `import.meta.env` 사용

`ScheduleCalendar.vue` 내부에서 `import.meta.env.DEV`를 참조합니다. Vite 기반 소비자에서는 자동 처리되지만, webpack/Rollup 기반 프로젝트에서는 별도 define 설정이 필요할 수 있습니다.

---

## 관련 문서

| 문서 | 내용 |
| ---- | ---- |
| [architecture.md](./architecture.md) | 컴포넌트 구조 및 Props/Emits 전체 API |
| [changelog.md](./changelog.md) | 버전별 변경 이력 |
| [roadmap.md](./roadmap.md) | 배포 후 개선 예정 항목 |
