import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { gotoCalendar } from './helpers/navigation'

function viewTab(page: Page, label: string): Locator {
  return page.locator('.vp-segmented-control-item', { hasText: label })
}

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page }).include('.schedule-calendar').analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
}

// F3-5: 전 뷰·모달 자동 접근성 감사 (axe-core)
test.describe('Accessibility (axe)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await gotoCalendar(page)
  })

  test('month view has no automatically detectable a11y violations', async ({ page }) => {
    await viewTab(page, 'Month').click()
    await expect(page.locator('.month-calendar')).toBeVisible()
    await expectNoViolations(page)
  })

  test('week view has no automatically detectable a11y violations', async ({ page }) => {
    await viewTab(page, 'Week').click()
    await expect(page.locator('.timed-grid')).toBeVisible()
    await expectNoViolations(page)
  })

  test('day view has no automatically detectable a11y violations', async ({ page }) => {
    await viewTab(page, 'Day').click()
    await expect(page.locator('.timed-grid.single-day')).toBeVisible()
    await expectNoViolations(page)
  })

  test('list view has no automatically detectable a11y violations', async ({ page }) => {
    await viewTab(page, 'List').click()
    await expect(page.locator('.vp-data-table')).toBeVisible({ timeout: 10_000 })
    await expectNoViolations(page)
  })

  test('schedule form modal has no automatically detectable a11y violations', async ({ page }) => {
    await viewTab(page, 'List').click()
    await page.locator('.vp-data-table-row').first().click()
    await expect(page.locator('.schedule-form')).toBeVisible()

    const results = await new AxeBuilder({ page }).include('.schedule-form-dialog').analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })
})
