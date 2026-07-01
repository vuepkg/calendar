import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { fetchPublicHolidays } from '@/services/publicHolidaysApi'
import type { Holiday } from '@/types/schedule'
import { getRequiredYearsForDate, usePublicHolidays } from './usePublicHolidays'

vi.mock('@/services/publicHolidaysApi', () => ({
  fetchPublicHolidays: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchPublicHolidays)

function holiday(year: number, month: number, day: number, name: string): Holiday {
  const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return {
    id: `public-${dateKey}`,
    dateKey,
    name,
    kind: 'public',
  }
}

describe('getRequiredYearsForDate', () => {
  it('returns only the current year for mid-year dates', () => {
    expect(getRequiredYearsForDate(new Date(2026, 3, 15))).toEqual([2026])
  })

  it('includes previous year for January', () => {
    expect(getRequiredYearsForDate(new Date(2026, 0, 10))).toEqual([2026, 2025])
  })

  it('includes next year for December', () => {
    expect(getRequiredYearsForDate(new Date(2026, 11, 10))).toEqual([2026, 2027])
  })
})

describe('usePublicHolidays', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    mockedFetch.mockImplementation(async (year) => [holiday(year, 1, 1, `${year} 신정`)])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fetches each required year only once on repeated ensureYearsForDate calls', async () => {
    const composable = usePublicHolidays({ serviceKey: 'test-key' })

    await composable.ensureYearsForDate(new Date(2026, 3, 15))
    await composable.ensureYearsForDate(new Date(2026, 5, 1))
    await composable.ensureYearsForDate(new Date(2026, 8, 20))

    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(mockedFetch).toHaveBeenCalledWith(2026, {
      serviceKey: 'test-key',
      signal: expect.any(AbortSignal),
    })
    expect(composable.loadedYears.has(2026)).toBe(true)
  })

  it('fetches a new year only when the calendar date moves to an unloaded year', async () => {
    const composable = usePublicHolidays({ serviceKey: 'test-key' })

    await composable.ensureYearsForDate(new Date(2026, 3, 15))
    await composable.ensureYearsForDate(new Date(2027, 3, 15))

    expect(mockedFetch).toHaveBeenCalledTimes(2)
    expect(mockedFetch).toHaveBeenNthCalledWith(1, 2026, {
      serviceKey: 'test-key',
      signal: expect.any(AbortSignal),
    })
    expect(mockedFetch).toHaveBeenNthCalledWith(2, 2027, {
      serviceKey: 'test-key',
      signal: expect.any(AbortSignal),
    })
  })

  it('prefetches adjacent years for January and December only once each', async () => {
    const composable = usePublicHolidays({ serviceKey: 'test-key' })

    await composable.ensureYearsForDate(new Date(2026, 0, 5))
    await composable.ensureYearsForDate(new Date(2026, 0, 20))

    expect(mockedFetch).toHaveBeenCalledTimes(2)
    expect(mockedFetch).toHaveBeenCalledWith(2026, {
      serviceKey: 'test-key',
      signal: expect.any(AbortSignal),
    })
    expect(mockedFetch).toHaveBeenCalledWith(2025, {
      serviceKey: 'test-key',
      signal: expect.any(AbortSignal),
    })

    vi.clearAllMocks()

    await composable.ensureYearsForDate(new Date(2026, 11, 5))
    await composable.ensureYearsForDate(new Date(2026, 11, 28))

    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(mockedFetch).toHaveBeenCalledWith(2027, {
      serviceKey: 'test-key',
      signal: expect.any(AbortSignal),
    })
  })

  it('does not call the API when fetchPublicHolidays is false', async () => {
    const company: Holiday[] = [
      {
        id: 'company-1',
        dateKey: '2026-04-01',
        name: '창립기념일',
        kind: 'company',
      },
    ]

    const composable = usePublicHolidays({
      fetchPublicHolidays: false,
      companyHolidays: company,
    })

    await composable.ensureYearsForDate(new Date(2026, 3, 15))
    await composable.ensureYearsForDate(new Date(2027, 3, 15))

    expect(mockedFetch).not.toHaveBeenCalled()
    expect(composable.getAllHolidays()).toEqual(company)
  })

  it('defaults fetchPublicHolidays to true', async () => {
    const composable = usePublicHolidays({ serviceKey: 'test-key' })

    await composable.ensureYearsForDate(new Date(2026, 3, 15))

    expect(mockedFetch).toHaveBeenCalledOnce()
  })

  it('merges API holidays with company holidays', async () => {
    const company: Holiday[] = [
      {
        id: 'company-1',
        dateKey: '2026-05-01',
        name: '창립기념일',
        kind: 'company',
      },
    ]

    const composable = usePublicHolidays({
      serviceKey: 'test-key',
      companyHolidays: company,
    })

    await composable.ensureYearsForDate(new Date(2026, 3, 15))

    expect(composable.getAllHolidays()).toEqual([holiday(2026, 1, 1, '2026 신정'), ...company])
  })

  it('deduplicates concurrent ensureYear calls for the same year', async () => {
    let resolveFetch: (() => void) | undefined
    mockedFetch.mockImplementation(
      () =>
        new Promise<Holiday[]>((resolve) => {
          resolveFetch = () => resolve([holiday(2026, 1, 1, '2026 신정')])
        }),
    )

    const composable = usePublicHolidays({ serviceKey: 'test-key' })
    const first = composable.ensureYearsForDate(new Date(2026, 3, 15))
    const second = composable.ensureYearsForDate(new Date(2026, 6, 1))

    resolveFetch?.()
    await Promise.all([first, second])

    expect(mockedFetch).toHaveBeenCalledTimes(1)
  })

  it('does not retry the same year within the TTL window after a fetch failure', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('network error'))
    const composable = usePublicHolidays({ serviceKey: 'test-key' })

    await composable.ensureYearsForDate(new Date(2026, 3, 15))
    await composable.ensureYearsForDate(new Date(2026, 6, 1))

    expect(mockedFetch).toHaveBeenCalledTimes(1)
    expect(composable.failedYears.has(2026)).toBe(true)
    expect(composable.error.value).toBe('network error')
  })

  it('retries a failed year after the TTL window expires', async () => {
    vi.useFakeTimers()
    mockedFetch
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce([holiday(2026, 1, 1, '2026 신정')])
    const composable = usePublicHolidays({ serviceKey: 'test-key' })

    await composable.ensureYearsForDate(new Date(2026, 3, 15))
    expect(composable.failedYears.has(2026)).toBe(true)

    vi.advanceTimersByTime(31_000)
    await composable.ensureYearsForDate(new Date(2026, 6, 1))

    expect(mockedFetch).toHaveBeenCalledTimes(2)
    expect(composable.loadedYears.has(2026)).toBe(true)
  })

  it('loading is true while a fetch is in-flight and false after completion', async () => {
    let resolveFetch: (() => void) | undefined
    mockedFetch.mockImplementation(
      () =>
        new Promise<Holiday[]>((resolve) => {
          resolveFetch = () => resolve([holiday(2026, 1, 1, '2026 신정')])
        }),
    )

    const composable = usePublicHolidays({ serviceKey: 'test-key' })
    expect(composable.loading.value).toBe(false)

    const pending = composable.ensureYearsForDate(new Date(2026, 3, 15))
    // micro-tick: request is registered, inflight
    await Promise.resolve()
    expect(composable.loading.value).toBe(true)

    resolveFetch?.()
    await pending

    expect(composable.loading.value).toBe(false)
  })

  it('does not update publicHolidays after scope dispose', async () => {
    let resolveFetch: (() => void) | undefined
    mockedFetch.mockImplementation(
      () =>
        new Promise<Holiday[]>((resolve) => {
          resolveFetch = () => resolve([holiday(2026, 1, 1, '2026 신정')])
        }),
    )

    const scope = effectScope()
    let composable!: ReturnType<typeof usePublicHolidays>

    scope.run(() => {
      composable = usePublicHolidays({ serviceKey: 'test-key' })
      void composable.ensureYearsForDate(new Date(2026, 3, 15))
    })

    scope.stop()
    resolveFetch?.()
    await flushPromises()

    expect(composable.publicHolidays.value).toEqual([])
  })
})
