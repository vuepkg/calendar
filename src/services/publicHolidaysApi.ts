import type { FetchPublicHolidaysOptions } from '@/types/schedule'
import type { Holiday } from '@/types/schedule'

/** 개발 서버 Vite proxy / production BFF 경로 — `vite.config.ts` 참고 */
export const DEFAULT_SPCDE_API_PATH = '/api/spcde/getRestDeInfo'

interface SpcdeHolidayItem {
  dateKind?: string
  dateName: string
  isHoliday?: string
  locdate: number
  seq?: number
}

interface SpcdeApiResponse {
  response: {
    header: {
      resultCode: string
      resultMsg: string
    }
    body: {
      items?:
        | {
            item?: SpcdeHolidayItem | SpcdeHolidayItem[]
          }
        | ''
      numOfRows: number
      pageNo: number
      totalCount: number
    }
  }
}

/** same-origin proxy/BFF가 serviceKey를 서버에서 주입하는 URL인지 */
export function usesServerInjectedServiceKey(apiUrl: string): boolean {
  if (apiUrl.startsWith('/')) {
    return true
  }

  try {
    const { origin } = window.location
    const resolved = new URL(apiUrl, origin)
    return resolved.origin === origin
  } catch {
    return false
  }
}

function resolveServiceKey(override?: string): string | undefined {
  return override
}

function resolveApiUrl(override?: string): string {
  return override ?? import.meta.env.VITE_SPCDE_API_URL ?? DEFAULT_SPCDE_API_PATH
}

function locdateToDateKey(locdate: number): string {
  const value = String(locdate)
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
}

function parseHolidayItems(body: SpcdeApiResponse['response']['body']): SpcdeHolidayItem[] {
  const items = body.items
  if (!items) {
    return []
  }

  const item = items.item
  if (!item) {
    return []
  }

  return Array.isArray(item) ? item : [item]
}

export function buildPublicHolidaysApiUrl(
  year: number,
  apiUrl: string,
  serviceKey?: string,
): string {
  const params = new URLSearchParams({
    solYear: String(year),
    pageNo: '1',
    numOfRows: '100',
    _type: 'json',
  })

  if (serviceKey) {
    params.set('serviceKey', serviceKey)
  }

  return `${apiUrl}?${params.toString()}`
}

/** 공공데이터포털 SpcdeInfoService/getRestDeInfo — 한국 공휴일 */
export async function fetchPublicHolidays(
  year: number,
  options: FetchPublicHolidaysOptions = {},
): Promise<Holiday[]> {
  const apiUrl = resolveApiUrl(options.apiUrl)
  const serviceKey = resolveServiceKey(options.serviceKey)
  const serverInjectsKey = usesServerInjectedServiceKey(apiUrl)

  if (!serviceKey && !serverInjectsKey) {
    throw new Error(
      'Direct 공공데이터포털 API calls require serviceKey. Use a same-origin BFF/proxy URL or pass serviceKey explicitly.',
    )
  }

  const response = await fetch(buildPublicHolidaysApiUrl(year, apiUrl, serviceKey), {
    signal: options.signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch public holidays (${response.status})`)
  }

  const data = (await response.json()) as SpcdeApiResponse
  const { resultCode, resultMsg } = data.response.header

  if (resultCode !== '00') {
    throw new Error(`공공데이터포털 API error (${resultCode}): ${resultMsg}`)
  }

  return parseHolidayItems(data.response.body)
    .filter((item) => item.isHoliday !== 'N')
    .map((item) => {
      const dateKey = locdateToDateKey(item.locdate)
      return {
        id: `public-${dateKey}`,
        dateKey,
        name: item.dateName,
        kind: 'public' as const,
      }
    })
}
