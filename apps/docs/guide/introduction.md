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
- **CSS-variable 테마**: 런타임 JS 테마 엔진 없음. `--vp-color-primary` 한 줄로 브랜드 컬러 변경.
- **Modern DX**: TypeScript-first, Composition API native, tree-shakeable.

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
| Timeline / Resource Scheduler 뷰 | 🚧 예정 (F4-6) |
| 타임존 지원 | 🚧 예정 (F4-8) |

## 번들 사이즈

| 산출물 | Brotli |
|--------|--------|
| `index.js` | ~15 KB |
| `style.css` | ~5 KB |

> vue peer dependency는 제외. FullCalendar ~100KB+ 대비 1/7 이하.
