# Changelog

## [Unreleased]

### 추가
- **F4-5** 반복 일정 — daily / weekly / monthly / yearly 반복
  - `Schedule.recurrence: RecurrenceRule` — 빈도/간격/요일/횟수/종료일 설정
  - `expandRecurringSchedules()` — 뷰 범위 내 회차를 파생 `Schedule`로 확장
  - `ScheduleFormModal` 반복 섹션 — 빈도, 간격, 종료 조건 UI
  - `ScheduleEventChip` 반복 아이콘 표시
- **F4-3** `ScheduleFormModal` — 일정 생성/수정/삭제 Dialog 컴포넌트
  - `v-model:open`, `schedule` prop, `save` / `delete` / `cancel` emit
  - `buildScheduleFromDraft`, `upsertSchedule`, `removeSchedule` 헬퍼 함수 제공
- **F4-2** `monthWeekCount?: 2 | 3 | 6` prop — 월간 뷰 2·3주 표시 모드
  - 기본값 `6`으로 기존 동작 유지 (하위 호환)
- **F4-4** Week/Day 뷰 DnD 이동·리사이즈
  - `schedule-move` emit — `{ schedule, newStart, newEnd }`
  - `schedule-resize` emit — `{ schedule, newEnd }`
  - 시간 단위 스냅, 고스트 오버레이, 리사이즈 핸들
  - `onScheduleMove` / `onScheduleResize` 옵션 → `useScheduleCalendarHost`
- `scheduleTypeOptions` prop — 커스텀 일정 유형 색상/라벨 등록
- 라이브러리 빌드 설정 (ES + CJS + `.d.ts`) 추가

### 수정
- 실 브라우저에서 timed event 클릭 무응답 버그 (포인터 캡처 충돌) — `pointerup` 핸들러에서 직접 `schedule-click` emit으로 대체

### 변경
- `Schedule.type` — 고정 union에서 `string`으로 확장 (하위 호환)
- `ListView` PrimeVue DataTable 제거 → 네이티브 `<table>` 대체
- `peerDependencies` → vue만 남김 (PrimeVue 제거)

---

## [0.0.1] — 2026-06-16

### 추가
- `hide-toolbar` prop
- `+N` overflow 버튼 스타일 개선

---

## [0.0.0] — 2026-06-10

초기 개발 마일스톤.

### 추가
- `ScheduleCalendar` — Month / Week / Day / List 뷰
- `useScheduleCalendarHost` — v-model 상태 + emit 핸들러 composable
- `useCalendar` — 파생 상태 (monthCells, weekDays, listRows)
- `usePublicHolidays` — 공휴일 API (연별 캐시)
- `time-slot-select` emit — Week/Day 빈 셀 클릭
- `query-change` emit — 뷰/날짜/필터 변경 시 API 재조회 트리거
- Vitest 205개 단위/컴포넌트 테스트, Playwright 126개 E2E 테스트

### 수정
- `VITE_DATA_GO_KR_SERVICE_KEY` 클라이언트 번들 노출 제거 (DEF-SEC-01)
- `usePublicHolidays` unmount 후 stale 업데이트 방지 (DEF-RT-01)
- 공휴일 API 실패 재시도 storm 방지 (DEF-RT-02)
