import { onScopeDispose, ref, toValue } from 'vue'
import type { UsePublicHolidaysOptions } from '@/types/schedule'
import type { Holiday } from '@/types/schedule'
import { fetchPublicHolidays } from '@/services/publicHolidaysApi'
import { mergeHolidays } from '@/utils/holiday'

/** 달력 표시에 필요한 연도 목록 (1월·12월은 인접 연도 포함) */
export function getRequiredYearsForDate(date: Date): number[] {
  const year = date.getFullYear()
  const years = [year]

  if (date.getMonth() === 0) {
    years.push(year - 1)
  }

  if (date.getMonth() === 11) {
    years.push(year + 1)
  }

  return years
}

function isFetchEnabled(
  fetchPublicHolidays: UsePublicHolidaysOptions['fetchPublicHolidays'],
): boolean {
  if (fetchPublicHolidays === undefined) {
    return true
  }

  return toValue(fetchPublicHolidays) !== false
}

function isAbortError(cause: unknown): boolean {
  return cause instanceof DOMException && cause.name === 'AbortError'
}

/**
 * 공공데이터포털(SpcdeInfoService/getRestDeInfo)로 국가 공휴일을 조회하고, 연도별 캐시를 유지합니다.
 * 동일 연도는 1회만 요청하며, `ensureYearsForDate`는 필요한 연도가 바뀔 때만 API를 호출합니다.
 */
export function usePublicHolidays(options: UsePublicHolidaysOptions = {}) {
  const publicHolidays = ref<Holiday[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loadedYears = new Set<number>()
  const failedYears = new Set<number>()
  const inflightYears = new Map<number, Promise<void>>()
  const abortController = new AbortController()

  onScopeDispose(() => {
    abortController.abort()
  })

  async function ensureYear(year: number) {
    if (!isFetchEnabled(options.fetchPublicHolidays)) {
      return
    }

    if (loadedYears.has(year) || failedYears.has(year)) {
      return
    }

    const inflight = inflightYears.get(year)
    if (inflight) {
      await inflight
      return
    }

    const request = (async () => {
      loading.value = true
      error.value = null

      try {
        const fetched = await fetchPublicHolidays(year, {
          serviceKey: options.serviceKey,
          signal: abortController.signal,
        })

        if (abortController.signal.aborted) {
          return
        }

        publicHolidays.value = mergeHolidays(publicHolidays.value, fetched)
        loadedYears.add(year)
      } catch (cause) {
        if (isAbortError(cause) || abortController.signal.aborted) {
          return
        }

        failedYears.add(year)
        error.value = cause instanceof Error ? cause.message : 'Failed to load holidays'
        if (import.meta.env.DEV) {
          console.warn('[usePublicHolidays]', error.value)
        }
      } finally {
        loading.value = false
        inflightYears.delete(year)
      }
    })()

    inflightYears.set(year, request)
    await request
  }

  async function ensureYearsForDate(date: Date) {
    if (!isFetchEnabled(options.fetchPublicHolidays)) {
      return
    }

    const missingYears = getRequiredYearsForDate(date).filter(
      (year) => !loadedYears.has(year) && !failedYears.has(year),
    )
    if (missingYears.length === 0) {
      return
    }

    await Promise.all(missingYears.map((year) => ensureYear(year)))
  }

  function getAllHolidays(): Holiday[] {
    const companyHolidays = toValue(options.companyHolidays) ?? []

    if (!isFetchEnabled(options.fetchPublicHolidays)) {
      return mergeHolidays(companyHolidays)
    }

    return mergeHolidays(publicHolidays.value, companyHolidays)
  }

  return {
    publicHolidays,
    loading,
    error,
    loadedYears,
    failedYears,
    ensureYear,
    ensureYearsForDate,
    getAllHolidays,
  }
}
