import { expect, test, type Locator, type Page } from '@playwright/test'
import type { HostLayoutId } from '../src/types/e2e'

type HostLayoutPreset = {
  id: HostLayoutId
  label: string
}

type ViewportPreset = {
  label: string
  width: number
  height: number
}

const HOST_LAYOUTS: HostLayoutPreset[] = [
  { id: 'minimal', label: 'Minimal embed (100vh flex)' },
  { id: 'fixed-panel', label: 'Fixed 600px dashboard panel' },
  { id: 'sidebar', label: 'Sidebar + main (embedded)' },
  { id: 'app-chrome', label: 'Header + footer shell' },
  { id: 'nested-card', label: 'Tabbed nested card' },
]

const VIEWPORTS: ViewportPreset[] = [
  { label: 'Desktop', width: 1280, height: 800 },
  { label: 'Tablet', width: 768, height: 1024 },
  { label: 'Mobile', width: 375, height: 667 },
]

type ScrollMetrics = {
  clientWidth: number
  scrollWidth: number
  clientHeight: number
  scrollHeight: number
}

function viewTab(page: Page, label: string): Locator {
  return page.locator('.vp-segmented-control-item', { hasText: label })
}

async function gotoHostLayout(page: Page, host: HostLayoutId) {
  await page.goto(`/?host=${host}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-testid="host-root"]')).toHaveAttribute('data-host-layout', host)
  await expect(page.locator('.schedule-calendar')).toBeVisible({ timeout: 15_000 })
}

async function getScrollMetrics(locator: Locator): Promise<ScrollMetrics> {
  return locator.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))
}

async function expectCalendarHasUsableSize(
  page: Page,
  options: { minWidth?: number; minHeight?: number } = {},
) {
  const minWidth = options.minWidth ?? 200
  const minHeight = options.minHeight ?? 300
  const calendar = page.locator('.schedule-calendar')
  const box = await calendar.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThan(minWidth)
  expect(box!.height).toBeGreaterThan(minHeight)
}

function expectedMinWidth(host: HostLayoutId, viewport: ViewportPreset): number {
  if (host === 'sidebar' && viewport.width <= 375) {
    // 220px sidebar leaves ~155px main column on 375px viewport
    return 100
  }
  return 200
}

for (const host of HOST_LAYOUTS) {
  for (const viewport of VIEWPORTS) {
    test.describe(`Host import — ${host.label} @ ${viewport.label} (${viewport.width}×${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } })

      test.beforeEach(async ({ page }) => {
        await gotoHostLayout(page, host.id)
      })

      test('renders ScheduleCalendar with non-zero area inside host', async ({ page }) => {
        await expectCalendarHasUsableSize(page, {
          minWidth: expectedMinWidth(host.id, viewport),
        })
        await expect(viewTab(page, 'Month')).toBeVisible()
        await expect(viewTab(page, 'Week')).toBeVisible()
        await expect(viewTab(page, 'Day')).toBeVisible()
        await expect(viewTab(page, 'List')).toBeVisible()
      })

      test('month view fits host without internal vertical scroll', async ({ page }) => {
        await viewTab(page, 'Month').click()
        await expect(page.locator('.month-weeks-body')).toBeVisible()

        const monthView = page.locator('.month-view')
        const weeksBody = page.locator('.month-weeks-body')
        const content = page.locator('.calendar-content.month-view-content')

        const monthMetrics = await getScrollMetrics(monthView)
        const weeksMetrics = await getScrollMetrics(weeksBody)
        const contentMetrics = await getScrollMetrics(content)

        expect(monthMetrics.scrollHeight).toBeLessThanOrEqual(monthMetrics.clientHeight + 2)
        expect(weeksMetrics.scrollHeight).toBeLessThanOrEqual(weeksMetrics.clientHeight + 2)
        expect(contentMetrics.scrollHeight).toBeLessThanOrEqual(contentMetrics.clientHeight + 2)
      })

      test('week view avoids horizontal overflow in host', async ({ page }) => {
        await viewTab(page, 'Week').click()
        await expect(page.locator('.week-view .timed-grid')).toBeVisible()

        const scrollHost = page.locator('.week-view .timed-grid-scroll')
        const hostMetrics = await getScrollMetrics(scrollHost)
        expect(hostMetrics.scrollWidth).toBeLessThanOrEqual(hostMetrics.clientWidth + 2)
      })

      test('switches Month → Week → Day inside host', async ({ page }) => {
        await viewTab(page, 'Month').click()
        await expect(page.locator('.month-calendar')).toBeVisible()

        await viewTab(page, 'Week').click()
        await expect(page.locator('.week-view .timed-grid')).toBeVisible()

        await viewTab(page, 'Day').click()
        await expect(page.locator('.day-view .timed-grid.single-day')).toBeVisible()
      })
    })
  }
}

test.describe('Host import — cross-layout interactions', () => {
  test('overflow popover works inside sidebar host on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await gotoHostLayout(page, 'sidebar')
    await viewTab(page, 'Month').click()
    await page.getByRole('button', { name: 'Next month' }).click()

    const may15Cell = page
      .locator('.month-cell:not(.outside)')
      .filter({ has: page.locator('.cell-date', { hasText: '15' }) })
    const overflowButton = may15Cell.locator('button.more-events')

    await expect(overflowButton).toBeVisible()
    await overflowButton.click()

    const popover = page.locator('.month-overflow-popover')
    await expect(popover).toBeVisible()
    await expect(popover).toContainText('2026-05-15')
    await expect(viewTab(page, 'Month')).toHaveClass(/active/)

    await popover.getByRole('button', { name: 'Close' }).click()
    await expect(popover).toHaveCount(0)
  })

  test('overflow popover stays within fixed-panel calendar bounds', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await gotoHostLayout(page, 'fixed-panel')
    await viewTab(page, 'Month').click()
    await page.getByRole('button', { name: 'Next month' }).click()

    const calendar = page.locator('.schedule-calendar')
    const may15Cell = page
      .locator('.month-cell:not(.outside)')
      .filter({ has: page.locator('.cell-date', { hasText: '15' }) })

    await may15Cell.locator('button.more-events').click()

    const popover = page.locator('.month-overflow-popover')
    await expect(popover).toBeVisible()

    const calendarBox = await calendar.boundingBox()
    const popoverBox = await popover.boundingBox()

    expect(calendarBox).not.toBeNull()
    expect(popoverBox).not.toBeNull()
    expect(popoverBox!.width).toBeLessThanOrEqual(calendarBox!.width)
    expect(popoverBox!.height).toBeLessThanOrEqual(calendarBox!.height * 0.5)
    expect(popoverBox!.x).toBeGreaterThanOrEqual(calendarBox!.x - 2)
    expect(popoverBox!.x + popoverBox!.width).toBeLessThanOrEqual(
      calendarBox!.x + calendarBox!.width + 2,
    )
  })

  test('fixed-panel keeps calendar within 600px host height', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await gotoHostLayout(page, 'fixed-panel')

    const panel = page.locator('[data-testid="host-panel"]')
    const calendar = page.locator('.schedule-calendar')

    const panelBox = await panel.boundingBox()
    const calendarBox = await calendar.boundingBox()

    expect(panelBox).not.toBeNull()
    expect(calendarBox).not.toBeNull()
    expect(panelBox!.height).toBeGreaterThan(590)
    expect(panelBox!.height).toBeLessThan(610)
    expect(calendarBox!.height).toBeLessThanOrEqual(panelBox!.height)

    await viewTab(page, 'Month').click()
    const weeksMetrics = await getScrollMetrics(page.locator('.month-weeks-body'))
    expect(weeksMetrics.scrollHeight).toBeLessThanOrEqual(weeksMetrics.clientHeight + 2)
  })

  test('nested-card remounts calendar when returning to schedule tab', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await gotoHostLayout(page, 'nested-card')

    await viewTab(page, 'Week').click()
    await expect(page.locator('.week-view .timed-grid')).toBeVisible()

    await page.getByRole('tab', { name: 'Other' }).click()
    await expect(page.locator('.schedule-calendar')).toHaveCount(0)

    await page.getByRole('tab', { name: 'Schedule' }).click()
    await expect(page.locator('.schedule-calendar')).toBeVisible()
    // v-if remount resets host fixture state to initial month view
    await expect(viewTab(page, 'Month')).toHaveClass(/active/)
    await viewTab(page, 'Week').click()
    await expect(page.locator('.week-view .timed-grid')).toBeVisible()
  })

  test('app-chrome host does not scroll the page body', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await gotoHostLayout(page, 'app-chrome')

    const bodyMetrics = await page.evaluate(() => ({
      clientHeight: document.documentElement.clientHeight,
      scrollHeight: document.documentElement.scrollHeight,
    }))

    expect(bodyMetrics.scrollHeight).toBeLessThanOrEqual(bodyMetrics.clientHeight + 2)

    await viewTab(page, 'List').click()
    await expect(page.locator('.vp-data-table')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.list-view')).toBeVisible()
  })

  test('minimal host shows april 21 all-day chips without +N at tall desktop height', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 1024 })
    await gotoHostLayout(page, 'minimal')
    await viewTab(page, 'Month').click()

    const april21Cell = page
      .locator('.month-cell:not(.outside)')
      .filter({ has: page.locator('.cell-date', { hasText: '21' }) })

    await expect(april21Cell.getByText('여수 출장')).toBeVisible()
    await expect(april21Cell.locator('button.more-events')).toHaveCount(0)
    await expect(april21Cell.locator('.cell-events .event-chip')).toHaveCount(5)
  })

  test('overflow popover works on minimal embed at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await gotoHostLayout(page, 'minimal')
    await viewTab(page, 'Month').click()
    await page.getByRole('button', { name: 'Next month' }).click()

    const may15Cell = page
      .locator('.month-cell:not(.outside)')
      .filter({ has: page.locator('.cell-date', { hasText: '15' }) })
    const overflowButton = may15Cell.locator('button.more-events')

    await expect(overflowButton).toBeVisible()
    await overflowButton.click()
    await expect(page.locator('.month-overflow-popover')).toBeVisible()
  })

  test('sidebar host on mobile keeps 7-column month grid in narrow main column', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await gotoHostLayout(page, 'sidebar')
    await viewTab(page, 'Month').click()
    await expect(page.locator('.month-weekday-row .weekday-header')).toHaveCount(7)
    await expect(page.locator('.month-cell').first()).toBeVisible()
  })

  test('sidebar host keeps calendar in main column without horizontal page scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await gotoHostLayout(page, 'sidebar')

    const main = page.locator('[data-testid="host-main"]')
    const calendar = page.locator('.schedule-calendar')

    const mainBox = await main.boundingBox()
    const calendarBox = await calendar.boundingBox()

    expect(mainBox).not.toBeNull()
    expect(calendarBox).not.toBeNull()
    expect(calendarBox!.x).toBeGreaterThanOrEqual(mainBox!.x)
    expect(calendarBox!.x + calendarBox!.width).toBeLessThanOrEqual(mainBox!.x + mainBox!.width + 2)

    const pageMetrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(pageMetrics.scrollWidth).toBeLessThanOrEqual(pageMetrics.clientWidth + 2)
  })
})
