import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildPublicHolidaysApiUrl,
  fetchPublicHolidays,
  usesServerInjectedServiceKey,
} from './publicHolidaysApi'

const TEST_SERVICE_KEY = 'test-service-key'

describe('usesServerInjectedServiceKey', () => {
  it('treats same-origin relative paths as server-injected', () => {
    expect(usesServerInjectedServiceKey('/api/spcde/getRestDeInfo')).toBe(true)
  })
})

describe('buildPublicHolidaysApiUrl', () => {
  it('omits serviceKey when proxy injects it server-side', () => {
    const url = buildPublicHolidaysApiUrl(2026, '/api/spcde/getRestDeInfo')
    expect(url).toContain('solYear=2026')
    expect(url).not.toContain('serviceKey')
  })

  it('includes serviceKey when explicitly provided', () => {
    const url = buildPublicHolidaysApiUrl(2026, '/api/spcde/getRestDeInfo', TEST_SERVICE_KEY)
    expect(url).toContain(`serviceKey=${TEST_SERVICE_KEY}`)
  })
})

describe('fetchPublicHolidays', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps SpcdeInfoService JSON response to Holiday records', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          response: {
            header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
            body: {
              items: {
                item: [
                  { dateName: '신정', isHoliday: 'Y', locdate: 20260101 },
                  { dateName: '어린이날', isHoliday: 'Y', locdate: 20260505 },
                ],
              },
              numOfRows: 100,
              pageNo: 1,
              totalCount: 2,
            },
          },
        }),
      }),
    )

    const holidays = await fetchPublicHolidays(2026, {
      apiUrl: '/api/spcde/getRestDeInfo',
    })

    expect(holidays).toEqual([
      { id: 'public-2026-01-01', dateKey: '2026-01-01', name: '신정', kind: 'public' },
      { id: 'public-2026-05-05', dateKey: '2026-05-05', name: '어린이날', kind: 'public' },
    ])
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/spcde/getRestDeInfo?'), {
      signal: undefined,
    })
    expect(fetch).toHaveBeenCalledWith(expect.not.stringContaining('serviceKey'), {
      signal: undefined,
    })
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('solYear=2026'), {
      signal: undefined,
    })
  })

  it('includes explicit serviceKey in request URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          response: {
            header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
            body: {
              items: { item: { dateName: '신정', isHoliday: 'Y', locdate: 20260101 } },
              numOfRows: 100,
              pageNo: 1,
              totalCount: 1,
            },
          },
        }),
      }),
    )

    await fetchPublicHolidays(2026, {
      serviceKey: TEST_SERVICE_KEY,
      apiUrl: '/api/spcde/getRestDeInfo',
    })

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`serviceKey=${TEST_SERVICE_KEY}`), {
      signal: undefined,
    })
  })

  it('normalizes a single holiday item object', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          response: {
            header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
            body: {
              items: {
                item: { dateName: '신정', isHoliday: 'Y', locdate: 20260101 },
              },
              numOfRows: 100,
              pageNo: 1,
              totalCount: 1,
            },
          },
        }),
      }),
    )

    const holidays = await fetchPublicHolidays(2026, {
      apiUrl: '/api/spcde/getRestDeInfo',
    })

    expect(holidays).toHaveLength(1)
    expect(holidays[0]?.name).toBe('신정')
  })

  it('throws when API responds with non-OK status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    )

    await expect(
      fetchPublicHolidays(2026, {
        apiUrl: '/api/spcde/getRestDeInfo',
      }),
    ).rejects.toThrow('Failed to fetch public holidays (503)')
  })

  it('throws when resultCode is not 00', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          response: {
            header: { resultCode: '30', resultMsg: 'SERVICE_KEY_IS_NOT_REGISTERED_ERROR' },
            body: {
              numOfRows: 100,
              pageNo: 1,
              totalCount: 0,
            },
          },
        }),
      }),
    )

    await expect(
      fetchPublicHolidays(2026, {
        apiUrl: '/api/spcde/getRestDeInfo',
      }),
    ).rejects.toThrow('공공데이터포털 API error (30)')
  })
})
