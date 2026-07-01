import { computed, onScopeDispose, ref, toValue } from 'vue'
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

/** 실패한 연도는 이 시간 이후 재시도 허용 */
const RETRY_AFTER_MS = 30_000

/**
 * 공공데이터포털(SpcdeInfoService/getRestDeInfo)로 국가 공휴일을 조회하고, 연도별 캐시를 유지합니다.
 * 동일 연도는 1회만 요청하며, 실패 시 30초 후 재시도합니다.
 * `ensureYearsForDate`는 필요한 연도가 바뀔 때만 API를 호출합니다.
 */
export function usePublicHolidays(options: UsePublicHolidaysOptions = {}) {
  const publicHolidays = ref<Holiday[]>([])
  const error = ref<string | null>(null)
  const loadedYears = new Set<number>()
  /** year → 실패 시각(epoch ms). RETRY_AFTER_MS 이후 재시도 허용 */
  const failedYears = new Map<number, number>()
  const inflightYears = new Map<number, Promise<void>>()
  const inflightCount = ref(0)
  const loading = computed(() => inflightCount.value > 0)
  const abortController = new AbortController()

  onScopeDispose(() => {
    abortController.abort()
  })

  function isTemporarilyFailed(year: number): boolean {
    const failedAt = failedYears.get(year)
    return failedAt !== undefined && Date.now() - failedAt < RETRY_AFTER_MS
  }

  async function ensureYear(year: number) {
    if (!isFetchEnabled(options.fetchPublicHolidays)) {
      return
    }

    if (loadedYears.has(year) || isTemporarilyFailed(year)) {
      return
    }

    const inflight = inflightYears.get(year)
    if (inflight) {
      await inflight
      return
    }

    const request = (async () => {
      inflightCount.value++
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

        failedYears.set(year, Date.now())
        error.value = cause instanceof Error ? cause.message : 'Failed to load holidays'
        if (import.meta.env.DEV) {
          console.warn('[usePublicHolidays]', error.value)
        }
      } finally {
        inflightCount.value--
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
      (year) => !loadedYears.has(year) && !isTemporarilyFailed(year),
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
