import { expect, test, type Page } from '@playwright/test'
import { gotoCalendar } from './helpers/navigation'

// 애니메이션·트랜지션 비활성화 후 캘린더가 안정될 때까지 대기
async function prepareForScreenshot(page: Page) {
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  })
  await page.waitForTimeout(200)
}

async function switchView(page: Page, label: string) {
  await page.locator('.vp-segmented-control-item', { hasText: label }).click()
  await page.waitForTimeout(150)
}

test.describe('Visual Regression — Light Mode', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await gotoCalendar(page)
    await prepareForScreenshot(page)
  })

  test('month view', async ({ page }) => {
    await switchView(page, 'Month')
    await expect(page.locator('.schedule-calendar')).toHaveScreenshot('month-light.png')
  })

  test('week view', async ({ page }) => {
    await switchView(page, 'Week')
    await expect(page.locator('.schedule-calendar')).toHaveScreenshot('week-light.png')
  })

  test('day view', async ({ page }) => {
    await switchView(page, 'Day')
    await expect(page.locator('.schedule-calendar')).toHaveScreenshot('day-light.png')
  })

  test('list view', async ({ page }) => {
    await switchView(page, 'List')
    await page.locator('.list-view').waitFor({ state: 'visible' })
    await expect(page.locator('.schedule-calendar')).toHaveScreenshot('list-light.png')
  })
})

test.describe('Visual Regression — Dark Mode', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await gotoCalendar(page)
    // .vp-dark 클래스로 다크 모드 강제 활성화
    await page.evaluate(() => document.documentElement.classList.add('vp-dark'))
    await prepareForScreenshot(page)
  })

  test('month view', async ({ page }) => {
    await switchView(page, 'Month')
    await expect(page.locator('.schedule-calendar')).toHaveScreenshot('month-dark.png')
  })

  test('week view', async ({ page }) => {
    await switchView(page, 'Week')
    await expect(page.locator('.schedule-calendar')).toHaveScreenshot('week-dark.png')
  })

  test('day view', async ({ page }) => {
    await switchView(page, 'Day')
    await expect(page.locator('.schedule-calendar')).toHaveScreenshot('day-dark.png')
  })

  test('list view', async ({ page }) => {
    await switchView(page, 'List')
    await page.locator('.list-view').waitFor({ state: 'visible' })
    await expect(page.locator('.schedule-calendar')).toHaveScreenshot('list-dark.png')
  })
})
