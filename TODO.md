# TODO — react-calendar 비교 기반 개선 항목

> react-calendar(npmjs.com/package/react-calendar) 소개글 분석으로 도출.  
> 기능 로드맵은 [docs/dev/roadmap.md](docs/dev/roadmap.md) 참조.

---

## 문서 · 배포 품질 (npm 페이지 인상)

### 🟢 빠르게 처리 가능

- [ ] **npm 배지 추가** — README 제목 아래에 배지 삽입
  ```md
  [![npm](https://img.shields.io/npm/v/@vuepkg/calendar)](https://www.npmjs.com/package/@vuepkg/calendar)
  [![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
  [![bundle size](https://img.shields.io/bundlephobia/minzip/@vuepkg/calendar)](https://bundlephobia.com/package/@vuepkg/calendar)
  ```
  > 배포 완료 후 추가 가능

- [ ] **브라우저 지원 명시** — README에 한 줄 추가
  ```
  Modern browsers (Chrome, Firefox, Safari, Edge) — IE 미지원
  ```

- [ ] **접근성(a11y) 현황 문서화** — 이미 구현된 내용을 README에 노출
  - `aria-pressed` (뷰 탭 SelectButton)
  - `role="grid"`, `aria-label` (월간 셀)
  - 키보드 네비게이션 지원 여부 명시

### 🟡 중간 작업

- [ ] **스크린샷 / GIF 추가** — react-calendar처럼 첫인상 제공
  - Month / Week / Day / List 뷰 스크린샷 각 1장 또는 전환 GIF
  - `docs/images/` 폴더에 저장 후 README 상단에 삽입

- [ ] **README 영문 섹션 추가** — 글로벌 npm 소비자 접근성
  - Installation
  - Basic usage (Composable 패턴)
  - Props / Emits 요약표 (영문)
  - Korean public holiday API opt-in 주의 안내

- [ ] **라이브 데모 배포** — react-calendar의 가장 강력한 차별점
  - GitHub Pages 또는 Vercel로 데모 앱 배포
  - README 상단에 링크 삽입

---

## 기능 격차 (react-calendar 대비)

### react-calendar에 있고 우리에게 없는 것

- [ ] **`minDate` / `maxDate` prop** — 선택 가능 날짜 범위 제한
  - react-calendar 기본 props, 우리 프로젝트에 미구현
  - 영향 파일: `ScheduleCalendar.vue`, `MonthView.vue`, `TimedGrid.vue`

- [ ] **날짜 범위 선택 (range selection)** — react-calendar 핵심 기능
  - 시작일·종료일 드래그 또는 두 번 클릭으로 선택
  - 현재는 `time-slot-select`(Week/Day 시간 슬롯)만 있음
  - 월간 뷰에서 날짜 범위 선택 → `date-range-select` emit

- [ ] **다중 날짜 선택 (multi-select)** — react-calendar `allowPartialRange` 류
  - 여러 날짜를 개별 클릭으로 선택

- [ ] **Locale / i18n 자동화** — react-calendar는 브라우저 `Intl` API 자동 연동
  - 현재 요일 헤더 `['SUN', 'MON', ...]` 하드코딩 (→ IMP-02 연계)
  - `Intl.DateTimeFormat`으로 요일·월 이름 자동 현지화
  - `locale` prop 추가 → `weekdayLabels` 대신 또는 병행

---

## 완료

- [x] README 최상단 소비자용 설치 섹션 추가
- [x] Props / Emits 요약 테이블 README 인라인 배치
- [x] 타이틀에서 "데모 프로젝트" 제거, 라이브러리 포지셔닝
