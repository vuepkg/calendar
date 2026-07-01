import { expect, test, type Locator, type Page } from '@playwright/test'
import { gotoCalendar } from './helpers/navigation'

type ViewportPreset = {
  label: string
  width: number
  height: number
}

const VIEWPORTS = {
  desktop: { label: 'Desktop', width: 1280, height: 800 },
  laptop: { label: 'Laptop', width: 1024, height: 768 },
  tablet: { label: 'Tablet', width: 768, height: 1024 },
  mobile: { label: 'Mobile', width: 375, height: 667 },
  mobileNarrow: { label: 'Mobile Narrow', width: 320, height: 568 },
} as const satisfies Record<string, ViewportPreset>

type ScrollMetrics = {
  clientWidth: number
  scrollWidth: number
  clientHeight: number
  scrollHeight: number
}

function viewTab(page: Page, label: string): Locator {
  return page.locator('.vp-segmented-control-item', { hasText: label })
}

async function getScrollMetrics(locator: Locator): Promise<ScrollMetrics> {
  return locator.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))
}

async function expectFillsViewport(page: Page, viewport: ViewportPreset) {
  const app = page.locator('.app')
  const calendar = page.locator('.schedule-calendar')

  const appBox = await app.boundingBox()
  const calendarBox = await calendar.boundingBox()

  expect(appBox).not.toBeNull()
  expect(calendarBox).not.toBeNull()

  // App padding 16px * 2; demo filter bar reduces calendar share slightly
  expect(calendarBox!.width).toBeGreaterThan(viewport.width * 0.85)
  expect(calendarBox!.height).toBeGreaterThan(viewport.height * 0.72)
}

for (const [, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`ScheduleCalendar responsive — ${viewport.label} (${viewport.width}×${viewport.height})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test.beforeEach(async ({ page }) => {
      await gotoCalendar(page)
    })

    test('calendar fills the app container', async ({ page }) => {
      await expectFillsViewport(page, viewport)
    })

    test('toolbar view tabs remain visible and usable', async ({ page }) => {
      for (const label of ['Month', 'Week', 'Day', 'List']) {
        await expect(viewTab(page, label)).toBeVisible()
      }

      await viewTab(page, 'Month').click()
      await expect(page.locator('.month-calendar')).toBeVisible()
    })

    test('month view keeps a 7-column grid', async ({ page }) => {
      await viewTab(page, 'Month').click()

      await expect(page.locator('.month-weekday-row .weekday-header')).toHaveCount(7)
      await expect(page.locator('.month-cell').first()).toBeVisible()

      const firstCell = page.locator('.month-cell').first()
      const cellBox = await firstCell.boundingBox()
      expect(cellBox).not.toBeNull()
      expect(cellBox!.width).toBeGreaterThan(0)
    })

    test('month view fits without vertical scroll inside calendar', async ({ page }) => {
      await viewTab(page, 'Month').click()

      const monthView = page.locator('.month-view')
      const weeksBody = page.locator('.month-weeks-body')
      const content = page.locator('.calendar-content.month-view-content')

      await expect(weeksBody).toBeVisible()

      const monthMetrics = await getScrollMetrics(monthView)
      const weeksMetrics = await getScrollMetrics(weeksBody)
      const contentMetrics = await getScrollMetrics(content)

      expect(monthMetrics.scrollHeight).toBeLessThanOrEqual(monthMetrics.clientHeight + 2)
      expect(weeksMetrics.scrollHeight).toBeLessThanOrEqual(weeksMetrics.clientHeight + 2)
      expect(contentMetrics.scrollHeight).toBeLessThanOrEqual(contentMetrics.clientHeight + 2)
    })

    test('week view fits viewport without horizontal scroll', async ({ page }) => {
      await viewTab(page, 'Week').click()
      await expect(page.locator('.timed-grid')).toBeVisible()

      const timedGrid = page.locator('.week-view .timed-grid')
      const scrollHost = page.locator('.week-view .timed-grid-scroll')
      const gridMetrics = await getScrollMetrics(timedGrid)
      const hostMetrics = await getScrollMetrics(scrollHost)

      expect(gridMetrics.scrollWidth).toBeLessThanOrEqual(viewport.width)
      expect(hostMetrics.scrollWidth).toBeLessThanOrEqual(hostMetrics.clientWidth + 2)
      await expect(page.locator('.day-header').first()).toBeVisible()
    })

    test('day view fits narrow viewport without forced horizontal scroll', async ({ page }) => {
      await viewTab(page, 'Day').click()
      await expect(page.locator('.timed-grid.single-day')).toBeVisible()

      const timedGrid = page.locator('.day-view .timed-grid.single-day')
      const scrollHost = page.locator('.day-view .timed-grid-scroll')
      const gridMetrics = await getScrollMetrics(timedGrid)
      const hostMetrics = await getScrollMetrics(scrollHost)

      expect(gridMetrics.scrollWidth).toBeLessThanOrEqual(viewport.width)
      expect(hostMetrics.scrollWidth).toBeLessThanOrEqual(hostMetrics.clientWidth + 2)
      await expect(page.getByRole('button', { name: 'Today' })).toBeVisible()
    })

    test('list view loads and table fits viewport width', async ({ page }) => {
      await viewTab(page, 'List').click()
      await expect(page.locator('.list-view')).toBeVisible()
      await expect(page.locator('.vp-data-table')).toBeVisible({ timeout: 10_000 })

      const table = page.locator('.vp-data-table')
      await expect(table).toBeVisible()
      const tableMetrics = await getScrollMetrics(table)
      const listMetrics = await getScrollMetrics(page.locator('.list-view'))

      expect(tableMetrics.scrollWidth).toBeLessThanOrEqual(listMetrics.clientWidth + 2)
      await expect(page.getByText('고객사 A 미팅')).toBeVisible()
    })

    test('view switching works after resize context', async ({ page }) => {
      await viewTab(page, 'Week').click()
      await expect(page.locator('.timed-grid')).toBeVisible()

      await viewTab(page, 'Day').click()
      await expect(page.locator('.timed-grid.single-day')).toBeVisible()

      await viewTab(page, 'Month').click()
      await page.getByRole('button', { name: 'Next month' }).click()
      await expect(page.locator('.calendar-month-nav-title')).toContainText('2026-05')
    })
  })
}

test.describe('ScheduleCalendar responsive — viewport transition', () => {
  test('week view stays within viewport when resizing', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await gotoCalendar(page)
    await viewTab(page, 'Week').click()

    const scrollHost = page.locator('.week-view .timed-grid-scroll')
    const narrowMetrics = await getScrollMetrics(scrollHost)
    expect(narrowMetrics.scrollWidth).toBeLessThanOrEqual(narrowMetrics.clientWidth + 2)

    await page.setViewportSize({ width: 1280, height: 800 })
    const wideMetrics = await getScrollMetrics(scrollHost)
    expect(wideMetrics.scrollWidth).toBeLessThanOrEqual(wideMetrics.clientWidth + 2)
  })

  test('month cell width shrinks when viewport narrows', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await gotoCalendar(page)
    await viewTab(page, 'Month').click()

    const desktopCellWidth = (await page.locator('.month-cell').first().boundingBox())!.width

    await page.setViewportSize({ width: 375, height: 667 })
    const mobileCellWidth = (await page.locator('.month-cell').first().boundingBox())!.width

    expect(mobileCellWidth).toBeLessThan(desktopCellWidth)
    expect(mobileCellWidth).toBeGreaterThan(20)
  })
})
