import { ref, watch, toValue } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'

/**
 * Controlled/uncontrolled 양 모드를 지원하는 상태 composable.
 *
 * - controlled: `controlledValue`가 정의되어 있으면 그 값을 따름 (emit-only 패턴)
 * - uncontrolled: `controlledValue`가 undefined면 내부 상태(`defaultValue`)로 자체 관리
 *
 * @example
 * // ScheduleCalendar 내부 — parent가 v-model:date를 안 쓸 때도 동작
 * const internalDate = useControllableState(() => props.date, emit('update:date', ...), new Date())
 */
export function useControllableState<T>(
  controlledValue: MaybeRefOrGetter<T | undefined>,
  onChange: (value: T) => void,
  defaultValue: T,
): readonly [Ref<T>, (value: T) => void] {
  const internalState = ref<T>(toValue(controlledValue) ?? defaultValue) as Ref<T>

  watch(
    () => toValue(controlledValue),
    (value) => {
      if (value !== undefined) {
        internalState.value = value
      }
    },
  )

  function setState(value: T): void {
    const controlled = toValue(controlledValue)
    if (controlled === undefined) {
      internalState.value = value
    }
    onChange(value)
  }

  return [internalState, setState] as const
}
