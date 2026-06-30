import { nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useControllableState } from './useControllableState'

describe('useControllableState — uncontrolled mode', () => {
  it('initializes to defaultValue when controlledValue is undefined', () => {
    const onChange = vi.fn()
    const [state] = useControllableState<string>(() => undefined, onChange, 'default')
    expect(state.value).toBe('default')
  })

  it('setState updates internal state immediately', () => {
    const onChange = vi.fn()
    const [state, setState] = useControllableState<string>(() => undefined, onChange, 'default')
    setState('next')
    expect(state.value).toBe('next')
  })

  it('setState calls onChange with the new value', () => {
    const onChange = vi.fn()
    const [, setState] = useControllableState<string>(() => undefined, onChange, 'default')
    setState('next')
    expect(onChange).toHaveBeenCalledExactlyOnceWith('next')
  })

  it('accepts a plain ref (not just a getter) as the controlledValue source', () => {
    const controlled = ref<string | undefined>(undefined)
    const onChange = vi.fn()
    const [state] = useControllableState<string>(controlled, onChange, 'default')
    expect(state.value).toBe('default')
  })
})

describe('useControllableState — controlled mode', () => {
  it('initializes from controlledValue instead of defaultValue when it is defined', () => {
    const controlled = ref<string>('from-parent')
    const onChange = vi.fn()
    const [state] = useControllableState<string>(controlled, onChange, 'default')
    expect(state.value).toBe('from-parent')
  })

  it('setState does not mutate internal state directly (parent must echo it back)', () => {
    const controlled = ref<string>('from-parent')
    const onChange = vi.fn()
    const [state, setState] = useControllableState<string>(controlled, onChange, 'default')
    setState('attempted-change')
    expect(state.value).toBe('from-parent')
  })

  it('setState still calls onChange even though internal state is not mutated', () => {
    const controlled = ref<string>('from-parent')
    const onChange = vi.fn()
    const [, setState] = useControllableState<string>(controlled, onChange, 'default')
    setState('attempted-change')
    expect(onChange).toHaveBeenCalledExactlyOnceWith('attempted-change')
  })

  it('syncs internal state when controlledValue changes externally', async () => {
    const controlled = ref<string>('initial')
    const onChange = vi.fn()
    const [state] = useControllableState<string>(controlled, onChange, 'default')

    controlled.value = 'updated-by-parent'
    await nextTick()

    expect(state.value).toBe('updated-by-parent')
  })
})

describe('useControllableState — boundary cases', () => {
  it('treats 0/empty-string/false as defined controlled values, not as "uncontrolled"', () => {
    const controlled = ref<number>(0)
    const onChange = vi.fn()
    const [state] = useControllableState<number>(controlled, onChange, 99)
    expect(state.value).toBe(0)
  })

  it('does not reset internal state when controlledValue transitions back to undefined', async () => {
    const controlled = ref<string | undefined>('from-parent')
    const onChange = vi.fn()
    const [state] = useControllableState<string>(controlled, onChange, 'default')

    controlled.value = undefined
    await nextTick()

    // watch() ignores `undefined` updates, so the last known value is retained
    expect(state.value).toBe('from-parent')
  })
})
