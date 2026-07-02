# 소개

`@vuepkg/calendar`는 Vue 3 Composition API 기반의 Modern Calendar Engine입니다.

## 왜 @vuepkg/calendar인가?

### 기존 Vue 캘린더의 문제

| 라이브러리 | 문제 |
|-----------|------|
| FullCalendar | 핵심 기능(DnD·Timeline·Recurring)이 유료 라이선스. ~100KB gzip. jQuery/Backbone 유산. |
| v-calendar | 단순 달력 수준 — Week/Day 그리드, DnD 없음. 정체 상태. |
| vue-cal | 유지보수 불안정. TypeScript 지원 미흡. |

### @vuepkg/calendar의 포지션

- **Controlled / emit-only**: 상태는 소비자가 소유, 컴포넌트는 표현+emit만. 서버 저장·낙관적 업데이트·권한 기반 뷰 제어에 완벽 적합.
- **Zero dependency**: `vue` peer 외 런타임 의존성 없음. CDN 없이 `npm install` 한 줄.
- **CSS-variable 테마**: 런타임 JS 테마 엔진 없음. `--vp-color-primary` 한 줄로 브랜드 컬러 변경. Tailwind 프로젝트는 [테마 가이드 § Tailwind](/guide/theming#tailwind-css-프로젝트에서-사용하기) 참고.
- **Scoped slot**: `#event`/`#day-cell`/`#toolbar`/`#month-overflow-item`로 칩·셀·툴바 마크업을 Tailwind 등으로 직접 교체 가능(REV-A1).
- **Headless**: `@vuepkg/calendar/headless`로 로직만 가져와 자체 UI(Tailwind 등) 구성 가능.
- **Modern DX**: TypeScript-first, Composition API native, tree-shakeable.

## 스타일 커스터마이징 (요약)

| 방식 | 적합한 경우 |
| ---- | ----------- |
| CSS 변수 (`--vp-*`) | `ScheduleCalendar` 그대로 쓰며 브랜드 톤만 맞출 때 |
| `scheduleTypeOptions` | 일정 유형별 색상 |
| `@vuepkg/calendar/headless` | 내부 UI까지 Tailwind로 직접 그릴 때 |
| scoped slot (`#event` 등) | ✅ 칩·셀·툴바·overflow 항목만 Tailwind로 교체할 때 (REV-A1, List 행 제외) |

상세: [테마 커스터마이징](/guide/theming) · 로드맵: [GitHub roadmap](https://github.com/vuepkg/calendar/blob/main/docs/dev/roadmap.md)

## 지원 범위

| 기능 | 상태 |
|------|------|
| Month / Week / Day / List 뷰 | ✅ |
| 드래그로 시간 슬롯 선택 | ✅ |
| 드래그 앤 드롭 이동·리사이즈 | ✅ |
| 반복 일정 (daily/weekly/monthly/yearly) | ✅ |
| 일정 CRUD 모달 (Dialog) | ✅ |
| 공휴일 자동 조회 (공공데이터포털) | ✅ |
| 2주/3주 월간 뷰 변형 | ✅ |
| Dark mode | ✅ |
| scoped slot API (Tailwind/shadcn) | ✅ (REV-A1) |
| Timeline / Resource Scheduler 뷰 | 🚧 Phase C (F4-6) |
| 타임존 지원 | 🚧 보류 (F4-8) |

## 번들 사이즈

| 산출물 | Brotli |
|--------|--------|
| `index.js` | ~18 KB |
| `style.css` | ~5 KB |

> vue peer dependency는 제외. FullCalendar ~100KB+ 대비 1/7 이하.
