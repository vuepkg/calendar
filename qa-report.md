# QA Report — @vuepkg/calendar Full Test (2026-07-01)

status: PASS

## 테스트 실행 요약

| 스위트 | 결과 | 건수 |
|--------|------|------|
| Vitest `@vuepkg/core` | ✅ PASS | 70 |
| Vitest `@vuepkg/ui` | ✅ PASS | 76 |
| Vitest `@vuepkg/calendar` | ✅ PASS | 265 (+18 신규) |
| Playwright `test:e2e:ci` | ✅ PASS | 137 (+3 신규) |
| **합계** | **✅ PASS** | **548** |

> E2E 실행 전 `pnpm build`(calendar) 필요 — `playwright.config.ts`가 `vite preview`를 webServer로 사용.

---

## ✅ 통과한 검증 항목

### 렌더링 / 뷰 전환
- Month / Week / Day / List 4뷰 렌더링 및 탭 전환 (unit + E2E)
- `hideToolbar`, `monthWeekCount` 변형 (unit)
- Host integration 5레이아웃 × 3뷰포트 (E2E 60건)
- Responsive 6뷰포트 × 7시나리오 (E2E 42건)

### 상태 / 데이터
- `useCalendar` 월간·주간·일간·리스트 파생 데이터 (unit)
- **F4-5 반복 일정** `expandRecurringSchedules` → `useCalendar` 통합 (unit 4건 신규)
- 공휴일 API fetch / merge / TTL (unit)
- `useScheduleCalendarHost` emit-only 계약 (unit)

### 상호작용 / CRUD
- `ScheduleFormModal` 생성·수정·삭제·유효성 검증 (unit)
- **반복 폼** weekly/count, daily/until, yearly/never, edit 시 recurrence 제거 (unit 3건 신규)
- Month overflow popover, +N 클릭 (unit + E2E)
- List 필터 해제, 월 네비게이션 (unit)
- **GAP-01** List 행 클릭 → 수정 모달 (E2E 신규)

### F4-5 반복 일정 (E2E 신규)
- 4월 화(7일)·목(9일)에 반복 칩 표시, 수(8일) 미표시
- 반복 칩 클릭 시 마스터 일정 weekly로 수정 모달 오픈

### F4-1 / F4-4 드래그
- `useTimeSlotSelection`, `useScheduleDrag` (TimedGrid unit)
- GAP-TS-01 빈 슬롯·기존 이벤트 클릭 (E2E)

### 접근성
- SegmentedControl `role=group`, `aria-pressed`, `:focus-visible` (unit + E2E)
- Dialog focus trap (`@vuepkg/ui` unit)

### 신규 컴포넌트 스위트
- `WeekView.spec.ts` — TimedGrid·주 네비·7열 렌더 (3건)
- `DayView.spec.ts` — single-day 그리드·일 네비·일정 표시 (3건)
- `HolidayChip.spec.ts` — 라벨·title (2건)

### 유틸 엣지 케이스
- `recurrence.spec.ts` interval clamp, 복수 schedule, 빈 배열 (3건 신규)

---

## ❌ 발견된 결함

없음 (이번 풀테스트 기준)

---

## ⚠️ 커버리지 갭 (잔여)

| ID | 영역 | 사유 |
|----|------|------|
| GAP-TS-01b | E2E `time-slot-select` payload | 뷰 유지만 검증, emit payload 미검증 |
| GAP-DRAG-01 | E2E `schedule-move` / `schedule-resize` | TimedGrid unit만, 브라우저 E2E 없음 |
| GAP-COMP-01 | `AllDayBar`, `MonthCell`, `TimedGridHeader`, `TimedGridAllDay` | 부모 spec·utils로 간접 커버, leaf spec 없음 |
| GAP-COMP-02 | `useTimeSlotSelection`, `useScheduleDrag`, `useMonthMeasuredCellHeight` | composable 직접 spec 없음 (TimedGrid/MonthView 간접) |
| GAP-FORM-01 | `ScheduleFormModal` exceptions UI, participant/type 필드 | 폼 필드 일부 미검증 |
| GAP-REF-01 | `resolveCalendarNavigateDate` 월말 edge case | 기본 action만 unit 검증 |
| GAP-INFRA-01 | F3-1 docs 사이트, F4-11 Changesets | CI build/deploy로만 검증 (구조상 예상) |
| GAP-A11Y-01 | axe 자동 감사 | 로드맵 F3-5 미착수 |

---

## 💡 개선 제안

- [SUG-01] E2E webServer에 `build` 선행 단계를 CI 문서/README에 명시 — 로컬에서 build 없이 E2E 실행 시 120s timeout 발생
- [SUG-02] 월간 셀 날짜 셀렉터에 `^${day}$` 정규식 패턴을 E2E 헬퍼로 공통화 (`8` vs `18`/`28` 혼동 방지)
- [SUG-03] `useScheduleDrag` / `schedule-move` E2E 1건 추가 시 F4-4 회귀 방어력 상승
- [SUG-04] F3-5 `axe-playwright` 도입 시 README a11y 신뢰도 강화

---

## 신규/수정 테스트 파일

| 파일 | 변경 |
|------|------|
| `packages/calendar/src/composables/useCalendar.spec.ts` | F4-5 통합 4건 추가 |
| `packages/calendar/src/components/calendar/ScheduleFormModal.spec.ts` | recurrence 3건 추가 |
| `packages/calendar/src/utils/recurrence.spec.ts` | 엣지 3건 추가 |
| `packages/calendar/src/components/calendar/views/WeekView.spec.ts` | **신규** |
| `packages/calendar/src/components/calendar/views/DayView.spec.ts` | **신규** |
| `packages/calendar/src/components/calendar/HolidayChip.spec.ts` | **신규** |
| `packages/calendar/e2e/calendar.spec.ts` | GAP-01 + F4-5 E2E 3건 추가 |

---

## Final Recommendation

`status: PASS` — 로드맵 완료 항목(F4-1~5, F4-11, F3-1) 중 **런타임 검증 가능한 범위**는 unit 265건 + E2E 137건으로 커버됨. 잔여 갭은 leaf 컴포넌트·드래그 E2E·인프라 영역으로, 제품 결함이 아닌 테스트 보강 백로그로 관리 권장.

다음 단계(FE 핸드오프 불필요): 신규 기능 착수 시 해당 영역 spec을 동반 추가.
