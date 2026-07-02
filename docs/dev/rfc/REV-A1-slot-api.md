# RFC: REV-A1 — scoped slot API 설계

> 상태: **구현 완료** (2026-07-02) · 작성일: 2026-07-02 · 열린 질문(§8)은 답변대로 확정: v1은 6개 `event` 컨텍스트로 한정, `toolbar` 라벨은 slot prop으로 내려주지 않음, overflow 헤더는 슬롯화하지 않음, budget 여유 내에서 8개 파일 전부 구현
> 로드맵: [roadmap.md § Phase A](../roadmap.md#2-phase-abc--다음-개발-방향-2026-07-02-확정) 1순위
> 대상: `packages/calendar/src/components/calendar/**`

CONTRIBUTING.md RFC 템플릿을 따르되, 코드베이스 조사 결과를 기술 부록(§5~8)으로 덧붙였습니다.

---

## 1. 배경

`ScheduleCalendar.vue` 이하 전 컴포넌트에 `<slot>`이 0건이다. 이벤트 칩·툴바·월간 셀·All Day 바·overflow 팝오버 항목을 소비자가 교체할 수 없어, Tailwind/shadcn 스타일로 내부 UI를 커스터마이즈하려는 소비자가 CSS 변수 오버라이드나 `@vuepkg/calendar/headless`(완전 재구현)만 선택할 수 있다. 두 옵션 사이의 간극이 커서 "5분 안에 브랜드 UI 적용" 스토리가 성립하지 않는다 (`vue3-reviewer-backlog.md` REV-A1, DX 6.5/10 근거).

## 2. 제안

최소 4개 scoped slot을 `event` / `day-cell` / `toolbar` / `month-overflow-item` 이름으로 도입한다. **핵심 설계 원칙 하나**로 나머지 결정이 파생된다:

> **슬롯은 위치·인터랙션(클릭/DnD 포인터/키보드/포지셔닝) 래퍼 안쪽의 순수 표현 콘텐츠만 교체한다. 래퍼 자체(className이 붙은 div, `@pointerdown`/`@keydown` 핸들러, `style: top/left/gridColumn` 등)는 절대 슬롯으로 넘기지 않는다.**

이 원칙이 필요한 이유: `TimedGridDayColumn.vue`의 `.timed-event`는 DnD 이동(`move-pointerdown`)·리사이즈(`resize-pointerdown`) 핸들러와 `top/height/left/width` 포지셔닝을 가진 래퍼이고, `MonthCell.vue`는 `role="gridcell"` + roving-tabindex(SRV-P2-09) a11y 셸을 가진 래퍼다. 슬롯이 이 래퍼까지 대체하게 하면 소비자가 슬롯 콘텐츠를 채우는 순간 DnD와 키보드 a11y가 조용히 깨진다. 래퍼는 항상 우리가 소유하고, 슬롯은 그 안의 "무엇을 보여줄지"만 위임한다.

### 2.1 슬롯별 설계

| 슬롯 | 소유 컴포넌트 | 교체 범위 | 기본 콘텐츠 |
| ---- | ------------ | -------- | ---------- |
| `toolbar` | `ScheduleCalendar.vue` | 전체(래퍼까지) — 탭 전환 UI는 인터랙션 래퍼 자체가 곧 콘텐츠라 분리 실익 없음 | 현재 `<CalendarToolbar>` |
| `day-cell` | `MonthCell.vue` | `role="gridcell"` 안쪽 콘텐츠만(날짜 숫자·바 spacer·이벤트 목록) | 현재 `.cell-date`+`.cell-events` 블록 |
| `event` | `MonthCell.vue`(month-chip) · `MonthView.vue`(month-all-day-bar) · `TimedGridAllDay.vue`(week/day-all-day-bar) · `TimedGridDayColumn.vue`(week/day-timed) | 클릭/DnD 래퍼 안쪽 칩·바 콘텐츠만 | 현재 `<ScheduleEventChip>` 또는 `<AllDayBar>` |
| `month-overflow-item` | `MonthOverflowPopover.vue` | `<li><button>` 안쪽 텍스트만 | 현재 `formatOverflowScheduleLabel(schedule)` |

### 2.2 slot props 타입 (신규 `src/types/slots.ts`)

```ts
export interface EventSlotProps {
  schedule: Schedule
  /** 기존 ScheduleClickSource 재사용 — 소비자가 컨텍스트별로 분기 가능 */
  source: ScheduleClickSource
  typeStyle: { color: string; backgroundColor: string }
  compact?: boolean
  showParticipant?: boolean
}

export interface DayCellSlotProps {
  cell: MonthWeekCell
  getTypeStyle: (type: Schedule['type']) => { color: string; backgroundColor: string }
  onScheduleClick: (schedule: Schedule) => void
  onOpenOverflow: (event: MouseEvent) => void
}

export interface ToolbarSlotProps {
  currentView: CalendarView
  views: readonly CalendarView[]
  onSelect: (view: CalendarView) => void
}

export interface MonthOverflowItemSlotProps {
  schedule: Schedule
  isHighlighted: boolean
  onSelect: () => void
}
```

기존 `ScheduleClickSource`(`types/calendarEvents.ts`)를 그대로 재사용 — 새 taxonomy를 만들지 않는다. `List` 행(`list-row`)은 `ScheduleClickSource`에 이미 존재하지만 **v1 `event` 슬롯 범위에서 제외**한다 (§4 대안 참고).

### 2.3 Forwarding 메커니즘

4개 슬롯이 최대 4단계(`ScheduleCalendar → WeekView/DayView → TimedGrid → TimedGridDayColumn`)를 거쳐야 한다. Vue named slot은 자동으로 통과되지 않으므로, 중간 컴포넌트마다 개별 슬롯명을 일일이 선언하지 않도록 **동적 forwarding 패턴**을 표준화한다:

```vue
<!-- 중간 pass-through 컴포넌트 공통 패턴 (WeekView/DayView/TimedGrid 등) -->
<ChildComponent>
  <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
    <slot :name="slotName" v-bind="slotProps ?? {}" />
  </template>
</ChildComponent>
```

이 패턴이면 새 슬롯이 나중에 추가돼도 중간 컴포넌트를 다시 건드릴 필요가 없다. 단, `MonthView.vue`는 `month-all-day-bar` 컨텍스트의 `event` 슬롯과 `day-cell`·`month-overflow-item` 슬롯이 한곳에 모이는 허브라 이 패턴 + 일부 수동 슬롯 선언이 혼재한다(§3 참고).

## 3. 영향 범위

### 3.1 컴포넌트별 변경

| 파일 | 변경 |
| ---- | ---- |
| `ScheduleCalendar.vue` | `toolbar` 직접 선언. 나머지 3개는 동적 forwarding으로 `MonthView`/`WeekView`/`DayView`/`ListView`에 전달 |
| `MonthView.vue` | `day-cell`·`event`(month-chip)를 `MonthCell`로 forwarding, `event`(month-all-day-bar) 직접 선언(AllDayBar 렌더 지점 본인), `month-overflow-item`을 `MonthOverflowPopover`로 forwarding |
| `MonthCell.vue` | `day-cell` 직접 선언(내부 콘텐츠 블록), `event`(month-chip) 직접 선언 |
| `MonthOverflowPopover.vue` | `month-overflow-item` 직접 선언 |
| `WeekView.vue` / `DayView.vue` | 동적 forwarding만 추가 (~3줄씩) |
| `TimedGrid.vue` | 동적 forwarding만 추가 |
| `TimedGridAllDay.vue` | `event`(week/day-all-day-bar) 직접 선언 |
| `TimedGridDayColumn.vue` | `event`(week/day-timed) 직접 선언 — DnD 래퍼(`.timed-event`, `resize-handle`)는 그대로 유지, 안쪽 `<ScheduleEventChip>`만 슬롯화 |
| `CalendarToolbar.vue` | 변경 없음(교체 대상이지 forwarding 대상 아님) — `viewTabs` 배열을 `constants/calendarView.ts` 등으로 lift해 `ScheduleCalendar`가 `ToolbarSlotProps.views`로 재사용 |
| `src/types/slots.ts` | 신규 — 위 4개 인터페이스 |
| `types/index.ts` | slot 타입 barrel export 추가 |

### 3.2 공개 API 변경 (breaking 여부)

**non-breaking.** Vue의 named slot은 미사용 시 기본 콘텐츠가 그대로 렌더되므로 기존 소비자는 아무 영향이 없다. `prop`/`emit` 시그니처 변경 없음 — `ToolbarSlotProps.onSelect`도 기존 `handleViewChange` 내부 로직을 노출하는 것뿐, 새 emit이 아니다.

### 3.3 번들 사이즈 영향

각 `<slot>` 선언 자체는 런타임 비용이 거의 없다(Vue 컴파일러가 slot 미사용 시 fallback만 렌더). 다만 8개 파일에 스코프드 슬롯이 추가되며 템플릿 컴파일 산출물이 소폭 증가한다. 현재 `index.js` 92%(18.4/20KB) 포화 상태라 **구현 착수 전 실측 필요** — size-limit CI가 게이트 역할.

### 3.4 리스크

| 리스크 | 완화 |
| ------ | ---- |
| forwarding 누락으로 특정 컨텍스트만 슬롯 미동작 | §5 테스트 계획의 컨텍스트별(month-chip/month-all-day-bar/week-all-day-bar/day-all-day-bar/week-timed/day-timed) 개별 spec으로 커버 |
| 슬롯 콘텐츠가 래퍼 크기 가정을 깨서 레이아웃 붕괴(월간 18px 칩 높이, All Day 22px 행 등) | 기본 콘텐츠는 현재 마크업과 100% 동일이 강제 조건. 커스텀 콘텐츠의 레이아웃 붕괴는 소비자 책임 영역이나, 문서에 "슬롯 콘텐츠는 부모가 지정한 높이 제약 안에서 렌더된다" 명시 |
| 번들 budget 초과 | 구현 착수 직후 1차 실측, 초과 시 F4-6 대비 이미 확보한 여유(92%→ 목표 재조정) 재검토 |

## 4. 대안 (채택하지 않음)

- **List 행(`list-row`)을 `event` 슬롯에 포함**: `ListView.vue`는 이미 `@vuepkg/ui`의 `DataTable`이 제공하는 `cell-{key}` named slot으로 각 컬럼을 렌더한다(현재는 `ListView.vue`가 그 슬롯들을 소비하기만 하고 자신은 상위로 재노출하지 않음). List 행 커스터마이즈는 `event` 슬롯과 모양이 다른 문제(칩 하나가 아니라 컬럼 여러 개)라 별도 RFC로 분리 — `ListView.vue`가 `cell-*` 슬롯을 `ScheduleCalendar`까지 재노출하는 게 더 자연스러운 해법.
- **`day-cell` 슬롯이 `MonthCell`의 root(`role=gridcell` 포함)까지 대체**: SRV-P2-09 roving-tabindex a11y가 슬롯 경계 밖에서 깨질 위험이 있어 기각. 향후 실수요가 확인되면 headless 레벨의 별도 composable로 검토.
- **완전히 새로운 slot 이름 체계**: `source` prop에 `ScheduleClickSource`를 재사용하지 않고 별도 enum을 만드는 안 — 기존 emit payload와 개념이 동일해 API 표면만 늘어난다고 판단, 기각.

## 5. 테스트 계획

- **Vitest** — 대상 6개 파일(`MonthCell`, `MonthView`, `TimedGridAllDay`, `TimedGridDayColumn`, `MonthOverflowPopover`, `ScheduleCalendar`/`CalendarToolbar`) 각각에 슬롯 override 시나리오 추가:
  1. 커스텀 슬롯 콘텐츠가 기본 콘텐츠 대신 렌더되는지
  2. slot props가 기대한 shape·값으로 전달되는지
  3. 슬롯 미사용 시 기존 스냅샷/DOM 어서션이 무변경으로 통과하는지 (회귀 가드)
- **Playwright E2E** — Month/Week/Day 뷰별로 커스텀 `#event` 슬롯(마커 엘리먼트로 교체)을 적용한 데모 호스트에서 클릭 → `schedule-click` emit이 여전히 발생하는지 확인 — 인터랙션 래퍼가 슬롯 경계 밖에 있다는 설계 원칙의 실증.
- **시각 회귀** — 기존 8종 baseline은 **무변경 통과가 기대값**이다(기본 슬롯 콘텐츠 = 현재 마크업 그대로). 하나라도 픽셀이 달라지면 forwarding 과정에서 의도치 않은 wrapper 엘리먼트가 추가된 신호로 간주.

## 6. 문서 계획

- `docs/dev/architecture.md` §3 `ScheduleCalendar.vue` API — slot 표 신규 섹션 추가 (Props/Emits 표와 동일 형식)
- `apps/docs/guide/theming.md` — "Tailwind" 섹션에 slot 기반 커스터마이즈 예제 추가, "미지원" 표기 제거
- F3-2(`vue-component-meta`) 착수 시 이 slot 표가 자동 생성 대상에 포함되는지 확인 — REV-A1을 F3-2보다 먼저 하는 이유(로드맵 §2 Phase A 순서)가 바로 이 지점

## 7. 로드맵 연결

`REV-A1` (roadmap.md §2 Phase A 1순위). 완료 시 로드맵 §0 대시보드의 Phase A 달성률(0/4 → 1/4)과 REV Critical 카운트(0/4 → 1/4) 동시 갱신.

## 8. 열린 질문 (구현 착수 전 결정 필요)

1. `event` 슬롯의 `source`에 `list-row`를 타입 레벨에서라도 포함할지, 아니면 v1은 6개 컨텍스트(month-chip/month-all-day-bar/week-all-day-bar/day-all-day-bar/week-timed/day-timed)로 완전히 한정할지.
2. `toolbar` 슬롯에 라벨 텍스트(`'Month'`/`'Week'`...)를 slot prop으로 내려줄지, 아니면 소비자가 `currentView`만 보고 자체 라벨을 붙이게 할지(현재 초안은 후자 — headless 철학과 일관, F3-3 `locale` prop과 별개 관심사 유지).
3. `MonthOverflowPopover`의 헤더(날짜 타이틀 + 닫기 버튼)도 이번에 슬롯화할지, 아니면 `month-overflow-item`(목록 항목)만으로 범위를 좁힐지 — 초안은 후자(REV-A1 원문의 4개 슬롯 이름에 정확히 대응).
4. 번들 사이즈 실측 후 8개 파일 전부에 슬롯을 넣을지, 사용 빈도가 낮을 것으로 예상되는 컨텍스트(예: month-all-day-bar)는 다음 마이너 릴리즈로 미룰지.
