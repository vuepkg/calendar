# ScheduleFormModal

일정 생성·수정을 위한 Dialog 컴포넌트입니다. `@vuepkg/ui`의 `Dialog` primitive 위에 구축됩니다.

## Props

| prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | `boolean` | — | **v-model:open** — 모달 열림 상태 |
| `schedule` | `Schedule \| null` | — | 수정할 일정. `null`이면 생성 모드 |
| `defaultDraft` | `Partial<ScheduleDraft>` | `{}` | 생성 모드 초기값 (start/end 등) |
| `scheduleTypeOptions` | `ScheduleTypeOption[]` | 기본 3종 | 일정 유형 선택 옵션 |

## Emits

| emit | payload | 설명 |
|------|---------|------|
| `save` | `ScheduleDraft` | 저장 클릭 (생성/수정 공통) |
| `delete` | — | 삭제 클릭 (수정 모드에서만 표시) |
| `cancel` | — | 취소 또는 Esc/외부 클릭으로 닫기 |

## 통합 예

→ [일정 CRUD 모달 가이드](/guide/schedule-crud)를 참조하세요.
