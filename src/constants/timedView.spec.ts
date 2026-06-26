import { describe, expect, it } from 'vitest'
import { DAY_VIEW_START_HOUR, TIMED_VIEW_END_HOUR, TIMED_VIEW_START_HOUR } from './calendarView'

describe('timed view constants', () => {
  it('starts week and day grids from 00:00', () => {
    expect(TIMED_VIEW_START_HOUR).toBe(0)
    expect(DAY_VIEW_START_HOUR).toBe(0)
  })

  it('ends week and day grids at 23:00', () => {
    expect(TIMED_VIEW_END_HOUR).toBe(23)
  })
})
